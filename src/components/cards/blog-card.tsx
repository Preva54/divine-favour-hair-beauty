import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import type { BlogCategory } from "@/generated/prisma/enums";

export function BlogCard({
  post,
}: {
  post: { title: string; slug: string; excerpt: string; image: string; category: BlogCategory; author: string; publishedAt: Date };
}) {
  const src = post.image.startsWith("/") ? post.image : `/images/${post.image}`;
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lux-lg">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={src}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <Badge variant="default" className="absolute top-3 left-3">
            {BLOG_CATEGORY_LABELS[post.category]}
          </Badge>
        </div>
        <div className="p-6">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-rose" />
            {formatDate(post.publishedAt)} · By {post.author}
          </p>
          <h3 className="line-clamp-2 font-serif text-xl leading-snug font-semibold transition-colors group-hover:text-rose">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-rose">
            Read Article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}