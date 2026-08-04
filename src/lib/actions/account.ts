"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AppointmentStatus } from "@/generated/prisma/enums";

export type ActionResult = { ok?: boolean; error?: string };

export async function cancelAppointmentAction(appointmentId: string, reason?: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in first." };

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId: session.user.id },
  });
  if (!appointment) return { error: "Appointment not found." };
  if (appointment.status === AppointmentStatus.CANCELLED) return { error: "Already cancelled." };
  if (appointment.status !== AppointmentStatus.PENDING && appointment.status !== AppointmentStatus.CONFIRMED) {
    return { error: "This appointment can no longer be cancelled." };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: AppointmentStatus.CANCELLED, cancelReason: reason?.trim() || null },
  });

  revalidatePath("/account/appointments");
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional(),
});

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in first." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check your details." };

  const d = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Account not found." };

  let passwordHash = undefined;
  if (d.newPassword) {
    if (!d.currentPassword) return { error: "Enter your current password to change it." };
    const valid = user.passwordHash ? await bcrypt.compare(d.currentPassword, user.passwordHash) : false;
    if (!valid) return { error: "Current password is incorrect." };
    passwordHash = await bcrypt.hash(d.newPassword, 12);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      phone: d.phone || null,
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  revalidatePath("/account/profile");
  return { ok: true };
}

export async function markNotificationsReadAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in first." };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/account/notifications");
  return { ok: true };
}