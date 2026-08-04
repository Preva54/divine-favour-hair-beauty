"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GALLERY_CATEGORY_LABELS } from "@/lib/constants";
import type { GalleryCategory } from "@/generated/prisma/enums";

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: GalleryCategory;
  featured: boolean;
}

const ALL = ["all", "HAIR", "NAILS", "MAKEUP", "SALON", "BRIDAL", "TRANSFORMATIONS"] as const;

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(
    () => (cat === "all" ? images : images.filter((i) => i.category === cat)),
    [images, cat],
  );

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2 rounded-full bg-white p-1.5 shadow-soft">
        {ALL.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition-all " +
              (cat === c ? "bg-ink text-ivory shadow-soft" : "text-foreground/70 hover:text-rose")
            }
          >
            {c === "all" ? "All" : GALLERY_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {filtered.map((img) => (
          <figure key={img.id} className="group relative break-inside-avoid overflow-hidden rounded-2xl shadow-soft">
            <Image
              src={img.url}
              alt={img.title}
              width={800}
              height={600}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span>
                <span className="block font-serif text-lg font-semibold text-white">{img.title}</span>
                <span className="text-xs font-medium text-gold">{GALLERY_CATEGORY_LABELS[img.category]}</span>
              </span>
            </figcaption>
          </figure>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-16 text-center text-muted-foreground">No photos in this category.</p>
        )}
      </div>
    </div>
  );
}