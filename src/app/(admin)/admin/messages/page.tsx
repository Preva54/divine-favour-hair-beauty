import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Messages" };

const OPTIONS = ["NEW", "READ", "REPLIED"] as const;

export default async function AdminMessagesPage() {
  await adminGuard();
  const messages = await prisma.contactMessage.findMany({ orderBy: [{ status: "desc" }, { createdAt: "desc" }], take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Messages</h2>
        <p className="text-sm text-muted-foreground">Enquiries submitted through the contact page.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {messages.length === 0 && (
              <p className="px-5 py-10 text-center text-muted-foreground">No messages yet.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`p-5 ${m.status === "NEW" ? "bg-gold/5" : ""}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-medium">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="flex items-center gap-1 text-xs text-rose hover:underline">
                    <Mail className="h-3 w-3" /> {m.email}
                  </a>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose">
                      <Phone className="h-3 w-3" /> {m.phone}
                    </a>
                  )}
                  <span className="text-xs text-muted-foreground">· {formatDate(m.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-foreground/60">{m.subject}</p>
                <p className="mt-2 rounded-xl bg-ivory/50 p-3 text-sm leading-relaxed text-foreground/80">{m.message}</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <StatusBadge status={m.status} />
                  <StatusSelect kind="message" id={m.id} value={m.status} options={OPTIONS} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}