import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { deleteGiftCardAction } from "@/lib/actions/admin-content";
import { DeleteButton } from "@/components/admin/delete-button";
import { GiftCardForm } from "@/components/admin/gift-card-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Gift Cards" };

export default async function AdminGiftCardsPage() {
  await requirePermission("giftcards:view");
  const cards = await prisma.giftCard.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { recipientUser: { select: { name: true, email: true } } },
  });

  const active = cards.filter((c) => c.status === "ACTIVE");
  const redeemedValue = cards.reduce((sum, c) => sum + (c.amount - c.balance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Gift cards</h2>
          <p className="text-sm text-muted-foreground">
            {active.length} active cards · {formatZAR(redeemedValue)} redeemed in total.
          </p>
        </div>
        <GiftCardForm />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Code</th>
                  <th className="px-5 py-3.5 font-semibold">Recipient</th>
                  <th className="px-5 py-3.5 font-semibold">From</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Balance</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Issued</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cards.map((c) => {
                  const redeemed = c.amount - c.balance > 0 && c.status === "ACTIVE";
                  return (
                    <tr key={c.id} className="transition hover:bg-ivory/40">
                      <td className="px-5 py-3.5">
                        <p className="font-mono font-semibold">{c.code}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{c.recipientName ?? c.recipientUser?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{c.recipientUser?.email ?? c.recipientEmail}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.senderName}</td>
                      <td className="px-5 py-3.5 font-medium">{formatZAR(c.amount)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={c.balance > 0 ? "success" : "neutral"}>{formatZAR(c.balance)}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={c.status === "ACTIVE" ? "success" : c.status === "REDEEMED" ? "neutral" : "danger"}>
                          {c.status.toLowerCase()}
                          {redeemed ? " (partially)" : ""}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{formatDate(c.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end">
                          <DeleteButton id={c.id} label="gift card" onDelete={deleteGiftCardAction} confirm="Delete this gift card permanently?" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}