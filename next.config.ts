import type { NextConfig } from "next";
import catalog from "./prisma/data/catalog.json";

// Anciennes URL du site d'origine -> nouvelles pages (redirections 301 pour conserver le référencement).
const legacyRedirects = [
  ...catalog.redirects.map((r) => ({ source: r.from, destination: r.to, permanent: true })),
  ...catalog.vehicles
    .filter((v) => !v.published)
    .map((v) => ({ source: `/vehicules/${v.slug}`, destination: "/gammes/golfette-utilitaire", permanent: true })),
  { source: "/gammes/tracteurs-electriques", destination: "/gammes/golfette-utilitaire", permanent: true },
  { source: "/gammes/nacelles-tractables", destination: "/gammes/golfette-utilitaire", permanent: true },
  { source: "/configurateur", destination: "/contact", permanent: true },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
  async redirects() {
    return legacyRedirects;
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
