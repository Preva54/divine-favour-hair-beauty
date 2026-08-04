const ITEMS = [
  "Hair Styling",
  "Balayage",
  "Nail Art",
  "Bridal Makeup",
  "Wigs & Extensions",
  "Facials",
  "Massage",
  "Luxury Treatments",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-rose/15 bg-ink py-5">
      <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-serif text-lg font-medium tracking-wide text-white/70">{item}</span>
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}