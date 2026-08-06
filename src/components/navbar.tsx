"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Calendar, Heart, LayoutDashboard, LogOut, Menu, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import type { Session } from "next-auth";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Book Now", href: "/booking", accent: true },
  { label: "Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({ session }: { session: Session | null }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const { count: cartCount, setOpen } = useCart();
  const { ids } = useWishlist();
  const user = session?.user;

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  const initials = (user?.name ?? "G")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "glass shadow-soft" : "bg-transparent"
      )}
    >
      <div className="container-lux flex h-[74px] items-center justify-between gap-4">
        <Link href="/" aria-label="Divine Favour Hair & Beauty home" className="shrink-0">
          <Logo dark={!scrolled} />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <motion.div key={item.href} whileHover={{ y: -1 }}>
              <Link
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                  scrolled ? "text-foreground/80 hover:bg-white/70 hover:text-rose" : "text-white/90 hover:bg-white/15 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <IconButton onClick={() => setOpen(true)} label="Shopping cart" badge={cartCount} light={!scrolled}>
            <ShoppingBag className="h-5 w-5" />
          </IconButton>
          <Link href="/loyalty" className="hidden sm:block">
            <IconButton label="Loyalty & wishlist" badge={ids.length} light={!scrolled}>
              <Heart className="h-5 w-5" />
            </IconButton>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full p-0.5 ring-2 ring-transparent transition hover:ring-rose/40 cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold normal-case text-foreground">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <LayoutDashboard className="h-4 w-4" /> My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/appointments">
                    <Calendar className="h-4 w-4" /> My Bookings
                  </Link>
                </DropdownMenuItem>
                {user.role !== "CUSTOMER" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck className="h-4 w-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <form action="/api/auth/signout" method="post">
                  <button type="submit" className="w-full">
                    <DropdownMenuItem className="text-destructive">
                      <LogOut className="h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant={scrolled ? "dark" : "white"} className="ml-1 hidden sm:inline-flex">
              <Link href="/login">
                <UserRound className="mr-1 h-4 w-4" /> Sign in
              </Link>
            </Button>
          )}

          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ user }: { user?: Session["user"] }) {
  return (
    <Sheet>
      <MenuTrigger />
      <SheetContent side="right" className="w-full max-w-sm">
        <div className="border-b px-6 pb-5 pt-8">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1 px-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition hover:bg-white"
            >
              {item.label}
              <span className="text-rose">→</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 p-5">
          {user ? (
            <Button asChild variant="dark">
              <Link href="/account">My Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="dark">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MenuTrigger() {
  return (
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="lg:hidden [&_svg]:size-5">
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
  );
}

function IconButton({
  children,
  label,
  badge,
  onClick,
  light,
}: {
  children: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
  light?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full transition",
        light ? "text-white/90 hover:bg-white/15 hover:text-white" : "text-foreground/80 hover:bg-white/70 hover:text-rose",
        "cursor-pointer"
      )}
    >
      {children}
      {badge ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}