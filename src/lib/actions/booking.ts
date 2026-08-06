"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAvailableSlots, pickStylist } from "@/lib/booking";
import { addMinutes, randomRef, formatDate, formatTime } from "@/lib/utils";
import { SALON } from "@/lib/constants";
import { bookingConfirmationHtml, sendEmail } from "@/lib/mailer";
import { buildPayfastUrl, payfastConfigured } from "@/lib/payfast";
import {
  AppointmentStatus,
  LoyaltyType,
  NotificationType,
  PaymentStatus,
} from "@/generated/prisma/enums";

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  stylistId: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(20),
  notes: z.string().trim().max(500).optional(),
});

export async function fetchSlotsAction(date: string, serviceId: string, stylistId?: string | null) {
  return getAvailableSlots({ date, serviceId, stylistId });
}

export type CreateBookingResult =
  | { ok: true; ref: string; serviceName: string; stylistName: string; start: string }
  | { ok: false; error: string };

export async function createAppointmentAction(input: unknown): Promise<CreateBookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check your booking details." };

  const d = parsed.data;
  const service = await prisma.service.findUnique({ where: { id: d.serviceId } });
  if (!service || !service.active) return { ok: false, error: "This service is no longer available." };

  const [year, month, day] = d.date.split("-").map(Number);
  const [hour, minute] = d.time.split(":").map(Number);
  const start = new Date(year, month - 1, day, hour, minute);
  const end = addMinutes(start, service.durationMinutes);

  const freeSlots = await getAvailableSlots({ date: d.date, serviceId: service.id, stylistId: d.stylistId });
  if (!freeSlots.includes(d.time)) {
    return { ok: false, error: "Sorry, that time is no longer available. Please pick another slot." };
  }

  const stylistId = await pickStylist(service.id, start, end, d.stylistId);
  if (!stylistId) return { ok: false, error: "No stylist is free at that time. Please choose another slot." };

  const stylist = await prisma.stylist.findUnique({ where: { id: stylistId } });

  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  const deposit = Math.round(service.price * SALON.depositPercent);
  const ref = randomRef("DF");

  await prisma.appointment.create({
    data: {
      ref,
      serviceId: service.id,
      stylistId,
      start,
      end,
      status: AppointmentStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      amount: service.price,
      depositAmount: deposit,
      notes: d.notes || null,
      guestName: user ? null : d.name,
      guestEmail: user ? null : d.email,
      guestPhone: user ? null : d.phone,
      userId: user?.id ?? null,
    },
  });

  if (user) {
    const earned = Math.floor(service.price * SALON.pointsPerRand);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { points: { increment: earned } },
      }),
      prisma.loyaltyTransaction.create({
        data: { userId: user.id, points: earned, type: LoyaltyType.EARN, description: `Booking ${service.name}` },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.APPOINTMENT,
          title: "Booking received",
          message: `Your ${service.name} request ${ref} was received. We're confirming availability now.`,
        },
      }),
    ]);
  }

  revalidatePath("/booking");
  revalidatePath("/account/appointments");

  await sendEmail({
    to: user?.email ?? d.email,
    subject: `Your ${service.name} booking (${ref})`,
    html: bookingConfirmationHtml({
      ref,
      service: service.name,
      stylist: stylist?.name ?? "assigned stylist",
      date: formatDate(start),
      time: formatTime(start),
      price: service.price,
    }),
  });

  return {
    ok: true,
    ref,
    serviceName: service.name,
    stylistName: stylist?.name ?? "",
    start: `${d.date}T${d.time}`,
  };
}

/* ---------------- Deposit payment ---------------- */

export type DepositResult =
  | { ok: true; paymentUrl: string; amount: number }
  | { ok: false; error: string };

export async function createDepositPaymentAction(appointmentId: string): Promise<DepositResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Please sign in to pay your deposit." };
  if (!payfastConfigured) {
    return { ok: false, error: "Online deposits aren't enabled yet — settle the deposit at the salon." };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true },
  });
  if (!appointment || appointment.userId !== userId) return { ok: false, error: "Appointment not found." };
  if (appointment.status === "CANCELLED") return { ok: false, error: "This appointment was cancelled." };
  if (appointment.paymentStatus !== "UNPAID") return { ok: false, error: "This appointment has already been paid for." };
  if (!appointment.depositAmount || appointment.depositAmount <= 0) {
    return { ok: false, error: "No deposit is required for this appointment." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  const nameParts = (user?.name ?? "Divine Favour").trim().split(/\s+/);
  const paymentUrl = buildPayfastUrl({
    ref: appointment.ref,
    amount: appointment.depositAmount,
    email: user?.email ?? "guest@divinefavour.co.za",
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" ").slice(0, 30),
  });

  return { ok: true, paymentUrl, amount: appointment.depositAmount };
}