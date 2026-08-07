import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  Role,
  Category,
  ProductCategory,
  GalleryCategory,
  BlogCategory,
  EntityType,
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  CouponType,
  LoyaltyType,
} from "../src/generated/prisma/enums";
import { hashSync } from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS } from "../src/lib/permissions";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const img = (n: string) => `/images/${n}`;

const serviceDefs = [
  // Hair
  { name: "Hair Washing", slug: "hair-washing", category: Category.HAIR, price: 120, duration: 30, image: "hair-1.jpg", popular: false, desc: "A luxurious deep-cleansing wash with premium sulphate-free products, scalp massage and warm towel finish." },
  { name: "Hair Cut", slug: "hair-cut", category: Category.HAIR, price: 250, duration: 45, image: "hair-1.jpg", popular: true, desc: "Precision cutting tailored to your face shape, hair texture and lifestyle by our certified stylists." },
  { name: "Blow Dry", slug: "blow-dry", category: Category.HAIR, price: 220, duration: 45, image: "hair-3.jpg", popular: false, desc: "Sleek, voluminous or bouncy blow-dry finishes with heat protection and shine serum." },
  { name: "Hair Colour", slug: "hair-colour", category: Category.HAIR, price: 650, duration: 120, image: "hair-4.jpg", popular: true, desc: "Full-head colour using ammonia-free formulas for rich, dimensional, damage-free results." },
  { name: "Balayage", slug: "balayage", category: Category.HAIR, price: 1200, duration: 180, image: "hair-4.jpg", popular: true, desc: "Hand-painted, sun-kissed highlights for a soft, natural, low-maintenance finish." },
  { name: "Highlights", slug: "highlights", category: Category.HAIR, price: 900, duration: 150, image: "hair-4.jpg", popular: false, desc: "Classic foils or modern slice highlights to add brightness, depth and movement." },
  { name: "Relaxer", slug: "relaxer", category: Category.HAIR, price: 550, duration: 90, image: "hair-2.jpg", popular: false, desc: "Smooth, silky straightening with a keratin-enriched relaxer system and deep conditioning." },
  { name: "Brazilian Treatment", slug: "brazilian-treatment", category: Category.HAIR, price: 800, duration: 120, image: "hair-2.jpg", popular: false, desc: "Frizz-eliminating keratin smoothing treatment that lasts up to 3 months." },
  { name: "Hair Extensions", slug: "hair-extensions", category: Category.HAIR, price: 2500, duration: 180, image: "hair-2.jpg", popular: false, desc: "Premium 100% human hair extensions applied with methods tailored to your hair." },
  { name: "Braiding", slug: "braiding", category: Category.HAIR, price: 400, duration: 120, image: "hair-2.jpg", popular: true, desc: "Beautiful, neat and long-lasting braids — knotless, box braids, Ghana twists and more." },
  { name: "Cornrows", slug: "cornrows", category: Category.HAIR, price: 350, duration: 90, image: "hair-2.jpg", popular: false, desc: "Sleek, symmetrical cornrow styles from classic lines to intricate geometric patterns." },
  { name: "Wig Installation", slug: "wig-installation", category: Category.HAIR, price: 500, duration: 90, image: "hair-2.jpg", popular: false, desc: "Flawless flat, secure wig installation with proper foundation, glue or no-glue options." },
  { name: "Wig Revamp", slug: "wig-revamp", category: Category.HAIR, price: 850, duration: 150, image: "hair-2.jpg", popular: false, desc: "Restore your wig to brand-new with re-plucking, customisation, re-styling and maintenance." },
  { name: "Hair Treatment", slug: "hair-treatment", category: Category.HAIR, price: 350, duration: 60, image: "hair-1.jpg", popular: false, desc: "Deep repair and hydration treatments to restore strength, shine and elasticity." },
  { name: "Silk Press", slug: "silk-press", category: Category.HAIR, price: 600, duration: 90, image: "hair-3.jpg", popular: true, desc: "The heat-free straightening alternative that delivers glass-like shine without chemicals." },
  { name: "Kids Hair", slug: "kids-hair", category: Category.HAIR, price: 200, duration: 60, image: "hair-1.jpg", popular: false, desc: "Gentle, patient and fun styling for little ones — washes, cuts, braids and school styles." },
  { name: "Men's Grooming", slug: "mens-grooming", category: Category.HAIR, price: 250, duration: 45, image: "hair-3.jpg", popular: false, desc: "Sharp fades, precision cuts, beard shaping and hot-towel finishes for modern men." },
  // Nails
  { name: "Gel Nails", slug: "gel-nails", category: Category.NAILS, price: 350, duration: 75, image: "nails-1.jpg", popular: true, desc: "Long-lasting, glossy gel manicure with a wide range of premium colours." },
  { name: "Acrylic Nails", slug: "acrylic-nails", category: Category.NAILS, price: 400, duration: 90, image: "nails-1.jpg", popular: true, desc: "Durable, sculpted acrylic extensions shaped and finished to perfection." },
  { name: "Pedicure", slug: "pedicure", category: Category.NAILS, price: 280, duration: 60, image: "nails-3.jpg", popular: false, desc: "Relaxing foot soak, exfoliation, cuticle care, polish and massage." },
  { name: "Manicure", slug: "manicure", category: Category.NAILS, price: 220, duration: 45, image: "nails-3.jpg", popular: false, desc: "Classic hand care with shaping, cuticle care, massage and polish." },
  { name: "Nail Art", slug: "nail-art", category: Category.NAILS, price: 150, duration: 30, image: "nails-2.jpg", popular: false, desc: "Custom hand-painted designs, chrome, gems, ombré and 3D art — add to any service." },
  { name: "French Tips", slug: "french-tips", category: Category.NAILS, price: 300, duration: 60, image: "nails-2.jpg", popular: false, desc: "Timeless, elegant French manicure — classic white or modern coloured tips." },
  { name: "Spa Pedicure", slug: "spa-pedicure", category: Category.NAILS, price: 450, duration: 90, image: "nails-3.jpg", popular: true, desc: "The ultimate foot ritual: soak, scrub, mask, massage and flawless polish." },
  // Beauty
  { name: "Professional Makeup", slug: "professional-makeup", category: Category.BEAUTY, price: 500, duration: 60, image: "beauty-4.jpg", popular: true, desc: "Flawless, camera-ready glam or soft natural looks using luxury products." },
  { name: "Bridal Makeup", slug: "bridal-makeup", category: Category.BEAUTY, price: 1800, duration: 150, image: "bridal-1.jpg", popular: true, desc: "Long-wearing bridal artistry with trials, lashes and touch-up kit included." },
  { name: "Eyelashes", slug: "eyelashes", category: Category.BEAUTY, price: 450, duration: 60, image: "beauty-4.jpg", popular: false, desc: "Individual lash extensions — natural, hybrid or dramatic volume, plus lifts and tints." },
  { name: "Eyebrow Tinting", slug: "eyebrow-tinting", category: Category.BEAUTY, price: 150, duration: 30, image: "beauty-4.jpg", popular: false, desc: "Define and enhance your brows with semi-permanent tinting and shaping." },
  { name: "Waxing", slug: "waxing", category: Category.BEAUTY, price: 200, duration: 45, image: "beauty-3.jpg", popular: false, desc: "Gentle, low-pain waxing for smooth, hair-free skin that lasts weeks." },
  { name: "Facials", slug: "facials", category: Category.BEAUTY, price: 450, duration: 60, image: "beauty-3.jpg", popular: true, desc: "Deep-cleansing, hydrating and brightening facials tailored to your skin." },
  { name: "Body Treatments", slug: "body-treatments", category: Category.BEAUTY, price: 600, duration: 60, image: "beauty-1.jpg", popular: false, desc: "Body scrubs, wraps and firming rituals that leave skin silky and glowing." },
  { name: "Massage", slug: "massage", category: Category.BEAUTY, price: 500, duration: 60, image: "beauty-2.jpg", popular: true, desc: "Relaxing and therapeutic massages to melt away stress and tension." },
  { name: "Skin Care", slug: "skin-care", category: Category.BEAUTY, price: 400, duration: 60, image: "beauty-2.jpg", popular: false, desc: "Personalised skin analysis and treatment plans with premium products." },
];

