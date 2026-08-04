import { LegalShell } from "../legal-shell";

export default function TermsPage() {
  return (
    <LegalShell eyebrow="Legal" title="Terms of Service" update="August 2026">
      <h2 className="font-serif text-xl font-semibold text-ink">1. Our services</h2>
      <p>
        Divine Favour Hair & Beauty (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides hair, nails, makeup and beauty
        treatments at 1066 Dariek Street, South Africa, and sells beauty products online. By booking a treatment or
        placing an order you agree to these terms.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">2. Bookings &amp; deposits</h2>
      <p>
        Online bookings are requests held for 24 hours pending confirmation and a 20% deposit. Deposits are deducted
        from your final bill. Cancellations are free up to 24 hours before your appointment; later cancellations may
        forfeit the deposit at our discretion. No-shows forfeit the deposit.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">3. Products &amp; delivery</h2>
      <p>
        All prices are in South African Rand (ZAR) and include VAT where applicable. We aim to dispatch within 2
        business days; delivery times are estimates. You may collect orders free of charge at the salon.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">4. Gift cards &amp; points</h2>
      <p>
        Gift cards never expire and can be used against treatments and products. Beauty points are non-transferable
        and have no cash value; points may be redeemed only in accordance with the rewards programme then in effect.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">5. Liability</h2>
      <p>
        We take care with every treatment, but no guarantee of specific results is implied. Please disclose allergies
        and medical conditions before treatment. Our liability is limited to the amount paid for the relevant
        treatment or order.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">6. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of our services after changes means you accept the
        updated terms.
      </p>
    </LegalShell>
  );
}