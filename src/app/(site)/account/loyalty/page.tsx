import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Gift, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { SALON } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default async function LoyaltyPage() {
  const userId = await requireUser();
  const [user, txns] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, referralCode: true, referredBy: true },
    }),
    prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const levels = [
    { name: "Silk", points: 0, perks: "Welcome points, birthday treat" },
    { name: "Velvet", points: 500, perks: "Priority booking, free deep-conditioning" },
    { name: "Crown", points: 1500, perks: "10% off all services + quarterly gift" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-ink via-[#2a1518] to-ink p-8 text-white shadow-lux">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow mb-2 text-gold">Your rewards</p>
            <p className="font-serif text-5xl font-bold">{user?.points ?? 0}</p>
            <p className="text-sm text-white/70">beauty points</p>
            <p className="mt-3 text-xs text-white/50">
              R1 spent = {SALON.pointsPerRand} point · 100 points = R50 off
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-center backdrop-blur">
            <Gift className="mx-auto mb-2 h-6 w-6 text-gold" />
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">Your referral code</p>
            <p className="mt-1 font-serif text-2xl font-bold tracking-widest text-gold">{user?.referralCode}</p>
            <p className="mt-2 max-w-[220px] text-[11px] text-white/50">
              Share it — you earn {SALON.referralPoints} points when a friend joins with your code.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Reward tiers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {levels.map((l) => (
            <div key={l.name} className="rounded-2xl border bg-white p-5 shadow-soft">
              <p className="font-serif text-lg font-semibold">{l.name}</p>
              <p className="text-xs font-medium text-rose">{l.points} points to unlock</p>
              <p className="mt-2 text-sm text-muted-foreground">{l.perks}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-soft">
        <h2 className="mb-4 font-serif text-xl font-semibold">Points history</h2>
        {txns.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet — book a service or shop to start earning.
          </p>
        ) : (
          <div className="divide-y">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      t.points > 0 ? "bg-gold/15 text-gold" : "bg-rose/10 text-rose",
                    )}
                  >
                    {t.points > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
                <span className={cn("font-bold", t.points > 0 ? "text-emerald-600" : "text-rose")}>
                  {t.points > 0 ? "+" : ""}
                  {t.points}
                </span>
              </div>
            ))}
          </div>
        )}
        {!user?.referredBy && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-ivory/60 p-3 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 shrink-0 text-rose" />
            Enter a friend&apos;s referral code at registration to start with bonus points.
          </p>
        )}
      </section>

      <div className="rounded-3xl border bg-white p-6 text-center shadow-soft">
        <h3 className="font-serif text-lg font-semibold">Share your referral link</h3>
        <Link
          href={`/register?referral=${user?.referralCode}`}
          className="mt-2 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition hover:bg-rose"
        >
          Copy referral link
        </Link>
      </div>
    </div>
  );
}