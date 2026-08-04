"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveBlogPostAction } from "@/lib/actions/admin-content";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type BlogFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  tags: string[];
  published: boolean;
};

const CATEGORIES = Object.entries(BLOG_CATEGORY_LABELS);

export function BlogForm({ post }: { post?: BlogFormData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (post?.id) fd.set("id", post.id);
    startTransition(async () => {
      const res = await saveBlogPostAction(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      toast.success(post ? "Post updated." : "Post created.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {post ? (
          <Button variant="ghost" size="iconSm" className="text-muted-foreground hover:text-rose" aria-label="Edit post">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="ml-auto">
            <Plus className="h-4 w-4" /> New post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit post" : "New blog post"}</DialogTitle>
          <DialogDescription>Content supports Markdown (headings, lists, links). Images live in public/images.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bp-title">Title</Label>
            <Input id="bp-title" name="title" required minLength={3} defaultValue={post?.title} placeholder="e.g. 7 Balayage Trends for Summer" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bp-slug">Slug (leave blank to auto-generate)</Label>
              <Input id="bp-slug" name="slug" defaultValue={post?.slug} placeholder="balayage-trends-summer" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bp-category">Category</Label>
              <select
                id="bp-category"
                name="category"
                defaultValue={post?.category ?? "HAIR_TIPS"}
                className="h-11 rounded-xl border border-input bg-white px-4 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bp-image">Image filename</Label>
              <Input id="bp-image" name="image" required defaultValue={post?.image} placeholder="blog-1.jpg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bp-author">Author</Label>
              <Input id="bp-author" name="author" required minLength={2} defaultValue={post?.author} placeholder="e.g. Thandi Mokoena" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bp-excerpt">Excerpt</Label>
            <Textarea id="bp-excerpt" name="excerpt" required minLength={10} rows={2} defaultValue={post?.excerpt} placeholder="Short summary shown on cards" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bp-content">Content (Markdown)</Label>
            <Textarea id="bp-content" name="content" required minLength={20} rows={12} className="font-mono text-xs" defaultValue={post?.content} placeholder="## Heading&#10;&#10;Write your article here…" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bp-tags">Tags (comma-separated)</Label>
            <Input id="bp-tags" name="tags" defaultValue={post?.tags?.join(", ")} placeholder="balayage, colour, summer" />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="published" defaultChecked={post?.published ?? true} /> Published
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {post ? "Save changes" : "Create post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}