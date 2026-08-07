import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SignOutButton } from "@/components/sign-out-button";
import { AccountNav } from "./account-nav";

export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, points: true, referralCode: true },
  });

  const unread = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="pt-[74px]">
      <div className="border-b bg-white/60 backdrop-blur">
        <div className="container-lux flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="eyebrow mb-1">My account</p>
            <h1 className="font-serif text-3xl font-semibold">
              Hello, {user?.name?.split(" ")[0] ?? "there"}
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-3 shadow-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-lg font-bold text-gold">
              {user?.points ?? 0}
            </span>
            <span>
              <span className="block text-sm leading-none font-bold">beauty points</span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Referral code: {user?.referralCode}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="container-lux grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-3xl border bg-white p-3 shadow-soft lg:sticky lg:top-24">
          <AccountNav unread={unread} />
          <div className="mt-2 border-t pt-2">
            <SignOutButton className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-rose/10 hover:text-rose" />
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}