import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Heart, Scissors } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatZAR } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/cards/service-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return { title: "Service Not Found" };
  return {
    title: service.name,
    description: service.description,
    openGraph: {
      title: `${service.name} · Divine Favour Hair & Beauty`,
      description: service.description,
      images: [{ url: service.image }],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: { stylists: true },
  });
  if (!service) notFound();

  const related = await prisma.service.findMany({
    where: { active: true, category: service.category, id: { not: service.id } },
    take: 4,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "BeautySalon", name: "Divine Favour Hair & Beauty" },
    category: CATEGORY_LABELS[service.category],
    image: service.image,
    offers: { "@type": "Offer", price: service.price, priceCurrency: "ZAR" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-[74px]">
        <div className="container-lux py-6">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-rose">
            <ArrowLeft className="h-4 w-4" /> All Services
          </Link>
        </div>
      </div>

      <section className="container-lux grid gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-lux-lg">
            <Image src={service.image} alt={service.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="default">{CATEGORY_LABELS[service.category]}</Badge>
              {service.popular && <Badge variant="gold">Popular</Badge>}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-white p-4 text-center">
              <p className="font-serif text-2xl font-bold text-rose">{formatZAR(service.price)}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">From price</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 font-serif text-2xl font-bold">
                <Clock className="h-5 w-5 text-rose" /> {service.durationMinutes}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Minutes</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 text-center">
              <p className="font-serif text-2xl font-bold text-gold">{service.stylists.length}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Specialists</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col justify-center">
          <span className="eyebrow mb-3">{CATEGORY_LABELS[service.category]} Service</span>
          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">{service.name}</h1>
          <p className="mt-5 leading-relaxed text-muted-foreground">{service.description}</p>

          <div className="mt-8 rounded-2xl border border-border/70 bg-white p-6">
            <h2 className="mb-4 font-serif text-xl font-semibold">What&apos;s included</h2>
            <ul className="grid gap-2.5 text-sm sm:grid-cols-2">
              {[
                "Complimentary hair & scalp consultation",
                "Premium luxury products",
                "Personalised aftercare advice",
                "Style & maintenance tips",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Heart className="h-4 w-4 shrink-0 text-rose" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="dark">
              <Link href={`/booking?service=${service.slug}`}>
                <Scissors className="h-4 w-4" /> Book This Service
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/booking?service=${service.slug}`}>Check Availability</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            A 20% deposit secures your booking online — pay the balance at the salon.
          </p>
        </Reveal>
      </section>

      {service.stylists.length > 0 && (
        <section className="section-pad bg-gradient-to-b from-ivory to-[#fdf3f0] pt-14">
          <div className="container-lux">
            <h2 className="mb-6 font-serif text-3xl font-semibold">Meet your specialists</h2>
            <div className="flex flex-wrap gap-3">
              {service.stylists.map((st) => (
                <Link
                  key={st.id}
                  href={`/team/${st.id}`}
                  className="group flex items-center gap-3 rounded-full border bg-white py-2 pr-5 pl-2 shadow-soft transition hover:-translate-y-0.5 hover:border-rose/40"
                >
                  <span className="relative h-11 w-11 overflow-hidden rounded-full">
                    <Image src={st.image} alt={st.name} fill sizes="44px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold transition-colors group-hover:text-rose">{st.name}</span>
                    <span className="block text-xs text-muted-foreground">{st.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section-pad pt-14">
          <div className="container-lux">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-semibold">You may also love</h2>
              <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-rose">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((s) => (
                <StaggerItem key={s.id}>
                  <ServiceCard service={s} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}