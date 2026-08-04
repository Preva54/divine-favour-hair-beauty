import { BadgeCheck, Quote } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { StarRating } from "@/components/star-rating";
import { Reveal } from "@/components/motion/reveal";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  featured: boolean;
};

export function ReviewsPreview({ reviews }: { reviews: Review[] }) {
  const row = [...reviews, ...reviews];
  return (
    <section className="section-pad bg-gradient-to-b from-ivory via-[#fdf4f2] to-ivory">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Testimonials"
          title="Love From Our Divine Clients"
          description="Real stories from the people who trust us with their beauty."
        />
      </div>
      <div className="relative overflow-hidden">
        <div className="flex w-max gap-5 animate-marquee py-2 hover:[animation-play-state:paused]" style={{ animationDuration: "60s" }}>
          {row.map((r, i) => (
            <Reveal key={`${r.id}-${i}`} className="w-[340px] shrink-0 md:w-[400px]">
              <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
                <div>
                  <Quote className="mb-3 h-7 w-7 text-rose/30" />
                  <p className="line-clamp-5 text-sm leading-relaxed text-foreground/85">&ldquo;{r.text}&rdquo;</p>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose to-gold font-serif text-sm font-bold text-white">
                      {r.authorName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-sm font-semibold">
                        {r.authorName} <BadgeCheck className="h-3.5 w-3.5 text-rose" />
                      </p>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}