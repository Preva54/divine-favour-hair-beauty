import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatZAR } from "@/lib/utils";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { ProductCard } from "@/components/cards/product-card";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { AddToCart } from "./add-to-cart";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: `${product.name} · Divine Favour Shop`, description: product.description, images: [{ url: product.image }] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { reviews: { where: { approved: true }, orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, category: product.category, id: { not: product.id } },
    take: 4,
  });

  const badges = [
    { icon: Truck, title: "Free shipping over R500", text: "Fast nationwide delivery in 2–5 business days." },
    { icon: ShieldCheck, title: "Authentic guarantee", text: "100% genuine salon-grade products, always." },
    { icon: ShieldCheck, title: "Easy returns", text: "Unopened items refundable within 14 days." },
  ];

  return (
    <>
      <div className="pt-[74px]">
        <div className="container-lux py-6">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-rose">
            <ArrowLeft className="h-4 w-4" /> All Products
          </Link>
        </div>
      </div>

      <section className="container-lux grid gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-square overflow-hidden rounded-[2rem] shadow-lux-lg">
            <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            {product.compareAtPrice && <Badge variant="gold" className="absolute top-4 left-4">Sale</Badge>}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose">
            {PRODUCT_CATEGORY_LABELS[product.category]}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} count={product.reviewCount} size={15} />
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-serif text-4xl font-bold text-rose">{formatZAR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xl text-muted-foreground line-through">{formatZAR(product.compareAtPrice)}</span>
            )}
          </div>
          <p className="mt-1 text-sm">
            {product.stock > 0 ? (
              <span className="font-medium text-emerald-600">In stock · {product.stock} available</span>
            ) : (
              <span className="font-medium text-rose">Sold out — check back soon</span>
            )}
          </p>

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <AddToCart product={product} />

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {badges.map((b) => (
              <div key={b.title} className="rounded-2xl border bg-white p-4">
                <b.icon className="mb-2 h-5 w-5 text-rose" />
                <p className="text-xs font-semibold">{b.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {product.reviews.length > 0 && (
        <section className="section-pad bg-gradient-to-b from-ivory to-[#fdf3f0] pt-14">
          <div className="container-lux">
            <h2 className="mb-6 font-serif text-3xl font-semibold">What our divas say</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {product.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border bg-white p-5 shadow-soft">
                  <StarRating rating={r.rating} size={13} />
                  <p className="mt-3 text-sm text-foreground/80">“{r.text}”</p>
                  <p className="mt-3 text-xs font-semibold text-muted-foreground">— {r.authorName}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section-pad pt-14">
          <div className="container-lux">
            <h2 className="mb-8 font-serif text-3xl font-semibold">Complete the look</h2>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}