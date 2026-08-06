import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, dark = false, compact = false }: { className?: string; dark?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/images/Logo.png"
        alt="Divine Favour Hair & Beauty"
        width={1536}
        height={1024}
        priority
        className={cn(
          "h-10 w-auto object-contain",
          compact && "h-8",
          dark && "brightness-0 invert"
        )}
      />
    </span>
  );
}
