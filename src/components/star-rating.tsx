import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  count,
  className,
  size = 16,
}: {
  rating: number;
  count?: number;
  className?: string;
  size?: number;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5 text-gold" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) return <Star key={i} size={size} className="fill-current" />;
          if (i === full && half) return <StarHalf key={i} size={size} className="fill-current" />;
          return <Star key={i} size={size} className="text-gold/30" />;
        })}
      </div>
      {typeof count === "number" && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}