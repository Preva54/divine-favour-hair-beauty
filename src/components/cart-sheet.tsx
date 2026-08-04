"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatZAR } from "@/lib/utils";

export function CartSheet() {
  const { items, isOpen, setOpen, setQty, remove, subtotal } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full max-w-md bg-white">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 font-serif">
            <ShoppingBag className="h-5 w-5 text-rose" /> Your Cart
            {items.length > 0 && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-rose">
                {items.reduce((a, l) => a + l.quantity, 0)} items
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-9 w-9 text-rose/60" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Discover our luxury products to get started.</p>
            </div>
            <Button asChild variant="dark" onClick={() => setOpen(false)}>
              <Link href="/shop">
                Explore the Shop <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
              {items.map((line) => (
                <div key={line.id} className="flex gap-4">
                  <Link href={`/shop/${line.slug}`} onClick={() => setOpen(false)} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/${line.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-2 text-sm font-medium hover:text-rose"
                      >
                        {line.name}
                      </Link>
                      <button
                        onClick={() => remove(line.id)}
                        aria-label={`Remove ${line.name}`}
                        className="text-muted-foreground transition hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border px-1.5 py-1">
                        <button
                          onClick={() => setQty(line.id, line.quantity - 1)}
                          className="rounded-full p-1 transition hover:bg-secondary cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          onClick={() => setQty(line.id, line.quantity + 1)}
                          className="rounded-full p-1 transition hover:bg-secondary cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">{formatZAR(line.price * line.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatZAR(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">Shipping and discounts calculated at checkout.</p>
              <Button asChild className="w-full" size="lg" onClick={() => setOpen(false)}>
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full" onClick={() => setOpen(false)}>
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
