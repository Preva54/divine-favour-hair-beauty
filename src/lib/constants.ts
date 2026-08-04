export const SALON = {
  name: "Divine Favour Hair & Beauty",
  tagline: "More Than Beauty, It's Divine.",
  altTagline: "Where Beauty Meets Confidence.",
  address: "1066 Dariek Street, South Africa",
  addressShort: "1066 Dariek Street",
  city: "South Africa",
  phone: "+27 82 555 0100",
  whatsapp: "27825550100",
  email: "hello@divinefavour.co.za",
  bookingsEmail: "bookings@divinefavour.co.za",
  instagram: "https://instagram.com/divinefavour.hairbeauty",
  tiktok: "https://tiktok.com/@divinefavour.hairbeauty",
  facebook: "https://facebook.com/divinefavour.hairbeauty",
  mapEmbed: "https://www.google.com/maps?q=1066+Dariek+Street+South+Africa&output=embed",
  mapLink: "https://www.google.com/maps/search/?api=1&query=1066+Dariek+Street+South+Africa",
  depositPercent: 0.2,
  pointsPerRand: 1,
  welcomePoints: 250,
  referralPoints: 100,
} as const;

export const CATEGORY_LABELS = {
  HAIR: "Hair",
  NAILS: "Nails",
  BEAUTY: "Beauty",
} as const;

export const PRODUCT_CATEGORY_LABELS = {
  HAIR_PRODUCTS: "Hair Products",
  HAIR_OILS: "Hair Oils",
  SHAMPOO: "Shampoo",
  CONDITIONERS: "Conditioners",
  HAIR_EXTENSIONS: "Hair Extensions",
  WIGS: "Wigs",
  MAKEUP: "Makeup",
  SKINCARE: "Skincare",
  ACCESSORIES: "Accessories",
} as const;

export const GALLERY_CATEGORY_LABELS = {
  HAIR: "Hair",
  NAILS: "Nails",
  MAKEUP: "Makeup",
  SALON: "Salon",
  BRIDAL: "Bridal",
  TRANSFORMATIONS: "Transformations",
} as const;

export const BLOG_CATEGORY_LABELS = {
  HAIR_TIPS: "Hair Tips",
  BEAUTY_ADVICE: "Beauty Advice",
  TRENDING_HAIRSTYLES: "Trending Hairstyles",
  WEDDING_LOOKS: "Wedding Looks",
  PRODUCT_REVIEWS: "Product Reviews",
  SKIN_CARE: "Skin Care",
} as const;

export const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
} as const;

export const ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  PAID: "Paid",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export const PAYMENT_METHOD_LABELS = {
  PAY_AT_SALON: "Pay at Salon",
  CARD: "Card",
  PAYFAST: "PayFast",
  STRIPE: "Stripe",
  OZOW: "Ozow",
  YOCO: "Yoco",
} as const;