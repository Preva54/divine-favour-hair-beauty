"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ToggleButton({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => Promise<{ error?: string; ok?: boolean } | undefined>;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const res = await onToggle();
          if (res?.error) toast.error(res.error);
        })
      }
      disabled={pending}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        on ? "bg-emerald-500" : "bg-slate-300",
        pending && "opacity-60"
      )}
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          on ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}