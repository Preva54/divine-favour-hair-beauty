"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserRoleAction } from "@/lib/actions/admin-content";

const ROLES = ["CUSTOMER", "SUPER_ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ACCOUNTANT", "INVENTORY_MANAGER", "MARKETING_MANAGER", "CUSTOMER_SUPPORT"] as const;

export function UserRoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={role}
        disabled={pending || disabled}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            const res = await updateUserRoleAction(userId, next);
            if (res?.error) {
              toast.error(res.error);
              e.target.value = role;
            }
          });
        }}
        className="h-9 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-medium capitalize outline-none transition focus:border-rose disabled:opacity-60"
        aria-label="User role"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.toLowerCase()}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-rose" />}
    </div>
  );
}