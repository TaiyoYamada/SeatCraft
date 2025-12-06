import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/shared/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SeatCraft - 席決めアプリ",
  description: "飲み会や会議の席決めを簡単に。制約を考慮した自動配置で理想の席順を。",
  keywords: ["席決め", "座席配置", "飲み会", "会議", "イベント"],
  openGraph: {
    title: "SeatCraft - 席決めアプリ",
    description: "飲み会や会議の席決めを簡単に。制約を考慮した自動配置で理想の席順を。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
