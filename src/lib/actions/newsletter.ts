"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  source: z.string().trim().max(40).optional(),
});

export type SubscribeResult = { ok: true } | { ok: false; error: string };

export async function subscribeNewsletterAction(input: unknown): Promise<SubscribeResult> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please enter a valid email address." };

  const { email, source } = parsed.data;
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source: source ?? "footer" },
      update: {},
    });
  } catch {
    return { ok: false, error: "Could not subscribe. Please try again." };
  }

  revalidatePath("/admin/newsletter");
  return { ok: true };
}

export async function unsubscribeNewsletterAction(email: string): Promise<void> {
  await prisma.newsletterSubscriber.deleteMany({ where: { email: email.trim().toLowerCase() } });
  revalidatePath("/admin/newsletter");
}
