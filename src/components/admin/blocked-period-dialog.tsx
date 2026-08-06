"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBlockedPeriodAction, saveBlockedPeriodAction } from "@/lib/actions/admin-staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type BlockedRange = {
  id: string;
  start: Date;
  end: Date;
  reason: string | null;
  stylistId: string | null;
  stylistName: string | null;
};

export function BlockedPeriodDialog({
  stylists,
  blocked,
  defaultStylistId,
}: {
  stylists: { id: string; name: string }[];
  blocked: BlockedRange[];
  defaultStylistId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [stylistId, setStylistId] = useState(defaultStylistId ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const reset = () => {
    setStylistId(defaultStylistId ?? "");
    setStart("");
    setEnd("");
    setReason("");
  };

  const add = () => {
    startTransition(async () => {
      const res = await saveBlockedPeriodAction({
        stylistId: stylistId || undefined,
        start,
        end,
        reason: reason || undefined,
      });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Period blocked. Bookings are hidden during this time.");
      reset();
      router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const res = await deleteBlockedPeriodAction(id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Blocked period removed.");
      router.refresh();
    });
  };

  const fmt = (d: Date) => new Date(d).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Ban className="h-3.5 w-3.5" /> Block periods
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Blocked periods</DialogTitle>
          <DialogDescription>
            Unavailable times for the whole salon or a single stylist. No new bookings can be made during a blocked period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {blocked.length === 0 && (
            <p className="rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">No blocked periods.</p>
          )}
          {blocked.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border bg-ivory/50 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium">
                  {fmt(b.start)} – {fmt(b.end)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.stylistName ?? "Whole salon"}
                  {b.reason ? ` · ${b.reason}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(b.id)}
                disabled={pending}
                className="text-muted-foreground transition hover:text-destructive"
                aria-label="Remove blocked period"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 rounded-xl border p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="bp-stylist">Applies to</Label>
              <select
                id="bp-stylist"
                value={stylistId}
                onChange={(e) => setStylistId(e.target.value)}
                className="h-10 rounded-lg border bg-card px-3 text-sm outline-none transition focus:border-rose"
              >
                <option value="">Whole salon</option>
                {stylists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bp-reason">Reason</Label>
              <Input id="bp-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Public holiday" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="bp-start">From</Label>
              <Input id="bp-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bp-end">Until</Label>
              <Input id="bp-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <Button onClick={add} disabled={pending || !start || !end || end <= start}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Block this period
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
