import type { Metadata } from "next";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Divine Favour Hair & Beauty account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const sp = await searchParams;
  const callbackUrl =
    typeof sp.callbackUrl === "string" && sp.callbackUrl.startsWith("/") ? sp.callbackUrl : "/account";

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to manage bookings, orders and beauty points.</p>

      {sp.registered === "1" && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
          <AlertOctagon className="h-4 w-4 shrink-0 text-gold" />
          Account created — sign in to continue.
        </div>
      )}
      {sp.error === "CredentialsSignin" && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
          <AlertOctagon className="h-4 w-4 shrink-0" />
          Invalid email or password.
        </div>
      )}

      <div className="mt-7">
        <LoginForm callbackUrl={callbackUrl} />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to Divine Favour?{" "}
        <Link href="/register" className="font-semibold text-rose hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}