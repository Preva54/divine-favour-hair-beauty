import { prisma } from "@/lib/db";
import { addMinutes } from "@/lib/utils";

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToStr(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export interface AvailabilityQuery {
  date: string;
  serviceId: string;
  stylistId?: string | null;
}

export async function getAvailableSlots({ date, serviceId, stylistId }: AvailabilityQuery): Promise<string[]> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const [year, month, day] = date.split("-").map(Number);
  const dayStart = new Date(year, month - 1, day);
  const dayEnd = new Date(year, month - 1, day + 1);

  const weekday = (dayStart.getDay() + 6) % 7; // Monday = 0 (matches OpeningHour.day seed)
  const hours = await prisma.openingHour.findUnique({ where: { day: weekday } });
  if (!hours || hours.closed) return [];

  const duration = service.durationMinutes;
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);

  if (close - open < duration) return [];

  const stylists = stylistId
    ? await prisma.stylist.findMany({ where: { id: stylistId, available: true } })
    : await prisma.stylist.findMany({
        where: { available: true, services: { some: { id: serviceId } } },
      });

  if (stylists.length === 0) return [];

  const bookings = await prisma.appointment.findMany({
    where: {
      stylistId: { in: stylists.map((s) => s.id) },
      start: { gte: dayStart, lt: dayEnd },
      status: { not: "CANCELLED" },
    },
  });

  const busyByStylist = new Map<string, { start: number; end: number }[]>();
  for (const b of bookings) {
    const arr = busyByStylist.get(b.stylistId) ?? [];
    arr.push({ start: toMinutes(formatTimeOf(b.start)), end: toMinutes(formatTimeOf(b.end)) });
    busyByStylist.set(b.stylistId, arr);
  }

  const isBusy = (id: string, startMin: number, endMin: number) => {
    const arr = busyByStylist.get(id) ?? [];
    return arr.some((b) => startMin < b.end && endMin > b.start);
  };

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = date === todayKey;

  const slots: string[] = [];
  for (let start = open; start + duration <= close; start += 30) {
    const end = start + duration;
    if (isToday && start <= nowMinutes + 60) continue;
    const free = stylists.some((s) => !isBusy(s.id, start, end));
    if (free) slots.push(minutesToStr(start));
  }

  return slots;
}

function formatTimeOf(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Picks a stylist for an appointment: the preferred one if free and eligible,
 * otherwise the first available stylist who offers the service. Returns null
 * when no one can take the slot.
 */
export async function pickStylist(
  serviceId: string,
  start: Date,
  end: Date,
  preferredId?: string | null,
): Promise<string | null> {
  const candidates = preferredId
    ? await prisma.stylist.findMany({
        where: { id: preferredId, available: true, services: { some: { id: serviceId } } },
      })
    : await prisma.stylist.findMany({
        where: { available: true, services: { some: { id: serviceId } } },
      });

  if (candidates.length === 0) return null;

  const bookings = await prisma.appointment.findMany({
    where: {
      stylistId: { in: candidates.map((c) => c.id) },
      start: { lt: end },
      end: { gt: start },
      status: { not: "CANCELLED" },
    },
    select: { stylistId: true },
  });
  const busyIds = new Set(bookings.map((b) => b.stylistId));
  return candidates.find((c) => !busyIds.has(c.id))?.id ?? null;
}

export { addMinutes };
