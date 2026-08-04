"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { SALON } from "@/lib/constants";

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