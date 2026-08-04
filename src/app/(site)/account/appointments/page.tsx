import Image from "next/image";
import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { formatDate, formatTime, formatZAR } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { CancelAppointment } from "./cancel-appointment";

export default async function AppointmentsPage() {
  const userId = await requireUser();
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: { service: true, stylist: true },
    orderBy: { start: "desc" },
  });

  const upcoming = appointments.filter((a) => a.status !== "CANCELLED" && a.start >= new Date());
  const past = appointments.filter((a) => a.status === "CANCELLED" || a.start < new Date());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 font-serif text-2xl font-semibold">My appointments</h2>
        <p className="text-sm text-muted-foreground">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      <ListBlock title="Upcoming">
        {upcoming.length === 0 ? (
          <EmptyState />
        ) : (
          upcoming.map((a) => (
            <Row key={a.id} a={a}>
              {a.status !== "COMPLETED" && <CancelAppointment id={a.id} code={a.ref} />}
            </Row>
          ))
        )}
      </ListBlock>

      <ListBlock title="Past & cancelled">
        {past.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          past.map((a) => <Row key={a.id} a={a} muted />)
        )}
      </ListBlock>
    </div>
  );
}

function ListBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-soft">
      <h3 className="mb-4 font-serif text-lg font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

type AppointmentRow = Awaited<
  ReturnType<typeof prisma.appointment.findMany<{ include: { service: true; stylist: true } }>>
>[number];

function Row({ a, children, muted }: { a: AppointmentRow; children?: React.ReactNode; muted?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${muted ? "opacity-70" : ""}`}>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        <Image src={a.service.image} alt={a.service.name} fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{a.service.name}</p>
          <Badge variant={a.status === "CONFIRMED" ? "default" : "outline"}>{STATUS_LABELS[a.status]}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(a.start)} at {formatTime(a.start)} · with {a.stylist.name} · {a.ref}
        </p>
        {a.notes && <p className="mt-1 text-xs text-muted-foreground italic">“{a.notes}”</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-rose">{formatZAR(a.amount)}</span>
        {children}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-10 text-center">
      <CalendarX2 className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
      <Link href="/booking" className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-ivory transition hover:bg-rose">
        Book your next transformation
      </Link>
    </div>
  );
}