import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "RAISE3",
  description: "Borderless giving. Crowdfunding for all. Launching April 2025",
  icons: {
    icon: [
      {
        url: "/r3logo.png",
        sizes: "1000x1000",
        type: "image/png",
      }
    ],
    apple: [
      {
        url: "/r3logo.png",
        sizes: "1000x1000",
        type: "image/png",
      }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
