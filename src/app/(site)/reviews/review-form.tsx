"use client";

import { useState } from "react";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewAction } from "@/lib/actions/reviews";

export function ReviewForm({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await submitReviewAction({ authorName: name, rating, text });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong.");
      return;
    }
    toast.success("Thank you! Your review is awaiting approval.");
    setName("");
    setText("");
    setRating(5);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-center gap-3">
        <Label className="text-base">Your rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="text-2xl leading-none transition-transform hover:scale-110"
            >
              <span className={n <= rating ? "text-gold" : "text-muted/60"}>★</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rv-name">Your name</Label>
        <Input id="rv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amahle Nkosi" required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rv-text">Your experience</Label>
        <Textarea
          id="rv-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us about your visit — the service, the vibe, how you felt after…"
          required
          minLength={10}
        />
      </div>
      <Button type="submit" variant="dark" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
        {loading ? "Submitting…" : "Submit review"}
      </Button>
      <p className="text-xs text-muted-foreground">Reviews are moderated before publishing.</p>
    </form>
  );
}