"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { giftCardEmailHtml, sendEmail } from "@/lib/mailer";

export type GiftCardResult =
  | { ok: true; code: string; amount: number; recipientEmail: string }
  | { ok: false; error: string };

const purchaseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").max(10000, "Amount is too large"),
  recipientEmail: z.string().trim().toLowerCase().email("Please enter a valid email"),
  recipientName: z.string().trim().min(1, "Recipient name is required").max(60),
  message: z.string().trim().max(500).optional(),
});

export async function purchaseGiftCardAction(input: unknown): Promise<GiftCardResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/gift-cards");

  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };

  const { amount, recipientEmail, recipientName, message } = parsed.data;
  const sender = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  if (!sender) return { ok: false, error: "Account not found." };

  const code = `DFG-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const recipient = await prisma.user.findUnique({ where: { email: recipientEmail }, select: { id: true } });

  try {
    await prisma.giftCard.create({
      data: {
        code,
        amount,
        balance: amount,
        recipientEmail,
        recipientName,
        senderName: sender.name,
        message: message || null,
        purchasedById: userId,
        recipientUserId: recipient?.id ?? null,
      },
    });
  } catch {
    return { ok: false, error: "Could not create the gift card. Please try again." };
  }

  revalidatePath("/account/gift-cards");

  await sendEmail({
    to: recipientEmail,
    subject: `You've been gifted ${Math.round(amount)} ZAR of beauty!`,
    html: giftCardEmailHtml({
      amount,
      code,
      recipientName: recipientName || null,
      senderName: sender.name,
      message: message || null,
      shopUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/shop`,
    }),
  });

  return { ok: true, code, amount, recipientEmail };
}
