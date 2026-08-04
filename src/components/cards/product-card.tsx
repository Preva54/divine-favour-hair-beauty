"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { formatZAR } from "@/lib/utils";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import type { ProductCategory } from "@/generated/prisma/enums";

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    compareAtPrice?: number | null;
    rating: number;
    reviewCount: number;
    category: ProductCategory;
    stock: number;
  };
}) {
  const { add, setOpen } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const quickAdd = () => {
    add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.image,
      stock: product.stock,
    });
    setOpen(true);
  };

  return (
    <Card className="group relative h-full overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lux-lg">
      <Link href={`/shop/${product.slug}`} className="relative block h-60 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.compareAtPrice && (
          <Badge variant="gold" className="absolute top-3 left-3">
            Sale
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">Sold Out</span>
          </div>
        )}
      </Link>

      <button
        onClick={() => toggle(product.id)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110 cursor-pointer ${
          wishlisted ? "text-rose" : "text-muted-foreground"
        }`}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
      </button>

      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-rose">{PRODUCT_CATEGORY_LABELS[product.category]}</p>
        <Link href={`/shop/${product.slug}`} className="mt-1 block line-clamp-1 font-serif text-lg font-semibold hover:text-rose">
          {product.name}
        </Link>
        <StarRating rating={product.rating} count={product.reviewCount} size={13} className="mt-1.5" />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formatZAR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatZAR(product.compareAtPrice)}</span>
            )}
          </div>
          <button
            onClick={quickAdd}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-ivory transition hover:bg-rose disabled:opacity-40 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
