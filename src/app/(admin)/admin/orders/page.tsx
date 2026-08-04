import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Orders" };

const OPTIONS = ["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function AdminOrdersPage() {
  await adminGuard();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true } } } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Orders</h2>
        <p className="text-sm text-muted-foreground">Track fulfilment from payment to delivery.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Items</th>
                  <th className="px-5 py-3.5 font-semibold">Total</th>
                  <th className="px-5 py-3.5 font-semibold">Placed</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5 font-mono text-xs font-medium">#{o.ref}</td>
                    <td className="px-5 py-3.5">
                      {o.fullName}
                      <span className="block text-xs text-muted-foreground">{o.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="max-w-[220px] space-y-0.5">
                        {o.items.map((li) => (
                          <p key={li.id} className="truncate text-xs text-muted-foreground">
                            {li.quantity}× {li.product.name}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{formatZAR(o.total)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusSelect kind="order" id={o.id} value={o.status} options={OPTIONS} />
                    </td>
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