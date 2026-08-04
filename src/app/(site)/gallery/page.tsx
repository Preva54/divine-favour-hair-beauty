import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { prisma } from "@/lib/db";
import { GalleryGrid } from "./gallery-grid";

export const metadata: Metadata = {
  title: "Our Gallery",
  description: "Browse transformations, bridal looks, nails, makeup and the Divine Favour salon experience.",
};

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 20% 0%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 85% 100%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <Camera className="h-3.5 w-3.5" /> The Lookbook
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Our Signature <span className="text-gradient-rose">Transformations</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            A glimpse of the hair, nails and beauty moments created at our studio.
          </p>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux">
          <GalleryGrid images={images} />
        </div>
      </section>
    </>
  );
}