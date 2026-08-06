import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";

export function StylistCard({
  stylist,
  firstServiceSlug,
}: {
  stylist: { id: string; name: string; title: string; bio: string; image: string; yearsExperience: number; rating: number; reviewCount: number; specialties: string[] };
  firstServiceSlug?: string;
}) {
  const bookHref = firstServiceSlug
    ? `/booking?service=${firstServiceSlug}&stylist=${stylist.id}`
    : `/team/${stylist.id}`;

  return (
    <div className="group block h-full">
      <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lux-lg">
        <Link href={`/team/${stylist.id}`} className="relative block h-80 overflow-hidden">
          <Image
            src={stylist.image}
            alt={stylist.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                <Clock className="h-3 w-3" /> {stylist.yearsExperience} yrs exp
              </span>
              <span className="rounded-full bg-rose px-2.5 py-1 text-[11px] font-semibold">{stylist.title}</span>
            </div>
            <h3 className="mt-2.5 font-serif text-2xl font-semibold">{stylist.name}</h3>
            <StarRating rating={stylist.rating} count={stylist.reviewCount} size={14} className="mt-1.5" />
          </div>
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {stylist.specialties.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-rose">
                {s}
              </span>
            ))}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{stylist.bio}</p>
          <span className="mt-auto pt-4">
            <Link
              href={bookHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose transition-transform group-hover:translate-x-1"
            >
              <Calendar className="h-4 w-4" /> Book {stylist.name.split(" ")[0]}
            </Link>
          </span>
        </div>
      </Card>
    </div>
  );
}
