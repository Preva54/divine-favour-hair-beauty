import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Customers" };

export default async function AdminUsersPage() {
  await adminGuard();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { appointments: true, orders: true, reviews: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Customers & staff</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} registered accounts. Adjust roles to grant staff or admin access.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">User</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Points</th>
                  <th className="px-5 py-3.5 font-semibold">Bookings</th>
                  <th className="px-5 py-3.5 font-semibold">Orders</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose/10 font-serif text-sm font-bold text-rose">
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <UserRoleSelect
                        userId={u.id}
                        role={u.role}
                        disabled={u.email === "admin@divinefavour.co.za"}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="gold">{u.points} pts</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u._count.appointments}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u._count.orders}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(u.createdAt)}</td>
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