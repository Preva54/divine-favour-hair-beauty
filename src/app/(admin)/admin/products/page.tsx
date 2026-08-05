import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import Image from "next/image";
import { formatZAR } from "@/lib/utils";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Products" };

export default async function AdminProductsPage() {
  await requirePermission("products:view");
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Products</h2>
        <p className="text-sm text-muted-foreground">
          {products.filter((p) => p.stock <= 5 && p.active).length} low-stock items need attention.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Stock</th>
                  <th className="px-5 py-3.5 font-semibold">Rating</th>
                  <th className="px-5 py-3.5 font-semibold">Visible</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Image src={p.image} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-muted-foreground">{p.category.toLowerCase().replace(/_/g, " ")}</td>
                    <td className="px-5 py-3.5 font-medium">{formatZAR(p.price)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={p.stock <= 5 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                        {p.stock} left
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.rating ? `${p.rating.toFixed(1)} ★` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <ActiveToggle kind="product" id={p.id} active={p.active} label={p.name} />
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