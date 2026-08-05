import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Coins, Gift, Receipt, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Customer" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("customers:view");
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { service: { select: { name: true } }, stylist: { select: { name: true } } },
        orderBy: { start: "desc" },
      },
      orders: { orderBy: { createdAt: "desc" } },
      loyaltyTransactions: { orderBy: { createdAt: "desc" } },
      giftCardsPurchased: { orderBy: { createdAt: "desc" } },
      reviews: { select: { id: true, rating: true, entity: true, approved: true } },
    },
  });
  if (!user) notFound();

  const [apptAgg, orderAgg] = await Promise.all([
    prisma.appointment.aggregate({
      where: { userId: id, status: { in: ["COMPLETED", "CONFIRMED"] } },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({ where: { userId: id, status: { not: "CANCELLED" } }, _sum: { total: true } }),
  ]);
  const lifetimeValue = (apptAgg._sum.amount ?? 0) + (orderAgg._sum.total ?? 0);

  const stats = [
    { icon: Coins, label: "Points", value: user.points.toString() },
    { icon: CalendarDays, label: "Appointments", value: user.appointments.length.toString() },
    { icon: ShoppingBag, label: "Orders", value: user.orders.length.toString() },
    { icon: Receipt, label: "Lifetime value", value: formatZAR(lifetimeValue) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">
            {user.email} · {user.phone ?? "no phone"} · joined {formatDate(user.createdAt)} · ref {user.referralCode}
          </p>
        </div>
        <span className="rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold">
          {user.points} points · {user.reviews.length} review(s)
        </span>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose/10">
                <s.icon className="h-5 w-5 text-rose" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="font-serif text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Appointments</CardTitle>
            <Link href="/admin/bookings" className="text-xs font-semibold text-rose hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="divide-y">
            {user.appointments.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No appointments.</p>}
            {user.appointments.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(a.start)} · {a.stylist.name} · {formatZAR(a.amount)} · {a.paymentStatus}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <Link href="/admin/orders" className="text-xs font-semibold text-rose hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="divide-y">
            {user.orders.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No orders.</p>}
            {user.orders.slice(0, 8).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">#{o.ref}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt)} · {formatZAR(o.total)} · {o.paymentStatus}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty activity</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {user.loyaltyTransactions.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No loyalty activity.</p>}
            {user.loyaltyTransactions.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.points >= 0 ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"}`}>
                  {t.points >= 0 ? "+" : ""}{t.points} pts
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gift cards purchased</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {user.giftCardsPurchased.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">None purchased.</p>}
            {user.giftCardsPurchased.slice(0, 8).map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Gift className="h-4 w-4 shrink-0 text-rose" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-medium">{g.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(g.createdAt)} · to {g.recipientName ?? g.recipientEmail}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatZAR(g.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
