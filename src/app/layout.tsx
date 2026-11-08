import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono, Inter } from "next/font/google";
import { DEVELOPER_PROFILE } from "@/lib/constants";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://neerajm.pages.dev"),
  title: "Neeraj M",
  description:
    `Personal developer portfolio of Neeraj M (${DEVELOPER_PROFILE.age}yo Solo Builder & Systems Engineer). Creator of KTCC Platform, Next.js 15, Android Hybrid Engines, and $0 Cloud Infrastructure.`,
  keywords: [
    "Neeraj M",
    "Solo Builder",
    "Systems Engineer",
    "Full-Stack Developer",
    "Next.js 15",
    "Supabase",
    "Capacitor Android",
    "Cloudflare R2",
    "TokyoNight",
    "Portfolio",
    "Kerala Developer",
  ],
  authors: [{ name: "Neeraj M", url: "https://neerajm.pages.dev" }],
  creator: "Neeraj M",
  openGraph: {
    title: "Neeraj M",
    description:
      "Architecting Production Platforms from Scratch. Full-Stack Android & Cloud Platforms with $0 Infrastructure.",
    url: "https://neerajm.pages.dev",
    siteName: "Neeraj M Portfolio",
    images: [
      {
        url: "/avatar-neeraj.png",
        width: 800,
        height: 800,
        alt: "Neeraj M - ASCII Matrix Avatar",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neeraj M",
    description:
      "Building Production Platforms from Scratch. $0 Cloud Infrastructure Specialist.",
    creator: "@neeraajm",
    images: ["/avatar-neeraj.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} ${inter.variable} antialiased bg-[#05070a] text-white font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
