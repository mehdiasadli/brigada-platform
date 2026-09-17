import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
    default: "Read",
    template: "%s · Read",
  },
  description: "Brigada reading club.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-svh font-sans antialiased">
        <header className="border-b">
          <nav className="mx-auto flex h-12 max-w-3xl items-center gap-4 px-4 text-sm">
            <Link className="font-medium" href="/">
              Read
            </Link>
            <Link className="text-muted-foreground" href="/books">
              Books
            </Link>
          </nav>
        </header>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
