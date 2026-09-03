import React from 'react';
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { FloatingButtons } from "@/components/floating/FloatingButtons";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

import { SettingsProvider } from "@/components/providers/SettingsProvider";

import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";

export const metadata: Metadata = {
  metadataBase: new URL('https://hatgiongnhavuon.vn'),
  title: {
    default: "HẠT GIỐNG NHÀ VƯỜN - Ươm Mầm Hôm Nay, Rực Rỡ Ngày Mai",
    template: "%s | Hạt Giống Nhà Vườn",
  },
  description: "Chuyên cung cấp sỉ & lẻ các loại Hạt Giống Hoa F1 thuần chủng, Hạt Giống Rau Sạch năng suất cao, Cây Ăn Trái và Vật Tư Nông Nghiệp Hữu Cơ. Tỷ lệ nảy mầm >85%, giao hàng toàn quốc nhanh chóng.",
  keywords: [
    "hạt giống hoa",
    "hạt giống nhà vườn",
    "hạt giống rau sạch",
    "hạt giống cây cảnh",
    "hạt giống hướng dương lùn",
    "hạt giống dạ yến thảo",
    "mua hạt giống hoa online",
    "nông nghiệp hữu cơ",
    "đất sạch tribat",
    "dụng cụ làm vườn"
  ],
  authors: [{ name: "Hạt Giống Nhà Vườn", url: "https://hatgiongnhavuon.vn" }],
  creator: "Hạt Giống Nhà Vườn",
  publisher: "Hạt Giống Nhà Vườn",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "HẠT GIỐNG NHÀ VƯỜN - Ươm Mầm Hôm Nay, Rực Rỡ Ngày Mai",
    description: "Shop hạt giống hoa & rau củ quả thuần F1 chất lượng cao. Nảy mầm >85%, miễn phí giao hàng đơn từ 300K.",
    url: "https://hatgiongnhavuon.vn",
    siteName: "Hạt Giống Nhà Vườn",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Logo Hạt Giống Nhà Vườn",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HẠT GIỐNG NHÀ VƯỜN - Ươm Mầm Hôm Nay, Rực Rỡ Ngày Mai",
    description: "Shop hạt giống hoa & rau củ quả thuần F1 chất lượng cao. Nảy mầm >85%, giao hàng toàn quốc.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "GardenStore",
  "name": "Hạt Giống Nhà Vườn",
  "alternateName": "Hạt Giống Nhà Vườn - Ươm Mầm Hôm Nay, Rực Rỡ Ngày Mai",
  "url": "https://hatgiongnhavuon.vn",
  "logo": "https://hatgiongnhavuon.vn/logo.png",
  "image": "https://hatgiongnhavuon.vn/logo.png",
  "description": "Chuyên cung cấp sỉ & lẻ các loại hạt giống hoa F1 thuần chủng, hạt giống rau sạch, cây ăn trái và vật tư nông nghiệp hữu cơ.",
  "telephone": "0934811307",
  "email": "contact@hatgiongnhavuon.vn",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "58 Lý Chính Thắng",
    "addressLocality": "TP. Quảng Ngãi",
    "addressRegion": "Quảng Ngãi",
    "postalCode": "570000",
    "addressCountry": "VN"
  },
  "priceRange": "$$"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-forest-700 selection:text-white font-sans">
        <SettingsProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <RealtimeProvider>
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <CartDrawer />
                  <FloatingButtons />
                  <MobileBottomNav />
                </RealtimeProvider>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
