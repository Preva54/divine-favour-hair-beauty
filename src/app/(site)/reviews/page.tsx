import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareHeart, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { StarRating } from "@/components/star-rating";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "Client Reviews",
  description:
    "Read what our clients say about Divine Favour Hair & Beauty — and share your own experience with us.",
};

export default async function ReviewsPage() {
  const [reviews, session] = await Promise.all([prisma.review.findMany({ where: { approved: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 24 }), auth()]);

  const avg =
    reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5;

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 70% at 90% 10%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 10% 90%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <MessageSquareHeart className="h-3.5 w-3.5" /> Client Love
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Stories From Our <span className="text-gradient-rose">Divas</span>
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="font-serif text-5xl font-bold text-gold">{avg.toFixed(1)}</span>
            <span className="text-left">
              <StarRating rating={Math.round(avg)} count={reviews.length} size={16} />
              <span className="block text-xs text-white/60">average across verified visits</span>
            </span>
          </div>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux">
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <StaggerItem key={r.id}>
                <Reveal>
                  <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-white p-6 shadow-soft">
                    <div className="flex items-center justify-between">
                      <StarRating rating={r.rating} size={14} />
                      {r.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold text-gold">
                          <Star className="h-3 w-3 fill-gold" /> Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">“{r.text}”</p>
                    <div className="mt-5 flex items-center gap-3 border-t pt-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose/10 font-serif font-bold text-rose">
                        {r.authorName.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{r.authorName}</span>
                        <span className="block text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </Reveal>
              </StaggerItem>
            ))}
          </Stagger>
          {reviews.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">No reviews yet — be the first!</p>
          )}
        </div>
      </section>

      <section className="section-pad bg-gradient-to-b from-ivory to-[#fdf3f0] pt-14">
        <div className="container-lux grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Tell us"
              title="Share your experience"
              description="Visited us recently? Your words help other divas choose their next transformation."
            />
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li>✓ Appears after quick approval</li>
              <li>✓ Honest feedback makes us better</li>
              <li>✓ Featured reviews earn bonus points</li>
            </ul>
          </div>
          <div className="rounded-3xl border bg-white p-7 shadow-soft">
            {session?.user ? (
              <ReviewForm initialName={session.user.name ?? ""} />
            ) : (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">Sign in to leave a review and earn beauty points.</p>
                <Link href="/login" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-rose">
                  Sign in to review
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}