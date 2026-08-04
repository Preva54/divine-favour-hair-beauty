import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Bookings" };

const OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

export default async function AdminBookingsPage() {
  await adminGuard();
  const appointments = await prisma.appointment.findMany({
    orderBy: { start: "desc" },
    include: {
      service: { select: { name: true } },
      stylist: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Bookings</h2>
        <p className="text-sm text-muted-foreground">
          Manage appointment status. Changes reflect instantly on customer dashboards.
        </p>
      </div>

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
                      No bookings yet.
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
                    <td className="px-5 py-3.5">{a.stylist.name}</td>
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