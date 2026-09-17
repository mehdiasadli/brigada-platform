import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "@brigada/ui/globals.css";
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
      <body className="min-h-dvh font-sans antialiased">
        <SiteHeader />
        <Providers>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
