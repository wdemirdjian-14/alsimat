import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CategoryPageClient } from "./category-page-client";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params?.slug ?? '' },
    include: {
      vehicles: {
        include: {
          vehicle: true,
        },
      },
      children: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!category) return notFound();

  const vehicles = (category?.vehicles ?? []).map((vc: any) => vc?.vehicle).filter(Boolean);
  const subCategories = (category?.children ?? []).map((c: any) => ({
    id: c?.id ?? '',
    name: c?.name ?? '',
    slug: c?.slug ?? '',
    description: c?.description ?? null,
    image: c?.image ?? null,
  }));

  return (
    <CategoryPageClient
      category={{
        id: category?.id ?? '',
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? null,
        image: category?.image ?? null,
      }}
      subCategories={subCategories}
      vehicles={vehicles.map((v: any) => ({
        id: v?.id ?? '',
        name: v?.name ?? '',
        slug: v?.slug ?? '',
        shortDescription: v?.shortDescription ?? null,
        images: v?.images ?? [],
      }))}
    />
  );
}
