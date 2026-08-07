"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { slugify } from "@/lib/utils";
import { BlogCategory, Category, CouponType, GalleryCategory, ProductCategory, Role } from "@/generated/prisma/enums";

type ActionResult = { error?: string; ok?: boolean };

const BLOG_CATEGORIES = Object.values(BlogCategory);
const GALLERY_CATEGORIES = Object.values(GalleryCategory);
const COUPON_TYPES = Object.values(CouponType);
const ROLES = Object.values(Role);
const SERVICE_CATEGORIES = Object.values(Category);

const checkbox = (fd: FormData, key: string) => fd.get(key) === "on";
const number = (fd: FormData, key: string) => Number(fd.get(key) ?? 0);
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const toTags = (csv: string) =>
  csv
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);


/* ---------------- Stylists ---------------- */

const stylistSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  title: z.string().min(2, "Title is required"),
  bio: z.string().min(10, "Bio needs at least 10 characters"),
  image: z.string().optional().default(""),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  rating: z.coerce.number().min(0).max(5).default(5),
  specialties: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  commissionRate: z.coerce.number().min(0).max(100).default(0),
});

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function parseSchedule(fd: FormData) {
  return WEEKDAY_NAMES.map((_, day) => ({
    day,
    open: str(fd, `sd-${day}-open`) || "09:00",
    close: str(fd, `sd-${day}-close`) || "17:00",
    closed: checkbox(fd, `sd-${day}-closed`),
  }));
}

