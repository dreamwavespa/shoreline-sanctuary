import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWA_ICONS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Shoreline Sanctuary",
  description: "A cozy beachcombing & restoration game",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shoreline Sanctuary",
  },
  icons: {
    apple: PWA_ICONS.icon192,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b3d3a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
