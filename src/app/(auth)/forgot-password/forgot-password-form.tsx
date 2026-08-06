"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ sent: boolean; devLink?: string } | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await requestPasswordResetAction(email);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone({ sent: res.sent, devLink: res.devLink });
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
          <MailCheck className="h-7 w-7 text-gold" />
        </div>
        <h2 className="font-serif text-xl font-semibold">
          {done.sent ? "Check your inbox" : "If that account exists"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {done.sent
            ? "We've sent a password reset link — it expires in 60 minutes."
            : "we've sent a password reset link to that email. Check your inbox (and spam folder)."}
        </p>
        {done.devLink && (
          <div className="mt-5 rounded-xl bg-ivory/70 p-4 text-left text-xs">
            <p className="mb-2 font-semibold text-foreground/70">Email sending isn&apos;t configured yet — dev reset link:</p>
            <Link href={done.devLink} className="break-all text-rose hover:underline">
              {done.devLink}
            </Link>
          </div>
        )}
        <Button asChild variant="outline" className="mt-6">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fp-email">Email address</Label>
        <Input
          id="fp-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-rose">{error}</p>}
      <Button type="submit" variant="dark" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {busy ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
