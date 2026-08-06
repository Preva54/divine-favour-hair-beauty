"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { reassignAppointmentAction } from "@/lib/actions/admin-staff";

export function StylistReassign({
  appointmentId,
  currentStylistId,
  stylists,
}: {
  appointmentId: string;
  currentStylistId: string;
  stylists: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target.value;
    if (!target || target === currentStylistId) return;
    startTransition(async () => {
      const res = await reassignAppointmentAction(appointmentId, target);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Appointment reassigned.");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-rose" />}
      <UserRoundCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <select
        value={currentStylistId}
        onChange={change}
        disabled={pending}
        className="h-8 max-w-36 cursor-pointer rounded-lg border bg-card px-2 text-xs outline-none transition focus:border-rose disabled:opacity-50"
        aria-label="Reassign stylist"
      >
        {stylists.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
