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
      <body className="club min-h-dvh bg-[#0c0c0c] font-sans text-[#f4f4f1] antialiased selection:bg-[#d01212] selection:text-[#f4f4f1]">
        <SiteHeader />
        <Providers>
          <div className="px-3 pt-2 pb-16 md:px-6">
            <div className="mx-auto w-full max-w-2xl bg-background text-foreground shadow-[6px_6px_0_#000]">
              <div className="px-5 py-8 md:px-10 md:py-12">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
