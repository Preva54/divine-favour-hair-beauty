import { cn } from "@/lib/utils";

export function Logo({ className, dark = false, compact = false }: { className?: string; dark?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-rose via-blush to-gold shadow-lux">
        <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden>
          <text
            x="20"
            y="26"
            textAnchor="middle"
            className="font-serif"
            fontSize="20"
            fontWeight="700"
            fill="#fff"
          >
            D
          </text>
        </svg>
        <Sparkle className="absolute -top-1 -right-1 h-4 w-4 text-gold" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-serif text-[17px] font-bold tracking-tight", dark ? "text-ivory" : "text-ink")}>
            Divine Favour
          </span>
          <span className={cn("mt-1 text-[9px] font-semibold uppercase tracking-[0.32em]", dark ? "text-rose/80" : "text-rose")}>
            Hair &amp; Beauty
          </span>
        </span>
      )}
    </span>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
    </svg>
  );
}