const stylistDefs = [
  { name: "Faith", title: "Senior Hair Stylist", years: 8, rating: 5.0, reviews: 198, image: "", featured: true, commission: 40, bio: "Faith is our braiding queen — neat, fast and gentle with every install. From classic cornrows to elaborate knotless styles, she keeps natural hair healthy and protected.", specialties: ["Braiding", "Cornrows", "Kids Hairstyles", "Twists", "Protective Styles"], services: ["braiding", "cornrows", "kids-hair", "hair-washing", "hair-treatment"] },
  { name: "Isaac", title: "Men's Grooming Specialist", years: 6, rating: 4.9, reviews: 176, image: "", featured: true, commission: 35, bio: "Sharp fades, crisp line-ups and beard work done with precision. Isaac is the barber our regulars refuse to skip — book ahead, he fills up fast.", specialties: ["Men's Haircuts", "Skin Fades", "Beard Grooming", "Hair Styling"], services: ["mens-grooming", "hair-cut", "hair-washing"] },
  { name: "Nathi", title: "Men's Grooming Specialist", years: 4, rating: 4.8, reviews: 122, image: "", featured: false, commission: 35, bio: "Clean cuts, precise fades and gentle beard trims with a relaxed, friendly vibe. Nathi makes every client feel like the salon's favourite regular.", specialties: ["Haircuts", "Fades", "Beard Trims", "Styling"], services: ["mens-grooming", "hair-cut", "hair-washing"] },
  { name: "Julia", title: "Hair Braiding Specialist", years: 7, rating: 5.0, reviews: 214, image: "", featured: true, commission: 35, bio: "Julia's braids are famous for their neatness, symmetry and longevity. Kids love her gentle hands — mums love that the style lasts weeks.", specialties: ["Braiding", "Cornrows", "Kids Hairstyles"], services: ["braiding", "cornrows", "kids-hair", "hair-washing"] },
  { name: "Felicia", title: "Professional Braider", years: 5, rating: 4.9, reviews: 143, image: "", featured: false, commission: 35, bio: "Felicia specialises in protective styles that turn heads — box braids, Ghana twists and sleek cornrows, all installed with care for your edges.", specialties: ["Braiding", "Cornrows", "Kids Hairstyles"], services: ["braiding", "cornrows", "kids-hair", "hair-washing"] },
  { name: "Fifi", title: "Nail Technician", years: 4, rating: 4.8, reviews: 167, image: "", featured: true, commission: 30, bio: "From flawless acrylics to detailed hand-painted art, Fifi's nails are a work of art every time. Her gel sets are famous for lasting weeks without a lift.", specialties: ["Acrylic Nails", "Gel Nails", "Nail Art"], services: ["gel-nails", "acrylic-nails", "nail-art", "manicure", "french-tips"] },
];

