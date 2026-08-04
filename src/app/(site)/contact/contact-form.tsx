"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessageAction } from "@/lib/actions/contact";

export function ContactForm({ initialName = "", initialEmail = "" }: { initialName?: string; initialEmail?: string }) {
  const [form, setForm] = useState({ name: initialName, email: initialEmail, phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await sendContactMessageAction(form);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong.");
      return;
    }
    toast.success("Message sent — we'll be in touch soon!");
    setForm({ name: initialName, email: initialEmail, phone: "", subject: "", message: "" });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="ct-name">Your name</Label>
        <Input id="ct-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ct-email">Email</Label>
        <Input id="ct-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ct-phone">Phone (optional)</Label>
        <Input id="ct-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27 82 000 0000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ct-subject">Subject</Label>
        <Input id="ct-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required minLength={3} placeholder="e.g. Bridal quote" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="ct-message">Message</Label>
        <Textarea id="ct-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={10} placeholder="How can we help?" />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="dark" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}