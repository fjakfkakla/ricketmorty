import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rick & Morty — The Game",
  description: "Explore the Smith house, use Rick's inventions and chat with your favourite characters!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistMono.variable} h-full`}>
      <body className="h-full overflow-hidden bg-black text-white">{children}</body>
    </html>
  );
}
