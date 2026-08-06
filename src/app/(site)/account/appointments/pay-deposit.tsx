"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createDepositPaymentAction } from "@/lib/actions/booking";

export function PayDeposit({ id, amount }: { id: string; amount: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    const res = await createDepositPaymentAction(id);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    window.location.href = res.paymentUrl;
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={pay}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2 text-xs font-semibold text-white transition hover:bg-rose/90 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {busy ? "Opening PayFast…" : `Pay R${amount} deposit`}
      </button>
      {error && <p className="max-w-52 text-right text-xs text-rose">{error}</p>}
    </div>
  );
}
