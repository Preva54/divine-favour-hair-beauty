import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Home, Package, XCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Payment Result" };

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ref?: string }>;
}) {
  const { status, ref } = await searchParams;
  const paid = status === "paid";
  const session = await auth();

  return (
    <div className="pt-[74px]">
      <div className="container-lux flex min-h-[60vh] items-center justify-center py-16">
        <div className="mx-auto w-full max-w-lg rounded-[2rem] border bg-white p-10 text-center shadow-lux">
          <div
            className={
              "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full " +
              (paid ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5" : "bg-gradient-to-br from-rose/30 to-rose/10")
            }
          >
            {paid ? <CheckCircle2 className="h-10 w-10 text-emerald-600" /> : <XCircle className="h-10 w-10 text-rose" />}
          </div>

          <h1 className="font-serif text-3xl font-semibold">
            {paid ? "Payment received!" : "Payment not completed"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {paid ? (
              <>
                Order <span className="font-bold text-ink">{ref}</span> is confirmed and paid. We&apos;ll prepare your
                goodies right away.
              </>
            ) : (
              <>
                {ref && (
                  <>
                    Order <span className="font-bold text-ink">{ref}</span> has not been charged.{" "}
                  </>
                )}
                You can try again, pay at the salon, or continue shopping — nothing was taken from your card.
              </>
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {session ? (
              <Button asChild variant="dark">
                <Link href="/account/orders">
                  <Package className="h-4 w-4" /> View my orders
                </Link>
              </Button>
            ) : (
              <Button asChild variant="dark">
                <Link href="/shop">
                  <Home className="h-4 w-4" /> Continue shopping
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/shop">Back to shop</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
