import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { ReviewToggle } from "@/components/admin/review-toggle";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Reviews" };

export default async function AdminReviewsPage() {
  await requirePermission("reviews:view");
  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { name: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">
          Approve or hide customer reviews. Unapproved reviews stay hidden from the public.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {reviews.length === 0 && (
              <p className="px-5 py-10 text-center text-muted-foreground">No reviews yet.</p>
            )}
            {reviews.map((r) => (
              <div key={r.id} className={`flex items-start gap-4 p-5 ${!r.approved ? "bg-amber-50/50" : ""}`}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose/10 font-serif font-bold text-rose">
                  {r.authorName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium">{r.authorName}</p>
                    <p className="text-xs font-semibold text-amber-500">
                      {"★".repeat(r.rating)}
                      <span className="text-slate-300">{"★".repeat(5 - r.rating)}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">· {formatDate(r.createdAt)}</span>
                    {r.product && <span className="ml-auto text-xs text-muted-foreground">on {r.product.name}</span>}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{r.text}</p>
                </div>
                <ReviewToggle id={r.id} approved={r.approved} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}