"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarAppointment = {
  id: string;
  ref: string;
  start: string;
  status: string;
  paymentStatus: string;
  amount: number;
  client: string;
  stylistName: string;
  serviceName: string;
};

type CalendarBlocked = {
  id: string;
  start: string;
  end: string;
  reason: string | null;
  stylistName: string | null;
};

const STATUS_STYLES: Record<string, { dot: string; chip: string }> = {
  PENDING: { dot: "bg-gold", chip: "bg-gold/15 text-gold" },
  CONFIRMED: { dot: "bg-blush", chip: "bg-blush/20 text-rose" },
  COMPLETED: { dot: "bg-rose", chip: "bg-rose/15 text-rose" },
  CANCELLED: { dot: "bg-muted", chip: "bg-muted text-muted-foreground" },
  NO_SHOW: { dot: "bg-charcoal/40", chip: "bg-charcoal/10 text-muted-foreground" },
};

const fmtTime = (iso: string) => format(new Date(iso), "HH:mm");

export function AdminCalendar({
  appointments,
  stylists,
  month,
  activeStylist,
  blocked = [],
}: {
  appointments: CalendarAppointment[];
  stylists: { id: string; name: string }[];
  month: string;
  activeStylist: string;
  blocked?: CalendarBlocked[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const [year, monthIndex] = month.split("-").map(Number);
  const base = new Date(year, monthIndex - 1, 1);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(base), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(base), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const a of appointments) {
      const key = format(new Date(a.start), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return map;
  }, [appointments]);

  const selectedAppointments = selected ? byDay.get(selected) ?? [] : [];
  const prevMonth = format(addMonths(base, -1), "yyyy-MM");
  const nextMonth = format(addMonths(base, 1), "yyyy-MM");

  const stylistQuery = () => (activeStylist ? `&s=${encodeURIComponent(activeStylist)}` : "");

  const isBlocked = (key: string) => {
    const t = new Date(`${key}T12:00:00`);
    return blocked.some((b) => t >= new Date(b.start) && t < new Date(b.end));
  };

  const blockedOn = (key: string) => {
    const t = new Date(`${key}T12:00:00`);
    return blocked.filter((b) => t >= new Date(b.start) && t < new Date(b.end));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/calendar?m=${prevMonth}${stylistQuery()}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/calendar?m=${nextMonth}${stylistQuery()}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/calendar?m=${format(new Date(), "yyyy-MM")}${stylistQuery()}`}
            className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
          >
            Today
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/calendar"
            className={cn(
              "inline-flex h-9 items-center rounded-lg border px-3 text-sm transition hover:bg-muted",
              !activeStylist && "border-rose bg-rose/10 font-semibold text-rose"
            )}
          >
            All stylists
          </Link>
          {stylists.map((st) => (
            <Link
              key={st.id}
              href={`/admin/calendar?m=${month}&s=${st.id}`}
              className={cn(
                "inline-flex h-9 items-center rounded-lg border px-3 text-sm transition hover:bg-muted",
                activeStylist === st.id && "border-rose bg-rose/10 font-semibold text-rose"
              )}
            >
              {st.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid grid-cols-7 border-b bg-ivory/60 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="px-1 py-2.5">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const list = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, base);
            const isToday = isSameDay(day, new Date());
            const blockedDay = isBlocked(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(selected === key ? null : key)}
                className={cn(
                  "relative flex min-h-24 flex-col gap-1 border-b border-r p-1.5 text-left transition last:border-r-0",
                  !inMonth && "bg-muted/30",
                  blockedDay && !inMonth && "bg-rose/5",
                  blockedDay && "bg-rose/10",
                  selected === key && "ring-1 ring-inset ring-rose"
                )}
              >
                {blockedDay && (
                  <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -rotate-6 bg-rose/40" />
                )}
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday ? "bg-rose text-white" : inMonth ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="space-y-1">
                  {blockedDay && (
                    <span className="truncate text-[10px] font-semibold text-rose">Blocked</span>
                  )}
                  {list.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center gap-1 truncate">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_STYLES[a.status]?.dot ?? "bg-muted")} />
                      <span className="truncate text-[10px] text-muted-foreground">
                        {fmtTime(a.start)} · {a.serviceName}
                      </span>
                    </div>
                  ))}
                  {list.length > 3 && (
                    <span className="text-[10px] font-semibold text-rose">+{list.length - 3} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-rose" />
          <h3 className="font-serif text-base font-semibold">
            {selected ? format(new Date(selected), "EEEE, d MMMM yyyy") : "Select a day"}
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {selected ? `${selectedAppointments.length} appointment(s)` : "Click any date to see appointments"}
          </span>
        </div>
        {selected && blockedOn(selected).length > 0 && (
          <div className="mb-3 space-y-1 rounded-xl border border-rose/20 bg-rose/10 p-3">
            {blockedOn(selected).map((b) => (
              <p key={b.id} className="text-xs font-medium text-rose">
                Blocked: {b.reason ?? "Unavailable"} · {b.stylistName ?? "Whole salon"}
                {!b.reason && !b.stylistName && " (no reason given)"}
              </p>
            ))}
          </div>
        )}
        {selectedAppointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {selected ? "No appointments this day." : "Pick a day on the calendar to view its appointments."}
          </p>
        ) : (
          <div className="divide-y">
            {selectedAppointments.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="w-20 font-mono text-xs text-muted-foreground">{fmtTime(a.start)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.client}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.serviceName} · {a.stylistName}
                  </p>
                </div>
                <span className="text-sm font-semibold">R{a.amount.toLocaleString()}</span>
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", STATUS_STYLES[a.status]?.chip ?? "bg-muted text-muted-foreground")}>
                  {a.status}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  {a.paymentStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
