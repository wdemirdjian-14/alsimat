import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RealisationsClient } from "./realisations-client";
import { getBoolSetting, SETTING_KEYS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Réalisations - Alsimat',
  description: 'Découvrez nos réalisations et projets avec des véhicules électriques Alsimat.',
};

export default async function RealisationsPage() {
  const visible = await getBoolSetting(SETTING_KEYS.realisationsVisible, true);
  if (!visible) return notFound();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <RealisationsClient
      projects={(projects ?? []).map((p: any) => ({
        id: p?.id ?? '',
        title: p?.title ?? '',
        description: p?.description ?? null,
        image: p?.image ?? null,
        date: p?.date ?? null,
      }))}
    />
  );
}
