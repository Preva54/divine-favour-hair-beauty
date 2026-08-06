"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";

type ActionResult = { error?: string; ok?: boolean };

/* ---------------- Leave management ---------------- */

const leaveSchema = z.object({
  stylistId: z.string().min(1),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).optional(),
});

export async function addStylistLeaveAction(input: unknown): Promise<ActionResult> {
  await requirePermission("stylists:manage");
  const parsed = leaveSchema.safeParse(input);
  if (!parsed.success) return { error: "Please provide valid dates." };

  const { stylistId, start, end, reason } = parsed.data;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T23:59:59`);
  if (endDate <= startDate) return { error: "End date must be after the start date." };

  const stylist = await prisma.stylist.findUnique({ where: { id: stylistId } });
  if (!stylist) return { error: "Stylist not found." };

  await prisma.stylistLeave.create({
    data: { stylistId, start: startDate, end: endDate, reason: reason || null },
  });
  revalidatePath("/admin/stylists");
  revalidatePath("/booking");
  return { ok: true };
}

export async function deleteStylistLeaveAction(id: string): Promise<ActionResult> {
  await requirePermission("stylists:manage");
  try {
    await prisma.stylistLeave.delete({ where: { id } });
  } catch {
    return { error: "Could not remove leave period." };
  }
  revalidatePath("/admin/stylists");
  revalidatePath("/booking");
  return { ok: true };
}

/* ---------------- Blocked periods (holidays / lunch breaks) ---------------- */

const blockedSchema = z.object({
  stylistId: z.string().optional().nullable(),
  start: z.string().min(1, "Start is required"),
  end: z.string().min(1, "End is required"),
  reason: z.string().min(2, "Reason is required").max(200),
});

export async function saveBlockedPeriodAction(input: unknown): Promise<ActionResult> {
  await requirePermission("bookings:manage");
  const parsed = blockedSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details." };

  const start = new Date(parsed.data.start);
  const end = new Date(parsed.data.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { error: "Invalid dates." };
  if (end <= start) return { error: "End must be after the start." };

  await prisma.blockedPeriod.create({
    data: {
      stylistId: parsed.data.stylistId || null,
      start,
      end,
      reason: parsed.data.reason,
    },
  });
  revalidatePath("/admin/calendar");
  revalidatePath("/booking");
  return { ok: true };
}

export async function deleteBlockedPeriodAction(id: string): Promise<ActionResult> {
  await requirePermission("bookings:manage");
  try {
    await prisma.blockedPeriod.delete({ where: { id } });
  } catch {
    return { error: "Could not remove blocked period." };
  }
  revalidatePath("/admin/calendar");
  revalidatePath("/booking");
  return { ok: true };
}

/* ---------------- Appointment reassignment ---------------- */

export async function reassignAppointmentAction(appointmentId: string, stylistId: string): Promise<ActionResult> {
  await requirePermission("bookings:manage");
  if (!stylistId) return { error: "Choose a stylist." };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: { select: { id: true } } },
  });
  if (!appointment) return { error: "Appointment not found." };

  const stylist = await prisma.stylist.findUnique({ where: { id: stylistId } });
  if (!stylist) return { error: "Stylist not found." };
  if (!stylist.available) return { error: `${stylist.name} is not available for bookings.` };

  if (stylistId !== appointment.stylistId) {
    const conflict = await prisma.appointment.findFirst({
      where: {
        stylistId,
        start: { lt: appointment.end },
        end: { gt: appointment.start },
        status: { not: "CANCELLED" },
        id: { not: appointmentId },
      },
    });
    if (conflict) return { error: `${stylist.name} already has an appointment at that time.` };
  }

  await prisma.appointment.update({ where: { id: appointmentId }, data: { stylistId } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/booking");
  return { ok: true };
}
