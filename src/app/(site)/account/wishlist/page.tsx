import { prisma } from "@/lib/db";
import { WishlistGrid } from "./wishlist-grid";

export default async function WishlistPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      price: true,
      compareAtPrice: true,
      rating: true,
      reviewCount: true,
      category: true,
      stock: true,
      featured: true,
    },
  });

  return <WishlistGrid products={products} />;
}