import type { Metadata } from "next";
import { Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { StylistCard } from "@/components/cards/stylist-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the award-winning artists behind Divine Favour Hair & Beauty — stylists, colourists, nail techs and makeup artists.",
};

export default async function TeamPage() {
  const [stylists, serviceCount] = await Promise.all([
    prisma.stylist.findMany({
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    prisma.service.count(),
  ]);

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 80% 0%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 10% 90%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <Users className="h-3.5 w-3.5" /> The Artists
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Hands Behind the <span className="text-gradient-rose">Magic</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            {stylists.length} passionate specialists · {serviceCount} signature treatments · one shared obsession with
            your beauty.
          </p>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux">
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stylists.map((st) => (
              <StaggerItem key={st.id}>
                <StylistCard stylist={st} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-pad bg-gradient-to-b from-ivory to-[#fdf3f0] pt-14">
        <div className="container-lux">
          <SectionHeading
            eyebrow="Join the team"
            title="Work with us"
            description="We're always looking for talented artists who share our love of craft. Send your portfolio to our studio."
            className="mb-10"
          />
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border bg-white p-8 text-center shadow-soft">
            <Sparkles className="h-6 w-6 text-rose" />
            <p className="text-sm text-muted-foreground">
              Email your CV and portfolio to{" "}
              <a href="mailto:careers@divinefavour.co.za" className="font-semibold text-rose hover:underline">
                careers@divinefavour.co.za
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}