import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Package,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { formatDate, formatZAR, formatTime } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default async function AccountOverviewPage() {
  const userId = await requireUser();

  const [user, appointments, orders, notifications] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.appointment.findMany({
      where: { userId, status: { in: ["PENDING", "CONFIRMED"] } },
      include: { service: true, stylist: true },
      orderBy: { start: "asc" },
      take: 2,
    }),
    prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const stats = [
    {
      label: "Upcoming visits",
      value: appointments.filter((a) => a.start >= new Date()).length,
      icon: CalendarClock,
      href: "/account/appointments",
    },
    { label: "Total orders", value: orders.length, icon: Package, href: "/account/orders" },
    { label: "Beauty points", value: user?.points ?? 0, icon: Sparkles, href: "/account/loyalty" },
    { label: "New alerts", value: notifications.length, icon: Bell, href: "/account/notifications" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lux"
          >
            <s.icon className="h-5 w-5 text-rose" />
            <p className="mt-3 font-serif text-3xl font-bold">{s.value}</p>
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition group-hover:text-rose">
              {s.label} <ArrowRight className="h-3 w-3" />
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Upcoming appointments</h2>
            <Link href="/account/appointments" className="text-sm font-semibold text-rose hover:underline">
              View all
            </Link>
          </div>
          {appointments.length === 0 ? (
            <EmptyCard
              text="No upcoming appointments."
              href="/booking"
              cta="Book a visit"
            />
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 rounded-2xl border p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={a.service.image} alt={a.service.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(a.start)} at {formatTime(a.start)} · with {a.stylist.name}
                    </p>
                    <div className="mt-1.5">
                      <Badge variant={a.status === "CONFIRMED" ? "default" : "outline"}>
                        {STATUS_LABELS[a.status]}
                      </Badge>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-rose">{formatZAR(a.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Recent orders</h2>
            <Link href="/account/orders" className="text-sm font-semibold text-rose hover:underline">
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <EmptyCard text="No orders yet." href="/shop" cta="Start shopping" />
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-4 rounded-2xl border p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{o.ref}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.items.length} item{o.items.length > 1 ? "s" : ""} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatZAR(o.total)}</p>
                    <Badge variant="outline">{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {notifications.length > 0 && (
        <section className="rounded-3xl border bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Latest updates</h2>
            <Link href="/account/notifications" className="text-sm font-semibold text-rose hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl bg-ivory/60 p-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose" />
                <div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyCard({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link href={href} className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-ivory transition hover:bg-rose">
        {cta}
      </Link>
    </div>
  );
}