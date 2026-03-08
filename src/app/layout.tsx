import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: [
    { path: "../../public/fonts/Geist-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/Geist-Medium.woff2", weight: "500" },
    { path: "../../public/fonts/Geist-SemiBold.woff2", weight: "600" },
    { path: "../../public/fonts/Geist-Bold.woff2", weight: "700" },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    { path: "../../public/fonts/GeistMono-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/GeistMono-Medium.woff2", weight: "500" },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://myaiprintshop.co.kr'),
  title: {
    default: "Myaiprintshop - AI로 만드는 나만의 커스텀 굿즈",
    template: "%s | 마이AI프린트샵",
  },
  description: "누구나 쉽게 AI로 디자인하고 굿즈를 제작/판매하는 플랫폼. 명함, 스티커, 티셔츠, 에코백 등 다양한 커스텀 상품을 AI로 디자인하세요.",
  keywords: ["AI 디자인", "커스텀 굿즈", "프린트샵", "명함 제작", "스티커 제작", "티셔츠 제작", "에코백", "AI 프린트", "마이AI프린트샵", "굿즈 제작"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "마이AI프린트샵",
    title: "Myaiprintshop - AI로 만드는 나만의 커스텀 굿즈",
    description: "누구나 쉽게 AI로 디자인하고 굿즈를 제작/판매하는 플랫폼",
  },
  twitter: {
    card: "summary_large_image",
    title: "Myaiprintshop - AI로 만드는 나만의 커스텀 굿즈",
    description: "누구나 쉽게 AI로 디자인하고 굿즈를 제작/판매하는 플랫폼",
  },
  robots: {
    index: true,
    follow: true,
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartSync />
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
