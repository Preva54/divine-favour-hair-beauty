"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import type { ProductCategory } from "@/generated/prisma/enums";
import { ProductCard } from "@/components/cards/product-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Input } from "@/components/ui/input";

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

function normalize(key: string) {
  return key.replace(/-/g, "_").toUpperCase();
}

export function ShopGrid({ products, initialCategory = "all" }: { products: ShopProduct[]; initialCategory?: string }) {
  const router = useRouter();
  const [cat, setCat] = useState<string>(
    CATS.some((c) => c.key !== "all" && normalize(String(c.key)) === normalize(initialCategory)) ? normalize(initialCategory) : "all",
  );
  const [sort, setSort] = useState<string>("featured");
  const [query, setQuery] = useState("");

  const pickCat = (key: string) => {
    setCat(key);
    setQuery("");
    if (key === "all") {
      router.replace("/shop", { scroll: false });
    } else {
      router.replace(`/shop?category=${key.toLowerCase()}`, { scroll: false });
    }
  };

  const filtered = useMemo(() => {
    let out = cat === "all" ? products : products.filter((p) => p.category === cat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((p) => p.name.toLowerCase().includes(q));
    }
    const outOfStock = (p: ShopProduct) => p.stock <= 0;
    switch (sort) {
      case "price-asc":
        out = [...out].sort((a, b) => a.price - b.price || Number(outOfStock(a)) - Number(outOfStock(b)));
        break;
      case "price-desc":
        out = [...out].sort((a, b) => b.price - a.price || Number(outOfStock(a)) - Number(outOfStock(b)));
        break;
      case "name":
        out = [...out].sort((a, b) => a.name.localeCompare(b.name) || Number(outOfStock(a)) - Number(outOfStock(b)));
        break;
      default:
        out = [...out].sort(
          (a, b) =>
            Number(outOfStock(a)) - Number(outOfStock(b)) ||
            Number(b.featured) - Number(a.featured) ||
            b.reviewCount - a.reviewCount,
        );
    }
    return out;
  }, [products, cat, sort, query]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-full flex-wrap gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft">
          {CATS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => pickCat(c.key)}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all " +
                (cat === c.key ? "bg-ink text-ivory shadow-soft" : "text-muted-foreground hover:text-rose")
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-10 w-44 rounded-full pl-9 shadow-soft sm:w-56"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/60 transition hover:text-rose"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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
      </div>

      <p className="mb-8 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
        {query.trim() && (
          <span className="text-rose">
            {" "}
            matching “{query.trim()}” — <button type="button" onClick={() => setQuery("")} className="underline">clear</button>
          </span>
        )}
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
        <div className="rounded-3xl border bg-white p-16 text-center shadow-soft">
          <p className="font-serif text-xl font-semibold">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {query.trim() ? "No products match your search. Try a different term." : "No products in this category yet."}
          </p>
        </div>
      )}
    </div>
  );
}
