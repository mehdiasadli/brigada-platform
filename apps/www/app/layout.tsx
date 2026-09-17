import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "@brigada/ui/globals.css";
import { env } from "../env";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Brigada",
    template: "%s · Brigada",
  },
  description: "Brigada — a closed friend-group platform.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-svh font-sans antialiased">{children}</body>
    </html>
  );
}
