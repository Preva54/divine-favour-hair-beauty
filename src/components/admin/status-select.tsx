"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateAppointmentStatusAction, updateMessageStatusAction, updateOrderStatusAction } from "@/lib/actions/admin";

const ACTIONS = {
  appointment: updateAppointmentStatusAction,
  order: updateOrderStatusAction,
  message: updateMessageStatusAction,
} as const;

export function StatusSelect({
  kind,
  id,
  value,
  options,
}: {
  kind: keyof typeof ACTIONS;
  id: string;
  value: string;
  options: readonly string[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        fd.set("id", id);
        fd.set("status", fd.get("status") as string);
        startTransition(() => void ACTIONS[kind](fd));
      }}
      className="flex items-center gap-2"
    >
      <select
        name="status"
        defaultValue={value}
        disabled={pending}
        onChange={(e) => {
          const form = e.currentTarget.form;
          if (form) {
            const fd = new FormData(form);
            fd.set("status", e.target.value);
startTransition(() => void ACTIONS[kind](fd));
          }
        }}
        className="rounded-lg border bg-white px-2.5 py-1.5 text-xs font-medium capitalize outline-none transition focus:border-rose disabled:opacity-60"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.toLowerCase().replace(/_/g, " ")}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-rose" />}
    </form>
  );
}