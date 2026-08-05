"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";

const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
const ORDER_STATUSES = ["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED"] as const;

export async function updateAppointmentStatusAction(formData: FormData) {
  const session = await requirePermission("bookings:manage");
  if (!session) return { error: "Unauthorized" };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(APPOINTMENT_STATUSES as readonly string[]).includes(status)) return { error: "Invalid request" };

  await prisma.appointment.update({ where: { id }, data: { status: status as never, updatedAt: new Date() } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function updateOrderStatusAction(formData: FormData) {
  const session = await requirePermission("orders:manage");
  if (!session) return { error: "Unauthorized" };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(ORDER_STATUSES as readonly string[]).includes(status)) return { error: "Invalid request" };

  await prisma.order.update({ where: { id }, data: { status: status as never, updatedAt: new Date() } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateMessageStatusAction(formData: FormData) {
  const session = await requirePermission("messages:manage");
  if (!session) return { error: "Unauthorized" };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(MESSAGE_STATUSES as readonly string[]).includes(status)) return { error: "Invalid request" };

  await prisma.contactMessage.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function toggleReviewApproveAction(id: string) {
  const session = await requirePermission("reviews:manage");
  if (!session) return { error: "Unauthorized" };

  const review = await prisma.review.findUnique({ where: { id }, select: { approved: true } });
  if (!review) return { error: "Review not found" };

  await prisma.review.update({ where: { id }, data: { approved: !review.approved } });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function toggleProductActiveAction(id: string) {
  const session = await requirePermission("products:manage");
  if (!session) return { error: "Unauthorized" };

  const product = await prisma.product.findUnique({ where: { id }, select: { active: true } });
  if (!product) return { error: "Product not found" };

  await prisma.product.update({ where: { id }, data: { active: !product.active } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleServiceActiveAction(id: string) {
  const session = await requirePermission("services:manage");
  if (!session) return { error: "Unauthorized" };

  const service = await prisma.service.findUnique({ where: { id }, select: { active: true } });
  if (!service) return { error: "Service not found" };

  await prisma.service.update({ where: { id }, data: { active: !service.active } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
}