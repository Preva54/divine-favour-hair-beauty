import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <Logo dark className="mb-10" />
      <p className="font-serif text-[7rem] leading-none font-bold text-gradient-rose">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold">This page slipped away</h1>
      <p className="mt-3 max-w-md text-white/60">
        The page you&apos;re looking for doesn&apos;t exist — but your next transformation is just a click away.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
          <Link href="/booking">
            <Sparkles className="h-4 w-4" /> Book a visit
          </Link>
        </Button>
      </div>
      <Link href="/" className="mt-10 inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-gold">
        <ArrowLeft className="h-3 w-3" /> Divine Favour Hair &amp; Beauty
      </Link>
    </div>
  );
}