import { LegalShell } from "../legal-shell";

export default function ShippingPage() {
  return (
    <LegalShell eyebrow="Legal" title="Delivery, Returns & Refunds" update="August 2026">
      <h2 className="font-serif text-xl font-semibold text-ink">1. Delivery</h2>
      <p>
        Orders are dispatched within 2 business days of payment confirmation. Nationwide delivery takes 2–5 business
        days. Free delivery applies to orders over R500; otherwise a flat fee of R60 is charged. You may also collect
        from the salon at no charge — choose &ldquo;Pay at salon&rdquo; and tell us in the order notes.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">2. Returns</h2>
      <p>
        Unopened, unused products may be returned within 14 days of delivery for a refund or exchange. Opened hygiene
        items (wigs, extensions, brushes) cannot be returned for health and safety reasons.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">3. Refunds</h2>
      <p>
        Refunds are processed to your original payment method within 5–10 business days of the returned item arriving
        with us. Appointment deposits are refundable when a booking is cancelled at least 24 hours in advance.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">4. Damaged items</h2>
      <p>
        If your parcel arrives damaged, take photos and contact us within 48 hours at hello@divinefavour.co.za and
        we&apos;ll replace the item free of charge.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">5. Consumer rights</h2>
      <p>
        Nothing in this policy limits your rights under the South African Consumer Protection Act, 2008.
      </p>
    </LegalShell>
  );
}