import { Role } from "@/generated/prisma/enums";

export const PERMISSIONS = {
  DASHBOARD: "dashboard:view",
  BOOKINGS_VIEW: "bookings:view",
  BOOKINGS_MANAGE: "bookings:manage",
  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  SERVICES_VIEW: "services:view",
  SERVICES_MANAGE: "services:manage",
  STYLISTS_VIEW: "stylists:view",
  STYLISTS_MANAGE: "stylists:manage",
  BLOG_VIEW: "blog:view",
  BLOG_MANAGE: "blog:manage",
  GALLERY_VIEW: "gallery:view",
  GALLERY_MANAGE: "gallery:manage",
  REVIEWS_VIEW: "reviews:view",
  REVIEWS_MANAGE: "reviews:manage",
  COUPONS_VIEW: "coupons:view",
  COUPONS_MANAGE: "coupons:manage",
  GIFTCARDS_VIEW: "giftcards:view",
  GIFTCARDS_MANAGE: "giftcards:manage",
  MESSAGES_VIEW: "messages:view",
  MESSAGES_MANAGE: "messages:manage",
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",
  OPENINGS_MANAGE: "openings:manage",
  SETTINGS_MANAGE: "settings:manage",
  CUSTOMERS_VIEW: "customers:view",
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS: { title: string; permissions: Permission[] }[] = [
  { title: "Dashboard", permissions: [PERMISSIONS.DASHBOARD] },
  { title: "Bookings", permissions: [PERMISSIONS.BOOKINGS_VIEW, PERMISSIONS.BOOKINGS_MANAGE] },
  { title: "Orders", permissions: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_MANAGE] },
  { title: "Products", permissions: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_MANAGE] },
  { title: "Services", permissions: [PERMISSIONS.SERVICES_VIEW, PERMISSIONS.SERVICES_MANAGE] },
  { title: "Stylists", permissions: [PERMISSIONS.STYLISTS_VIEW, PERMISSIONS.STYLISTS_MANAGE] },
  { title: "Blog", permissions: [PERMISSIONS.BLOG_VIEW, PERMISSIONS.BLOG_MANAGE] },
  { title: "Gallery", permissions: [PERMISSIONS.GALLERY_VIEW, PERMISSIONS.GALLERY_MANAGE] },
  { title: "Reviews", permissions: [PERMISSIONS.REVIEWS_VIEW, PERMISSIONS.REVIEWS_MANAGE] },
  { title: "Coupons", permissions: [PERMISSIONS.COUPONS_VIEW, PERMISSIONS.COUPONS_MANAGE] },
  { title: "Gift cards", permissions: [PERMISSIONS.GIFTCARDS_VIEW, PERMISSIONS.GIFTCARDS_MANAGE] },
  { title: "Messages", permissions: [PERMISSIONS.MESSAGES_VIEW, PERMISSIONS.MESSAGES_MANAGE] },
  { title: "Customers", permissions: [PERMISSIONS.CUSTOMERS_VIEW] },
  { title: "Users", permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE] },
  { title: "Opening hours", permissions: [PERMISSIONS.OPENINGS_MANAGE] },
  { title: "Settings", permissions: [PERMISSIONS.SETTINGS_MANAGE] },
];

export const STAFF_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.MANAGER,
  Role.RECEPTIONIST,
  Role.STYLIST,
  Role.ACCOUNTANT,
  Role.INVENTORY_MANAGER,
  Role.MARKETING_MANAGER,
  Role.CUSTOMER_SUPPORT,
];

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  [Role.SUPER_ADMIN]: ALL_PERMISSIONS,
  [Role.MANAGER]: ALL_PERMISSIONS.filter((p) => !["users:manage", "settings:manage"].includes(p)),
  [Role.RECEPTIONIST]: ["dashboard:view", "bookings:view", "bookings:manage", "customers:view", "messages:view"],
  [Role.STYLIST]: ["dashboard:view", "bookings:view"],
  [Role.ACCOUNTANT]: ["dashboard:view", "bookings:view", "orders:view", "products:view"],
  [Role.INVENTORY_MANAGER]: ["dashboard:view", "products:view", "products:manage", "orders:view"],
  [Role.MARKETING_MANAGER]: ["dashboard:view", "blog:view", "blog:manage", "gallery:view", "gallery:manage", "coupons:view", "coupons:manage", "giftcards:view", "giftcards:manage", "messages:view"],
  [Role.CUSTOMER_SUPPORT]: ["dashboard:view", "bookings:view", "messages:view", "messages:manage", "reviews:view", "reviews:manage", "customers:view"],
  [Role.CUSTOMER]: [],
};
