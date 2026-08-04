import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SALON } from "@/lib/constants";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Divine Favour Hair & Beauty and earn 250 welcome beauty points.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ referral?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const sp = await searchParams;
  const referral = typeof sp.referral === "string" ? sp.referral : "";

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join the Divine Favour family and earn rewards on every visit.
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-rose/10 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
          <Gift className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink">
          <span className="font-semibold">{SALON.welcomePoints} welcome points</span> instantly — redeem for
          treatments and products.
        </p>
      </div>

      <div className="mt-7">
        <RegisterForm initialReferral={referral} />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href="/login" className="font-semibold text-rose hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-rose" /> By joining you accept our{" "}
        <Link href="/legal/terms" className="underline hover:text-rose">
          terms
        </Link>
        .
      </p>
    </div>
  );
}