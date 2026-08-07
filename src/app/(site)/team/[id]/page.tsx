import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BookOpen, Clock, Scissors } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatZAR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { StylistAvatar } from "@/components/stylist-avatar";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const stylist = await prisma.stylist.findUnique({ where: { id } });
  if (!stylist) return { title: "Stylist Not Found" };
  return { title: `${stylist.name} — ${stylist.title}`, description: stylist.bio };
}

export default async function StylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stylist = await prisma.stylist.findUnique({
    where: { id },
    include: { services: true },
  });
  if (!stylist) notFound();

  const recentAppointments = await prisma.appointment.count({
    where: { stylistId: id, status: "COMPLETED" },
  });

  return (
    <>
      <div className="pt-[74px]">
        <div className="container-lux py-6">
          <Link href="/team" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-rose">
            <ArrowLeft className="h-4 w-4" /> All Stylists
          </Link>
        </div>
      </div>

      <section className="container-lux grid gap-10 pb-16 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-14">
        <Reveal>
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-lux-lg">
            <StylistAvatar name={stylist.name} image={stylist.image} initialsClassName="text-7xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h1 className="font-serif text-3xl font-semibold">{stylist.name}</h1>
              <p className="mt-1 text-sm text-white/80">{stylist.title}</p>
              <StarRating rating={stylist.rating} count={stylist.reviewCount} size={15} className="mt-2" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-white p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 font-serif text-2xl font-bold">
                <Clock className="h-5 w-5 text-rose" /> {stylist.yearsExperience}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Years</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 text-center">
              <p className="font-serif text-2xl font-bold text-gold">{stylist.services.length}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Treatments</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 text-center">
              <p className="font-serif text-2xl font-bold text-rose">{recentAppointments}+</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Happy clients</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col">
          <span className="eyebrow mb-3">Meet your artist</span>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">{stylist.name}</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">{stylist.bio}</p>

          <div className="mt-7 flex flex-wrap gap-2">
            {stylist.specialties.map((s) => (
              <span key={s} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-rose">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-rose/10 p-5">
            <Award className="h-8 w-8 shrink-0 text-gold" />
            <p className="text-sm text-ink">
              <span className="font-semibold">{stylist.rating.toFixed(1)} / 5</span> across {stylist.reviewCount} reviews
              — request {stylist.name.split(" ")[0]} directly when you book.
            </p>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
              <Scissors className="h-5 w-5 text-rose" /> Signature treatments
            </h3>
            <div className="space-y-3">
              {stylist.services.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-white p-4 transition hover:border-rose/40 hover:shadow-soft"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium transition-colors group-hover:text-rose">{s.name}</span>
                    <span className="block text-xs text-muted-foreground">{s.durationMinutes} minutes</span>
                  </span>
                  <span className="shrink-0 font-serif text-lg font-bold text-rose">{formatZAR(s.price)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="dark">
              <Link href={`/booking?service=${stylist.services[0]?.slug ?? ""}&stylist=${stylist.id}`}>Book with {stylist.name.split(" ")[0]}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/booking">
                <BookOpen className="h-4 w-4" /> Browse all services
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {stylist.services.length > 0 && (
        <section className="section-pad bg-gradient-to-b from-ivory to-[#fdf3f0] pt-14">
          <div className="container-lux">
            <h2 className="mb-8 text-center font-serif text-3xl font-semibold">
              Book your appointment with {stylist.name.split(" ")[0]}
            </h2>
            <Stagger className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stylist.services.slice(0, 6).map((s) => (
                <StaggerItem key={s.id}>
                  <Link
                    href={`/booking?service=${s.slug}&stylist=${stylist.id}`}
                    className="flex h-full flex-col rounded-2xl border border-border/70 bg-white p-6 transition hover:-translate-y-1 hover:border-rose/40 hover:shadow-soft"
                  >
                    <Badge variant="outline" className="mb-3 self-start">
                      {s.durationMinutes} min
                    </Badge>
                    <span className="font-serif text-lg font-semibold">{s.name}</span>
                    <span className="mt-2 text-sm text-rose">{formatZAR(s.price)}</span>
                    <span className="mt-auto pt-3 text-xs font-semibold text-muted-foreground">Book now →</span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}