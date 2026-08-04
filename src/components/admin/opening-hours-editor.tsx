"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateOpeningHourAction } from "@/lib/actions/admin-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

type OpeningHour = {
  id: number;
  day: number;
  dayName: string;
  open: string;
  close: string;
  closed: boolean;
};

export function OpeningHoursEditor({ hours }: { hours: OpeningHour[] }) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPendingId(id);
    startTransition(async () => {
      const res = await updateOpeningHourAction(fd);
      setPendingId(null);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Hours saved.");
    });
  };

  return (
    <Card>
      <CardContent className="divide-y p-0">
        {hours.map((h) => (
          <form
            key={h.id}
            onSubmit={(e) => onSubmit(e, h.id)}
            className="flex flex-wrap items-center gap-4 p-4"
          >
            <input type="hidden" name="id" value={h.id} />
            <input type="hidden" name="day" value={h.day} />
            <input type="hidden" name="dayName" value={h.dayName} />
            <p className="w-24 text-sm font-semibold">{h.dayName}</p>
            <Input
              name="open"
              type="time"
              defaultValue={h.closed ? "09:00" : h.open}
              disabled={pending}
              className="h-10 w-32"
              aria-label={`${h.dayName} opening time`}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              name="close"
              type="time"
              defaultValue={h.closed ? "17:00" : h.close}
              disabled={pending}
              className="h-10 w-32"
              aria-label={`${h.dayName} closing time`}
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox name="closed" defaultChecked={h.closed} /> Closed
            </label>
            <div className="ml-auto">
              <Button type="submit" variant="outline" size="sm" disabled={pendingId === h.id || pending}>
                {pendingId === h.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save
              </Button>
            </div>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}