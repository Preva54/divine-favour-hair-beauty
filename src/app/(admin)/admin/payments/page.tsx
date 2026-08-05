import Link from "next/link";
import { CreditCard } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata = { title: "Payments" };

type SearchParams = Promise<{ status?: string; type?: string }>;

const STATUSES = ["UNPAID", "DEPOSIT_PAID", "PAID", "REFUNDED"] as const;

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-emerald-500/10 text-emerald-600",
    DEPOSIT_PAID: "bg-gold/15 text-gold",
    UNPAID: "bg-destructive/10 text-destructive",
    REFUNDED: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide", styles[status] ?? "bg-muted text-muted-foreground")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("payments:view");
  const { status, type } = await searchParams;
  const statusFilter = STATUSES.includes(status as never) ? (status as string) : "";
  const typeFilter = type === "appointments" || type === "orders" ? type : "";

  const [appointments, orders] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...(statusFilter ? { paymentStatus: statusFilter as never } : {}) },
      select: {
        id: true,
        ref: true,
        start: true,
        amount: true,
        depositAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        guestName: true,
        service: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { start: "desc" },
      take: 200,
    }),
    prisma.order.findMany({
      where: { ...(statusFilter ? { paymentStatus: statusFilter as never } : {}) },
      select: {
        id: true,
        ref: true,
        createdAt: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        fullName: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const filteredAppointments = typeFilter === "orders" ? [] : appointments;
  const filteredOrders = typeFilter === "appointments" ? [] : orders;

  const apptTotal = filteredAppointments.reduce((s, a) => s + a.amount, 0);
  const orderTotal = filteredOrders.reduce((s, o) => s + o.total, 0);
  const unpaidAppointments = filteredAppointments.filter((a) => a.paymentStatus === "UNPAID").reduce((s, a) => s + a.amount, 0);
  const unpaidOrders = filteredOrders.filter((o) => o.paymentStatus === "UNPAID").reduce((s, o) => s + o.total, 0);

  const rows = [
    ...filteredAppointments.map((a) => ({
      key: `a-${a.id}`,
      type: "appointment" as const,
      href: "/admin/bookings",
      ref: a.ref,
      date: formatDate(a.start),
      party: a.guestName ?? a.user?.name ?? "Guest",
      detail: a.service.name,
      amount: a.amount,
      method: a.paymentMethod ?? "—",
      status: a.paymentStatus,
    })),
    ...filteredOrders.map((o) => ({
      key: `o-${o.id}`,
      type: "order" as const,
      href: "/admin/orders",
      ref: o.ref,
      date: formatDate(o.createdAt),
      party: o.fullName,
      detail: "Order",
      amount: o.total,
      method: o.paymentMethod ?? "—",
      status: o.paymentStatus,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const stats = [
    { label: "Ledger total", value: formatZAR(apptTotal + orderTotal), sub: `${rows.length} payments` },
    { label: "Outstanding", value: formatZAR(unpaidAppointments + unpaidOrders), sub: "unpaid" },
    { label: "Appointments", value: formatZAR(apptTotal), sub: `${filteredAppointments.length} bookings` },
    { label: "Orders", value: formatZAR(orderTotal), sub: `${filteredOrders.length} orders` },
  ];

  const chip = (label: string, value: string) => {
    const active =
      (value === "" && !statusFilter && !typeFilter) ||
      (statusFilter === value) ||
      (typeFilter === value && (value === "appointments" || value === "orders"));
    return (
      <Link
        href={`/admin/payments?${value ? `${value === "appointments" || value === "orders" ? "type" : "status"}=${value}` : ""}`}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition hover:bg-muted",
          active && "border-rose bg-rose/10 font-semibold text-rose"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Payments</h2>
        <p className="text-sm text-muted-foreground">Consolidated ledger of booking and order payments.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="font-serif text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {chip("All", "")}
        {chip("Appointments", "appointments")}
        {chip("Orders", "orders")}
        {STATUSES.map((s) => chip(s.replace(/_/g, " ").toLowerCase(), s))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Reference</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Party</th>
                  <th className="px-5 py-3.5 font-semibold">Detail</th>
                  <th className="px-5 py-3.5 font-semibold">Method</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                      No payments match the filter.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.key} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5">
                      <Link href={r.href} className="font-mono text-xs font-medium text-rose hover:underline">
                        {r.ref}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" /> {r.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{r.date}</td>
                    <td className="px-5 py-3.5 font-medium">{r.party}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{r.detail}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{r.method.replace(/_/g, " ").toLowerCase()}</td>
                    <td className="px-5 py-3.5 font-semibold">{formatZAR(r.amount)}</td>
                    <td className="px-5 py-3.5">
                      <PaymentBadge status={r.status} />
                    </td>
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
