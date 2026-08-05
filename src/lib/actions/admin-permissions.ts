"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { DEFAULT_ROLE_PERMISSIONS, ALL_PERMISSIONS } from "@/lib/permissions";
import { Role } from "@/generated/prisma/enums";

type ActionResult = { error?: string; ok?: boolean };

const ROLES = Object.values(Role) as string[];

function isValidRole(role: string): role is Role {
  return ROLES.includes(role);
}

export async function updateRolePermissionsAction(role: string, permissions: string[]): Promise<ActionResult> {
  await requirePermission("settings:manage");
  if (!isValidRole(role)) return { error: "Invalid role" };
  const valid = permissions.filter((p) => ALL_PERMISSIONS.includes(p as never));

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { role } }),
    prisma.rolePermission.createMany({
      data: valid.map((permission) => ({ role: role as Role, permission })),
    }),
  ]);
  revalidatePath("/admin/permissions");
  revalidatePath("/admin");
  return { ok: true };
}

export async function resetRolePermissionsAction(role: string): Promise<ActionResult> {
  await requirePermission("settings:manage");
  if (!isValidRole(role)) return { error: "Invalid role" };
  const defaults = DEFAULT_ROLE_PERMISSIONS[role as Role];

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { role } }),
    prisma.rolePermission.createMany({
      data: defaults.map((permission) => ({ role: role as Role, permission })),
    }),
  ]);
  revalidatePath("/admin/permissions");
  revalidatePath("/admin");
  return { ok: true };
}
