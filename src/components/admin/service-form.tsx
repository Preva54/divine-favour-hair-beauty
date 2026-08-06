"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveServiceAction, deleteServiceAction } from "@/lib/actions/admin-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type ServiceFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  price: number;
  durationMinutes: number;
  popular: boolean;
  featured: boolean;
  active: boolean;
};

const CATEGORIES = ["HAIR", "NAILS", "BEAUTY"] as const;

const catLabel = (c: string) => c.toLowerCase().replace(/^./, (m) => m.toUpperCase());

export function ServiceForm({ service }: { service?: ServiceFormData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (service?.id) fd.set("id", service.id);
    startTransition(async () => {
      const res = await saveServiceAction(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      toast.success(service ? "Service updated." : "Service added.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {service ? (
          <Button variant="ghost" size="iconSm" className="text-muted-foreground hover:text-rose" aria-label="Edit service">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="ml-auto">
            <Plus className="h-4 w-4" /> Add service
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>
            Shown on the services menu and available for booking. Images live in public/images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="s-name">Name</Label>
              <Input id="s-name" name="name" required minLength={2} defaultValue={service?.name} placeholder="e.g. Luxury Silk Press" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-slug">Slug (optional — auto-generated)</Label>
              <Input id="s-slug" name="slug" defaultValue={service?.slug} placeholder="luxury-silk-press" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="s-desc">Description</Label>
            <Textarea id="s-desc" name="description" required minLength={10} rows={3} defaultValue={service?.description} placeholder="What's included in this treatment" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="s-category">Category</Label>
              <select
                id="s-category"
                name="category"
                defaultValue={service?.category ?? "HAIR"}
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
              <Label htmlFor="s-image">Image path</Label>
              <Input id="s-image" name="image" required defaultValue={service?.image ?? "/images/service-1.jpg"} placeholder="/images/service-1.jpg" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="s-price">Price (ZAR)</Label>
              <Input id="s-price" name="price" type="number" min={0.01} step={0.01} required defaultValue={service?.price ?? 0} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-duration">Duration (minutes)</Label>
              <Input id="s-duration" name="durationMinutes" type="number" min={5} max={600} step={5} required defaultValue={service?.durationMinutes ?? 60} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="popular" defaultChecked={service?.popular} /> Popular pick
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="featured" defaultChecked={service?.featured} /> Featured on home
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox name="active" defaultChecked={service?.active ?? true} /> Visible on site
            </label>
          </div>

          <DialogFooter className="gap-2">
            {service && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" className="mr-auto text-rose hover:bg-rose/10">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this service?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes &quot;{service.name}&quot; from the menu. Services with bookings can&apos;t be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-rose hover:bg-rose/90"
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteServiceAction(service.id!);
                          if (res?.error) {
                            toast.error(res.error);
                            return;
                          }
                          setOpen(false);
                          toast.success("Service deleted.");
                        })
                      }
                    >
                      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {service ? "Save changes" : "Add service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
