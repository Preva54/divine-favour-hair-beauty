import type { Metadata } from "next";
import { Playfair_Display, Poppins, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { CartSheet } from "@/components/cart-sheet";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SALON } from "@/lib/constants";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${SALON.name} — More Than Beauty, It's Divine`,
    template: `%s · ${SALON.name}`,
  },
  description:
    "Premium hair, nail, skincare, makeup and beauty treatments at Divine Favour Hair & Beauty, 1066 Dariek Street. Book appointments, shop luxury products and join our rewards programme.",
  keywords: [
    "hair salon",
    "beauty salon",
    "hair extensions",
    "nails",
    "bridal makeup",
    "balayage",
    "South Africa",
    "Divine Favour",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: SALON.name,
    title: `${SALON.name} — More Than a Beauty, It's Divine`,
    description: "Premium hair, nail, skincare, makeup and beauty treatments. Book your appointment online.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SALON.name}`,
    description: "Premium salon treatments & luxury beauty products.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-ivory text-foreground antialiased">
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartSheet />
            </WishlistProvider>
          </CartProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}