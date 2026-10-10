import type { Metadata } from "next";
import { SITE_URL, type CompanyInfo } from "./site";
import { truncate } from "./utils";

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const desc = truncate(description, 158);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title, description: desc, url: path, ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { title, description: desc, ...(image ? { images: [image] } : {}) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function organizationJsonLd(c: CompanyInfo) {
  const sameAs = [c.linkedin, c.facebook, c.instagram].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${SITE_URL}/#organization`,
    name: c.name,
    legalName: c.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-alsimat.png`,
    image: `${SITE_URL}/og-image.jpg`,
    description: c.tagline,
    telephone: c.phone.replace(/\s/g, "").replace(/^0/, "+33"),
    email: c.email,
    areaServed: c.serviceArea || "France",
    ...(c.street || c.city
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: c.street || undefined,
            postalCode: c.postalCode || undefined,
            addressLocality: c.city || undefined,
            addressRegion: c.region || undefined,
            addressCountry: "FR",
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
