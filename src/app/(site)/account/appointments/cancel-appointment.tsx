"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelAppointmentAction } from "@/lib/actions/account";

export function CancelAppointment({ id, code }: { id: string; code: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onCancel() {
    if (!confirm(`Cancel booking ${code}? This can't be undone.`)) return;
    setBusy(true);
    const res = await cancelAppointmentAction(id);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not cancel.");
      return;
    }
    toast.success("Appointment cancelled.");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onCancel}
      disabled={busy}
      className="rounded-full border border-rose/40 px-4 py-1.5 text-xs font-semibold text-rose transition hover:bg-rose hover:text-white disabled:opacity-50"
    >
      {busy ? "Cancelling…" : "Cancel"}
    </button>
  );
}