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

function formatTimeOf(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface Window {
  open: number;
  close: number;
}

export interface AvailabilityQuery {
  date: string;
  serviceId: string;
  stylistId?: string | null;
}

/**
 * Loads candidate stylists for a service. When the preferred stylist (or none
 * of the stylists linked to the service) can't serve the request, falls back to
 * any available stylist so every service stays bookable.
 */
async function loadCandidates(serviceId: string, preferredId?: string | null) {
  let stylists = preferredId
    ? await prisma.stylist.findMany({ where: { id: preferredId, available: true } })
    : await prisma.stylist.findMany({
        where: { available: true, services: { some: { id: serviceId } } },
      });
  if (stylists.length === 0) {
    stylists = await prisma.stylist.findMany({ where: { available: true } });
  }
  return stylists;
}

/**
 * Returns the working window for a stylist on a given weekday (Monday = 0).
 * Uses the stylist's own weekly schedule when defined, otherwise the salon
 * opening hours. Returns null when the stylist is off that day.
 */
async function workingWindow(
  stylistId: string,
  weekday: number,
  salonHours: { open: string; close: string; closed: boolean } | null,
): Promise<Window | null> {
  if (!salonHours) return null;
  const entry = await prisma.stylistSchedule.findUnique({
    where: { stylistId_day: { stylistId, day: weekday } },
  });
  const sch = entry ?? salonHours;
  if (sch.closed || sch.open === "00:00") return null;
  return { open: toMinutes(sch.open), close: toMinutes(sch.close) };
}

/** Minute ranges during which a stylist cannot take bookings (leave + blocked periods). */
async function unavailableRanges(stylistIds: string[], dayStart: Date, dayEnd: Date) {
  const [leave, blocked] = await Promise.all([
    prisma.stylistLeave.findMany({
      where: { stylistId: { in: stylistIds }, start: { lt: dayEnd }, end: { gt: dayStart } },
    }),
    prisma.blockedPeriod.findMany({
      where: {
        OR: [{ stylistId: null }, { stylistId: { in: stylistIds } }],
        start: { lt: dayEnd },
        end: { gt: dayStart },
      },
    }),
  ]);

  const ranges = new Map<string, { start: number; end: number }[]>();
  const add = (id: string, start: Date, end: Date) => {
    const s = Math.max(start.getTime(), dayStart.getTime());
    const e = Math.min(end.getTime(), dayEnd.getTime());
    if (e <= s) return;
    const list = ranges.get(id) ?? [];
    list.push({
      start: toMinutes(formatTimeOf(new Date(s))) + (s - dayStart.getTime()) / 60000,
      end: toMinutes(formatTimeOf(new Date(e))) + (e - dayStart.getTime()) / 60000,
    });
    ranges.set(id, list);
  };
  for (const l of leave) add(l.stylistId, l.start, l.end);
  for (const b of blocked) {
    const key = b.stylistId ?? "__all__";
    const list = ranges.get(key) ?? [];
    const s = Math.max(b.start.getTime(), dayStart.getTime());
    const e = Math.min(b.end.getTime(), dayEnd.getTime());
    if (e <= s) continue;
    list.push({
      start: toMinutes(formatTimeOf(new Date(s))) + (s - dayStart.getTime()) / 60000,
      end: toMinutes(formatTimeOf(new Date(e))) + (e - dayStart.getTime()) / 60000,
    });
    ranges.set(key, list);
  }
  return ranges;
}

function isInRanges(ranges: { start: number; end: number }[], startMin: number, endMin: number) {
  return ranges.some((b) => startMin < b.end && endMin > b.start);
}

export async function getAvailableSlots({ date, serviceId, stylistId }: AvailabilityQuery): Promise<string[]> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const [year, month, day] = date.split("-").map(Number);
  const dayStart = new Date(year, month - 1, day);
  const dayEnd = new Date(year, month - 1, day + 1);

  const weekday = (dayStart.getDay() + 6) % 7; // Monday = 0 (matches OpeningHour.day seed)
  const salonHours = await prisma.openingHour.findUnique({ where: { day: weekday } });
  if (!salonHours || salonHours.closed) return [];

  const stylists = await loadCandidates(serviceId, stylistId);
  if (stylists.length === 0) return [];

  const ids = stylists.map((s) => s.id);
  const [windows, ranges, bookings] = await Promise.all([
    Promise.all(stylists.map((s) => workingWindow(s.id, weekday, salonHours).then((w) => [s.id, w] as const))),
    unavailableRanges(ids, dayStart, dayEnd),
    prisma.appointment.findMany({
      where: {
        stylistId: { in: ids },
        start: { gte: dayStart, lt: dayEnd },
        status: { not: "CANCELLED" },
      },
    }),
  ]);

  const windowByStylist = new Map<string, Window | null>(windows);
  const allRanges = ranges.get("__all__") ?? [];
  const busyByStylist = new Map<string, { start: number; end: number }[]>();
  for (const b of bookings) {
    const arr = busyByStylist.get(b.stylistId) ?? [];
    arr.push({ start: toMinutes(formatTimeOf(b.start)), end: toMinutes(formatTimeOf(b.end)) });
    busyByStylist.set(b.stylistId, arr);
  }

  const duration = service.durationMinutes;
  const isFree = (id: string, startMin: number, endMin: number) => {
    const win = windowByStylist.get(id);
    if (!win || startMin < win.open || endMin > win.close) return false;
    if (isInRanges(allRanges, startMin, endMin)) return false;
    if (isInRanges(ranges.get(id) ?? [], startMin, endMin)) return false;
    if (isInRanges(busyByStylist.get(id) ?? [], startMin, endMin)) return false;
    return true;
  };

  const opens = [...windowByStylist.values()].filter((w): w is Window => !!w).map((w) => w.open);
  const closes = [...windowByStylist.values()].filter((w): w is Window => !!w).map((w) => w.close);
  if (opens.length === 0) return [];
  const open = Math.min(...opens);
  const close = Math.max(...closes);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = date === todayKey;

  const slots: string[] = [];
  for (let start = open; start + duration <= close; start += 30) {
    const end = start + duration;
    if (isToday && start <= nowMinutes + 60) continue;
    if (stylists.some((s) => isFree(s.id, start, end))) slots.push(minutesToStr(start));
  }

  return slots;
}

