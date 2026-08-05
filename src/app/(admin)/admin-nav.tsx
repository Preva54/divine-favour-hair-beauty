"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CalendarDays,
  CalendarRange,
  Clock,
  Contact,
  CreditCard,
  FileText,
  Gift,
  Images,
  LayoutDashboard,
  MessageSquare,
  Package,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Star,
  Ticket,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; permission: string };

const SECTIONS: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, permission: "dashboard:view" }] },
  {
    title: "Sales",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, permission: "bookings:view" },
      { href: "/admin/calendar", label: "Calendar", icon: CalendarRange, permission: "bookings:view" },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "orders:view" },
      { href: "/admin/payments", label: "Payments", icon: CreditCard, permission: "payments:view" },
      { href: "/admin/gift-cards", label: "Gift cards", icon: Gift, permission: "giftcards:view" },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket, permission: "coupons:view" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package, permission: "products:view" },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes, permission: "products:view" },
      { href: "/admin/services", label: "Services", icon: Scissors, permission: "services:view" },
      { href: "/admin/stylists", label: "Stylists", icon: UsersRound, permission: "stylists:view" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText, permission: "blog:view" },
      { href: "/admin/gallery", label: "Gallery", icon: Images, permission: "gallery:view" },
      { href: "/admin/reviews", label: "Reviews", icon: Star, permission: "reviews:view" },
    ],
  },
  {
    title: "Inbox",
    items: [{ href: "/admin/messages", label: "Messages", icon: MessageSquare, permission: "messages:view" }],
  },
  {
    title: "Customers",
    items: [{ href: "/admin/customers", label: "Customers", icon: Contact, permission: "customers:view" }],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/openings", label: "Opening hours", icon: Clock, permission: "openings:manage" },
      { href: "/admin/permissions", label: "Role permissions", icon: ShieldCheck, permission: "settings:manage" },
      { href: "/admin/users", label: "Customers & staff", icon: UsersRound, permission: "users:view" },
    ],
  },
];

export function AdminNav({ badges, permissions }: { badges: Record<string, number>; permissions: string[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section, i) => {
        const items = section.items.filter((item) => permissions.includes(item.permission));
        if (items.length === 0) return null;
        return (
          <div key={i}>
            {section.title && (
              <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{section.title}</p>
            )}
            <div className="space-y-1">
              {items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const badge = badges[item.href] ?? 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                    active ? "bg-rose text-white shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-[18px] w-[18px]", !active && "opacity-70")} />
                  {item.label}
                  {badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-ink">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}