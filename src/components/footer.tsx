"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/brand-icons";
import { SALON } from "@/lib/constants";
import { subscribeNewsletterAction } from "@/lib/actions/newsletter";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Book Appointment", href: "/booking" },
  { label: "Meet Our Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Customer Reviews", href: "/reviews" },
];

const SERVICE_LINKS = [
  { label: "Hair Services", href: "/services?category=hair" },
  { label: "Nail Services", href: "/services?category=nails" },
  { label: "Beauty & Makeup", href: "/services?category=beauty" },
  { label: "Loyalty & Rewards", href: "/loyalty" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "Online Store", href: "/shop" },
];

const HOURS = [
  { day: "Mon – Fri", time: "09:00 – 18:00" },
  { day: "Thursday", time: "09:00 – 19:00" },
  { day: "Saturday", time: "08:00 – 17:00" },
  { day: "Sunday", time: "Closed" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    const res = await subscribeNewsletterAction({ email });
    setSubscribing(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Welcome to the Divine Favour family!", {
      description: "You're subscribed to exclusive offers and beauty tips.",
    });
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 0%, #b76e79 0%, transparent 45%), radial-gradient(circle at 90% 100%, #d4af37 0%, transparent 40%)",
        }}
      />
      <div className="container-lux relative">
        <div className="grid gap-12 border-b border-white/10 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <Logo dark />
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              More than beauty, it&apos;s divine. Premium hair, nail, skincare, makeup and beauty treatments at
              1066 Dariek Street.
            </p>
            <div className="flex gap-3">
              {[
                { icon: InstagramIcon, href: SALON.instagram, label: "Instagram" },
                { icon: TikTokIcon, href: SALON.tiktok, label: "TikTok" },
                { icon: FacebookIcon, href: SALON.facebook, label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-rose hover:bg-rose hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 font-serif text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 transition hover:text-rose">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-serif text-lg font-semibold">Services</h4>
            <ul className="space-y-3 text-sm">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 transition hover:text-rose">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-serif text-lg font-semibold">Visit Us</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <a href={SALON.mapLink} target="_blank" rel="noreferrer" className="transition hover:text-rose">
                  {SALON.address}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <span className="flex flex-col gap-0.5">
                  {SALON.phones.map((p) => (
                    <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="transition hover:text-rose">
                      {p}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <a href={`mailto:${SALON.email}`} className="transition hover:text-rose">
                  {SALON.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50">
                <Clock className="h-3.5 w-3.5 text-rose" /> Opening Hours
              </div>
              <ul className="space-y-1.5 text-[13px] text-white/70">
                {HOURS.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className={h.time === "Closed" ? "text-rose" : ""}>{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-10 border-b border-white/10 py-12 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 font-serif text-2xl font-semibold">Join the Divine Circle</h4>
            <p className="mb-5 max-w-md text-sm text-white/60">
              Beauty tips, exclusive offers and early access to seasonal treatments — straight to your inbox.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex w-full max-w-md items-center gap-2 self-end">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-rose"
            />
            <Button type="submit" variant="gold" className="h-12 shrink-0" disabled={subscribing}>
              {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 py-8 text-xs text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} Divine Favour Hair &amp; Beauty. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="transition hover:text-rose">Privacy Policy</Link>
            <Link href="/legal/terms" className="transition hover:text-rose">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}