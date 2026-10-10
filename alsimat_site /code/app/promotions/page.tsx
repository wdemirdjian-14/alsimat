import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getBoolSetting, SETTING_KEYS } from "@/lib/settings";
import { PromotionsClient } from "./promotions-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promotions - Alsimat",
  description: "Découvrez nos offres et promotions du moment sur les tracteurs et nacelles électriques.",
};

export default async function PromotionsPage() {
  const visible = await getBoolSetting(SETTING_KEYS.promotionsVisible, true);
  if (!visible) return notFound();

  const items = await prisma.promotion.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <PromotionsClient
      items={items.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description ?? null,
        image: p.image ?? null,
        discount: p.discount ?? null,
        badge: p.badge ?? null,
        ctaLabel: p.ctaLabel ?? null,
        ctaLink: p.ctaLink ?? null,
      }))}
    />
  );
}
