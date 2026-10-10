import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { VehicleDetailClient } from "./vehicle-detail-client";

export const dynamic = "force-dynamic";

export default async function VehiclePage({ params }: { params: { slug: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: params?.slug ?? '' },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!vehicle) return notFound();

  const cats = (vehicle?.categories ?? []).map((vc: any) => ({
    name: vc?.category?.name ?? '',
    slug: vc?.category?.slug ?? '',
  }));

  return (
    <VehicleDetailClient
      vehicle={{
        id: vehicle?.id ?? '',
        name: vehicle?.name ?? '',
        slug: vehicle?.slug ?? '',
        description: vehicle?.description ?? null,
        shortDescription: vehicle?.shortDescription ?? null,
        price: vehicle?.price ?? null,
        characteristics: (vehicle?.characteristics as Record<string, string>) ?? {},
        images: vehicle?.images ?? [],
      }}
      categories={cats}
    />
  );
}
