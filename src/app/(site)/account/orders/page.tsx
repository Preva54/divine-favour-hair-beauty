import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default async function OrdersPage() {
  const userId = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border bg-white p-14 text-center shadow-soft">
        <Package className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
        <Link href="/shop" className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition hover:bg-rose">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 font-serif text-2xl font-semibold">My orders</h2>
        <p className="text-sm text-muted-foreground">{orders.length} order{orders.length > 1 ? "s" : ""} in total</p>
      </div>
      {orders.map((o) => (
        <section key={o.id} className="rounded-3xl border bg-white p-6 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-serif text-lg font-semibold">{o.ref}</p>
              <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              {o.couponCode && <Badge variant="gold">{o.couponCode}</Badge>}
              <Badge variant="outline">{ORDER_STATUS_LABELS[o.status]}</Badge>
              <span className="font-serif text-lg font-bold text-rose">{formatZAR(o.total)}</span>
            </div>
          </div>
          <div className="divide-y">
            {o.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.product.image} alt={item.product.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${item.product.slug}`} className="block truncate text-sm font-medium hover:text-rose">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatZAR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          {o.discount > 0 && (
            <p className="mt-3 text-right text-xs text-emerald-600">Coupon savings: {formatZAR(o.discount)}</p>
          )}
        </section>
      ))}
    </div>
  );
}