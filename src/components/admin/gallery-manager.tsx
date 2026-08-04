"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import {
  deleteGalleryImageAction,
  saveGalleryImageAction,
  toggleGalleryFeaturedAction,
} from "@/lib/actions/admin-content";
import { GALLERY_CATEGORY_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  title: string;
  category: string;
  featured: boolean;
};

const CATEGORIES = Object.entries(GALLERY_CATEGORY_LABELS);
const img = (u: string) => (u.startsWith("/") || u.startsWith("http") ? u : `/images/${u}`);

export function GalleryManager({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveGalleryImageAction(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      e.currentTarget.reset();
      toast.success("Image added to gallery.");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Featured images (★) float to the top of the site gallery.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to gallery</DialogTitle>
              <DialogDescription>Reference an image in public/images by filename.</DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gl-url">Image</Label>
                <Input id="gl-url" name="url" required placeholder="gallery-13.jpg" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gl-title">Title</Label>
                <Input id="gl-title" name="title" required minLength={2} placeholder="e.g. Golden Hour Glam" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gl-category">Category</Label>
                <select
                  id="gl-category"
                  name="category"
                  defaultValue="HAIR"
                  className="h-11 rounded-xl border border-input bg-white px-4 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {CATEGORIES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add image
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {images.map((imgItem) => (
          <figure key={imgItem.id} className={cn("group overflow-hidden rounded-2xl border bg-white shadow-sm transition", imgItem.featured && "border-gold")}>
            <div className="relative aspect-[4/3]">
              <Image src={img(imgItem.url)} alt={imgItem.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </div>
            <figcaption className="flex items-center gap-2 p-3">
              <p className="min-w-0 flex-1 truncate text-xs font-medium">
                {imgItem.title}
                <span className="block truncate text-[10px] font-normal text-muted-foreground">
                  {imgItem.category.toLowerCase().replace(/_/g, " ")}
                </span>
              </p>
              <button
                onClick={() =>
                  startTransition(() => {
                    void toggleGalleryFeaturedAction(imgItem.id);
                  })
                }
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-60",
                  imgItem.featured ? "bg-gold/15 text-gold" : "text-slate-300 hover:bg-ivory hover:text-slate-400"
                )}
                aria-label={imgItem.featured ? "Unfeature" : "Feature"}
                title={imgItem.featured ? "Unfeature" : "Feature"}
                disabled={pending}
              >
                <Star className="h-3.5 w-3.5" />
              </button>
              <DeleteButton id={imgItem.id} label="image" onDelete={deleteGalleryImageAction} confirm="Remove this image from the gallery?" />
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}