import type { Metadata } from "next";
import { CalendarCheck2, ShieldCheck, Star, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { BookingWizard, type WizardService, type WizardStylist } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Reserve your luxury hair, nails or beauty appointment online at Divine Favour Hair & Beauty in South Africa.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; n?: string; stylist?: string }>;
}) {
  const [sp, session] = await Promise.all([searchParams, auth()]);

  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { popular: "desc" }, { price: "asc" }],
  });

  const stylists = await prisma.stylist.findMany({
    where: { available: true },
    include: { services: { select: { id: true } } },
  });

  const initialService = sp.service
    ? services.find((s) => s.slug === sp.service)
    : undefined;

  const initialStylist = sp.stylist
    ? stylists.find((st) => st.id === sp.stylist)
    : undefined;

  const wizardServices: WizardService[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    category: s.category,
    image: s.image,
    price: s.price,
    durationMinutes: s.durationMinutes,
    description: s.description,
    popular: s.popular,
  }));

  const wizardStylists: WizardStylist[] = stylists.map((st) => ({
    id: st.id,
    name: st.name,
    title: st.title,
    image: st.image,
    serviceIds: st.services.map((x) => x.id),
  }));

  const features = [
    { icon: Wallet, title: "Pay what you like", text: "20% deposit secures your slot — balance after your visit." },
    { icon: Star, title: "Top-rated artists", text: "Hand-picked specialists with 5-star reviews." },
    { icon: ShieldCheck, title: "Free cancellation", text: "Reschedule or cancel free up to 24 hours before." },
  ];

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 20% 0%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 90% 30%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <CalendarCheck2 className="h-3.5 w-3.5" /> Online Booking
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Book Your <span className="text-gradient-rose">Transformation</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Choose a service, pick your artist and select a time — done in under a minute.
          </p>
        </div>
      </header>

      <section className="section-pad pt-12 pb-20">
        <div className="container-lux">
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/70 bg-white p-5 shadow-soft">
                <f.icon className="mb-3 h-6 w-6 text-rose" />
                <h3 className="font-serif text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>

          <BookingWizard
            services={wizardServices}
            stylists={wizardStylists}
            initialServiceId={initialService?.id}
            initialStylistId={initialStylist?.id}
            initialName={session?.user?.name ?? undefined}
            initialEmail={session?.user?.email ?? undefined}
            initialPhone={session?.user?.phone ?? undefined}
          />
        </div>
      </section>
    </>
  );
}