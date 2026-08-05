import { AlertTriangle, Boxes, CheckCircle2, PackageX } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatZAR } from "@/lib/utils";
import { InventoryTable } from "@/components/admin/inventory-table";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Inventory" };

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requirePermission("products:view");

  const [products, movements, lowCount, outCount] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        image: true,
        category: true,
        price: true,
        stock: true,
        _count: { select: { stockMovements: true } },
      },
      orderBy: { stock: "asc" },
    }),
    prisma.stockMovement.findMany({
      include: { product: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.product.count({ where: { active: true, stock: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { active: true, stock: 0 } }),
  ]);

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const stats = [
    { icon: Boxes, label: "Active products", value: products.length.toString(), sub: "SKUs" },
    { icon: PackageX, label: "Out of stock", value: outCount.toString(), sub: "need reorder", warn: outCount > 0 },
    { icon: AlertTriangle, label: "Low stock", value: lowCount.toString(), sub: "≤ 5 units", warn: lowCount > 0 },
    { icon: CheckCircle2, label: "Stock value", value: formatZAR(totalValue), sub: `${totalUnits} units` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Inventory</h2>
        <p className="text-sm text-muted-foreground">Stock levels, reorders and movement history.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-start gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${s.warn ? "bg-gold/15" : "bg-rose/10"}`}>
                <s.icon className={`h-5 w-5 ${s.warn ? "text-gold" : "text-rose"}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="font-serif text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <InventoryTable products={products} />

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 font-serif text-base font-semibold">Recent stock movements</h3>
          {movements.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No movements recorded yet.</p>}
          <div className="divide-y">
            {movements.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <span className="rounded-full bg-rose/10 px-2.5 py-1 text-xs font-semibold text-rose">+{m.change}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.product.name}</span>
                <span className="text-xs text-muted-foreground">{m.reason.replace(/_/g, " ").toLowerCase()}</span>
                <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
