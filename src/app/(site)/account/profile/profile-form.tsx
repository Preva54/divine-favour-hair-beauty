"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/actions/account";

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string | null; referralCode: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfileAction({
      name,
      phone,
      ...(newPassword ? { currentPassword, newPassword } : {}),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not save changes.");
      return;
    }
    toast.success("Profile updated.");
    setCurrentPassword("");
    setNewPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pf-name">Full name</Label>
          <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-phone">Phone / WhatsApp</Label>
          <Input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27 82 000 0000" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pf-email">Email (login)</Label>
          <Input id="pf-email" value={user.email} disabled className="opacity-60" />
        </div>
      </div>

      <div className="rounded-2xl border bg-ivory/50 p-5">
        <p className="mb-4 font-serif text-lg font-semibold">Change password</p>
        <p className="mb-4 text-xs text-muted-foreground">Leave both fields blank to keep your current password.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-cur">Current password</Label>
            <Input id="pf-cur" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-new">New password</Label>
            <Input id="pf-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Referral code: <span className="font-bold text-ink">{user.referralCode}</span></p>
        <Button type="submit" variant="dark" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}