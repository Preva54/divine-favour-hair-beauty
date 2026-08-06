import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password · Divine Favour" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email you registered with and we&apos;ll send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1 font-medium text-rose hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </p>
    </div>
  );
}
