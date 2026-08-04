"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, type RegisterState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="dark" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function RegisterForm({ initialReferral = "" }: { initialReferral?: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState<RegisterState, FormData>(registerAction, {});

  useEffect(() => {
    if (state?.ok && state.redirect) router.push(state.redirect);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required minLength={2} placeholder="e.g. Thandi Nkosi" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" placeholder="+27 82 000 0000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referral">Referral code (optional)</Label>
          <Input id="referral" name="referral" defaultValue={initialReferral} placeholder="DF-YOU123" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={6} placeholder="At least 6 characters" />
      </div>

      {state?.error && <p className="text-sm text-rose">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}