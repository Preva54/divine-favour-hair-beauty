import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { AdminCalendar } from "@/components/admin/admin-calendar";
import { BlockedPeriodDialog, type BlockedRange } from "@/components/admin/blocked-period-dialog";

export const metadata = { title: "Calendar" };

type SearchParams = Promise<{ m?: string; s?: string }>;

export default async function AdminCalendarPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("bookings:view");
  const { m, s } = await searchParams;

  const month = typeof m === "string" && /^\d{4}-\d{2}$/.test(m) ? m : format(new Date(), "yyyy-MM");
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);

  const [stylists, appointments, blockedRows, leaveRows] = await Promise.all([
    prisma.stylist.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.appointment.findMany({
      where: { start: { gte: start, lt: end }, ...(s ? { stylistId: s } : {}) },
      select: {
        id: true,
        ref: true,
        start: true,
        end: true,
        status: true,
        amount: true,
        paymentStatus: true,
        guestName: true,
        service: { select: { name: true } },
        stylist: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { start: "asc" },
    }),
    prisma.blockedPeriod.findMany({
      where: {
        start: { lt: end },
        end: { gte: start },
        OR: [{ stylistId: null }, ...(s ? [{ stylistId: s }] : [])],
      },
      select: {
        id: true,
        start: true,
        end: true,
        reason: true,
        stylistId: true,
        stylist: { select: { name: true } },
      },
      orderBy: { start: "asc" },
    }),
    prisma.stylistLeave.findMany({
      where: { start: { lt: end }, end: { gte: start }, ...(s ? { stylistId: s } : {}) },
      select: {
        id: true,
        stylistId: true,
        start: true,
        end: true,
        reason: true,
        stylist: { select: { name: true } },
      },
      orderBy: { start: "asc" },
    }),
  ]);

  const serialized = appointments.map((a) => ({
    id: a.id,
    ref: a.ref,
    start: a.start.toISOString(),
    end: a.end.toISOString(),
    status: a.status,
    amount: a.amount,
    paymentStatus: a.paymentStatus,
    client: a.guestName ?? a.user?.name ?? "Guest",
    serviceName: a.service.name,
    stylistName: a.stylist.name,
  }));

  const blocked: BlockedRange[] = blockedRows.map((b) => ({
    id: b.id,
    start: b.start,
    end: b.end,
    reason: b.reason,
    stylistId: b.stylistId,
    stylistName: b.stylist?.name ?? null,
  }));

  const gridBlocked = [
    ...blocked,
    ...leaveRows.map((l) => ({
      id: `leave-${l.id}`,
      start: l.start,
      end: l.end,
      reason: l.reason ? `Leave: ${l.reason}` : "Leave",
      stylistId: l.stylistId,
      stylistName: l.stylist.name,
    })),
  ].map((b) => ({ id: b.id, start: b.start.toISOString(), end: b.end.toISOString(), reason: b.reason, stylistName: b.stylistName }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Calendar</h2>
          <p className="text-sm text-muted-foreground">Appointments for {format(new Date(year, monthIndex - 1, 1), "MMMM yyyy")}.</p>
        </div>
        <BlockedPeriodDialog stylists={stylists} blocked={blocked} defaultStylistId={s} />
      </div>
      <AdminCalendar
        appointments={serialized}
        stylists={stylists}
        month={month}
        activeStylist={s ?? ""}
        blocked={gridBlocked}
      />
    </div>
  );
}
