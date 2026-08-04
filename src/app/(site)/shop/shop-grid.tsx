"use client";

import { useMemo, useState } from "react";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import type { ProductCategory } from "@/generated/prisma/enums";
import { ProductCard } from "@/components/cards/product-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export interface ShopProduct {
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
  featured: boolean;
}

const CATS: { key: "all" | ProductCategory; label: string }[] = [
  { key: "all", label: "All Products" },
  ...(Object.keys(PRODUCT_CATEGORY_LABELS) as (keyof typeof PRODUCT_CATEGORY_LABELS)[]).map((k) => ({
    key: k as ProductCategory,
    label: PRODUCT_CATEGORY_LABELS[k],
  })),
];

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name", label: "Name A–Z" },
] as const;

export function ShopGrid({ products }: { products: ShopProduct[] }) {
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<string>("featured");

  const filtered = useMemo(() => {
    let out = cat === "all" ? products : products.filter((p) => p.category === cat);
    switch (sort) {
      case "price-asc":
        out = [...out].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        out = [...out].sort((a, b) => b.price - a.price);
        break;
      case "name":
        out = [...out].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        out = [...out].sort((a, b) => Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount);
    }
    return out;
  }, [products, cat, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-full flex-wrap gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft">
          {CATS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(c.key)}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all " +
                (cat === c.key ? "bg-ink text-ivory shadow-soft" : "text-muted-foreground hover:text-rose")
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-soft focus:outline-none focus:ring-2 focus:ring-rose/40"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-8 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      {filtered.length > 0 ? (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <p className="py-20 text-center text-muted-foreground">No products in this category yet.</p>
      )}
    </div>
  );
}