const scheduleDefs = [
  { day: 0, open: "09:00", close: "18:00" },
  { day: 1, open: "09:00", close: "18:00" },
  { day: 2, open: "09:00", close: "18:00" },
  { day: 3, open: "09:00", close: "19:00" },
  { day: 4, open: "09:00", close: "19:00" },
  { day: 5, open: "08:00", close: "17:00" },
];

const productDefs = [
  { name: "Argan Luxe Hair Oil", slug: "argan-luxe-hair-oil", category: ProductCategory.HAIR_OILS, price: 320, image: "product-1.jpg", stock: 42, rating: 4.9, reviews: 87, featured: true, desc: "100% pure Moroccan argan oil that tames frizz, adds shine and repairs split ends.", supplier: "Luxe Beauty Distributors", cost: 160 },
  { name: "Rose Gold Repairing Shampoo", slug: "rose-gold-repairing-shampoo", category: ProductCategory.SHAMPOO, price: 240, image: "product-5.jpg", stock: 35, rating: 4.8, reviews: 64, featured: true, desc: "Sulphate-free shampoo infused with rose gold minerals to strengthen and restore.", supplier: "Luxe Beauty Distributors", cost: 110 },
  { name: "Silk Protein Conditioner", slug: "silk-protein-conditioner", category: ProductCategory.CONDITIONERS, price: 260, image: "product-3.jpg", stock: 38, rating: 4.7, reviews: 52, desc: "Silky-smooth detangling conditioner with silk proteins and vitamin E.", supplier: "Luxe Beauty Distributors", cost: 120 },
  { name: "Divine Favour Hair Mask", slug: "divine-favour-hair-mask", category: ProductCategory.HAIR_PRODUCTS, price: 380, image: "product-2.jpg", stock: 25, rating: 4.9, reviews: 71, featured: true, desc: "Weekly deep-repair treatment that restores hydration, elasticity and gloss.", supplier: "House Brand", cost: 150 },
  { name: "Brazilian Keratin Treatment Kit", slug: "brazilian-keratin-treatment-kit", category: ProductCategory.HAIR_PRODUCTS, price: 550, image: "product-11.jpg", stock: 18, rating: 4.8, reviews: 44, desc: "Professional at-home smoothing kit for sleek, frizz-free hair up to 3 months.", supplier: "Luxe Beauty Distributors", cost: 260 },
  { name: "Heat Protectant Spray", slug: "heat-protectant-spray", category: ProductCategory.HAIR_PRODUCTS, price: 230, image: "product-1.jpg", stock: 60, rating: 4.7, reviews: 39, desc: "Weightless thermal shield for heat styling up to 230°C, with a silk finish.", supplier: "Luxe Beauty Distributors", cost: 95 },
  { name: "100% Human Hair Weave 16\"", slug: "human-hair-weave-16", category: ProductCategory.HAIR_EXTENSIONS, price: 1800, compareAtPrice: 2200, image: "product-8.jpg", stock: 12, rating: 4.9, reviews: 33, featured: true, desc: "Virgin remy human hair, ethically sourced, tangle-free and colour-treatable.", supplier: "Africa Hair World", cost: 950 },
  { name: "X-Pression Braiding Hair", slug: "x-pression-braiding-hair", category: ProductCategory.HAIR_EXTENSIONS, price: 85, image: "product-7.jpg", stock: 120, rating: 4.8, reviews: 96, featured: true, desc: "Classic X-Pression kanekalon braiding hair — soft, tangle-free and available in every shade for box braids, twists and crochet styles.", supplier: "Africa Hair World", cost: 40 },
  { name: "Braiding Hair Pack", slug: "braiding-hair-pack", category: ProductCategory.HAIR_EXTENSIONS, price: 95, image: "product-8.jpg", stock: 90, rating: 4.7, reviews: 61, desc: "Premium pre-stretched braiding hair with a natural matte finish — knotless-ready and gentle on edges.", supplier: "Africa Hair World", cost: 45 },
  { name: "Hair Pieces & Clip-Ins", slug: "hair-pieces-clip-ins", category: ProductCategory.HAIR_EXTENSIONS, price: 450, image: "hair-2.jpg", stock: 22, rating: 4.6, reviews: 34, desc: "Instant length and volume — double-wefted clip-in hair pieces that blend seamlessly with natural hair.", supplier: "Africa Hair World", cost: 210 },
  { name: "Lace Front Wig", slug: "lace-front-wig", category: ProductCategory.WIGS, price: 3500, compareAtPrice: 4200, image: "hair-2.jpg", stock: 8, rating: 5.0, reviews: 26, featured: true, desc: "Pre-plucked 13x4 HD lace front wig with baby hairs, natural hairline and 180% density.", supplier: "Africa Hair World", cost: 1900 },
  { name: "Styling Hair Gel", slug: "styling-hair-gel", category: ProductCategory.HAIR_PRODUCTS, price: 120, image: "product-9.jpg", stock: 75, rating: 4.7, reviews: 48, desc: "Strong-hold, alcohol-free styling gel for sleek buns, edges and defined styles — no flakes, no white residue.", supplier: "Luxe Beauty Distributors", cost: 45 },
  { name: "Edge Control Gel", slug: "edge-control-gel", category: ProductCategory.HAIR_PRODUCTS, price: 110, image: "product-1.jpg", stock: 68, rating: 4.8, reviews: 73, desc: "Creamy edge control that lays baby hairs flat all day with a soft, shiny finish that won't crack.", supplier: "Luxe Beauty Distributors", cost: 40 },
  { name: "Velvet Matte Foundation", slug: "velvet-matte-foundation", category: ProductCategory.MAKEUP, price: 420, image: "product-6.jpg", stock: 30, rating: 4.6, reviews: 58, desc: "Full-coverage, long-wear foundation in 24 inclusive shades with a soft-matte finish.", supplier: "Anita Cosmetics", cost: 180 },
  { name: "Rose Gold Eyeshadow Palette", slug: "rose-gold-eyeshadow-palette", category: ProductCategory.MAKEUP, price: 650, image: "product-9.jpg", stock: 20, rating: 4.8, reviews: 47, featured: true, desc: "18 buttery neutral and rose-gold shades, highly pigmented and blendable.", supplier: "Anita Cosmetics", cost: 290 },
  { name: "Longwear Liquid Lipstick", slug: "longwear-liquid-lipstick", category: ProductCategory.MAKEUP, price: 280, image: "product-10.jpg", stock: 45, rating: 4.7, reviews: 39, desc: "Transfer-proof, kiss-proof liquid lipstick that lasts up to 12 hours.", supplier: "Anita Cosmetics", cost: 110 },
  { name: "Vitamin C Brightening Serum", slug: "vitamin-c-brightening-serum", category: ProductCategory.SKINCARE, price: 460, image: "product-4.jpg", stock: 28, rating: 4.9, reviews: 93, featured: true, desc: "15% stabilised vitamin C serum for radiant, even-toned, glowing skin.", supplier: "Anita Cosmetics", cost: 190 },
  { name: "Rose Water Facial Mist", slug: "rose-water-facial-mist", category: ProductCategory.SKINCARE, price: 190, image: "product-2.jpg", stock: 50, rating: 4.6, reviews: 41, desc: "Hydrating, refreshing rose mist for a dewy glow — perfect over makeup.", supplier: "Anita Cosmetics", cost: 70 },
  { name: "Hyaluronic Moisturiser", slug: "hyaluronic-moisturiser", category: ProductCategory.SKINCARE, price: 390, image: "product-5.jpg", stock: 32, rating: 4.8, reviews: 66, desc: "Intense 24-hour hydration with hyaluronic acid, ceramides and squalane.", supplier: "Anita Cosmetics", cost: 160 },
  { name: "Nail Care Gift Set", slug: "nail-care-gift-set", category: ProductCategory.ACCESSORIES, price: 480, image: "nails-2.jpg", stock: 15, rating: 4.7, reviews: 28, desc: "The perfect at-home manicure kit: files, cuticle oil, base and top coat.", supplier: "Nail Pro Supplies", cost: 220 },
  { name: "Silk Scrunchie Trio", slug: "silk-scrunchie-trio", category: ProductCategory.ACCESSORIES, price: 150, image: "product-9.jpg", stock: 70, rating: 4.8, reviews: 57, desc: "Gentle on hair, no creases — pure silk scrunchies in rose, blush and ivory.", supplier: "Luxe Beauty Distributors", cost: 55 },
  { name: "Detangling Wide-Tooth Comb", slug: "detangling-wide-tooth-comb", category: ProductCategory.ACCESSORIES, price: 120, image: "hair-3.jpg", stock: 80, rating: 4.5, reviews: 22, desc: "Smooth, snag-free wide-tooth comb ideal for wet and natural hair.", supplier: "Nail Pro Supplies", cost: 35 },
];

