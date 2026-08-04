"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist-provider";
import { ProductCard } from "@/components/cards/product-card";
import type { ShopProduct } from "@/app/(site)/shop/shop-grid";

export function WishlistGrid({ products }: { products: ShopProduct[] }) {
  const { ids } = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border bg-white p-14 text-center shadow-soft">
        <Heart className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">Your wishlist is empty.</p>
        <p className="text-xs text-muted-foreground">Tap the heart on any product to save it here.</p>
        <Link href="/shop" className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition hover:bg-rose">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl font-semibold">My wishlist</h2>
      <p className="mb-6 text-sm text-muted-foreground">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}