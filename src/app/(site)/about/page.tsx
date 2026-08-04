import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Clock, Gem, MapPin, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { SALON } from "@/lib/constants";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story, craft and team behind Divine Favour Hair & Beauty, 1066 Dariek Street, South Africa.",
};

export default async function AboutPage() {
  const [servicesCount, reviewsCount] = await Promise.all([
    prisma.service.count(),
    prisma.review.count({ where: { approved: true } }),
  ]);

  const values = [
    { icon: Sparkles, title: "Craft first", text: "Every service is performed with premium products and obsessive attention to detail." },
    { icon: Award, title: "5-star promise", text: "If you're not obsessed with your look, we'll make it right — no questions asked." },
    { icon: Gem, title: "Authentic luxury", text: "A warm, welcoming studio where you're treated like royalty." },
    { icon: Clock, title: "Always on time", text: "We respect your schedule as much as your hair." },
  ];

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 20% 0%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 85% 100%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            Our Story
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            More Than Beauty, <span className="text-gradient-rose">It&apos;s Divine</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            {SALON.addressShort}, where artistry meets hospitality.
          </p>
        </div>
      </header>

      <section className="container-lux grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-lux-lg">
            <Image src="/images/about-salon.jpg" alt="Inside the Divine Favour salon" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <span className="eyebrow mb-3">Who we are</span>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">A studio built on confidence</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Divine Favour Hair & Beauty was born from a simple belief: everyone deserves to feel beautiful. What began
            as a two-chair passion project has grown into a full-service studio offering hair, nails, makeup and skin
            rituals under one roof — with {servicesCount}+ signature treatments crafted around every face, every hair
            texture, every occasion.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We invest in our artists, our products and our craft so that every visit feels less like an appointment and
            more like a ritual. From your consultation to your final mirror-check, it&apos;s all about you.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { n: `${5}+`, l: "Years of craft" },
              { n: `${servicesCount}`, l: "Treatments" },
              { n: reviewsCount > 0 ? `+${reviewsCount}` : "500+", l: "5-star reviews" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border bg-white p-4 text-center shadow-soft">
                <p className="font-serif text-3xl font-bold text-rose">{s.n}</p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section-pad bg-gradient-to-b from-ivory to-[#fdf3f0] pt-14">
        <div className="container-lux">
          <SectionHeading eyebrow="Our values" title="Why divas choose us" className="mb-10" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-white p-6 shadow-soft">
                <v.icon className="mb-4 h-7 w-7 text-rose" />
                <h3 className="font-serif text-xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-lux flex flex-col items-center gap-6 rounded-[2.5rem] bg-ink p-14 text-center text-white">
          <MapPin className="h-8 w-8 text-gold" />
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">Visit the studio</h2>
          <p className="max-w-lg text-white/70">
            {SALON.address} · {SALON.phone} · Tuesday to Saturday. Walk-ins welcome, appointments preferred.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="dark" className="bg-white text-ink hover:bg-ivory">
              <Link href="/booking">Book an appointment</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
              <Link href="/contact">Get directions</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}