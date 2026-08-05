"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";

type ActionResult = { error?: string; ok?: boolean };

const REASONS = ["STOCK_TAKE", "SUPPLIER_DELIVERY", "RETURN", "ADJUSTMENT", "OTHER"] as const;

export async function restockProductAction(
  productId: string,
  quantity: number,
  reason: string
): Promise<ActionResult> {
  await requirePermission("products:manage");

  if (!productId) return { error: "Product is required" };
  const qty = Math.trunc(quantity);
  if (!Number.isFinite(qty) || qty <= 0 || qty > 10000) return { error: "Quantity must be between 1 and 10 000" };
  if (!REASONS.includes(reason as (typeof REASONS)[number])) return { error: "Invalid reason" };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return { error: "Product not found" };

  try {
    await prisma.$transaction([
      prisma.product.update({ where: { id: productId }, data: { stock: { increment: qty } } }),
      prisma.stockMovement.create({ data: { productId, change: qty, reason } }),
    ]);
  } catch {
    return { error: "Could not update stock" };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}
