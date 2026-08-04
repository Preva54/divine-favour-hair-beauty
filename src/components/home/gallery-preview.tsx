import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Camera } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  title: string;
  category: string;
};

const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[3/4]"];

export function GalleryPreview({ images }: { images: GalleryImage[] }) {
  return (
    <section className="section-pad">
      <div className="container-lux">
        <SectionHeading
          eyebrow="The Gallery"
          title="Transformations That Speak"
          description="A glimpse into our world — hair, nails, bridal and beyond."
        />
        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {images.slice(0, 8).map((img, i) => (
            <StaggerItem key={img.id} className={cn(i === 0 && "col-span-2 row-span-2", ASPECTS[i % ASPECTS.length])}>
              <Link href="/gallery" className="group relative block h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src={img.url}
                  alt={img.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="p-5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">{img.category}</p>
                    <p className="mt-1 font-serif text-lg">{img.title}</p>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-12 text-center">
          <Button asChild variant="dark">
            <Link href="/gallery">
              <Camera className="h-4 w-4" /> Explore the Gallery <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}