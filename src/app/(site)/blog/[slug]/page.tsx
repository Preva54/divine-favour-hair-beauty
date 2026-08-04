import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, UserRound } from "lucide-react";
import Markdown from "react-markdown";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/cards/blog-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [{ url: post.image }] },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { published: true, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const image = post.image.startsWith("/") ? post.image : `/images/${post.image}`;

  return (
    <>
      <div className="pt-[74px]">
        <div className="container-lux py-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-rose">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
        </div>
      </div>

      <article className="container-lux max-w-3xl">
        <Badge variant="default">{BLOG_CATEGORY_LABELS[post.category]}</Badge>
        <h1 className="mt-4 font-serif text-4xl leading-tight font-semibold md:text-5xl">{post.title}</h1>
        <p className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UserRound className="h-4 w-4 text-rose" /> {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-rose" /> {formatDate(post.publishedAt)}
          </span>
        </p>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[2rem] shadow-lux-lg">
          <Image src={image} alt={post.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>

        <div className="mt-10">
          <Markdown
            components={{
              h2: (props) => <h2 className="mt-10 mb-4 font-serif text-2xl font-semibold" {...props} />,
              h3: (props) => <h3 className="mt-8 mb-3 font-serif text-xl font-semibold" {...props} />,
              p: (props) => <p className="mb-4 leading-relaxed text-foreground/80" {...props} />,
              ul: (props) => <ul className="mb-4 space-y-1.5 pl-5" {...props} />,
              li: (props) => (
                <li className="leading-relaxed text-foreground/80 marker:text-rose" {...props} />
              ),
              strong: (props) => <strong className="font-semibold text-ink" {...props} />,
              a: (props) => <a className="text-rose underline underline-offset-2 hover:text-rose/80" {...props} />,
            }}
          >
            {post.content}
          </Markdown>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-rose">
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="section-pad mt-4 pt-14">
          <div className="container-lux">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-semibold">Keep reading</h2>
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-rose">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <StaggerItem key={p.id}>
                  <BlogCard post={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}