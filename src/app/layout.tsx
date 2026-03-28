import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://goodzz.co.kr'),
  title: {
    default: "GOODZZ | 사진 한 장으로 시작되는 프리미엄 글로벌 굿즈",
    template: "%s | GOODZZ",
  },
  description: "복잡한 디자인 없이, 당신의 사진 한 장으로 전 세계 어디든 프리미엄 굿즈를 배송합니다. AI 자동 시안 합성 기술로 완성되는 나만의 브랜드.",
  keywords: ["프리미엄 굿즈", "AI 굿즈 제작", "글로벌 굿즈 배송", "사진 굿즈", "GOODZZ", "나노바나나", "커스텀 디자인"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "GOODZZ",
    title: "GOODZZ | 사진 한 장으로 시작되는 프리미엄 글로벌 굿즈",
    description: "가장 쉬운 글로벌 굿즈 커스텀 플랫폼. 지금 사진을 업로드하고 나만의 굿즈 시안을 확인하세요.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "GOODZZ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GOODZZ | 사진 한 장으로 시작되는 프리미엄 글로벌 굿즈",
    description: "가장 쉬운 글로벌 굿즈 커스텀 플랫폼. 지금 사진을 업로드하고 나만의 굿즈 시안을 확인하세요.",
    images: ["/og-image.png"],
  },
};

import { Toaster } from 'sonner';
import { AuthProvider } from "@/context/AuthContext";
import CartSync from "@/components/CartSync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css" />
        <script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js" async></script>
      </head>
      <body className="antialiased bg-zinc-950 text-zinc-200 selection:bg-amber-500/30 selection:text-amber-200">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7704550771011130"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <CartSync />
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
