import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/db";
import { ShopGrid } from "./shop-grid";

export const metadata: Metadata = {
  title: "Shop Luxury Products",
  description:
    "Shop premium hair products, oils, wigs, extensions, makeup and skincare from Divine Favour Hair & Beauty.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 80% 0%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 10% 90%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <ShoppingBag className="h-3.5 w-3.5" /> The Boutique
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Shop The <span className="text-gradient-rose">Good Stuff</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            The same luxury products we use in the studio — delivered to your door, or collect at the salon.
          </p>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux">
          <ShopGrid products={products} initialCategory={sp.category ?? "all"} />
        </div>
      </section>
    </>
  );
}