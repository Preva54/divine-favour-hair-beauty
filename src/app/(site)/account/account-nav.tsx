"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarClock,
  Gift,
  Heart,
  LayoutDashboard,
  Package,
  Sparkles,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/appointments", label: "My Appointments", icon: CalendarClock },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/loyalty", label: "Beauty Points", icon: Sparkles },
  { href: "/account/gift-cards", label: "Gift Cards", icon: Gift },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/profile", label: "Profile", icon: UserRound },
];

export function AccountNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              active ? "bg-ink text-ivory shadow-soft" : "text-muted-foreground hover:bg-rose/10 hover:text-rose",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {href === "/account/notifications" && unread > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1.5 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}