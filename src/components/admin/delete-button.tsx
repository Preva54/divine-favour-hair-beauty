"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DeleteButton({
  id,
  label,
  onDelete,
  confirm,
  className,
}: {
  id: string;
  label: string;
  onDelete: (id: string) => Promise<{ error?: string; ok?: boolean } | undefined>;
  confirm?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          const res = await onDelete(id);
          if (res?.error) toast.error(res.error);
        });
      }}
      disabled={pending}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-rose-50 hover:text-rose disabled:opacity-60",
        className
      )}
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}