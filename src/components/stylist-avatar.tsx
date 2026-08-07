import Image from "next/image";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StylistAvatar({
  name,
  image,
  className,
  initialsClassName = "text-5xl",
}: {
  name: string;
  image?: string | null;
  className?: string;
  initialsClassName?: string;
}) {
  const hasImage = Boolean(image);
  const src = image?.startsWith("/") || image?.startsWith("http") ? image : `/images/${image}`;

  if (hasImage) {
    return <Image src={src!} alt={name} fill className={cn("object-cover", className)} />;
  }

  return (
    <div
      aria-label={name}
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-rose/15 via-ivory to-blush/40 font-serif font-semibold text-rose",
        initialsClassName,
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
