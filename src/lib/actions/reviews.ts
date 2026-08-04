"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { EntityType } from "@/generated/prisma/enums";

const reviewSchema = z.object({
  authorName: z.string().trim().min(2, "Please enter your name").max(80),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
});

export type ReviewResult = { error?: string; ok?: boolean };

export async function submitReviewAction(input: unknown): Promise<ReviewResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your review." };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    await prisma.review.create({
      data: {
        authorName: parsed.data.authorName,
        rating: parsed.data.rating,
        text: parsed.data.text,
        entity: EntityType.SALON,
        approved: false,
        userId,
      },
    });
  } catch (e) {
    console.error("review error", e);
    return { error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}