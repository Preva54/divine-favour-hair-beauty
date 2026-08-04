"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveCouponAction } from "@/lib/actions/admin-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export type CouponFormData = {
  id?: string;
  code: string;
  type: string;
  value: number;
  minSpend: number | null;
  maxDiscount: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  active: boolean;
};

export function CouponForm({ coupon }: { coupon?: CouponFormData }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(coupon?.type ?? "PERCENT");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (coupon?.id) fd.set("id", coupon.id);
    startTransition(async () => {
      const res = await saveCouponAction(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      toast.success(coupon ? "Coupon updated." : "Coupon created.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {coupon ? (
          <Button variant="ghost" size="iconSm" className="text-muted-foreground hover:text-rose" aria-label="Edit coupon">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="ml-auto">
            <Plus className="h-4 w-4" /> New coupon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit coupon" : "New coupon"}</DialogTitle>
          <DialogDescription>Coupons are applied at checkout. Codes are auto-uppercased.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cp-code">Code</Label>
              <Input id="cp-code" name="code" required minLength={3} defaultValue={coupon?.code} placeholder="WELCOME15" className="uppercase" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cp-type">Type</Label>
              <select
                id="cp-type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-11 rounded-xl border border-input bg-white px-4 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="PERCENT">Percent off</option>
                <option value="FIXED">Fixed amount</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cp-value">Value {type === "FIXED" ? "(ZAR)" : "(%)"}</Label>
            <Input id="cp-value" name="value" type="number" min={1} step={0.01} required defaultValue={coupon?.value} placeholder={type === "FIXED" ? "150" : "15"} />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="cp-min">Min spend (ZAR)</Label>
              <Input id="cp-min" name="minSpend" type="number" min={0} defaultValue={coupon?.minSpend ?? ""} placeholder="750" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cp-max">Max discount</Label>
              <Input id="cp-max" name="maxDiscount" type="number" min={0} defaultValue={coupon?.maxDiscount ?? ""} placeholder="300" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cp-limit">Usage limit</Label>
              <Input id="cp-limit" name="usageLimit" type="number" min={0} defaultValue={coupon?.usageLimit ?? ""} placeholder="100" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cp-expires">Expires</Label>
            <Input id="cp-expires" name="expiresAt" type="date" defaultValue={coupon?.expiresAt ?? ""} />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox name="active" defaultChecked={coupon?.active ?? true} /> Active
          </label>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {coupon ? "Save changes" : "Create coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}