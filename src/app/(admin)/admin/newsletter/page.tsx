import { Mail, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { unsubscribeNewsletterAction } from "@/lib/actions/newsletter";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Newsletter" };

export default async function AdminNewsletterPage() {
  const session = await requirePermission("messages:view");
  const canManage = await prisma.rolePermission.count({
    where: { role: session.user.role, permission: "messages:manage" },
  });

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.newsletterSubscriber.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Newsletter subscribers</h2>
        <p className="text-sm text-muted-foreground">{total} beauty lovers joined the Divine Circle.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Source</th>
                  <th className="px-5 py-3.5 font-semibold">Subscribed</th>
                  {canManage > 0 && <th className="px-5 py-3.5 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={canManage > 0 ? 4 : 3} className="px-5 py-10 text-center text-muted-foreground">
                      No subscribers yet.
                    </td>
                  </tr>
                )}
                {subscribers.map((s) => (
                  <tr key={s.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5">
                      <a
                        href={`mailto:${s.email}`}
                        className="flex items-center gap-2 font-medium text-rose hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" /> {s.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-muted-foreground">{s.source}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(s.createdAt)}</td>
                    {canManage > 0 && (
                      <td className="px-5 py-3.5">
                        <form action={unsubscribeNewsletterAction.bind(null, s.email)}>
                          <button
                            type="submit"
                            aria-label={`Remove ${s.email}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-rose/10 hover:text-rose"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </td>
                    )}
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
