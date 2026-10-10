import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = headers();
  const host = headersList?.get?.('x-forwarded-host') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const siteUrl = host?.startsWith?.('http') ? host : `https://${host}`;

  const categories = await prisma.category.findMany({ select: { slug: true } });
  const vehicles = await prisma.vehicle.findMany({ select: { slug: true } });

  const staticPages = [
    { url: `${siteUrl}/`, lastModified: new Date() },
    { url: `${siteUrl}/a-propos`, lastModified: new Date() },
    { url: `${siteUrl}/realisations`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    { url: `${siteUrl}/sav`, lastModified: new Date() },
  ];

  const categoryPages = (categories ?? []).map((c: any) => ({
    url: `${siteUrl}/gammes/${c?.slug ?? ''}`,
    lastModified: new Date(),
  }));

  const vehiclePages = (vehicles ?? []).map((v: any) => ({
    url: `${siteUrl}/vehicules/${v?.slug ?? ''}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...categoryPages, ...vehiclePages];
}
