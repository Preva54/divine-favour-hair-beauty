import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { prisma } from "@/lib/db";
import { BlogCard } from "@/components/cards/blog-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Beauty Journal",
  description:
    "Hair care tips, trending hairstyles, wedding looks and beauty advice from the Divine Favour team.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <header className="relative overflow-hidden bg-ink pt-36 pb-20 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 70% at 20% 0%, rgb(183 110 121 / 0.35), transparent), radial-gradient(45% 60% at 90% 90%, rgb(212 175 55 / 0.15), transparent)" }}
        />
        <div className="container-lux relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur">
            <Newspaper className="h-3.5 w-3.5" /> The Journal
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight font-semibold md:text-6xl">
            Beauty <span className="text-gradient-rose">Wisdom</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Tips, trends and stories from behind the chair.
          </p>
        </div>
      </header>

      <section className="section-pad">
        <div className="container-lux">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No articles yet — check back soon.</p>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <StaggerItem key={p.id}>
                  <BlogCard post={p} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </>
  );
}