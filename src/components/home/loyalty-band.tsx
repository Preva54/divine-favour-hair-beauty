import Link from "next/link";
import { ArrowRight, Coins, Gift, Sparkle, TicketPercent } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const PERKS = [
  { icon: Coins, title: "Earn Beauty Points", text: "Every rand you spend earns beauty points — automatically." },
  { icon: Gift, title: "Birthday & Rewards", text: "Birthday gifts, free treatments and member-only exclusives." },
  { icon: TicketPercent, title: "Redeem Instantly", text: "Turn points into discounts, treatments and products." },
];

export function LoyaltyBand() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 15% 20%, rgb(183 110 121 / 0.25), transparent 45%), radial-gradient(circle at 85% 75%, rgb(212 175 55 / 0.15), transparent 40%)" }} />
      <div className="container-lux relative py-20 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              dark
              eyebrow="Membership & Loyalty"
              title="Beauty That Rewards You Back"
              description="Join the Divine Circle and earn beauty points on every visit and purchase. Redeem them for discounts, free treatments, birthday gifts and exclusive promotions."
              className="mb-8"
            />
            <Stagger className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {PERKS.map((p) => (
                <StaggerItem key={p.title}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-gold/50">
                    <p.icon className="mb-3 h-6 w-6 text-gold" />
                    <h3 className="font-serif text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{p.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Reveal delay={0.1}>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose to-gold text-white">
                  <Sparkle className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold">How it works</p>
                  <h3 className="font-serif text-2xl font-semibold">Earn on everything</h3>
                </div>
              </div>
              <ol className="space-y-6">
                {[
                  { t: "Join for free", d: "Create an account—it takes a minute." },
                  { t: "Earn as you go", d: "Appointments, store purchases and referrals all earn points." },
                  { t: "Redeem your way", d: "Discounts on treatments, products, gift cards and more." },
                ].map((step, i) => (
                  <li key={step.t} className="flex gap-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 font-serif text-lg font-bold text-gold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{step.t}</p>
                      <p className="text-sm text-white/60">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <Button asChild variant="gold" size="lg">
                  <Link href="/loyalty">
                    Join the Circle <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white hover:text-ink">
                  <Link href="/gift-cards">Give a Gift Card</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}