/**
 * Picks a stylist for an appointment: the preferred one if free and eligible,
 * otherwise the first available stylist who offers the service. Falls back to
 * any available stylist when no one is linked to the service. Returns null
 * when no one can take the slot.
 */
export async function pickStylist(
  serviceId: string,
  start: Date,
  end: Date,
  preferredId?: string | null,
): Promise<string | null> {
  const candidates = await loadCandidates(serviceId, preferredId);
  if (candidates.length === 0) return null;

  const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600000);
  const weekday = (dayStart.getDay() + 6) % 7;
  const salonHours = await prisma.openingHour.findUnique({ where: { day: weekday } });
  if (!salonHours || salonHours.closed) return null;

  const ids = candidates.map((c) => c.id);
  const startMin = toMinutes(formatTimeOf(start));
  const endMin = toMinutes(formatTimeOf(end));

  const [windows, ranges, bookings] = await Promise.all([
    Promise.all(candidates.map((c) => workingWindow(c.id, weekday, salonHours).then((w) => [c.id, w] as const))),
    unavailableRanges(ids, dayStart, dayEnd),
    prisma.appointment.findMany({
      where: {
        stylistId: { in: ids },
        start: { lt: end },
        end: { gt: start },
        status: { not: "CANCELLED" },
      },
      select: { stylistId: true },
    }),
  ]);
  const windowByStylist = new Map<string, Window | null>(windows);
  const allRanges = ranges.get("__all__") ?? [];
  const busyIds = new Set(bookings.map((b) => b.stylistId));

  return (
    candidates.find((c) => {
      const win = windowByStylist.get(c.id);
      if (!win || startMin < win.open || endMin > win.close) return false;
      if (isInRanges(allRanges, startMin, endMin)) return false;
      if (isInRanges(ranges.get(c.id) ?? [], startMin, endMin)) return false;
      return !busyIds.has(c.id);
    })?.id ?? null
  );
}

export { addMinutes };