const galleryDefs = [
  { url: "gallery-1.jpg", title: "Soft Glam Editorial Look", category: GalleryCategory.MAKEUP },
  { url: "gallery-2.jpg", title: "Signature Blowout", category: GalleryCategory.HAIR },
  { url: "gallery-3.jpg", title: "Luxury Product Ritual", category: GalleryCategory.SALON },
  { url: "gallery-4.jpg", title: "Bridal Elegance", category: GalleryCategory.BRIDAL },
  { url: "gallery-5.jpg", title: "Chrome Nail Art", category: GalleryCategory.NAILS },
  { url: "gallery-6.jpg", title: "Bridal Glamour", category: GalleryCategory.BRIDAL },
  { url: "gallery-7.jpg", title: "Colour Correction", category: GalleryCategory.HAIR },
  { url: "gallery-8.jpg", title: "From Flat to Fabulous", category: GalleryCategory.TRANSFORMATIONS },
  { url: "gallery-9.jpg", title: "Rose Gold Palette", category: GalleryCategory.MAKEUP },
  { url: "gallery-10.jpg", title: "Spa Serenity", category: GalleryCategory.SALON },
  { url: "gallery-11.jpg", title: "The Big Day Reveal", category: GalleryCategory.TRANSFORMATIONS },
  { url: "gallery-12.jpg", title: "Precision Fade", category: GalleryCategory.HAIR },
];

