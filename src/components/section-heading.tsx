import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  dark?: boolean;
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex max-w-2xl flex-col gap-4 md:mb-16",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-3">
          <span className="h-px w-8 bg-rose/50" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose">{eyebrow}</span>
          <span className="h-px w-8 bg-rose/50" />
        </span>
      )}
      <h2 className={cn("font-serif text-4xl leading-tight font-semibold tracking-tight md:text-5xl", dark ? "text-ivory" : "text-ink")}>
        {title}
      </h2>
      {description && <p className={cn("text-base leading-relaxed md:text-lg", dark ? "text-white/70" : "text-muted-foreground")}>{description}</p>}
    </Reveal>
  );
}