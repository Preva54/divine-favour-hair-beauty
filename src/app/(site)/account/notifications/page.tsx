import Link from "next/link";
import { BellRing, CheckCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { formatDateTime } from "@/lib/utils";
import { markNotificationsReadAction } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";

export default async function NotificationsPage() {
  const userId = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {notifications.filter((n) => !n.read).length} unread
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await markNotificationsReadAction();
          }}
        >
          <Button variant="outline" size="sm" type="submit">
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        </form>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border bg-white p-14 text-center shadow-soft">
          <BellRing className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.type === "APPOINTMENT" ? "/account/appointments" : n.type === "ORDER" ? "/account/orders" : "/account/loyalty"}
              className="block rounded-2xl border bg-white p-4 shadow-soft transition hover:border-rose/40"
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-rose"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/70">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}