const blogDefs = [
  { title: "5 Winter Hair Care Secrets Every South African Should Know", slug: "winter-hair-care-secrets", category: BlogCategory.HAIR_TIPS, image: "blog-1.jpg", author: "Faith", tags: ["Hair Care", "Winter", "Tips"], excerpt: "Cold weather doesn't have to mean dry, brittle hair. Here's how our stylists keep hair lush through winter.", content: "## Winter hair care\n\nCold, dry air strips moisture from your hair faster than any other season. The result? Frizz, static and breakage.\n\n**1. Hydrate more, wash less.** Reduce shampooing to once or twice a week and let a hydrating mask do the heavy lifting.\n\n**2. Seal your ends.** A few drops of argan oil on damp hair locks in moisture and prevents split ends.\n\n**3. Invest in a silk pillowcase.** Cotton absorbs your hair's natural oils overnight. Silk keeps them where they belong.\n\n**4. Say no to hot tools on low days.** Your blow-dryer is a friend, but 230°C daily is not. Always use heat protection.\n\n**5. Book a monthly deep treatment.** Our Divine Favour Hair Mask plus a salon treatment keeps winter hair unbothered.\n\nWinter is the season your hair needs the most love. Come in for a complimentary hair analysis and we'll build your winter routine together." },
  { title: "Balayage vs Highlights: The Complete Guide", slug: "balayage-vs-highlights", category: BlogCategory.TRENDING_HAIRSTYLES, image: "blog-2.jpg", author: "Fifi", tags: ["Colour", "Balayage", "Highlights"], excerpt: "Sun-kissed balayage or classic foils? Our stylists break down the difference so you can choose with confidence.", content: "## Balayage vs highlights\n\nOne of the questions we hear most: should I get balayage or highlights? Here's how to decide.\n\n**Balayage** is hand-painted, starting darker at the root and melting into lighter ends. It grows out beautifully, requires fewer touch-ups, and creates a soft, natural sun-kissed effect. Perfect if you want a low-maintenance, lived-in colour.\n\n**Highlights** are woven or foiled sections that run root-to-end. They give more all-over brightness and dimension, with a slightly more polished, uniform finish. If you want visible brightness from the root, this is your pick.\n\n**The hybrid option.** Many of our clients love a blend — fine face-framing foils with a soft balayage melt. It's the best of both worlds.\n\n**Book a colour consultation.** Colour is personal. Book a 10-minute consultation and we'll design your perfect shade — no commitment required." },
  { title: "The Complete Bridal Hair & Makeup Checklist", slug: "bridal-hair-makeup-checklist", category: BlogCategory.WEDDING_LOOKS, image: "blog-3.jpg", author: "Fifi", tags: ["Bridal", "Wedding", "Checklist"], excerpt: "From your trial run to the first dance — everything you need to plan flawless bridal beauty.", content: "## Your bridal beauty timeline\n\nYour wedding morning should feel calm, not chaotic. This is exactly how to plan your beauty.\n\n**3–6 months before:** Book your trial with your hair and makeup artist. Bring inspiration photos and your veil or headpiece.\n\n**1 month before:** Finalise your bridal makeup trial and hair style. Book a hydration facial and a hair deep-treatment.\n\n**2 weeks before:** Final colour, balayage touch-up or braids installed. Book your pre-wedding spa pedicure.\n\n**The week before:** No new skincare products! Stick to your routine. Drink water, rest and de-stress.\n\n**Wedding day:** Arrive with clean, dry hair and a bare face. We'll take care of the rest — including your touch-up kit and a protective style refresh for your honeymoon.\n\nOur bridal package includes the trial, on-the-day styling, lashes and a personal touch-up kit. Because your day should be divine." },
  { title: "Best Hair Oils for Natural Hair — Ranked", slug: "best-hair-oils-natural-hair", category: BlogCategory.PRODUCT_REVIEWS, image: "blog-4.jpg", author: "Julia", tags: ["Natural Hair", "Hair Oils", "Reviews"], excerpt: "Argan, jojoba, castor or rosemary? We tested the oils our clients love and ranked them for natural hair.", content: "## Oils we actually recommend\n\nNot all oils are created equal — and what works for your sister's hair may not work for yours.\n\n**1. Argan oil — the all-rounder.** Packed with vitamin E and fatty acids, it softens, seals moisture and adds shine without heaviness. Our Argan Luxe Hair Oil is a client favourite.\n\n**2. Jojoba oil — for low porosity hair.** Its molecular structure mimics your scalp's natural sebum, making it excellent for lightweight sealing.\n\n**3. Castor oil — for growth.** Thick and rich, perfect for scalp massages, edges and brows. Use sparingly.\n\n**4. Rosemary oil — the scalp booster.** Studies show it can support hair growth as effectively as minoxidil with daily massage.\n\n**How to layer.** Rule of thumb: water or leave-in first, then oil to seal. Oils do not moisturise — they lock moisture in.\n\n**The Divine Favour ritual:** leave-in conditioner, then 3 drops of argan oil, massaged from mid-length to ends." },
  { title: "Skincare 101: Build a Routine That Actually Works", slug: "skincare-routine-101", category: BlogCategory.SKIN_CARE, image: "blog-5.jpg", author: "Fifi", tags: ["Skincare", "Routine", "Tips"], excerpt: "Cleanser, serum, moisturiser, SPF — the simple science-backed framework for glowing skin at any age.", content: "## The four-step foundation\n\nBeautiful skin doesn't need a 10-step shelf. It needs consistency.\n\n**1. Cleanse.** Morning and night. A gentle cleanser that doesn't strip your barrier is non-negotiable.\n\n**2. Treat.** This is where serums do the heavy lifting: Vitamin C in the morning for brightness and protection, and a gentle retinoid or hydrating serum at night.\n\n**3. Moisturise.** Hydration locks everything in. Choose a formula for your skin type — gel for oily, cream for dry.\n\n**4. Protect.** SPF 30+ every single day. It is the single best anti-ageing product you will ever buy.\n\n**Add an exfoliant.** 1–2 times a week, a chemical exfoliant (AHAs/BHAs) keeps skin smooth and clear.\n\n**What we offer.** Book a skin analysis and receive a personalised routine with products matched to your skin — then watch the glow happen." },
  { title: "Protective Styles: Braids, Cornrows & Wigs Explained", slug: "protective-styles-guide", category: BlogCategory.BEAUTY_ADVICE, image: "blog-6.jpg", author: "Felicia", tags: ["Protective Styles", "Braids", "Wigs"], excerpt: "The ultimate guide to keeping your natural hair healthy while you slay: braids, cornrows and wigs done right.", content: "## Protective styling 101\n\nProtective styles protect your ends, retain length and give you the freedom to switch up your look. Done wrong, they can also cause breakage. Here's how to do it right.\n\n**Braids & cornrows.** Your hair should be freshly washed, deep-conditioned and detangled before installation. Keep braids in for 4–6 weeks max, and moisturise your scalp every few days.\n\n**Wigs.** The ultimate rotate-your-style option. Your natural hair underneath should always be braided down or in a flat style — and never tight enough to pull.\n\n**Golden rules.**\n- Never install styles too tight — tension = traction alopecia.\n- Oil your scalp, not your lengths.\n- Give your hair a rest between styles.\n- Always follow up with a deep treatment.\n\n**Come see us.** Whether it's knotless braids by Faith or sleek cornrows by Julia, we'll protect your hair while you look divine." },
];

