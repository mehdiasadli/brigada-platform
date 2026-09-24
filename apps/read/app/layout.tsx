import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "@brigada/ui/globals.css";
import "./club.css";
import { SiteHeader } from "../components/site-header";
import { env } from "../env";
import { Providers } from "./providers";

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
      <body className="club min-h-dvh bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <SiteHeader />
        <Providers>
          <div className="mx-auto w-full max-w-2xl px-5 py-8 md:px-10 md:py-12">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
