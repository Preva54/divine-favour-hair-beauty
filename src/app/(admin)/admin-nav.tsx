"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Clock,
  FileText,
  Gift,
  Images,
  LayoutDashboard,
  MessageSquare,
  Package,
  Scissors,
  ShoppingBag,
  Star,
  Ticket,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const SECTIONS: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }] },
  {
    title: "Sales",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/gift-cards", label: "Gift cards", icon: Gift },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/services", label: "Services", icon: Scissors },
      { href: "/admin/stylists", label: "Stylists", icon: UsersRound },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "Inbox",
    items: [{ href: "/admin/messages", label: "Messages", icon: MessageSquare }],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/openings", label: "Opening hours", icon: Clock },
      { href: "/admin/users", label: "Customers & staff", icon: UsersRound },
    ],
  },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section, i) => (
        <div key={i}>
          {section.title && (
            <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{section.title}</p>
          )}
          <div className="space-y-1">
            {section.items.map((item) => {
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
      ))}
    </nav>
  );
}