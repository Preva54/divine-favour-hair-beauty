"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MessageStatus } from "@/generated/prisma/enums";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

export type ContactResult = { ok?: boolean; error?: string };

export async function sendContactMessageAction(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check your message details." };

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: MessageStatus.NEW,
        userId,
      },
    });
  } catch (e) {
    console.error("contact error", e);
    return { error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}