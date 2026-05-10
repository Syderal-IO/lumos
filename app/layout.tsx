import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "@/components/ui/client-providers";
import SplashScreen from "@/components/ui/splash-screen";
import PageTransition from "@/components/ui/page-transition";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumos | Mercado Solar P2P",
  description:
    "Compra o vende energía solar directamente con tus vecinos. Pagos instantáneos, sin intermediarios.",
  keywords: ["energía solar", "mercado P2P", "Costa Rica", "sostenibilidad", "Solana", "blockchain"],
  manifest: "/manifest.json",
  themeColor: "#F97316",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lumos",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${pressStart2P.variable} h-full`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-[family-name:var(--font-pixel)] antialiased">
        <ClientProviders>
          <SplashScreen />
          <PageTransition>
            {children}
          </PageTransition>
        </ClientProviders>
        {/* PWA Service Worker registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
