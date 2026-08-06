"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { Role } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { SALON } from "@/lib/constants";
import { passwordResetHtml, sendEmail } from "@/lib/mailer";

const RESET_TOKEN_MINUTES = 60;

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  referral: z.string().trim().optional(),
});

export type RegisterState = { error?: string; ok?: boolean; redirect?: string };

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const { name, email, password, phone, referral } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 12);
  const referralCode = `DF-${name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 4) || "YOU"}${Math.floor(100 + Math.random() * 900)}`;

  // Find referring user for bonus
  let referredByUser = null;
  let welcomePoints = SALON.welcomePoints;
  if (referral) {
    const source = await prisma.user.findUnique({ where: { referralCode: referral.trim().toUpperCase() } });
    if (source) referredByUser = source;
  }
  if (referredByUser) welcomePoints += SALON.referralPoints;

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        role: Role.CUSTOMER,
        referralCode,
        referredBy: referredByUser ? referredByUser.referralCode : null,
        points: welcomePoints,
        loyaltyTransactions: {
          create: [
            { points: SALON.welcomePoints, type: "BONUS" as const, description: "Welcome bonus" },
            ...(referredByUser
              ? [{ points: SALON.referralPoints, type: "BONUS" as const, description: `Referral from ${referredByUser.name}` }]
              : []),
          ],
        },
        notifications: {
          create: {
            type: "LOYALTY",
            title: "Welcome to Divine Favour",
            message: `You earned ${welcomePoints} beauty points. They're waiting in your account!`,
          },
        },
      },
    });

    if (referredByUser) {
      await prisma.user.update({
        where: { id: referredByUser.id },
        data: {
          points: { increment: SALON.referralPoints },
          loyaltyTransactions: {
            create: { points: SALON.referralPoints, type: "BONUS", description: `Referral reward from ${user.name}` },
          },
        },
      });
    }
  } catch (e) {
    // @ts-expect-error P2002 check
    if (e?.code === "P2002") {
      return { error: "This email is already registered." };
    }
    console.error("register error", e);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/account");
  return { ok: true, redirect: "/login?registered=1" };
}

/* ---------------- Password reset ---------------- */

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type RequestResetResult =
  | { ok: true; sent: boolean; devLink?: string }
  | { ok: false; error: string };

export async function requestPasswordResetAction(email: string): Promise<RequestResetResult> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(email);
  if (!parsed.success) return { ok: false, error: "Please enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  if (!user?.passwordHash) {
    // Don't reveal whether an account exists.
    return { ok: true, sent: false };
  }

  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_MINUTES * 60_000),
      },
    }),
  ]);

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const link = `${base}/reset-password?token=${token}`;
  const res = await sendEmail({
    to: user.email,
    subject: "Reset your Divine Favour password",
    html: passwordResetHtml({ name: user.name.split(" ")[0], link, minutes: RESET_TOKEN_MINUTES }),
  });

  if (!res.ok) return { ok: false, error: "Could not send the reset email. Please try again." };
  if (!res.sent) return { ok: true, sent: false, devLink: link };
  return { ok: true, sent: true };
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

export async function resetPasswordAction(token: string, password: string): Promise<ResetPasswordResult> {
  if (!token) return { ok: false, error: "Invalid or missing reset token." };
  if (typeof password !== "string" || password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);

  revalidatePath("/login");
  return { ok: true };
}