const reviewDefs = [
  { authorName: "Nompumelelo Zulu", rating: 5, text: "Absolutely divine experience! Faith braided my hair and I haven't stopped getting compliments. The salon is stunning and the service is world-class.", featured: true },
  { authorName: "Caitlin van der Merwe", rating: 5, text: "My nails were flawless and stayed perfect for weeks. Fifi is a true artist. I felt like royalty!", featured: true },
  { authorName: "Karabo Dube", rating: 5, text: "Best braids in the city, period. Julia's cornrows are art. Booking online was so easy.", featured: true },
  { authorName: "Fatima Khan", rating: 4, text: "Lovely atmosphere and very professional team. Isaac's fade was on point. Booking online was so easy.", featured: false },
  { authorName: "Mbali Ntuli", rating: 5, text: "The kids' braiding service is a lifesaver. My daughter actually looks forward to salon days now!", featured: true },
  { authorName: "Jessica Adams", rating: 5, text: "From the welcome tea to the final reveal, everything is luxury. Felicia's knotless braids are unreal.", featured: false },
  { authorName: "Lerato Mashego", rating: 5, text: "Faith's twists look so natural my own mother couldn't tell. 10/10!", featured: true },
  { authorName: "Sipho Khumalo", rating: 5, text: "Finally a barber that gets it right every time. Sharp fade from Nathi, beard on point. Booking ahead is a must.", featured: false },
];

const couponDefs = [
  { code: "WELCOME15", type: CouponType.PERCENT, value: 15, minSpend: 200 },
  { code: "DIVINE10", type: CouponType.PERCENT, value: 10, minSpend: 150 },
  { code: "BEAUTY50", type: CouponType.FIXED, value: 50, minSpend: 300 },
];

const hoursDefs = [
  { day: 0, dayName: "Monday", open: "09:00", close: "18:00", closed: false },
  { day: 1, dayName: "Tuesday", open: "09:00", close: "18:00", closed: false },
  { day: 2, dayName: "Wednesday", open: "09:00", close: "18:00", closed: false },
  { day: 3, dayName: "Thursday", open: "09:00", close: "19:00", closed: false },
  { day: 4, dayName: "Friday", open: "09:00", close: "19:00", closed: false },
  { day: 5, dayName: "Saturday", open: "08:00", close: "17:00", closed: false },
  { day: 6, dayName: "Sunday", open: "00:00", close: "00:00", closed: true },
];

