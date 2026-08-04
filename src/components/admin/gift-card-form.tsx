"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createGiftCardAction } from "@/lib/actions/admin-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GiftCardForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createGiftCardAction(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      e.currentTarget.reset();
      toast.success("Gift card created. Send the code to the recipient.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <Plus className="h-4 w-4" /> Issue gift card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue a gift card</DialogTitle>
          <DialogDescription>The card code is generated automatically and can be used at checkout.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="gc-amount">Amount (ZAR)</Label>
              <Input id="gc-amount" name="amount" type="number" min={1} step={0.01} required placeholder="500" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gc-email">Recipient email</Label>
              <Input id="gc-email" name="recipientEmail" type="email" required placeholder="friend@example.com" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="gc-recipient">Recipient name</Label>
              <Input id="gc-recipient" name="recipientName" placeholder="e.g. Amahle" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gc-sender">From</Label>
              <Input id="gc-sender" name="senderName" defaultValue="Divine Favour" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gc-message">Message</Label>
            <Textarea id="gc-message" name="message" rows={3} placeholder="Treat yourself — you deserve it." />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Issue gift card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}