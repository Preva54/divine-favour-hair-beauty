import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset Password · Divine Favour" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Make it strong — at least 6 characters.</p>
      </div>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">
            This reset link is missing its token.{" "}
            <Link href="/forgot-password" className="font-medium text-rose hover:underline">
              Request a new one
            </Link>
            .
          </p>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1 font-medium text-rose hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </p>
    </div>
  );
}
