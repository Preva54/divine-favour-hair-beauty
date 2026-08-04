import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent, CalendarHeart, Gift, Send, Sparkles, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Give the gift of beauty — Divine Favour gift cards are spendable on any treatment or product, in salon or online.",
};

const DENOMS = [250, 500, 750, 1000];

const STEPS = [
  { icon: Send, t: "Pick a design & amount", d: "Choose from R250 up — plus a personal message." },
  { icon: Wallet, t: "We deliver instantly", d: "Emailed to your loved one the moment it's paid for." },
  { icon: Sparkles, t: "They redeem in salon", d: "Treatments, products, anything on their wishlist." },
];

export default async function GiftCardsPage() {
  const session = await auth();

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-24 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 85% 0%, rgb(212 175 55 / 0.25), transparent 60%), radial-gradient(45% 60% at 5% 100%, rgb(183 110 121 / 0.3), transparent 50%)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose/40 bg-rose/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose">
            <Gift className="h-3.5 w-3.5" /> The perfect present
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Give the gift of <span className="text-gradient-rose">beauty</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Gift cards never expire and can be used for any treatment or product — online or at 1066 Dariek Street.
          </p>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow mb-3">Choose an amount</p>
            <h2 className="font-serif text-3xl font-semibold md:text-4xl">
              From R250 to <span className="text-gradient-rose">unforgettable</span>
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {DENOMS.map((d) => (
                <div key={d} className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-gold/60 hover:shadow-lux">
                  <p className="font-serif text-3xl font-bold">R{d.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Beauty gift card</p>
                  <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-rose/20 to-gold/20 transition group-hover:scale-150" />
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarHeart className="h-4 w-4 shrink-0 text-rose" /> Can&apos;t decide? Top up any amount in salon — every rand helps a dream appointment.
            </p>
          </div>

          <div className="rounded-[2rem] border border-gold/30 bg-gradient-to-br from-ink via-[#2a1518] to-ink p-8 text-white shadow-lux md:p-10">
            <p className="eyebrow mb-2 text-gold">How it works</p>
            <h3 className="font-serif text-2xl font-semibold">Three easy steps</h3>
            <div className="mt-8 space-y-6">
              {STEPS.map((s, i) => (
                <div key={s.t} className="flex gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10">
                    <s.icon className="h-5 w-5 text-gold" />
                  </span>
                  <div>
                    <p className="font-semibold">{s.t}</p>
                    <p className="mt-1 text-sm text-white/60">{s.d}</p>
                  </div>
                  <span className="ml-auto font-serif text-2xl font-bold text-white/15">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href={session ? "/account/gift-cards" : "/register"}>
                  {session ? "Buy a gift card" : "Sign in to buy"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white hover:text-ink">
                <Link href="/shop">Shop instead</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-ivory/60">
        <div className="container-lux">
          <p className="eyebrow mb-3 text-center">Everything covered</p>
          <h2 className="text-center font-serif text-3xl font-semibold">One card, endless possibilities</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Sparkles, t: "Any treatment", d: "Wigs, braids, silk press, nails, makeup — the full menu." },
              { icon: BadgePercent, t: "Any product", d: "Extensions, oils, brushes and everything in our shop." },
              { icon: Gift, t: "Never expires", d: "No expiry, no fuss. Balance shown right in their account." },
            ].map((c) => (
              <div key={c.t} className="rounded-3xl border bg-white p-7 text-center shadow-soft">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose/10">
                  <c.icon className="h-6 w-6 text-rose" />
                </div>
                <h3 className="font-serif text-xl font-semibold">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Terms: gift cards are redeemable in person at the salon or online, are non-refundable and non-transferable.
          </p>
        </div>
      </section>
    </>
  );
}