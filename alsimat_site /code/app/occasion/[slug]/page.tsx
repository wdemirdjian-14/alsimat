import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getBoolSetting, SETTING_KEYS } from "@/lib/settings";
import { OccasionDetailClient } from "./detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const v = await prisma.usedVehicle.findUnique({ where: { slug: params.slug } });
  if (!v) return { title: "Véhicule d'occasion - Alsimat" };
  return {
    title: `${v.name} - Occasion - Alsimat`,
    description: v.description ?? "Véhicule électrique d'occasion disponible chez Alsimat.",
  };
}

export default async function OccasionDetailPage({ params }: { params: { slug: string } }) {
  const visible = await getBoolSetting(SETTING_KEYS.occasionVisible, true);
  if (!visible) return notFound();

  const v = await prisma.usedVehicle.findUnique({ where: { slug: params.slug } });
  if (!v) return notFound();

  const characteristics =
    v.characteristics && typeof v.characteristics === "object" && !Array.isArray(v.characteristics)
      ? (v.characteristics as Record<string, string>)
      : {};

  return (
    <OccasionDetailClient
      vehicle={{
        id: v.id,
        name: v.name,
        description: v.description ?? null,
        price: v.price ?? null,
        year: v.year ?? null,
        mileage: v.mileage ?? null,
        condition: v.condition ?? null,
        images: v.images ?? [],
        sold: v.sold,
        characteristics,
      }}
    />
  );
}
