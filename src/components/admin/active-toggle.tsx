"use client";

import { useTransition } from "react";
import { toggleProductActiveAction, toggleServiceActiveAction } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

export function ActiveToggle({
  kind,
  id,
  active,
  label,
}: {
  kind: "product" | "service";
  id: string;
  active: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const action = kind === "product" ? toggleProductActiveAction : toggleServiceActiveAction;

  return (
    <button
      onClick={() => startTransition(() => void action(id))}
      disabled={pending}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        active ? "bg-emerald-500" : "bg-slate-300",
        pending && "opacity-60"
      )}
      aria-label={`${active ? "Hide" : "Show"} ${label}`}
      title={active ? "Click to hide" : "Click to show"}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          active ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}