"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveProductAction } from "@/lib/actions/admin-content";
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

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  supplier: string | null;
  minStock: number | null;
  stock: number;
  featured: boolean;
  active: boolean;
};

const CATEGORIES = [
  "HAIR_PRODUCTS",
  "HAIR_OILS",
  "SHAMPOO",
  "CONDITIONERS",
  "HAIR_EXTENSIONS",
  "WIGS",
  "MAKEUP",
  "SKINCARE",
  "ACCESSORIES",
] as const;

const catLabel = (c: string) =>
  c
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (m) => m.toUpperCase());

export function ProductForm({ product }: { product?: ProductFormData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (product?.id) fd.set("id", product.id);
    startTransition(async () => {
      const res = await saveProductAction(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      toast.success(product ? "Product updated." : "Product added.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button variant="ghost" size="iconSm" className="text-muted-foreground hover:text-rose" aria-label="Edit product">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="ml-auto">
            <Plus className="h-4 w-4" /> Add product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            Shown in the shop. Images live in public/images (e.g. /images/product-1.jpg).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" name="name" required minLength={2} defaultValue={product?.name} placeholder="e.g. Argan Luxe Hair Oil" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-slug">Slug (optional — auto-generated)</Label>
              <Input id="p-slug" name="slug" defaultValue={product?.slug} placeholder="argan-luxe-hair-oil" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" name="description" required minLength={10} rows={3} defaultValue={product?.description} placeholder="What it is and what it does" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-category">Category</Label>
              <select
                id="p-category"
                name="category"
                defaultValue={product?.category ?? "HAIR_PRODUCTS"}
                className="h-10 rounded-lg border bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {catLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-image">Image path</Label>
              <Input id="p-image" name="image" required defaultValue={product?.image ?? "/images/product-1.jpg"} placeholder="/images/product-1.jpg" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="p-price">Price (ZAR)</Label>
              <Input id="p-price" name="price" type="number" min={0.01} step={0.01} required defaultValue={product?.price ?? 0} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-cost">Cost price (ZAR)</Label>
              <Input id="p-cost" name="costPrice" type="number" min={0} step={0.01} defaultValue={product?.costPrice ?? ""} placeholder="Optional" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-compare">Compare-at price</Label>
              <Input id="p-compare" name="compareAtPrice" type="number" min={0} step={0.01} defaultValue={product?.compareAtPrice ?? ""} placeholder="Optional" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="p-supplier">Supplier</Label>
              <Input id="p-supplier" name="supplier" defaultValue={product?.supplier ?? ""} placeholder="e.g. Africa Hair World" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-minstock">Reorder at</Label>
              <Input id="p-minstock" name="minStock" type="number" min={0} max={9999} defaultValue={product?.minStock ?? 5} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-stock">Stock</Label>
              <Input id="p-stock" name="stock" type="number" min={0} max={9999} defaultValue={product?.stock ?? 0} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="featured" defaultChecked={product?.featured} /> Featured in shop
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="active" defaultChecked={product?.active ?? true} /> Visible on site
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {product ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
