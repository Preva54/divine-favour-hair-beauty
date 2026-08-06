import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your bag and complete your order at Divine Favour Hair & Beauty.",
};

export default async function CheckoutPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { points: true } })
    : null;

  return (
    <div className="pt-[74px]">
      <div className="container-lux py-10">
        <span className="eyebrow mb-2">Secure checkout</span>
        <h1 className="mb-10 font-serif text-4xl font-semibold">Complete your order</h1>
        <CheckoutForm
          initialName={session?.user?.name ?? undefined}
          initialEmail={session?.user?.email ?? undefined}
          signedIn={!!session?.user}
          pointsBalance={user?.points ?? 0}
        />
      </div>
    </div>
  );
}