import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { AdminCalendar } from "@/components/admin/admin-calendar";

export const metadata = { title: "Calendar" };

type SearchParams = Promise<{ m?: string; s?: string }>;

export default async function AdminCalendarPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("bookings:view");
  const { m, s } = await searchParams;

  const month = typeof m === "string" && /^\d{4}-\d{2}$/.test(m) ? m : format(new Date(), "yyyy-MM");
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);

  const [stylists, appointments] = await Promise.all([
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

  const activeStylist = s ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Calendar</h2>
        <p className="text-sm text-muted-foreground">Appointments for {format(new Date(year, monthIndex - 1, 1), "MMMM yyyy")}.</p>
      </div>
      <AdminCalendar appointments={serialized} stylists={stylists} month={month} activeStylist={activeStylist} />
    </div>
  );
}
