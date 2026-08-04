"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Lock,
  Minus,
  PartyPopper,
  Plus,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatZAR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart-provider";
import { createOrderAction, validateCouponAction } from "@/lib/actions/orders";

interface Props {
  initialName?: string;
  initialEmail?: string;
  signedIn: boolean;
}

export function CheckoutForm({ initialName = "", initialEmail = "", signedIn }: Props) {
  const { items, subtotal, setQty, remove, clear } = useCart();

  const [form, setForm] = useState({
    fullName: initialName,
    email: initialEmail,
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });
  const [pay, setPay] = useState<"PAY_AT_SALON" | "CARD">("PAY_AT_SALON");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ ref: string; total: number; subtotal: number; discount: number } | null>(null);

  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const canSubmit =
    items.length > 0 &&
    form.fullName.trim().length >= 2 &&
    form.email.includes("@") &&
    form.phone.trim().length >= 7 &&
    form.address.trim().length >= 5 &&
    form.city.trim().length >= 2 &&
    form.postalCode.trim().length >= 3;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setChecking(true);
    const res = await validateCouponAction(couponInput, subtotal);
    setChecking(false);
    if (!res.ok) {
      toast.error(res.error);
      setCoupon(null);
      return;
    }
    setCoupon({ code: couponInput.trim().toUpperCase(), discount: res.discount, label: res.label });
    toast.success(`${couponInput.trim().toUpperCase()} applied`);
  }

  async function placeOrder() {
    if (!canSubmit) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    const res = await createOrderAction({
      items: items.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      coupon: coupon?.code,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      notes: form.notes || undefined,
      paymentMethod: pay,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDone({ ref: res.ref, total: res.total, subtotal: res.subtotal, discount: res.discount });
    clear();
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-[2rem] border bg-white p-10 text-center shadow-lux">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-rose/30">
          <PartyPopper className="h-9 w-9 text-rose" />
        </div>
        <h2 className="font-serif text-3xl font-semibold">Order received!</h2>
        <p className="mt-3 text-muted-foreground">
          Order <span className="font-bold text-ink">{done.ref}</span> · {formatZAR(done.total)}. We&apos;ll confirm
          shipping by email shortly.
        </p>
        {done.discount > 0 && <p className="mt-1 text-sm text-emerald-600">You saved {formatZAR(done.discount)} today.</p>}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="dark">
            <Link href="/shop">Continue shopping</Link>
          </Button>
          {signedIn && (
            <Button asChild variant="outline">
              <Link href="/account/orders">View my orders</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border bg-white p-16 text-center shadow-soft">
        <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-rose" />
        <h2 className="font-serif text-2xl font-semibold">Your bag is empty</h2>
        <p className="mt-2 text-muted-foreground">Add a few lovelies before checking out.</p>
        <Button asChild className="mt-6" variant="dark">
          <Link href="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(380px,420px)]">
      <div className="space-y-8">
        <section className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
          <h2 className="mb-5 flex items-center gap-2 font-serif text-xl font-semibold">
            <ShoppingBag className="h-5 w-5 text-rose" /> Your bag
          </h2>
          <div className="divide-y">
            {items.map((l) => (
              <div key={l.id} className="flex items-center gap-4 py-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${l.slug}`} className="block truncate font-medium hover:text-rose">
                    {l.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatZAR(l.price)}
                    {l.compareAtPrice && l.compareAtPrice > l.price && (
                      <span className="ml-2 text-xs text-muted-foreground line-through">{formatZAR(l.compareAtPrice)}</span>
                    )}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex items-center rounded-full border">
                      <button type="button" onClick={() => setQty(l.id, l.quantity - 1)} className="flex h-7 w-7 items-center justify-center hover:text-rose" aria-label="Decrease">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{l.quantity}</span>
                      <button type="button" onClick={() => setQty(l.id, l.quantity + 1)} className="flex h-7 w-7 items-center justify-center hover:text-rose" aria-label="Increase">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(l.id)}
                      className="ml-1 text-xs text-muted-foreground transition hover:text-rose"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <span className="shrink-0 font-semibold">{formatZAR(l.price * l.quantity)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
          <h2 className="mb-5 font-serif text-xl font-semibold">Delivery details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="co-name">Full name</Label>
              <Input id="co-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-phone">Phone</Label>
              <Input id="co-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27 82 000 0000" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="co-email">Email</Label>
              <Input id="co-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="co-address">Street address</Label>
              <Input id="co-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-city">City / Town</Label>
              <Input id="co-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-postal">Postal code</Label>
              <Input id="co-postal" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="co-notes">Order notes (optional)</Label>
              <Textarea id="co-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Delivery instructions, gift wrapping…" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
          <h2 className="mb-5 font-serif text-xl font-semibold">Payment method</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPay("PAY_AT_SALON")}
              className={
                "flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition " +
                (pay === "PAY_AT_SALON" ? "border-rose bg-rose/5 ring-1 ring-rose" : "border-border hover:border-rose/40")
              }
            >
              <Banknote className="h-5 w-5 text-rose" />
              <span className="font-semibold">Pay at salon</span>
              <span className="text-xs text-muted-foreground">Collect & pay on pickup — no fees.</span>
            </button>
            <button
              type="button"
              onClick={() => setPay("CARD")}
              className={
                "flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition " +
                (pay === "CARD" ? "border-rose bg-rose/5 ring-1 ring-rose" : "border-border hover:border-rose/40")
              }
            >
              <CreditCard className="h-5 w-5 text-rose" />
              <span className="font-semibold">Card online</span>
              <span className="text-xs text-muted-foreground">
                {pay === "CARD" ? "Sandbox demo — no real charge (PayFast/Stripe to be wired)." : "Secure card checkout via PayFast."}
              </span>
            </button>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-3xl border bg-white p-6 shadow-lux sm:p-8 lg:sticky lg:top-28">
        <h2 className="mb-5 font-serif text-xl font-semibold">Order summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatZAR(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Coupon ({coupon?.label})</span>
              <span>-{formatZAR(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-serif text-2xl font-bold text-rose">{formatZAR(total)}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="uppercase" disabled={!!coupon} />
          {coupon ? (
            <Button variant="ghost" onClick={() => { setCoupon(null); setCouponInput(""); }}>
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={applyCoupon} disabled={checking || !couponInput.trim()}>
              {checking ? "…" : <Tag className="h-4 w-4" />} Apply
            </Button>
          )}
        </div>

        <Button variant="dark" size="lg" className="mt-6 w-full" onClick={placeOrder} disabled={submitting || !canSubmit}>
          {submitting ? "Placing order…" : "Place order"} <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Payments are being set up in sandbox mode. No real charge is made during this demo.
        </p>
      </aside>
    </div>
  );
}