import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/generated/prisma/enums";
import type { Permission } from "@/lib/permissions";

const STAFF_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.MANAGER,
  Role.RECEPTIONIST,
  Role.STYLIST,
  Role.ACCOUNTANT,
  Role.INVENTORY_MANAGER,
  Role.MARKETING_MANAGER,
  Role.CUSTOMER_SUPPORT,
];

export async function adminGuard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!STAFF_ROLES.includes(session.user?.role)) redirect("/account");
  return session;
}

export const getPermissions = cache(async () => {
  const session = await auth();
  if (!session?.user?.id || !STAFF_ROLES.includes(session.user.role)) return [] as string[];
  const rows = await prisma.rolePermission.findMany({
    where: { role: session.user.role },
    select: { permission: true },
  });
  return rows.map((r) => r.permission);
});

export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!STAFF_ROLES.includes(session.user?.role)) redirect("/account");
  const has = await prisma.rolePermission.count({
    where: { role: session.user.role, permission },
  });
  if (!has) redirect("/account");
  return session;
}

export async function requireUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/account");
  return userId;
}
