import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { StylistReassign } from "@/components/admin/stylist-reassign";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Admin · Bookings" };

const OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
const STATUS_FILTERS = ["ALL", ...OPTIONS] as const;

type SearchParams = Promise<{ status?: string; stylist?: string; from?: string; to?: string }>;

export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("bookings:view");
  const { status, stylist, from, to } = await searchParams;

  const [stylists, appointments] = await Promise.all([
    prisma.stylist.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.appointment.findMany({
      where: {
        ...(status && status !== "ALL" ? { status: status as never } : {}),
        ...(stylist ? { stylistId: stylist } : {}),
        ...(from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? { start: { gte: new Date(`${from}T00:00:00`) } } : {}),
        ...(to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? { end: { lte: new Date(`${to}T23:59:59`) } } : {}),
      },
      orderBy: { start: "desc" },
      include: {
        service: { select: { name: true } },
        stylist: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
      take: 200,
    }),
  ]);

  const mkQuery = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const all = { status, stylist, from, to, ...patch };
    for (const [k, v] of Object.entries(all)) {
      if (v && v !== "ALL") params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const filterInput =
    "h-9 rounded-lg border bg-card px-3 text-xs outline-none transition focus:border-rose";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Appointment Management</h2>
        <p className="text-sm text-muted-foreground">
          Reassign appointments between stylists and manage statuses. Conflicts are checked automatically.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status ?? "ALL"}
              onChange={(e) => (window.location.href = `/admin/bookings${mkQuery({ status: e.target.value })}`)}
              className={filterInput}
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All statuses" : s.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
            <select
              value={stylist ?? "ALL"}
              onChange={(e) => (window.location.href = `/admin/bookings${mkQuery({ stylist: e.target.value })}`)}
              className={filterInput}
              aria-label="Filter by stylist"
            >
              <option value="ALL">All stylists</option>
              {stylists.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Input
              type="date"
              defaultValue={from ?? ""}
              onChange={(e) => (window.location.href = `/admin/bookings${mkQuery({ from: e.target.value })}`)}
              className={`${filterInput} w-36`}
              aria-label="From date"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              defaultValue={to ?? ""}
              onChange={(e) => (window.location.href = `/admin/bookings${mkQuery({ to: e.target.value })}`)}
              className={`${filterInput} w-36`}
              aria-label="To date"
            />
            {(status || stylist || from || to) && (
              <a href="/admin/bookings" className="text-xs font-semibold text-rose hover:underline">
                Clear filters
              </a>
            )}
            <span className="ml-auto text-xs text-muted-foreground">{appointments.length} appointment(s)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Reference</th>
                  <th className="px-5 py-3.5 font-semibold">Client</th>
                  <th className="px-5 py-3.5 font-semibold">Service</th>
                  <th className="px-5 py-3.5 font-semibold">Stylist</th>
                  <th className="px-5 py-3.5 font-semibold">When</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                      No bookings match these filters.
                    </td>
                  </tr>
                )}
                {appointments.map((a) => (
                  <tr key={a.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{a.ref}</td>
                    <td className="px-5 py-3.5 font-medium">
                      {a.guestName ?? a.user?.name ?? "Guest"}
                      <span className="block text-xs font-normal text-muted-foreground">{a.user?.email ?? a.guestEmail}</span>
                    </td>
                    <td className="px-5 py-3.5">{a.service.name}</td>
                    <td className="px-5 py-3.5">
                      <StylistReassign appointmentId={a.id} currentStylistId={a.stylistId} stylists={stylists} />
                    </td>
                    <td className="px-5 py-3.5">{formatDate(a.start)}</td>
                    <td className="px-5 py-3.5 font-medium">{formatZAR(a.amount)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={a.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusSelect kind="appointment" id={a.id} value={a.status} options={OPTIONS} />
                      </div>
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
