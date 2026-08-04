import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import { deleteBlogPostAction, toggleBlogPublishedAction } from "@/lib/actions/admin-content";
import { ToggleButton } from "@/components/admin/toggle-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { BlogForm } from "@/components/admin/blog-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Blog" };

const img = (u: string) => (u.startsWith("/") || u.startsWith("http") ? u : `/images/${u}`);

export default async function AdminBlogPage() {
  await adminGuard();
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ published: "asc" }, { publishedAt: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Blog</h2>
          <p className="text-sm text-muted-foreground">
            {posts.filter((p) => p.published).length} of {posts.length} posts published. Content is Markdown.
          </p>
        </div>
        <BlogForm />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {posts.length === 0 && <p className="px-5 py-10 text-center text-muted-foreground">No posts yet.</p>}
            {posts.map((post) => (
              <div key={post.id} className={`flex items-center gap-4 p-4 px-5 ${!post.published ? "bg-amber-50/40" : ""}`}>
                <Image
                  src={img(post.image)}
                  alt={post.title}
                  width={64}
                  height={48}
                  className="hidden h-12 w-16 shrink-0 rounded-lg object-cover sm:block"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{post.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{BLOG_CATEGORY_LABELS[post.category]}</Badge>
                    <span>· {post.author}</span>
                    <span>· {formatDate(post.publishedAt)}</span>
                    {post.tags.length > 0 && <span>· #{post.tags.slice(0, 2).join(" #")}</span>}
                  </p>
                </div>
                <ToggleButton
                  on={post.published}
                  onToggle={() => toggleBlogPublishedAction(post.id)}
                  label={post.published ? "Unpublish post" : "Publish post"}
                />
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-semibold text-rose transition hover:underline"
                  target="_blank"
                >
                  View
                </Link>
                <BlogForm
                  post={{
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    image: post.image,
                    category: post.category,
                    author: post.author,
                    tags: post.tags,
                    published: post.published,
                  }}
                />
                <DeleteButton id={post.id} label="post" onDelete={deleteBlogPostAction} confirm="Delete this post permanently?" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}