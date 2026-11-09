import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin Alsimat" },
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "Alsimat", statusBarStyle: "black-translucent" },
  icons: { apple: "/admin-apple-touch.png" },
};

export const viewport: Viewport = { themeColor: "#0d2420", width: "device-width", initialScale: 1, viewportFit: "cover" };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
