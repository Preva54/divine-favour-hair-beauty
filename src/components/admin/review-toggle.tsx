"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toggleReviewApproveAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ReviewToggle({ id, approved }: { id: string; approved: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={approved ? "outline" : "dark"}
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => void toggleReviewApproveAction(id))}
      className="shrink-0"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : approved ? (
        <EyeOff className="h-3.5 w-3.5" />
      ) : (
        <Eye className="h-3.5 w-3.5" />
      )}
      {approved ? "Hide" : "Approve"}
    </Button>
  );
}