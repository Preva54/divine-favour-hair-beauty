import { Badge } from "@/components/ui/badge";

const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-sky-100 text-sky-800 border-sky-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  NO_SHOW: "bg-slate-200 text-slate-700 border-slate-300",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PACKED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  SHIPPED: "bg-sky-100 text-sky-800 border-sky-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  NEW: "bg-amber-100 text-amber-800 border-amber-200",
  READ: "bg-slate-100 text-slate-700 border-slate-200",
  REPLIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`shrink-0 capitalize ${STYLES[status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {status.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}