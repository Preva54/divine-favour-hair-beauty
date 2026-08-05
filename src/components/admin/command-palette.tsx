"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  CalendarDays,
  Clock,
  Command,
  Contact,
  CreditCard,
  FileText,
  Gift,
  Home,
  Images,
  LayoutDashboard,
  Mail,
  Package,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const COMMANDS: { href: string; label: string; keywords: string; permission: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/admin", label: "Go to overview", keywords: "dashboard home", permission: "dashboard:view", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "View bookings", keywords: "appointments schedule", permission: "bookings:view", icon: CalendarDays },
  { href: "/admin/calendar", label: "Open calendar", keywords: "month week agenda schedule", permission: "bookings:view", icon: CalendarDays },
  { href: "/admin/orders", label: "View orders", keywords: "sales checkout", permission: "orders:view", icon: ShoppingBag },
  { href: "/admin/payments", label: "Payments ledger", keywords: "money paid invoice finance", permission: "payments:view", icon: CreditCard },
  { href: "/admin/products", label: "Manage products", keywords: "shop stock inventory", permission: "products:view", icon: Package },
  { href: "/admin/inventory", label: "View inventory", keywords: "stock reorder restock", permission: "products:view", icon: Boxes },
  { href: "/admin/customers", label: "Browse customers", keywords: "clients accounts people", permission: "customers:view", icon: Contact },
  { href: "/admin/services", label: "Manage services", keywords: "menu price", permission: "services:view", icon: Scissors },
  { href: "/admin/stylists", label: "Manage stylists", keywords: "team staff", permission: "stylists:view", icon: UsersRound },
  { href: "/admin/blog", label: "Manage blog posts", keywords: "articles news", permission: "blog:view", icon: FileText },
  { href: "/admin/gallery", label: "Manage gallery", keywords: "photos images", permission: "gallery:view", icon: Images },
  { href: "/admin/reviews", label: "Moderate reviews", keywords: "ratings feedback", permission: "reviews:view", icon: Star },
  { href: "/admin/coupons", label: "Manage coupons", keywords: "discount promo codes", permission: "coupons:view", icon: Ticket },
  { href: "/admin/gift-cards", label: "Gift cards", keywords: "vouchers", permission: "giftcards:view", icon: Gift },
  { href: "/admin/messages", label: "Inbox", keywords: "contact enquiries mail", permission: "messages:view", icon: Mail },
  { href: "/admin/openings", label: "Opening hours", keywords: "hours schedule times", permission: "openings:manage", icon: Clock },
  { href: "/admin/permissions", label: "Role permissions", keywords: "rbac roles access matrix", permission: "settings:manage", icon: ShieldCheck },
  { href: "/admin/users", label: "Customers & staff", keywords: "accounts people", permission: "users:view", icon: UsersRound },
  { href: "/account", label: "My account", keywords: "profile dashboard", permission: "", icon: UserRound },
  { href: "/", label: "Back to site", keywords: "home public", permission: "", icon: Home },
];

export function CommandPalette({ permissions }: { permissions: string[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMANDS.filter(
      (c) =>
        (!c.permission || permissions.includes(c.permission)) &&
        (!q || c.label.toLowerCase().includes(q) || c.keywords.includes(q))
    );
  }, [query, permissions]);

  const run = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border bg-transparent px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden xl:inline">Search admin…</span>
        <kbd className="ml-2 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-semibold xl:inline">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showClose={false} className="top-[12%] max-w-xl gap-0 overflow-hidden p-0 shadow-2xl">
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{query}”.</p>}
            {results.map((c) => (
              <button
                key={c.href}
                type="button"
                onClick={() => run(c.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-muted",
                  c.href === "/admin" && "font-medium"
                )}
              >
                <c.icon className="h-4 w-4 shrink-0 text-rose" />
                <span className="flex-1 truncate">{c.label}</span>
                <Command className="h-3 w-3 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
