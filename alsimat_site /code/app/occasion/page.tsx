import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getBoolSetting, SETTING_KEYS } from "@/lib/settings";
import { OccasionClient } from "./occasion-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Véhicules d'occasion - Alsimat",
  description: "Découvrez nos véhicules électriques d'occasion disponibles à la vente.",
};

export default async function OccasionPage() {
  const visible = await getBoolSetting(SETTING_KEYS.occasionVisible, true);
  if (!visible) return notFound();

  const items = await prisma.usedVehicle.findMany({
    where: { sold: false },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <OccasionClient
      items={items.map((v: any) => ({
        id: v.id, name: v.name, slug: v.slug, price: v.price ?? null,
        year: v.year ?? null, mileage: v.mileage ?? null, condition: v.condition ?? null,
        images: v.images ?? [], featured: v.featured,
      }))}
    />
  );
}
