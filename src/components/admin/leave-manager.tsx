"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addStylistLeaveAction, deleteStylistLeaveAction } from "@/lib/actions/admin-staff";
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

export type LeavePeriod = {
  id: string;
  start: Date;
  end: Date;
  reason: string | null;
};

export function LeaveManager({ stylistId, stylistName, leave }: { stylistId: string; stylistName: string; leave: LeavePeriod[] }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const add = () => {
    startTransition(async () => {
      const res = await addStylistLeaveAction({ stylistId, start, end, reason: reason || undefined });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Leave period added.");
      setStart("");
      setEnd("");
      setReason("");
      router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const res = await deleteStylistLeaveAction(id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Leave period removed.");
      router.refresh();
    });
  };

  const fmt = (d: Date) => new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarOff className="h-3.5 w-3.5" /> Leave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave · {stylistName}</DialogTitle>
          <DialogDescription>Staff are hidden from online booking during these periods.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {leave.length === 0 && <p className="rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">No leave booked.</p>}
          {leave.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 rounded-xl border bg-ivory/50 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium">
                  {fmt(l.start)} – {fmt(l.end)}
                </p>
                {l.reason && <p className="text-xs text-muted-foreground">{l.reason}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(l.id)}
                disabled={pending}
                className="text-muted-foreground transition hover:text-destructive"
                aria-label="Remove leave period"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 rounded-xl border p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor={`lv-start-${stylistId}`}>Start date</Label>
              <Input id={`lv-start-${stylistId}`} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`lv-end-${stylistId}`}>End date</Label>
              <Input id={`lv-end-${stylistId}`} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`lv-reason-${stylistId}`}>Reason (optional)</Label>
            <Input id={`lv-reason-${stylistId}`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Annual leave" />
          </div>
          <Button onClick={add} disabled={pending || !start || !end}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add leave period
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
