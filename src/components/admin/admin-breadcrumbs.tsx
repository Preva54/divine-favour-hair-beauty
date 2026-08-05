"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Dashboard",
  bookings: "Bookings",
  calendar: "Calendar",
  orders: "Orders",
  payments: "Payments",
  products: "Products",
  inventory: "Inventory",
  services: "Services",
  stylists: "Stylists",
  customers: "Customers",
  blog: "Blog",
  gallery: "Gallery",
  reviews: "Reviews",
  coupons: "Coupons",
  "gift-cards": "Gift cards",
  messages: "Messages",
  openings: "Opening hours",
  permissions: "Role permissions",
  users: "Customers & staff",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] !== "admin") return null;

  const trail = segments.map((seg, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    const label = LABELS[seg] ?? seg;
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link href="/admin" className="inline-flex items-center gap-1 transition hover:text-foreground">
        <LayoutDashboard className="h-3.5 w-3.5" />
        {trail[0].label}
      </Link>
      {trail.slice(1).map((t) => (
        <span key={t.href} className="inline-flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {t.isLast ? (
            <span className="font-medium text-foreground">{t.label}</span>
          ) : (
            <Link href={t.href} className="transition hover:text-foreground">
              {t.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
