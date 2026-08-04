"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatZAR } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category } from "@/generated/prisma/enums";

export function ServiceCard({
  service
}: {
  service: { id: string; name: string; slug: string; category: Category; description: string; image: string; price: number; durationMinutes: number; popular?: boolean };
}) {
  return (
    <Link href={`/services/${service.slug}`} className="group block h-full">
      <Card className="group relative h-full overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lux-lg">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="default">{CATEGORY_LABELS[service.category]}</Badge>
            {service.popular && <Badge variant="gold">Popular</Badge>}
          </div>
          <div className="absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink backdrop-blur">
            {formatZAR(service.price)}
          </div>
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-serif text-xl font-semibold transition-colors group-hover:text-rose">{service.name}</h3>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {service.durationMinutes} min
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <Link
              href={`/booking?service=${service.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-rose"
            >
              Book Now <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-xs text-muted-foreground transition-colors group-hover:text-rose">Details →</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

