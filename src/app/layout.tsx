import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Epoque@Prastuti '26 - KIET",
  description: "Futuristic Schedule for Epoque@Prastuti 2026 at KIET Deemed to be University",
};

export const viewport = {
  themeColor: "#050510",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: "#030308" }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-[#030308] text-white min-h-screen relative`}>
        {/* Three.js animated background — lazy loaded, never blocks paint */}
        <BackgroundWrapper />
        {/* Subtle CSS radial glow fallback (renders instantly before 3D loads) */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neon-purple/10 blur-[120px]" />
          <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-neon-red/5 blur-[120px] translate-x-[-50%]" />
        </div>
        {children}
        <script
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
        <Analytics />
      </body>
    </html>
  );
}
