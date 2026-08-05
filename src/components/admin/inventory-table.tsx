"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { restockProductAction } from "@/lib/actions/admin-inventory";
import { cn } from "@/lib/utils";

type InventoryProduct = {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  stock: number;
  _count: { stockMovements: number };
};

const REASONS = [
  { value: "SUPPLIER_DELIVERY", label: "Supplier delivery" },
  { value: "RETURN", label: "Return" },
  { value: "STOCK_TAKE", label: "Stock take" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "OTHER", label: "Other" },
];

function stockBadge(stock: number) {
  if (stock === 0) return <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-destructive">Out</span>;
  if (stock <= 5) return <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">Low</span>;
  return <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">In stock</span>;
}

export function InventoryTable({ products }: { products: InventoryProduct[] }) {
  const [restocking, setRestocking] = useState<string | null>(null);
  const [qty, setQty] = useState(10);
  const [reason, setReason] = useState("SUPPLIER_DELIVERY");
  const [pending, startTransition] = useTransition();

  const submit = (productId: string) => {
    startTransition(async () => {
      const res = await restockProductAction(productId, qty, reason);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Stock updated (+${qty})`);
      setRestocking(null);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3.5 font-semibold">Product</th>
              <th className="px-5 py-3.5 font-semibold">Price</th>
              <th className="px-5 py-3.5 font-semibold">Stock</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Movements</th>
              <th className="px-5 py-3.5 font-semibold">Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  No active products.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="transition hover:bg-ivory/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Image src={p.image} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.category.replace(/_/g, " ").toLowerCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">{p.price.toLocaleString("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 })}</td>
                <td className="px-5 py-3.5">
                  <span className={cn("font-mono text-base font-semibold", p.stock === 0 && "text-destructive")}>{p.stock}</span>
                  <span className="ml-1 text-xs text-muted-foreground">units</span>
                </td>
                <td className="px-5 py-3.5">{stockBadge(p.stock)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{p._count.stockMovements}</td>
                <td className="px-5 py-3.5">
                  {restocking === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="h-8 w-16 rounded-lg border px-2 text-xs outline-none focus:border-rose"
                        aria-label="Quantity"
                      />
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="h-8 rounded-lg border bg-card px-1.5 text-xs outline-none focus:border-rose"
                        aria-label="Reason"
                      >
                        {REASONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => submit(p.id)}
                        disabled={pending}
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-rose px-2.5 text-xs font-semibold text-white transition hover:bg-rose/90 disabled:opacity-50"
                      >
                        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestocking(null)}
                        disabled={pending}
                        className="h-8 rounded-lg border px-2 text-xs text-muted-foreground transition hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setQty(10);
                        setReason("SUPPLIER_DELIVERY");
                        setRestocking(p.id);
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition hover:bg-muted"
                    >
                      <PackagePlus className="h-3.5 w-3.5 text-rose" /> Restock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
