import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { STAFF_ROLES } from "@/lib/permissions";
import { RolePermissionsEditor } from "@/components/admin/role-permissions-editor";

export const metadata = { title: "Role Permissions" };

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  MANAGER: "Manager",
  RECEPTIONIST: "Receptionist",
  STYLIST: "Stylist",
  ACCOUNTANT: "Accountant",
  INVENTORY_MANAGER: "Inventory manager",
  MARKETING_MANAGER: "Marketing manager",
  CUSTOMER_SUPPORT: "Customer support",
};

export default async function RolePermissionsPage() {
  await requirePermission("settings:manage");

  const rows = await prisma.rolePermission.findMany({ select: { role: true, permission: true } });
  const byRole = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!byRole.has(r.role)) byRole.set(r.role, new Set());
    byRole.get(r.role)!.add(r.permission);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Role permissions</h2>
        <p className="text-sm text-muted-foreground">Configure what each staff role can view and manage. Changes apply immediately.</p>
      </div>

      <div className="space-y-6">
        {STAFF_ROLES.map((role) => (
          <RolePermissionsEditor
            key={role}
            role={role}
            roleLabel={ROLE_LABELS[role] ?? role.toLowerCase()}
            initialPermissions={[...(byRole.get(role) ?? [])]}
          />
        ))}
      </div>
    </div>
  );
}
