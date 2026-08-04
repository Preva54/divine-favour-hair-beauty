import type { Metadata } from "next";
import Link from "next/link";
import { Check, Coins, Crown, Gift, Heart, Sparkle, TicketPercent } from "lucide-react";
import { auth } from "@/lib/auth";
import { SALON } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Loyalty & Rewards",
  description: "Join the Divine Circle — earn beauty points on every visit and purchase, unlock tiers and redeem for discounts, free treatments and birthday gifts.",
};

const TIERS = [
  {
    icon: Sparkle,
    name: "Silk",
    points: 0,
    color: "text-slate-400 border-slate-300 bg-slate-50",
    perks: ["Welcome bonus points", "Birthday treat", "Exclusive promotions"],
  },
  {
    icon: Coins,
    name: "Velvet",
    points: 500,
    color: "text-[#8a6d9f] border-[#8a6d9f]/30 bg-[#8a6d9f]/10",
    perks: ["Everything in Silk", "Priority booking", "Free deep-conditioning once a year"],
  },
  {
    icon: Crown,
    name: "Crown",
    points: 1500,
    color: "text-gold border-gold/40 bg-gold/10",
    perks: ["Everything in Velvet", "10% off all services", "Quarterly curated gift"],
  },
];

const FAQ = [
  {
    q: "How do I earn points?",
    a: `Every R1 you spend on services or products earns you ${SALON.pointsPerRand} beauty point. Referrals and special promotions earn bonus points too.`,
  },
  {
    q: "How do I redeem my points?",
    a: "100 points = R50 off any service or product. Redeem at checkout online or ask our team at the salon.",
  },
  {
    q: "Do points expire?",
    a: "Points never expire while your account is active. Keep the glow going for as long as you like.",
  },
  {
    q: "Can I gift my points?",
    a: "Points are personal to you and can't be transferred, but you can buy a Gift Card for someone special — they'll love you for it.",
  },
];

export default async function LoyaltyPage() {
  const session = await auth();

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-24 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 70% at 15% 0%, rgb(183 110 121 / 0.3), transparent 60%), radial-gradient(45% 60% at 90% 100%, rgb(212 175 55 / 0.2), transparent 50%)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            <Heart className="h-3.5 w-3.5" /> The Divine Circle
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Beauty that <span className="text-gradient-rose">rewards</span> you
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Earn {SALON.pointsPerRand} beauty point for every rand you spend — on appointments, products and referrals.
            Then turn them into discounts, treatments and gifts.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href={session ? "/account/loyalty" : "/register"}>
                {session ? "View my points" : "Join free"} <Sparkle className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white hover:text-ink">
              <Link href="/gift-cards">Gift cards</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux">
          <p className="eyebrow mb-3 text-center">Reward tiers</p>
          <h2 className="text-center font-serif text-3xl font-semibold md:text-4xl">Three tiers, endless glow</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TIERS.map((t, i) => (
              <div
                key={t.name}
                className={`relative rounded-3xl border bg-white p-7 shadow-soft ${i === 2 ? "md:-translate-y-3 border-gold/50" : ""}`}
              >
                {i === 2 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
                    Most loved
                  </span>
                )}
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${t.color}`}>
                  <t.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-semibold">{t.name}</h3>
                <p className="mt-1 text-sm font-medium text-rose">{t.points.toLocaleString()} points to unlock</p>
                <ul className="mt-5 space-y-2.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            100 points = R50 off · <span className="font-medium text-rose">Refer a friend</span> and earn{" "}
            {SALON.referralPoints} bonus points when they join with your code.
          </p>
        </div>
      </section>

      <section className="section-pad bg-ivory/60">
        <div className="container-lux grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="font-serif text-3xl font-semibold md:text-4xl">
              Earn while you <span className="text-gradient-rose">indulge</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Points are tracked automatically on your account. No cards to carry, no codes to remember — just sign in
              and your balance is always up to date.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Heart, t: "Create an account", d: "Free, takes a minute." },
                { icon: TicketPercent, t: "Earn on everything", d: "Services, shop, referrals." },
                { icon: Gift, t: "Redeem anytime", d: "Discounts & free treats." },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl border bg-white p-5 shadow-soft">
                  <s.icon className="mb-3 h-6 w-6 text-rose" />
                  <p className="font-semibold">{s.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-gold/30 bg-gradient-to-br from-ink via-[#2a1518] to-ink p-8 text-white shadow-lux md:p-10">
            <p className="font-serif text-4xl font-bold text-gradient-rose">{SALON.referralPoints} pts</p>
            <p className="mt-2 text-white/70">every time a friend joins with your code — and they get a welcome bonus too.</p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex gap-2.5"><Check className="h-4 w-4 shrink-0 text-gold" /> Birthday surprise every year</li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 shrink-0 text-gold" /> Member-only product drops</li>
              <li className="flex gap-2.5"><Check className="h-4 w-4 shrink-0 text-gold" /> First access to seasonal menus</li>
            </ul>
            <Button asChild variant="gold" className="mt-8">
              <Link href={session ? "/account/loyalty" : "/register"}>
                {session ? "Open my rewards" : "Start earning"} <Sparkle className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-lux max-w-3xl">
          <p className="eyebrow mb-3 text-center">Good to know</p>
          <h2 className="text-center font-serif text-3xl font-semibold">Frequently asked</h2>
          <div className="mt-8 space-y-4">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border bg-white p-5 shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-rose transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}