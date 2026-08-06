import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SALON } from "@/lib/constants";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SALON.name} — call, WhatsApp, email or visit us at ${SALON.address}.`,
};

export default async function ContactPage() {
  const [hours, session] = await Promise.all([prisma.openingHour.findMany({ orderBy: { day: "asc" } }), auth()]);

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 80% 0%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 10% 90%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <MessageCircle className="h-3.5 w-3.5" /> We&apos;re here for you
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Say <span className="text-gradient-rose">Hello</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Questions, bookings, partnerships — we answer within a day.
          </p>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux grid gap-10 lg:grid-cols-[1fr_minmax(380px,440px)]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Get in touch"
              title="Send us a message"
              description="Fill in the form and we'll get back to you by email or phone."
              className="mb-8"
            />
            <div className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
              <ContactForm initialName={session?.user?.name ?? undefined} initialEmail={session?.user?.email ?? undefined} />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border bg-white p-6 shadow-soft">
              <h2 className="mb-5 font-serif text-xl font-semibold">Studio details</h2>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
                  <span>
                    <span className="block font-semibold">Address</span>
                    <span className="text-muted-foreground">{SALON.address}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
                  <span>
                    <span className="block font-semibold">Call us</span>
                    <span className="flex flex-col gap-0.5">
                      {SALON.phones.map((p) => (
                        <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="text-muted-foreground hover:text-rose">
                          {p}
                        </a>
                      ))}
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
                  <span>
                    <span className="block font-semibold">Email</span>
                    <span className="flex flex-col gap-0.5">
                      {SALON.emails.map((e) => (
                        <a key={e} href={`mailto:${e}`} className="text-muted-foreground hover:text-rose">
                          {e}
                        </a>
                      ))}
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
                  <span>
                    <span className="block font-semibold">WhatsApp</span>
                    <span className="flex flex-col gap-0.5">
                      {SALON.whatsapps.map((w) => (
                        <a
                          key={w}
                          href={`https://wa.me/27${w.replace(/\D/g, "").replace(/^27/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-rose"
                        >
                          {w}
                        </a>
                      ))}
                    </span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-soft">
              <h2 className="mb-5 flex items-center gap-2 font-serif text-xl font-semibold">
                <Clock className="h-5 w-5 text-rose" /> Opening hours
              </h2>
              <ul className="space-y-2.5 text-sm">
                {hours.map((h) => (
                  <li key={h.day} className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{h.dayName}</span>
                    {h.closed ? (
                      <span className="font-medium text-rose">Closed</span>
                    ) : (
                      <span className="font-medium">
                        {h.open} – {h.close}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <iframe
              title="Divine Favour Hair & Beauty location"
              src={SALON.mapEmbed}
              className="h-64 w-full rounded-3xl border-0 shadow-soft"
              loading="lazy"
            />
          </aside>
        </div>
      </section>
    </>
  );
}