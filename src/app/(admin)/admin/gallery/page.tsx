import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Gallery" };

export default async function AdminGalleryPage() {
  await adminGuard();
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Gallery</h2>
        <p className="text-sm text-muted-foreground">{images.length} images in the lookbook.</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <GalleryManager
            images={images.map((g) => ({
              id: g.id,
              url: g.url,
              title: g.title,
              category: g.category,
              featured: g.featured,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}