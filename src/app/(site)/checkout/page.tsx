import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your bag and complete your order at Divine Favour Hair & Beauty.",
};

export default async function CheckoutPage() {
  const session = await auth();

  return (
    <div className="pt-[74px]">
      <div className="container-lux py-10">
        <span className="eyebrow mb-2">Secure checkout</span>
        <h1 className="mb-10 font-serif text-4xl font-semibold">Complete your order</h1>
        <CheckoutForm
          initialName={session?.user?.name ?? undefined}
          initialEmail={session?.user?.email ?? undefined}
          signedIn={!!session?.user}
        />
      </div>
    </div>
  );
}