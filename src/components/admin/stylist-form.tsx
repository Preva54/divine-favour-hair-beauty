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
  phone?: string | null;
  email?: string | null;
  commissionRate?: number;
  serviceIds?: string[];
  schedule?: { day: number; open: string; close: string; closed: boolean }[];
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function StylistForm({
  stylist,
  services = [],
}: {
  stylist?: StylistFormData;
  services?: { id: string; name: string; category: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const schedule = stylist?.schedule?.length
    ? stylist.schedule
    : WEEKDAYS.map((_, day) => ({
        day,
        open: day === 5 ? "08:00" : "09:00",
        close: day === 5 ? "17:00" : day >= 3 ? "19:00" : "18:00",
        closed: day === 6,
      }));

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
          <DialogDescription>Profile, services offered, commission and weekly schedule.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="st-name">Full name</Label>
              <Input id="st-name" name="name" required minLength={2} defaultValue={stylist?.name} placeholder="e.g. Faith" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-title">Title</Label>
              <Input id="st-title" name="title" required minLength={2} defaultValue={stylist?.title} placeholder="e.g. Senior Hair Stylist" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="st-bio">Bio</Label>
            <Textarea id="st-bio" name="bio" required minLength={10} rows={3} defaultValue={stylist?.bio} placeholder="A short introduction shown on their profile card" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="st-phone">Phone</Label>
              <Input id="st-phone" name="phone" defaultValue={stylist?.phone ?? ""} placeholder="e.g. 072 000 0000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-email">Email</Label>
              <Input id="st-email" name="email" type="email" defaultValue={stylist?.email ?? ""} placeholder="name@divinefavour.co.za" />
            </div>
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
              <Label htmlFor="st-commission">Commission %</Label>
              <Input id="st-commission" name="commissionRate" type="number" min={0} max={100} step={1} defaultValue={stylist?.commissionRate ?? 30} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="st-specs">Specialties (comma-separated)</Label>
            <Input id="st-specs" name="specialties" defaultValue={stylist?.specialties?.join(", ")} placeholder="Braiding, Cornrows, Kids Hairstyles" />
          </div>

          <div className="grid gap-2">
            <Label>Services offered</Label>
            <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border p-3">
              {services.length === 0 && <p className="col-span-full text-xs text-muted-foreground">No services available.</p>}
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <Checkbox name="serviceIds" value={s.id} defaultChecked={stylist?.serviceIds?.includes(s.id)} />
                  <span className="truncate">
                    {s.name}
                    <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground">{s.category}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Weekly schedule</Label>
            <div className="space-y-2 rounded-xl border p-3">
              {schedule.map((d) => (
                <div key={d.day} className="flex items-center gap-2 text-sm">
                  <label className="flex w-24 shrink-0 items-center gap-2">
                    <Checkbox name={`sd-${d.day}-closed`} defaultChecked={d.closed} />
                    <span className="font-medium">{WEEKDAYS[d.day]}</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      name={`sd-${d.day}-open`}
                      type="time"
                      defaultValue={d.open}
                      className="h-8 rounded-lg border px-2 text-xs outline-none focus:border-rose"
                      aria-label={`${WEEKDAYS[d.day]} opening time`}
                    />
                    <span className="text-muted-foreground">–</span>
                    <input
                      name={`sd-${d.day}-close`}
                      type="time"
                      defaultValue={d.close}
                      className="h-8 rounded-lg border px-2 text-xs outline-none focus:border-rose"
                      aria-label={`${WEEKDAYS[d.day]} closing time`}
                    />
                  </div>
                  {d.closed && <span className="text-[10px] font-semibold uppercase tracking-wide text-rose">Day off</span>}
                </div>
              ))}
            </div>
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
