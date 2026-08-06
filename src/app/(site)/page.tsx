import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { WhyChoose } from "@/components/home/why-choose";
import { ReviewsPreview } from "@/components/home/reviews-preview";
import { LoyaltyBand } from "@/components/home/loyalty-band";
import { CtaBanner } from "@/components/home/cta-banner";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ServiceCard } from "@/components/cards/service-card";
import { StylistCard } from "@/components/cards/stylist-card";
import { BlogCard } from "@/components/cards/blog-card";
import { Button } from "@/components/ui/button";
import { GalleryPreview } from "@/components/home/gallery-preview";

export const revalidate = 300;

export default async function HomePage() {
  const [services, stylists, gallery, reviews, posts] = await Promise.all([
    prisma.service.findMany({ where: { active: true, featured: true }, take: 8 }),
    prisma.stylist.findMany({
      where: { featured: true },
      take: 4,
      include: { services: { take: 1, select: { slug: true } } },
    }),
    prisma.galleryImage.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    prisma.review.findMany({ where: { approved: true, featured: true }, take: 6 }),
    prisma.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return (
    <>
      <Hero />
      <Marquee />

      <WhyChoose />

      <section className="section-pad">
        <div className="container-lux">
          <SectionHeading
            eyebrow="Our Services"
            title="Treatments Crafted to Perfection"
            description="From statement hair colour to indulgent spa rituals — explore our signature services."
          />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <StaggerItem key={s.id}>
                <ServiceCard service={s} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">
                View All Services <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-gradient-to-b from-ivory via-[#fdf3f0] to-ivory">
        <div className="container-lux">
          <SectionHeading
            eyebrow="Meet the Team"
            title="Artists Behind the Magic"
            description="Certified, passionate and obsessed with details — your beauty is in expert hands."
          />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stylists.map((st) => (
              <StaggerItem key={st.id}>
                <StylistCard stylist={st} firstServiceSlug={st.services[0]?.slug} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 text-center">
            <Button asChild variant="dark">
              <Link href="/team">
                Meet the Full Team <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <GalleryPreview images={gallery} />

      <ReviewsPreview reviews={reviews} />

      <LoyaltyBand />

      <section className="section-pad">
        <div className="container-lux">
          <SectionHeading
            eyebrow="The Journal"
            title="Beauty Wisdom & Inspiration"
            description="Tips, trends and stories from our team of experts."
          />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.id}>
                <BlogCard post={p} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/blog">
                Read the Journal <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}