import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { EnvironmentBanner } from "@/components/environment-banner";
import { SiteHeader } from "@/components/site-header";
import { getCurrentViewer } from "@/lib/auth";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hardware Club Exchange",
    template: "%s | Hardware Club Exchange",
  },
  description: "硬件社团内部二手闲置发布、审核和交换平台。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getCurrentViewer();

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="min-h-screen">
          <SiteHeader viewer={viewer} />
          <EnvironmentBanner />
          <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-10">
            {children}
          </main>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
