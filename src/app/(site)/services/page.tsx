import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SectionHeading } from "@/components/section-heading";
import { ServicePageHeader } from "@/components/services/page-header";
import { ServiceCard } from "@/components/cards/service-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Category } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore luxury hair, nails, skincare, makeup and beauty treatments at Divine Favour — from balayage and braids to bridal makeup and spa rituals.",
};

const FILTERS = [
  { key: "", label: "All Services" },
  { key: "hair", label: "Hair" },
  { key: "nails", label: "Nails" },
  { key: "beauty", label: "Beauty & Makeup" },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: Category.HAIR, label: "Hair" },
  { key: Category.NAILS, label: "Nails" },
  { key: Category.BEAUTY, label: "Beauty" },
];

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const slug = sp.category?.toLowerCase();
  const cat = (["hair", "nails", "beauty"] as const).find((x) => x === slug);
  const category = cat ? CATEGORIES.find((c) => c.key.toLowerCase() === cat)?.key : undefined;

  const services = await prisma.service.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: [{ category: "asc" }, { popular: "desc" }, { price: "asc" }],
  });

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: services.filter((s) => s.category === cat.key),
  }));

  const activeKey = slug ?? "";

  return (
    <>
      <ServicePageHeader />
      <section className="section-pad pt-12">
        <div className="container-lux">
          <div className="mb-12 flex flex-wrap items-center justify-center gap-2 rounded-full bg-white p-1.5 shadow-soft">
            {FILTERS.map((c) => (
              <Link
                key={c.key || "all"}
                href={c.key ? `/services?category=${c.key}` : "/services"}
                className={
                  "rounded-full px-5 py-2 text-sm font-medium transition-all " +
                  (activeKey === c.key ? "bg-ink text-ivory shadow-soft" : "text-foreground/70 hover:text-rose")
                }
              >
                {c.label}
              </Link>
            ))}
          </div>

          <p className="-mt-6 mb-12 text-center text-sm text-muted-foreground">
            {services.length} {services.length === 1 ? "treatment" : "treatments"} · all prices include consultation
          </p>

          <div className="space-y-20">
            {grouped.map(({ key, label, items }) => {
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <SectionHeading
                    align="left"
                    eyebrow={`${CATEGORY_LABELS[key]} Services`}
                    title={`${label} Services`}
                    className="mb-10"
                  />
                  <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((s) => (
                      <StaggerItem key={s.id}>
                        <ServiceCard service={s} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              );
            })}
            {services.length === 0 && (
              <div className="rounded-2xl border bg-white p-16 text-center text-muted-foreground">
                No services found in this category.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}