import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { OpeningHoursEditor } from "@/components/admin/opening-hours-editor";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Opening Hours" };

export default async function AdminOpeningsPage() {
  await requirePermission("openings:manage");
  const hours = await prisma.openingHour.findMany({ orderBy: { day: "asc" } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Opening hours</h2>
        <p className="text-sm text-muted-foreground">
          Set the weekly operating times shown to customers. Mark a day as closed to hide it.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <OpeningHoursEditor
            hours={hours.map((h) => ({ id: h.id, day: h.day, dayName: h.dayName, open: h.open, close: h.close, closed: h.closed }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}