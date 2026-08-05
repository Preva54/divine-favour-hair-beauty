"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetRolePermissionsAction, updateRolePermissionsAction } from "@/lib/actions/admin-permissions";
import { PERMISSION_GROUPS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function RolePermissionsEditor({
  role,
  roleLabel,
  initialPermissions,
}: {
  role: string;
  roleLabel: string;
  initialPermissions: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialPermissions));
  const [pending, startTransition] = useTransition();
  const savedRef = useRef(new Set(initialPermissions));

  const toggle = (permission: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  };

  const dirty = selected.size !== savedRef.current.size || [...selected].some((p) => !savedRef.current.has(p));

  const save = () => {
    startTransition(async () => {
      const res = await updateRolePermissionsAction(role, [...selected]);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      savedRef.current = new Set(selected);
      toast.success(`${roleLabel} permissions updated`);
    });
  };

  const reset = () => {
    startTransition(async () => {
      const res = await resetRolePermissionsAction(role);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setSelected(new Set(initialPermissions));
      savedRef.current = new Set(initialPermissions);
      toast.success(`${roleLabel} permissions reset to defaults`);
    });
  };

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-serif text-base font-semibold">{roleLabel}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose/90 disabled:opacity-40"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</p>
            {group.permissions.map((permission) => {
              const checked = selected.has(permission);
              return (
                <label
                  key={permission}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition",
                    checked ? "border-rose/40 bg-rose/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(permission)}
                    className="h-3.5 w-3.5 accent-rose"
                  />
                  <span className="font-medium">
                    {permission.endsWith(":manage") ? "Manage" : "View"}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{permission}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
