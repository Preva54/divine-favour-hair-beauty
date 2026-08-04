import { Sparkles } from "lucide-react";

export function ServicePageHeader() {
  return (
    <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 80% at 50% 100%, rgb(183 110 121 / 0.3), transparent), radial-gradient(40% 60% at 90% 20%, rgb(212 175 55 / 0.15), transparent)" }} />
      <div className="container-lux relative text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Our Menu of Treatments
        </span>
        <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
          Services Crafted to <span className="text-gradient-rose">Perfection</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-white/70">
          Hair, nails, makeup and spa rituals — every treatment performed with premium products and precision.
          Book online in under a minute.
        </p>
      </div>
    </header>
  );
}