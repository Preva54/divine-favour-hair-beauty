"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";

export function AddToCart({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
  };
}) {
  const { add, setOpen } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [qty, setQty] = useState(1);
  const out = product.stock === 0;

  function handleAdd() {
    add(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        stock: product.stock,
      },
      qty,
    );
    toast.success(`${product.name} added to bag`);
    setOpen(true);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-border bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-12 items-center justify-center rounded-full transition hover:text-rose"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-serif text-lg font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
            className="flex h-12 w-12 items-center justify-center rounded-full transition hover:text-rose"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button size="lg" variant="dark" onClick={handleAdd} disabled={out} className="flex-1">
          <ShoppingBag className="h-4 w-4" /> {out ? "Sold out" : "Add to bag"}
        </Button>
        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          className={`flex h-13 w-13 items-center justify-center rounded-full border transition hover:scale-105 ${
            isWishlisted(product.id) ? "border-rose bg-rose/10 text-rose" : "border-border bg-white text-muted-foreground"
          }`}
        >
          <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}