import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const userId = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true, referralCode: true },
  });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Profile settings</h2>
        <p className="text-sm text-muted-foreground">Keep your details up to date for bookings and deliveries.</p>
      </div>
      <div className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}