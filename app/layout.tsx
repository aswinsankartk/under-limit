import type { Metadata } from "next";
import { Onest, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const onest = Onest({
  variable: "--font-onest",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://under-limit.vercel.app"),

  title: {
    default: "Under Limit — Free Online Image Resizer & Compressor",
    template: "%s | Under Limit",
  },
  description:
    "Resize and compress images to meet exact file size and dimension requirements. Free, private, and easy to use. Your images never leave your device.",

  applicationName: "Under Limit",

  verification: {
    google: "8nizk4PobkHiKBE9GgCFJ5d59-ROmBkVepPiuQY0hzc",
  },

  keywords: [
    "image resizer",
    "image compressor",
    "resize image online",
    "compress image online",
    "image size reducer",
    "resize image to KB",
    "photo resizer",
    "image resizer for forms",
  ],

  authors: [{ name: "Aswin Sankar TK" }],
  creator: "Aswin Sankar TK",
  category: "technology",

  alternates: {
    canonical: "https://under-limit.vercel.app",
  },

  openGraph: {
    type: "website",
    url: "https://under-limit.vercel.app",
    siteName: "Under Limit",
    title: "Under Limit — Free Online Image Resizer & Compressor",
    description:
      "Resize and compress images to meet exact file size and dimension requirements. Free, private, and easy to use.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Under Limit — Fits the form on the first try.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Under Limit — Free Online Image Resizer & Compressor",
    description:
      "Resize and compress images to meet exact file size and dimension requirements.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${onest.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
