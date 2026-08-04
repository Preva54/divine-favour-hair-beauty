import { LegalShell } from "../legal-shell";

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Legal" title="Privacy Policy" update="August 2026">
      <h2 className="font-serif text-xl font-semibold text-ink">1. What we collect</h2>
      <p>
        We collect information you give us directly — your name, contact details, booking history, orders and
        preferences — plus technical data such as device and browsing information. We comply with the Protection of
        Personal Information Act (PoPIA) of South Africa.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">2. How we use it</h2>
      <p>
        We use your information to manage bookings and orders, provide rewards and referrals, send appointment
        reminders and, with your consent, marketing. We never sell your personal data.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">3. Sharing</h2>
      <p>
        Information is shared only with service providers who help us operate (e.g. payments and delivery) under
        confidentiality obligations, or where the law requires it.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">4. Security &amp; retention</h2>
      <p>
        Passwords are stored hashed, and your data is held on secured infrastructure. We retain records only as long as
        necessary for our services and legal obligations.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">5. Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal information at any time by emailing
        hello@divinefavour.co.za. You may also close your account from your profile settings.
      </p>
      <h2 className="font-serif text-xl font-semibold text-ink">6. Cookies</h2>
      <p>
        We use essential cookies for sign-in and your shopping bag, and analytics cookies to improve the site. You can
        disable cookies in your browser, though some features may not work.
      </p>
    </LegalShell>
  );
}