import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Golfette électrique professionnelle & véhicules électriques | Alsimat",
    template: "%s | Alsimat",
  },
  description:
    "Alsimat, spécialiste de la golfette électrique : transport de personnes, utilitaires, tout-terrain, homologuées route, PMR et bus électriques. Conseil, livraison et SAV sur site.",
  applicationName: "Alsimat",
  formatDetection: { telephone: false },
  openGraph: { type: "website", locale: "fr_FR", siteName: "Alsimat", images: [{ url: "/og-image.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export const viewport: Viewport = { themeColor: "#0d2420", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${body.variable} ${heading.variable}`}>
      <body>{children}</body>
    </html>
  );
}
