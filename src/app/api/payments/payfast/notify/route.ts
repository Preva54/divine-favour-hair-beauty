import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { PAYFAST_URLS, verifyPayfastSignature } from "@/lib/payfast";
import { OrderStatus, PaymentStatus, NotificationType } from "@/generated/prisma/enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_KEYS = ["m_payment_id", "amount", "signature", "payment_status"];

export async function POST() {
  return new Response("OK", { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  if (!verifyPayfastSignature(params)) {
    return new NextResponse("INVALID SIGNATURE", { status: 400 });
  }
  if (!REQUIRED_KEYS.every((k) => params[k])) {
    return new NextResponse("INVALID PARAMS", { status: 400 });
  }

  const body = new URLSearchParams(params).toString();
  let validation = "INVALID";
  try {
    const res = await fetch(PAYFAST_URLS.validate, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    validation = (await res.text()).trim().toUpperCase();
  } catch {
    return new NextResponse("VALIDATION FAILED", { status: 502 });
  }

  if (validation !== "VALID") {
    return new NextResponse("NOT VALID", { status: 400 });
  }

  const ref = params.m_payment_id;
  const amount = Number(params.amount);
  const status = params.payment_status.toUpperCase();

  const order = await prisma.order.findUnique({ where: { ref } });
  if (!order) return new NextResponse("ORDER NOT FOUND", { status: 404 });

  if (Math.abs(order.total - amount) > 0.01) {
    return new NextResponse("AMOUNT MISMATCH", { status: 400 });
  }

  if (status === "COMPLETE" && order.paymentStatus !== PaymentStatus.PAID) {
    const updates: Prisma.PrismaPromise<unknown>[] = [
      prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, paymentStatus: PaymentStatus.PAID },
      }),
    ];
    if (order.userId) {
      updates.push(
        prisma.notification.create({
          data: {
            userId: order.userId,
            type: NotificationType.ORDER,
            title: "Payment received",
            message: `Your payment for order ${ref} (R${Math.round(amount)}) was received.`,
          },
        }),
      );
    }
    await prisma.$transaction(updates);
    revalidatePath("/account/orders");
    return new NextResponse("OK", { status: 200 });
  }

  if ((status === "CANCELLED" || status === "FAILED") && order.paymentStatus !== PaymentStatus.PAID) {
    await prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });
      if (order.userId) {
        await tx.notification.create({
          data: {
            userId: order.userId,
            type: NotificationType.ORDER,
            title: "Payment not completed",
            message: `Your payment for order ${ref} was cancelled. No charge was made — your basket is still waiting for you.`,
          },
        });
      }
    });
    revalidatePath("/account/orders");
    return new NextResponse("OK", { status: 200 });
  }

  return new NextResponse("OK", { status: 200 });
}
