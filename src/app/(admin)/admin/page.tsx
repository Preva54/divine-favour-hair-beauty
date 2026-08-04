import Link from "next/link";
import { CalendarDays, CircleDollarSign, MessageSquare, Package, ShoppingBag, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  await adminGuard();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    revenue,
    monthRevenue,
    pendingBookings,
    newOrders,
    newMessages,
    unapprovedReviews,
    lowStock,
    recentAppointments,
    recentOrders,
  ] = await Promise.all([
    prisma.appointment.aggregate({ where: { status: { in: ["COMPLETED", "CONFIRMED"] } }, _sum: { amount: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.product.count({ where: { stock: { lte: 5 }, active: true } }),
    prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { service: { select: { name: true } }, stylist: { select: { name: true } }, user: { select: { name: true } } },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
  ]);

  const stats = [
    { icon: CircleDollarSign, label: "Lifetime revenue", value: formatZAR(revenue._sum.amount ?? 0), sub: "appointments" },
    { icon: CalendarDays, label: "This month sales", value: formatZAR(monthRevenue._sum.total ?? 0), sub: "orders" },
    { icon: ShoppingBag, label: "Pending orders", value: newOrders.toString(), sub: "awaiting action", href: "/admin/orders" },
    { icon: MessageSquare, label: "New messages", value: newMessages.toString(), sub: "unread", href: "/admin/messages" },
    { icon: Star, label: "Pending reviews", value: unapprovedReviews.toString(), sub: "to moderate", href: "/admin/reviews" },
    { icon: Package, label: "Low stock", value: lowStock.toString(), sub: "≤ 5 units", href: "/admin/products" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">A snapshot of Divine Favour operations — {formatDate(now)}.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="transition hover:-translate-y-0.5 hover:shadow-lux">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose/10">
                <s.icon className="h-5 w-5 text-rose" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="font-serif text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent bookings</CardTitle>
            <Link href="/admin/bookings" className="text-xs font-semibold text-rose hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {pendingBookings > 0 && (
              <p className="mb-3 rounded-xl bg-gold/15 px-3 py-2 text-xs font-medium text-gold">
                {pendingBookings} booking{pendingBookings === 1 ? "" : "s"} awaiting confirmation
              </p>
            )}
            <div className="divide-y">
              {recentAppointments.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No bookings yet.</p>}
              {recentAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {a.guestName ?? a.user?.name ?? "Guest"} · {a.service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(a.start)} · {a.stylist.name} · {formatZAR(a.amount)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Link href="/admin/orders" className="text-xs font-semibold text-rose hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentOrders.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>}
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      #{o.ref} · {o.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} · {formatZAR(o.total)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}