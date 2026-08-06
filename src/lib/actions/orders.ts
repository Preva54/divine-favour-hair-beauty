"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { randomRef } from "@/lib/utils";
import { SALON } from "@/lib/constants";
import { buildPayfastUrl, payfastConfigured } from "@/lib/payfast";
import {
  CouponType,
  LoyaltyType,
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/enums";

const orderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1)
    .max(50),
  coupon: z.string().trim().toUpperCase().optional(),
  pointsToRedeem: z.number().int().min(0).max(100000).optional(),
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(20),
  address: z.string().trim().min(5).max(160),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(20),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["PAY_AT_SALON", "CARD"]),
});

export type OrderResult =
  | {
      ok: true;
      ref: string;
      total: number;
      subtotal: number;
      discount: number;
      pointsUsed?: number;
      paymentUrl?: string;
    }
  | { ok: false; error: string };

export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<{ ok: true; discount: number; label: string } | { ok: false; error: string }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) return { ok: false, error: "Invalid coupon code." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, error: "This coupon has expired." };
  if (typeof coupon.usageLimit === "number" && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return { ok: false, error: `Minimum order of ${Math.round(coupon.minSpend)} ZAR required.` };
  }
  let discount = coupon.type === CouponType.PERCENT ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.type === CouponType.PERCENT && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.round(Math.min(discount, subtotal));
  const label = coupon.type === CouponType.PERCENT ? `${coupon.value}% off` : `${Math.round(coupon.value)} ZAR off`;
  return { ok: true, discount, label };
}

export async function validatePointsAction(
  points: number,
): Promise<{ ok: true; discount: number; balance: number; used: number } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to redeem points." };
  if (!Number.isInteger(points) || points < 1) return { ok: false, error: "Enter a valid number of points." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true },
  });
  if (!user) return { ok: false, error: "Account not found." };
  if (points > user.points) {
    return { ok: false, error: `You only have ${user.points} points.` };
  }
  const discount = Math.floor(points / SALON.pointsRedeemRate);
  if (discount < 1) {
    return { ok: false, error: `A minimum of ${SALON.pointsRedeemRate} points is needed to redeem.` };
  }
  return { ok: true, discount, balance: user.points, used: points };
}

export async function createOrderAction(input: unknown): Promise<OrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check your order details." };

  const d = parsed.data;
  const ids = d.items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
  });
  if (products.length !== ids.length) return { ok: false, error: "Some products are no longer available." };

  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  for (const item of d.items) {
    const p = byId.get(item.productId);
    if (!p) return { ok: false, error: "A product in your cart is unavailable." };
    if (p.stock < item.quantity) {
      return { ok: false, error: `Only ${p.stock} left of "${p.name}".` };
    }
    subtotal += p.price * item.quantity;
  }

  let discount = 0;
  let couponCode: string | null = null;
  if (d.coupon) {
    const coupon = await prisma.coupon.findUnique({ where: { code: d.coupon } });
    if (!coupon || !coupon.active) return { ok: false, error: "That coupon code doesn't exist." };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, error: "That coupon has expired." };
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
      return { ok: false, error: "That coupon has reached its usage limit." };
    }
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return { ok: false, error: `This coupon needs a minimum order of ${Math.round(coupon.minSpend)} ZAR.` };
    }
    if (coupon.type === CouponType.PERCENT) {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.value, subtotal);
    }
    discount = Math.round(discount);
    couponCode = coupon.code;
  }

  const ref = randomRef("DF");
  const session = await auth();
  const userId = session?.user?.id ?? null;

  let pointsUsed = 0;
  const points = d.pointsToRedeem ?? 0;
  let pointsDiscount = 0;
  if (points > 0) {
    if (!userId) return { ok: false, error: "Sign in to redeem loyalty points." };
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
    if (!user) return { ok: false, error: "Account not found." };
    if (points > user.points) return { ok: false, error: `You only have ${user.points} points.` };
    pointsUsed = Math.min(points, Math.max(0, subtotal - discount) * SALON.pointsRedeemRate);
    pointsDiscount = Math.floor(pointsUsed / SALON.pointsRedeemRate);
    if (pointsDiscount < 1) return { ok: false, error: `A minimum of ${SALON.pointsRedeemRate} points is needed to redeem.` };
    pointsUsed = pointsDiscount * SALON.pointsRedeemRate;
  }

  const total = Math.max(0, Math.round(subtotal - discount - pointsDiscount));
  const combinedDiscount = Math.round(discount + pointsDiscount);

  await prisma.$transaction(async (tx) => {
    for (const item of d.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    if (couponCode) {
      await tx.coupon.update({ where: { code: couponCode }, data: { usageCount: { increment: 1 } } });
    }
    if (pointsUsed > 0 && userId) {
      await tx.user.update({ where: { id: userId }, data: { points: { decrement: pointsUsed } } });
      await tx.loyaltyTransaction.create({
        data: {
          userId,
          points: -pointsUsed,
          type: LoyaltyType.REDEEM,
          description: `Checkout discount · Order ${ref}`,
        },
      });
    }
    return tx.order.create({
      data: {
        ref,
        userId,
        status: OrderStatus.PENDING,
        paymentMethod: d.paymentMethod as PaymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        subtotal,
        discount: combinedDiscount,
        total,
        couponCode,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        address: d.address,
        city: d.city,
        postalCode: d.postalCode,
        notes: d.notes || null,
        items: {
          create: d.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: byId.get(item.productId)!.price,
          })),
        },
      },
    });
  });

  if (userId) {
    const earned = Math.floor(total * SALON.pointsPerRand);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { points: { increment: earned } } }),
      prisma.loyaltyTransaction.create({
        data: {
          userId,
          points: earned,
          type: LoyaltyType.EARN,
          description: `Order ${ref}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: NotificationType.ORDER,
          title: "Order received",
          message: `Order ${ref} (${Math.round(total)} ZAR) was received. You earned ${earned} points.`,
        },
      }),
    ]);
  }

  revalidatePath("/shop");
  revalidatePath("/account/orders");

  if (d.paymentMethod === "CARD") {
    if (!payfastConfigured) {
      return { ok: false, error: "Card payments are not configured yet — please pay at the salon." };
    }
    const [first, ...rest] = d.fullName.trim().split(/\s+/);
    const paymentUrl = buildPayfastUrl({
      ref,
      amount: total,
      email: d.email,
      firstName: first,
      lastName: rest.join(" ").slice(0, 30),
    });
    return { ok: true, ref, subtotal, discount: combinedDiscount, total, pointsUsed, paymentUrl };
  }

  return { ok: true, ref, subtotal, discount: combinedDiscount, total, pointsUsed };
}