import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Customers" };

type SearchParams = Promise<{ q?: string }>;

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("customers:view");
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      points: true,
      referralCode: true,
      createdAt: true,
      _count: { select: { appointments: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const [apptSpend, orderSpend] = await Promise.all([
    prisma.appointment.groupBy({
      by: ["userId"],
      where: { userId: { not: null }, status: { in: ["COMPLETED", "CONFIRMED"] } },
      _sum: { amount: true },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { not: null }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
  ]);
  const spendMap = new Map<string, number>();
  for (const g of apptSpend) if (g.userId) spendMap.set(g.userId, (spendMap.get(g.userId) ?? 0) + (g._sum.amount ?? 0));
  for (const g of orderSpend) if (g.userId) spendMap.set(g.userId, (spendMap.get(g.userId) ?? 0) + (g._sum.total ?? 0));

  const total = customers.reduce((sum, c) => sum + (spendMap.get(c.id) ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Customers</h2>
          <p className="text-sm text-muted-foreground">
            {customers.length} customer{customers.length === 1 ? "" : "s"} · {formatZAR(total)} lifetime value.
          </p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or email…"
            className="h-9 w-64 rounded-lg border bg-card px-3 text-sm outline-none transition focus:border-rose"
          />
          <button type="submit" className="h-9 rounded-lg bg-rose px-4 text-sm font-semibold text-white transition hover:bg-rose/90">
            Search
          </button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Contact</th>
                  <th className="px-5 py-3.5 font-semibold">Points</th>
                  <th className="px-5 py-3.5 font-semibold">Bookings</th>
                  <th className="px-5 py-3.5 font-semibold">Orders</th>
                  <th className="px-5 py-3.5 font-semibold">Lifetime value</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                      No customers found.
                    </td>
                  </tr>
                )}
                {customers.map((c) => (
                  <tr key={c.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/customers/${c.id}`} className="group inline-flex items-center gap-1.5 font-medium hover:text-rose">
                        {c.name}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">{c.referralCode}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p>{c.email}</p>
                      <p className="text-xs text-muted-foreground">{c.phone ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold">{c.points} pts</span>
                    </td>
                    <td className="px-5 py-3.5">{c._count.appointments}</td>
                    <td className="px-5 py-3.5">{c._count.orders}</td>
                    <td className="px-5 py-3.5 font-semibold">{formatZAR(spendMap.get(c.id) ?? 0)}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
