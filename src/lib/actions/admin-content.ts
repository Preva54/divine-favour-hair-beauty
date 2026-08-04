"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import { slugify } from "@/lib/utils";
import { BlogCategory, CouponType, GalleryCategory, Role } from "@/generated/prisma/enums";

type ActionResult = { error?: string; ok?: boolean };

const BLOG_CATEGORIES = Object.values(BlogCategory);
const GALLERY_CATEGORIES = Object.values(GalleryCategory);
const COUPON_TYPES = Object.values(CouponType);
const ROLES = Object.values(Role);

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
  image: z.string().min(1, "Image filename is required"),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  rating: z.coerce.number().min(0).max(5).default(5),
  specialties: z.string().optional(),
});

export async function saveStylistAction(formData: FormData): Promise<ActionResult> {
  await adminGuard();
  const parsed = stylistSchema.safeParse({
    id: str(formData, "id") || undefined,
    name: str(formData, "name"),
    title: str(formData, "title"),
    bio: str(formData, "bio"),
    image: str(formData, "image"),
    yearsExperience: number(formData, "yearsExperience"),
    rating: str(formData, "rating") === "" ? 5 : Number(formData.get("rating")),
    specialties: str(formData, "specialties"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { id, name, title, bio, image, yearsExperience, rating, specialties } = parsed.data;
  const data = {
    name,
    title,
    bio,
    image,
    yearsExperience,
    rating,
    specialties: toTags(specialties ?? ""),
    featured: checkbox(formData, "featured"),
    available: checkbox(formData, "available"),
  };

  try {
    if (id) {
      await prisma.stylist.update({ where: { id }, data });
    } else {
      await prisma.stylist.create({ data });
    }
  } catch {
    return { error: "Could not save stylist" };
  }
  revalidatePath("/admin/stylists");
  revalidatePath("/team");
  return { ok: true };
}

export async function deleteStylistAction(id: string): Promise<ActionResult> {
  await adminGuard();
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
  await adminGuard();
  const stylist = await prisma.stylist.findUnique({ where: { id }, select: { featured: true } });
  if (!stylist) return { error: "Stylist not found" };
  await prisma.stylist.update({ where: { id }, data: { featured: !stylist.featured } });
  revalidatePath("/admin/stylists");
  revalidatePath("/team");
  return { ok: true };
}

export async function toggleStylistAvailableAction(id: string): Promise<ActionResult> {
  await adminGuard();
  const stylist = await prisma.stylist.findUnique({ where: { id }, select: { available: true } });
  if (!stylist) return { error: "Stylist not found" };
  await prisma.stylist.update({ where: { id }, data: { available: !stylist.available } });
  revalidatePath("/admin/stylists");
  revalidatePath("/team");
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
  await adminGuard();
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
  await adminGuard();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}

export async function toggleBlogPublishedAction(id: string): Promise<ActionResult> {
  await adminGuard();
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
  await adminGuard();
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
  await adminGuard();
  await prisma.galleryImage.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function toggleGalleryFeaturedAction(id: string): Promise<ActionResult> {
  await adminGuard();
  const image = await prisma.galleryImage.findUnique({ where: { id }, select: { featured: true } });
  if (!image) return { error: "Image not found" };
  await prisma.galleryImage.update({ where: { id }, data: { featured: !image.featured } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
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
  await adminGuard();
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
  await adminGuard();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCouponActiveAction(id: string): Promise<ActionResult> {
  await adminGuard();
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
  await adminGuard();
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
  await adminGuard();
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
  await adminGuard();
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
  await adminGuard();
  if (!ROLE_OPTIONS.includes(role)) return { error: "Invalid role" };
  await prisma.user.update({ where: { id }, data: { role: role as never } });
  revalidatePath("/admin/users");
  return { ok: true };
}