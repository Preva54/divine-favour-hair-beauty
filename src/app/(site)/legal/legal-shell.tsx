import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal",
  robots: { index: false },
};

export function LegalShell({
  eyebrow,
  title,
  update,
  children,
}: {
  eyebrow: string;
  title: string;
  update: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-[74px]">
      <div className="container-lux max-w-3xl py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-rose">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <span className="eyebrow mb-2 mt-6 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> {eyebrow}
        </span>
        <h1 className="font-serif text-4xl font-semibold">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: {update}</p>
        <div className="mt-8 space-y-6 rounded-3xl border bg-white p-8 text-sm leading-relaxed text-foreground/80 shadow-soft">
          {children}
        </div>
      </div>
    </div>
  );
}