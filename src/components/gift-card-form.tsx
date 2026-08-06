"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Gift, PartyPopper, Send } from "lucide-react";
import { toast } from "sonner";
import { formatZAR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { purchaseGiftCardAction } from "@/lib/actions/gift-cards";

const DENOMS = [250, 500, 750, 1000];

export function GiftCardForm({ signedIn }: { signedIn: boolean }) {
  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ code: string; amount: number; recipientEmail: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!finalAmount || finalAmount < 50) {
      toast.error("Minimum gift card amount is R50.");
      return;
    }
    if (!recipientName.trim()) {
      toast.error("Who is the lucky diva? Add a recipient name.");
      return;
    }
    if (!recipientEmail.includes("@")) {
      toast.error("Please enter the recipient's email.");
      return;
    }
    setBusy(true);
    const res = await purchaseGiftCardAction({
      amount: finalAmount,
      recipientEmail,
      recipientName,
      message: message.trim() || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setCreated({ code: res.code, amount: res.amount, recipientEmail: res.recipientEmail });
  }

  async function copyCode() {
    if (!created) return;
    await navigator.clipboard.writeText(created.code);
    setCopied(true);
    toast.success("Gift card code copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (created) {
    return (
      <div className="rounded-[2rem] border border-gold/30 bg-gradient-to-br from-ink via-[#2a1518] to-ink p-8 text-white shadow-lux md:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold/40 to-rose/40">
          <PartyPopper className="h-8 w-8 text-gold" />
        </div>
        <h3 className="text-center font-serif text-2xl font-semibold">Your gift card is ready!</h3>
        <p className="mt-2 text-center text-sm text-white/60">
          {formatZAR(created.amount)} gift card for {created.recipientEmail}
        </p>

        <div className="mt-7 rounded-2xl border border-dashed border-gold/40 bg-white/5 p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Gift card code</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-[0.2em] text-gold">{created.code}</p>
          <p className="mt-3 text-xs text-white/50">
            Share this code with your loved one — they can redeem it in salon or online.
          </p>
          <Button type="button" variant="gold" className="mt-5" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy code"}
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-white/60">
          <span>We&apos;ve saved it to your account too.</span>
          <Link href="/account/gift-cards" className="font-semibold text-gold hover:underline">
            View my gift cards →
          </Link>
        </div>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-[2rem] border border-gold/30 bg-gradient-to-br from-ink via-[#2a1518] to-ink p-8 text-center text-white shadow-lux md:p-10">
        <Gift className="mx-auto mb-4 h-10 w-10 text-gold" />
        <h3 className="font-serif text-2xl font-semibold">Sign in to buy a gift card</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/60">
          Your gift cards live in your account — sign in or create a free account to get started.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href="/login?callbackUrl=/gift-cards">Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white hover:text-ink">
            <Link href="/register?callbackUrl=/gift-cards">Create account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[2rem] border border-gold/30 bg-gradient-to-br from-ink via-[#2a1518] to-ink p-8 text-white shadow-lux md:p-10">
      <p className="eyebrow mb-2 text-gold">Buy a gift card</p>
      <h3 className="font-serif text-2xl font-semibold">Make someone&apos;s day</h3>

      <div className="mt-7">
        <Label className="text-white/70">Amount</Label>
        <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DENOMS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { setAmount(d); setCustom(""); }}
              className={
                "rounded-xl border px-3 py-3 font-serif text-lg font-bold transition " +
                (!custom && amount === d
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-gold/50")
              }
            >
              R{d.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Or enter a custom amount"
            inputMode="numeric"
            className="h-11 border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-gold"
          />
          {custom && <span className="shrink-0 font-semibold text-gold">{formatZAR(Number(custom) || 0)}</span>}
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gc-name" className="text-white/70">Recipient name</Label>
          <Input id="gc-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="h-11 border-white/15 bg-white/10 text-white placeholder:text-white/40" placeholder="e.g. Nomsa" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gc-email" className="text-white/70">Recipient email</Label>
          <Input id="gc-email" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="h-11 border-white/15 bg-white/10 text-white placeholder:text-white/40" placeholder="nomsa@example.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="gc-msg" className="text-white/70">Personal message (optional)</Label>
          <Textarea id="gc-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} className="border-white/15 bg-white/10 text-white placeholder:text-white/40" placeholder="Happy birthday, gorgeous!" />
        </div>
      </div>

      <Button type="submit" variant="gold" size="lg" className="mt-7 w-full" disabled={busy}>
        {busy ? "Creating…" : <><Send className="h-4 w-4" /> Buy gift card · {formatZAR(finalAmount || 0)}</>}
      </Button>
      <p className="mt-4 text-center text-xs text-white/45">
        Gift cards never expire and can be used on any treatment or product — in salon or online.
      </p>
    </form>
  );
}