async function main() {
  console.log("Seeding Divine Favour Hair & Beauty...");
  await prisma.openingHour.deleteMany();

  await prisma.rolePermission.deleteMany();

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.stylist.deleteMany();
  await prisma.user.deleteMany();

  await prisma.openingHour.createMany({ data: hoursDefs });

  for (const c of couponDefs) await prisma.coupon.create({ data: c });

  const services: Record<string, string> = {};
  for (const s of serviceDefs) {
    const created = await prisma.service.create({
      data: {
        name: s.name,
        slug: s.slug,
        category: s.category,
        price: s.price,
        durationMinutes: s.duration,
        image: img(s.image),
        description: s.desc,
        popular: s.popular,
      },
    });
    services[s.slug] = created.id;
  }

  const stylistIds: string[] = [];
  for (const st of stylistDefs) {
    const created = await prisma.stylist.create({
      data: {
        name: st.name,
        title: st.title,
        bio: st.bio,
        image: st.image,
        yearsExperience: st.years,
        rating: st.rating,
        reviewCount: st.reviews,
        specialties: st.specialties,
        featured: st.featured,
        commissionRate: st.commission,
        services: { connect: st.services.map((slug) => ({ id: services[slug] })) },
        schedule: {
          create: scheduleDefs.map((s) => ({ day: s.day, open: s.open, close: s.close })),
        },
      },
    });
    stylistIds.push(created.id);
  }

  for (const p of productDefs) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        image: img(p.image),
        category: p.category,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        costPrice: p.cost,
        supplier: p.supplier,
        minStock: 10,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviews,
        featured: p.featured,
      },
    });
  }

  for (const g of galleryDefs) {
    await prisma.galleryImage.create({ data: { ...g, url: img(g.url), featured: g.category === GalleryCategory.TRANSFORMATIONS } });
  }

  for (const b of blogDefs) {
    await prisma.blogPost.create({ data: b });
  }

  await prisma.user.create({
    data: {
      name: "Divine Favour Admin",
      email: "admin@divinefavour.co.za",
      passwordHash: hashSync("admin1234", 10),
      phone: "+27 82 555 0100",
      role: Role.SUPER_ADMIN,
      referralCode: "DF-ADMIN",
    },
  });

  const demo = await prisma.user.create({
    data: {
      name: "Amahle Nkosi",
      email: "demo@divinefavour.co.za",
      passwordHash: hashSync("demo1234", 10),
      phone: "+27 71 555 0142",
      role: Role.CUSTOMER,
      points: 350,
      referralCode: "DF-AMAHLE",
      referredBy: "DF-ADMIN",
      notifications: {
        create: [
          { type: "LOYALTY", title: "Welcome to Divine Favour", message: "You earned 250 welcome points. They're already in your account!" },
          { type: "APPOINTMENT", title: "Booking confirmed", message: "Your braiding appointment with Faith is confirmed for your chosen date." },
        ],
      },
      loyaltyTransactions: {
        create: [
          { points: 250, type: LoyaltyType.BONUS, description: "Welcome bonus" },
          { points: 100, type: LoyaltyType.EARN, description: "Completed appointment · Balayage" },
        ],
      },
    },
    include: { loyaltyTransactions: true },
  });

  await prisma.user.create({
    data: {
      name: "Reception Team",
      email: "staff@divinefavour.co.za",
      passwordHash: hashSync("staff1234", 10),
      role: Role.RECEPTIONIST,
      referralCode: "DF-STAFF",
    },
  });

  const styles = await prisma.stylist.findMany();
  const svcs = await prisma.service.findMany();
  const products = await prisma.product.findMany();
  const bySlug = (slug: string) => services[slug];

  const addDays = (d: number, h = 10) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    dt.setHours(h, 0, 0, 0);
    return dt;
  };
  const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3600000);

  const appt = async (ref: string, days: number, svc: string, st: AppointmentStatus, opts: Partial<{ user: string; pay: PaymentMethod; payStatus: PaymentStatus; notes: string; guestName: string; guestEmail: string; cancelReason: string }> = {}) => {
    const service = svcs.find((s) => s.id === bySlug(svc));
    if (!service) throw new Error(`MISSING SERVICE ${svc} (map=${services[svc]})`);
    const start = addDays(days);
    const idx = ((days % styles.length) + styles.length) % styles.length;
    const stylist = styles[idx];
    if (!stylist) throw new Error(`MISSING STYLIST idx=${idx}`);
    await prisma.appointment.create({
      data: {
        ref,
        serviceId: service.id,
        stylistId: styles[idx].id,
        start,
        end: addHours(start, service.durationMinutes / 60),
        status: st,
        amount: service.price,
        paymentMethod: opts.pay,
        paymentStatus: opts.payStatus ?? (st === AppointmentStatus.COMPLETED ? PaymentStatus.PAID : PaymentStatus.UNPAID),
        depositAmount: opts.pay === PaymentMethod.STRIPE ? Math.round(service.price * 0.2) : null,
        notes: opts.notes,
        userId: opts.user === "demo" ? demo.id : undefined,
        guestName: opts.user === "demo" ? undefined : opts.guestName,
        guestEmail: opts.user === "demo" ? undefined : opts.guestEmail,
        cancelReason: opts.cancelReason,
      },
    });
  };

  await appt("DF-1001", -21, "blow-dry", AppointmentStatus.COMPLETED, { user: "demo", pay: PaymentMethod.PAY_AT_SALON, payStatus: PaymentStatus.PAID });
  await appt("DF-1002", -14, "gel-nails", AppointmentStatus.COMPLETED, { user: "demo", pay: PaymentMethod.CARD, payStatus: PaymentStatus.PAID });
  await appt("DF-1003", -7, "balayage", AppointmentStatus.COMPLETED, { user: "demo", pay: PaymentMethod.STRIPE, payStatus: PaymentStatus.PAID, notes: "Please recommend maintenance products after." });
  await appt("DF-1004", -3, "facials", AppointmentStatus.CANCELLED, { guestName: "Thabo Molefe", guestEmail: "thabo@example.com", cancelReason: "Client requested reschedule to next month" });
  await appt("DF-1005", 2, "braiding", AppointmentStatus.CONFIRMED, { user: "demo", pay: PaymentMethod.STRIPE, payStatus: PaymentStatus.DEPOSIT_PAID, notes: "Knotless braids, medium size." });
  await appt("DF-1006", 5, "massage", AppointmentStatus.PENDING, { guestName: "Naledi Motaung", guestEmail: "naledi@example.com" });
  await appt("DF-1007", 9, "silk-press", AppointmentStatus.CONFIRMED, { user: "demo", pay: PaymentMethod.PAY_AT_SALON });
  await appt("DF-1008", 14, "mens-grooming", AppointmentStatus.PENDING, { guestName: "James Naidoo", guestEmail: "james@example.com" });

  const prodBySlug = (slug: string) => products.find((p) => p.slug === slug)!;
  const daysAgo = (d: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    return dt;
  };

  await prisma.order.create({
    data: {
      ref: "ORD-2001",
      userId: demo.id,
      status: OrderStatus.DELIVERED,
      subtotal: 800,
      discount: 120,
      total: 680,
      couponCode: "WELCOME15",
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.PAID,
      fullName: "Amahle Nkosi",
      email: "demo@divinefavour.co.za",
      phone: "+27 71 555 0142",
      address: "12 Rose Lane, Sandton",
      city: "Johannesburg",
      postalCode: "2196",
      trackingNumber: "DFHB-SA-88412",
      createdAt: daysAgo(26),
      items: {
        create: [
          { productId: prodBySlug("argan-luxe-hair-oil").id, quantity: 1, price: 320 },
          { productId: prodBySlug("rose-gold-repairing-shampoo").id, quantity: 2, price: 240 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      ref: "ORD-2002",
      userId: demo.id,
      status: OrderStatus.SHIPPED,
      subtotal: 930,
      discount: 0,
      total: 930,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.PAID,
      fullName: "Amahle Nkosi",
      email: "demo@divinefavour.co.za",
      phone: "+27 71 555 0142",
      address: "12 Rose Lane, Sandton",
      city: "Johannesburg",
      postalCode: "2196",
      trackingNumber: "DFHB-SA-88901",
      createdAt: daysAgo(9),
      items: {
        create: [
          { productId: prodBySlug("rose-gold-eyeshadow-palette").id, quantity: 1, price: 650 },
          { productId: prodBySlug("longwear-liquid-lipstick").id, quantity: 1, price: 280 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      ref: "ORD-2003",
      userId: demo.id,
      status: OrderStatus.PAID,
      subtotal: 650,
      discount: 0,
      total: 650,
      paymentMethod: PaymentMethod.STRIPE,
      paymentStatus: PaymentStatus.PAID,
      fullName: "Amahle Nkosi",
      email: "demo@divinefavour.co.za",
      phone: "+27 71 555 0142",
      address: "12 Rose Lane, Sandton",
      city: "Johannesburg",
      postalCode: "2196",
      createdAt: daysAgo(2),
      items: {
        create: [
          { productId: prodBySlug("vitamin-c-brightening-serum").id, quantity: 1, price: 460 },
          { productId: prodBySlug("rose-water-facial-mist").id, quantity: 1, price: 190 },
        ],
      },
    },
  });

  await prisma.giftCard.create({
    data: {
      code: "DFG-8412-AMAHLE",
      amount: 500,
      balance: 500,
      recipientEmail: "amahle@example.com",
      recipientName: "Amahle",
      senderName: "Amahle Nkosi",
      message: "Treat yourself — you deserve it. With love, Divine Favour.",
      purchasedById: demo.id,
    },
  });

  for (const r of reviewDefs) {
    await prisma.review.create({ data: { ...r, entity: EntityType.SALON, authorName: r.authorName } });
  }

  const rolePermissions = DEFAULT_ROLE_PERMISSIONS;

  await prisma.rolePermission.createMany({
    data: (Object.entries(rolePermissions) as [Role, readonly string[]][]).flatMap(([role, perms]) =>
      perms.map((permission) => ({ role, permission }))
    ),
  });

  console.log("Seed complete!");
  console.log("  Admin:  admin@divinefavour.co.za / admin1234");
  console.log("  Demo:   demo@divinefavour.co.za / demo1234");
  console.log("  Staff:  staff@divinefavour.co.za / staff1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

