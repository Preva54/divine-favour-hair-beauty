import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { PAYFAST_URLS, verifyPayfastSignature } from "@/lib/payfast";
import { OrderStatus, PaymentStatus, NotificationType } from "@/generated/prisma/enums";
import { paymentReceivedHtml, sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_KEYS = ["m_payment_id", "amount", "signature", "payment_status"];

type ITNParams = Record<string, string>;

export async function POST(request: NextRequest) {
  const params: ITNParams = {};
  const form = await request.formData();
  for (const [key, value] of form.entries()) {
    params[key] = String(value);
  }
  if (Object.keys(params).length === 0) {
    return new NextResponse("EMPTY", { status: 400 });
  }
  return processITN(params);
}

export async function GET(request: NextRequest) {
  const params: ITNParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  if (Object.keys(params).length === 0) {
    return new NextResponse("EMPTY", { status: 400 });
  }
  return processITN(params);
}

async function processITN(params: ITNParams) {
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
    const strict = process.env.PAYFAST_SANDBOX !== "1";
    if (strict) {
      return new NextResponse("NOT VALID", { status: 400 });
    }
    console.warn(`[payfast:notify] external validation returned ${validation} — sandbox mode, processing signed ITN anyway`);
  }

  const ref = params.m_payment_id;
  const amount = Number(params.amount);
  const status = params.payment_status.toUpperCase();

  const order = await prisma.order.findUnique({ where: { ref } });

  if (order) {
    return handleOrder(order, ref, amount, status);
  }

  const appointment = await prisma.appointment.findUnique({ where: { ref } });
  if (appointment) {
    return handleAppointment(appointment, ref, amount, status);
  }

  return new NextResponse("NOT FOUND", { status: 404 });
}

/* ---------------- Orders ---------------- */

async function handleOrder(
  order: { id: string; userId: string | null; email: string; total: number; paymentStatus: string },
  ref: string,
  amount: number,
  status: string,
) {
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
    await sendEmail({
      to: order.email,
      subject: `Payment received for order ${ref}`,
      html: paymentReceivedHtml({ ref, amount, what: "your order" }),
    });
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

/* ---------------- Appointments (deposits) ---------------- */

async function handleAppointment(
  appointment: { id: string; userId: string | null; guestEmail: string | null; depositAmount: number | null; paymentStatus: string },
  ref: string,
  amount: number,
  status: string,
) {
  if (!appointment.depositAmount || Math.abs(appointment.depositAmount - amount) > 0.01) {
    return new NextResponse("AMOUNT MISMATCH", { status: 400 });
  }

  const recipient = appointment.guestEmail ?? "";

  if (status === "COMPLETE" && appointment.paymentStatus !== PaymentStatus.PAID) {
    const updates: Prisma.PrismaPromise<unknown>[] = [
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { paymentStatus: PaymentStatus.DEPOSIT_PAID },
      }),
    ];
    if (appointment.userId) {
      updates.push(
        prisma.notification.create({
          data: {
            userId: appointment.userId,
            type: NotificationType.APPOINTMENT,
            title: "Deposit received",
            message: `Your ${Math.round(amount)} ZAR deposit for appointment ${ref} was received. Your slot is secured!`,
          },
        }),
      );
    }
    await prisma.$transaction(updates);
    if (recipient) {
      await sendEmail({
        to: recipient,
        subject: `Deposit received for appointment ${ref}`,
        html: paymentReceivedHtml({ ref, amount, what: "your booking deposit" }),
      });
    }
    revalidatePath("/account/appointments");
    revalidatePath("/admin/bookings");
    return new NextResponse("OK", { status: 200 });
  }

  if (status === "CANCELLED" || status === "FAILED") {
    if (appointment.userId) {
      await prisma.notification.create({
        data: {
          userId: appointment.userId,
          type: NotificationType.APPOINTMENT,
          title: "Deposit not completed",
          message: `Your deposit payment for appointment ${ref} wasn't completed. Your booking is still held — you can pay later or settle at the salon.`,
        },
      });
    }
    revalidatePath("/account/appointments");
    return new NextResponse("OK", { status: 200 });
  }

  return new NextResponse("OK", { status: 200 });
}
