import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { SALON } from "@/lib/constants";

const perks = [
  "Book appointments in seconds",
  "Earn points on every visit",
  "Manage bookings & orders in one place",
];

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 70% at 15% 10%, rgb(183 110 121 / 0.35), transparent), radial-gradient(50% 60% at 90% 90%, rgb(212 175 55 / 0.18), transparent)" }}
        />
        <div className="relative">
          <Link href="/">
            <Logo dark />
          </Link>
        </div>
        <div className="relative">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Member Lounge
          </span>
          <h1 className="max-w-md font-serif text-4xl leading-tight font-semibold">
            More than beauty — <span className="text-gradient-rose">it&apos;s divine.</span>
          </h1>
          <p className="mt-4 max-w-sm text-white/70">
            Welcome back to {SALON.name} at {SALON.addressShort}. Sign in to your beauty account.
          </p>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} {SALON.name} · {SALON.addressShort}
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}