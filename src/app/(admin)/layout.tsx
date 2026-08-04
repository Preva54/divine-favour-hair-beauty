import Link from "next/link";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { Logo } from "@/components/logo";
import { AdminNav } from "./admin-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await adminGuard();

  const [newMessages, unapprovedReviews, pendingBookings] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
  ]);

  const badges = {
    "/admin/messages": newMessages,
    "/admin/reviews": unapprovedReviews,
    "/admin/bookings": pendingBookings,
  };

  return (
    <div className="min-h-screen bg-ivory/40">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-white lg:flex">
        <div className="flex h-[74px] items-center px-6">
          <Logo dark className="scale-90" />
        </div>
        <AdminNav badges={badges} />
        <div className="p-5">
          <Link href="/" className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b bg-white/80 px-6 backdrop-blur">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="hidden font-serif text-lg font-semibold lg:block">Salon Back Office</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/account">My account</Link>
            </Button>
          </div>
        </header>
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}