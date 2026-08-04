import Link from "next/link";
import { Gift, Ticket } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function GiftCardsPage() {
  const uid = await requireUser();
  const [purchased, received] = await Promise.all([
    prisma.giftCard.findMany({ where: { purchasedById: uid }, orderBy: { createdAt: "desc" } }),
    prisma.giftCard.findMany({ where: { recipientUserId: uid }, orderBy: { createdAt: "desc" } }),
  ]);

type GiftCardRow = Awaited<ReturnType<typeof prisma.giftCard.findMany>>[number];

  const Card = ({ g, kind }: { g: GiftCardRow; kind: "purchased" | "received" }) => (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#2a1518] to-ink p-6 text-white shadow-soft">
      <div className="flex items-start justify-between">
        <Gift className="h-6 w-6 text-gold" />
        <Badge variant={g.status === "ACTIVE" ? "default" : "outline"} className="border-white/20 text-white">
          {g.status}
        </Badge>
      </div>
      <p className="mt-4 font-serif text-3xl font-bold text-gold">{formatZAR(g.amount)}</p>
      <p className="mt-1 text-xs text-white/60">
        Balance: {formatZAR(g.balance)} · Code {g.code}
      </p>
      <div className="mt-4 border-t border-white/10 pt-3 text-[11px] text-white/60">
        {kind === "purchased" ? (
          <>
            Gifted to <span className="font-semibold text-white">{g.recipientName ?? g.recipientEmail}</span>
          </>
        ) : (
          <>From {g.senderName}</>
        )}
        <span className="block mt-0.5">— {formatDate(g.createdAt)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Gift cards</h2>
          <p className="text-sm text-muted-foreground">The perfect gift — spendable on any treatment or product.</p>
        </div>
        <Link
          href="/gift-cards"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory transition hover:bg-rose"
        >
          <Ticket className="h-4 w-4" /> Buy a gift card
        </Link>
      </div>

      {purchased.length === 0 && received.length === 0 && (
        <div className="rounded-3xl border bg-white p-14 text-center shadow-soft">
          <Gift className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No gift cards yet.</p>
          <Link href="/gift-cards" className="mt-4 inline-block rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white">
            Send your first gift card
          </Link>
        </div>
      )}

      {purchased.length > 0 && (
        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold">You gifted</h3>
          <div className="grid gap-4 sm:grid-cols-2">{purchased.map((g) => <Card key={g.id} g={g} kind="purchased" />)}</div>
        </section>
      )}

      {received.length > 0 && (
        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold">Gifted to you</h3>
          <div className="grid gap-4 sm:grid-cols-2">{received.map((g) => <Card key={g.id} g={g} kind="received" />)}</div>
        </section>
      )}
    </div>
  );
}