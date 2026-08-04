"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveStylistAction } from "@/lib/actions/admin-content";
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

export type StylistFormData = {
  id?: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  featured: boolean;
  available: boolean;
};

export function StylistForm({ stylist }: { stylist?: StylistFormData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (stylist?.id) fd.set("id", stylist.id);
    startTransition(async () => {
      const res = await saveStylistAction(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      toast.success(stylist ? "Stylist updated." : "Stylist added.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {stylist ? (
          <Button variant="ghost" size="iconSm" className="text-muted-foreground hover:text-rose" aria-label="Edit stylist">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="ml-auto">
            <Plus className="h-4 w-4" /> Add stylist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stylist ? "Edit stylist" : "Add stylist"}</DialogTitle>
          <DialogDescription>Details appear on the team page. Images live in public/images.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="st-name">Full name</Label>
              <Input id="st-name" name="name" required minLength={2} defaultValue={stylist?.name} placeholder="e.g. Thandi Mokoena" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-title">Title</Label>
              <Input id="st-title" name="title" required minLength={2} defaultValue={stylist?.title} placeholder="e.g. Master Hair Stylist" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="st-bio">Bio</Label>
            <Textarea id="st-bio" name="bio" required minLength={10} rows={4} defaultValue={stylist?.bio} placeholder="A short introduction shown on their profile card" />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="st-image">Image filename</Label>
              <Input id="st-image" name="image" required defaultValue={stylist?.image} placeholder="stylist-1.jpg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-years">Years experience</Label>
              <Input id="st-years" name="yearsExperience" type="number" min={0} max={60} defaultValue={stylist?.yearsExperience ?? 0} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-rating">Rating (0–5)</Label>
              <Input id="st-rating" name="rating" type="number" min={0} max={5} step={0.1} defaultValue={stylist?.rating ?? 5} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="st-specs">Specialties (comma-separated)</Label>
            <Input id="st-specs" name="specialties" defaultValue={stylist?.specialties?.join(", ")} placeholder="Balayage, Silk Press, Wig Installation" />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="featured" defaultChecked={stylist?.featured} /> Featured on home
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="available" defaultChecked={stylist?.available ?? true} /> Available for booking
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {stylist ? "Save changes" : "Add stylist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}