export async function saveStylistAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("stylists:manage");
  const parsed = stylistSchema.safeParse({
    id: str(formData, "id") || undefined,
    name: str(formData, "name"),
    title: str(formData, "title"),
    bio: str(formData, "bio"),
    image: str(formData, "image"),
    yearsExperience: number(formData, "yearsExperience"),
    rating: str(formData, "rating") === "" ? 5 : Number(formData.get("rating")),
    specialties: str(formData, "specialties"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    commissionRate: str(formData, "commissionRate") === "" ? 0 : Number(formData.get("commissionRate")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { id, name, title, bio, image, yearsExperience, rating, specialties, phone, email, commissionRate } = parsed.data;
  const serviceIds = formData
    .getAll("serviceIds")
    .map(String)
    .filter((s) => s.length > 0);
  const data = {
    name,
    title,
    bio,
    image,
    yearsExperience,
    rating,
    specialties: toTags(specialties ?? ""),
    phone: phone || null,
    email: email || null,
    commissionRate,
    featured: checkbox(formData, "featured"),
    available: checkbox(formData, "available"),
  };

  try {
    if (id) {
      await prisma.stylist.update({
        where: { id },
        data: {
          ...data,
          services: { set: serviceIds.map((serviceId) => ({ id: serviceId })) },
          schedule: { deleteMany: {}, create: parseSchedule(formData) },
        },
      });
    } else {
      await prisma.stylist.create({
        data: {
          ...data,
          services: { connect: serviceIds.map((serviceId) => ({ id: serviceId })) },
          schedule: { create: parseSchedule(formData) },
        },
      });
    }
  } catch {
    return { error: "Could not save stylist" };
  }
  revalidatePath("/admin/stylists");
  revalidatePath("/team");
  revalidatePath("/booking");
  return { ok: true };
}

export async function deleteStylistAction(id: string): Promise<ActionResult> {
  await requirePermission("stylists:manage");
  try {
    await prisma.stylist.delete({ where: { id } });
  } catch {
    return { error: "Stylist has appointments and cannot be deleted" };
  }
  revalidatePath("/admin/stylists");
  revalidatePath("/team");
  return { ok: true };
}

export async function toggleStylistFeaturedAction(id: string): Promise<ActionResult> {
  await requirePermission("stylists:manage");
  const stylist = await prisma.stylist.findUnique({ where: { id }, select: { featured: true } });
  if (!stylist) return { error: "Stylist not found" };
  await prisma.stylist.update({ where: { id }, data: { featured: !stylist.featured } });
  revalidatePath("/admin/stylists");
  revalidatePath("/team");
  return { ok: true };
}

export async function toggleStylistAvailableAction(id: string): Promise<ActionResult> {
  await requirePermission("stylists:manage");
  const stylist = await prisma.stylist.findUnique({ where: { id }, select: { available: true } });
  if (!stylist) return { error: "Stylist not found" };
  await prisma.stylist.update({ where: { id }, data: { available: !stylist.available } });
  revalidatePath("/admin/stylists");
  revalidatePath("/team");
  return { ok: true };
}

/* ---------------- Services ---------------- */

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description needs at least 10 characters"),
  image: z.string().min(1, "Image is required"),
  category: z.enum(SERVICE_CATEGORIES as [string, ...string[]]),
  price: z.coerce.number().positive("Price must be positive"),
  durationMinutes: z.coerce.number().int().min(5, "Duration must be at least 5 minutes").max(600),
});

export async function saveServiceAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("services:manage");
  const parsed = serviceSchema.safeParse({
    id: str(formData, "id") || undefined,
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
    image: str(formData, "image"),
    category: str(formData, "category"),
    price: Number(formData.get("price")),
    durationMinutes: number(formData, "durationMinutes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { id, name, slug, description, image, category, price, durationMinutes } = parsed.data;
  const finalSlug = slugify(slug ?? name);
  if (!finalSlug) return { error: "Slug could not be generated" };

  const data = {
    name,
    slug: finalSlug,
    description,
    image,
    category: category as never,
    price,
    durationMinutes,
    popular: checkbox(formData, "popular"),
    featured: checkbox(formData, "featured"),
    active: checkbox(formData, "active"),
  };

  try {
    if (id) {
      await prisma.service.update({ where: { id }, data });
    } else {
      await prisma.service.create({ data });
    }
  } catch {
    return { error: "A service with that slug already exists" };
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/booking");
  return { ok: true };
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  await requirePermission("services:manage");
  try {
    await prisma.service.delete({ where: { id } });
  } catch {
    return { error: "Service has appointments and cannot be deleted — deactivate it instead" };
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/booking");
  return { ok: true };
}

/* ---------------- Blog ---------------- */

const blogSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().min(10, "Excerpt needs at least 10 characters"),
  content: z.string().min(20, "Content needs at least 20 characters"),
  image: z.string().min(1, "Image filename is required"),
  category: z.enum(BLOG_CATEGORIES as [string, ...string[]]),
  author: z.string().min(2, "Author is required"),
  publishedAt: z.string().optional(),
});

export async function saveBlogPostAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("blog:manage");
  const parsed = blogSchema.safeParse({
    id: str(formData, "id") || undefined,
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    excerpt: str(formData, "excerpt"),
    content: str(formData, "content"),
    image: str(formData, "image"),
    category: str(formData, "category"),
    author: str(formData, "author"),
    publishedAt: str(formData, "publishedAt") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { id, title, excerpt, content, image, category, author, publishedAt } = parsed.data;
  const slug = slugify(parsed.data.slug ?? title);
  if (!slug) return { error: "Slug could not be generated" };

  const published = checkbox(formData, "published");
  const data = {
    title,
    slug,
    excerpt,
    content,
    image,
    category: category as never,
    author,
    published,
    tags: toTags(str(formData, "tags")),
    publishedAt: publishedAt ? new Date(`${publishedAt}T00:00:00`) : new Date(),
  };

  try {
    if (id) {
      await prisma.blogPost.update({ where: { id }, data });
    } else {
      await prisma.blogPost.create({ data });
    }
  } catch {
    return { error: "A post with that slug already exists" };
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  await requirePermission("blog:manage");
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}

export async function toggleBlogPublishedAction(id: string): Promise<ActionResult> {
  await requirePermission("blog:manage");
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { published: true } });
  if (!post) return { error: "Post not found" };
  await prisma.blogPost.update({ where: { id }, data: { published: !post.published } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}

/* ---------------- Gallery ---------------- */

const gallerySchema = z.object({
  url: z.string().min(1, "Image is required"),
  title: z.string().min(2, "Title is required"),
  category: z.enum(GALLERY_CATEGORIES as [string, ...string[]]),
});

export async function saveGalleryImageAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("gallery:manage");
  const parsed = gallerySchema.safeParse({
    url: str(formData, "url"),
    title: str(formData, "title"),
    category: str(formData, "category"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  await prisma.galleryImage.create({ data: { ...parsed.data, category: parsed.data.category as never } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function deleteGalleryImageAction(id: string): Promise<ActionResult> {
  await requirePermission("gallery:manage");
  await prisma.galleryImage.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function toggleGalleryFeaturedAction(id: string): Promise<ActionResult> {
  await requirePermission("gallery:manage");
  const image = await prisma.galleryImage.findUnique({ where: { id }, select: { featured: true } });
  if (!image) return { error: "Image not found" };
  await prisma.galleryImage.update({ where: { id }, data: { featured: !image.featured } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

/* ---------------- Products ---------------- */

const PRODUCT_CATEGORIES = Object.values(ProductCategory);

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description needs at least 10 characters"),
  image: z.string().min(1, "Image is required"),
  category: z.enum(PRODUCT_CATEGORIES as [string, ...string[]]),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  supplier: z.string().optional(),
  minStock: z.coerce.number().int().min(0).max(9999).optional(),
  stock: z.coerce.number().int().min(0).max(9999),
});

export async function saveProductAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("products:manage");
  const parsed = productSchema.safeParse({
    id: str(formData, "id") || undefined,
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
    image: str(formData, "image"),
    category: str(formData, "category"),
    price: Number(formData.get("price")),
    compareAtPrice: str(formData, "compareAtPrice") === "" ? undefined : Number(formData.get("compareAtPrice")),
    costPrice: str(formData, "costPrice") === "" ? undefined : Number(formData.get("costPrice")),
    supplier: str(formData, "supplier") || undefined,
    minStock: str(formData, "minStock") === "" ? undefined : number(formData, "minStock"),
    stock: number(formData, "stock"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { id, name, slug, description, image, category, price, compareAtPrice, costPrice, supplier, minStock, stock } = parsed.data;
  const finalSlug = slugify(slug ?? name);
  if (!finalSlug) return { error: "Slug could not be generated" };

  const data = {
    name,
    slug: finalSlug,
    description,
    image,
    category: category as never,
    price,
    compareAtPrice,
    costPrice: costPrice ?? null,
    supplier: supplier ?? null,
    minStock,
    stock,
    featured: checkbox(formData, "featured"),
    active: checkbox(formData, "active"),
  };

  try {
    if (id) {
      const existing = await prisma.product.findUnique({ where: { id }, select: { stock: true } });
      await prisma.product.update({ where: { id }, data });
      if (existing && stock !== existing.stock) {
        await prisma.stockMovement.create({
          data: { productId: id, change: stock - existing.stock, reason: "ADJUSTMENT" },
        });
      }
    } else {
      const created = await prisma.product.create({ data });
      if (stock > 0) {
        await prisma.stockMovement.create({
          data: { productId: created.id, change: stock, reason: "STOCK_TAKE" },
        });
      }
    }
  } catch {
    return { error: "A product with that slug already exists" };
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requirePermission("products:manage");
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return { error: "Product is on an order and cannot be deleted" };
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  return { ok: true };
}

/* ---------------- Coupons ---------------- */

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "Code is required"),
  type: z.enum(COUPON_TYPES as [string, ...string[]]),
  value: z.coerce.number().positive("Value must be positive"),
  minSpend: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  expiresAt: z.string().optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
});

export async function saveCouponAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("coupons:manage");
  const parsed = couponSchema.safeParse({
    id: str(formData, "id") || undefined,
    code: str(formData, "code").toUpperCase().replace(/\s+/g, ""),
    type: str(formData, "type"),
    value: number(formData, "value"),
    minSpend: str(formData, "minSpend") === "" ? undefined : number(formData, "minSpend"),
    maxDiscount: str(formData, "maxDiscount") === "" ? undefined : number(formData, "maxDiscount"),
    expiresAt: str(formData, "expiresAt") || undefined,
    usageLimit: str(formData, "usageLimit") === "" ? undefined : number(formData, "usageLimit"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { id, code, type, value, minSpend, maxDiscount, expiresAt, usageLimit } = parsed.data;
  const data = {
    code,
    type: type as never,
    value,
    minSpend: minSpend || null,
    maxDiscount: maxDiscount || null,
    expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`) : null,
    usageLimit: usageLimit || null,
    active: checkbox(formData, "active"),
  };

  try {
    if (id) {
      await prisma.coupon.update({ where: { id }, data });
    } else {
      await prisma.coupon.create({ data });
    }
  } catch {
    return { error: "That coupon code already exists" };
  }
  revalidatePath("/admin/coupons");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  await requirePermission("coupons:manage");
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCouponActiveAction(id: string): Promise<ActionResult> {
  await requirePermission("coupons:manage");
  const coupon = await prisma.coupon.findUnique({ where: { id }, select: { active: true } });
  if (!coupon) return { error: "Coupon not found" };
  await prisma.coupon.update({ where: { id }, data: { active: !coupon.active } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

/* ---------------- Gift cards ---------------- */

const giftCardSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  recipientEmail: z.string().email("Please enter a valid email"),
  recipientName: z.string().optional(),
  senderName: z.string().min(1, "Sender name is required"),
  message: z.string().optional(),
});

export async function createGiftCardAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("giftcards:manage");
  const parsed = giftCardSchema.safeParse({
    amount: number(formData, "amount"),
    recipientEmail: str(formData, "recipientEmail"),
    recipientName: str(formData, "recipientName") || undefined,
    senderName: str(formData, "senderName") || "Divine Favour",
    message: str(formData, "message") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const code = `DFG-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  await prisma.giftCard.create({ data: { ...parsed.data, code, amount: parsed.data.amount, balance: parsed.data.amount } });
  revalidatePath("/admin/gift-cards");
  return { ok: true };
}

export async function deleteGiftCardAction(id: string): Promise<ActionResult> {
  await requirePermission("giftcards:manage");
  await prisma.giftCard.delete({ where: { id } });
  revalidatePath("/admin/gift-cards");
  return { ok: true };
}

/* ---------------- Opening hours ---------------- */

const openingSchema = z.object({
  id: z.coerce.number(),
  day: z.coerce.number().int().min(0).max(6),
  dayName: z.string().min(2),
  open: z.string(),
  close: z.string(),
});

export async function updateOpeningHourAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("openings:manage");
  const parsed = openingSchema.safeParse({
    id: str(formData, "id"),
    day: str(formData, "day"),
    dayName: str(formData, "dayName"),
    open: str(formData, "open"),
    close: str(formData, "close"),
  });
  if (!parsed.success) return { error: "Invalid details" };

  const { id, day, dayName, open, close } = parsed.data;
  const closed = checkbox(formData, "closed");
  await prisma.openingHour.update({
    where: { id },
    data: { day, dayName, open: closed ? "00:00" : open, close: closed ? "00:00" : close, closed },
  });
  revalidatePath("/admin/openings");
  return { ok: true };
}

/* ---------------- Users ---------------- */

const ROLE_OPTIONS = ROLES as [string, ...string[]];

export async function updateUserRoleAction(id: string, role: string): Promise<ActionResult> {
  await requirePermission("users:manage");
  if (!ROLE_OPTIONS.includes(role)) return { error: "Invalid role" };
  await prisma.user.update({ where: { id }, data: { role: role as never } });
  revalidatePath("/admin/users");
  return { ok: true };
}