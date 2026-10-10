import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getBoolSetting, SETTING_KEYS } from "@/lib/settings";
import { ConfiguratorClient } from "./configurator-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configurateur - Alsimat",
  description: "Configurez votre véhicule électrique sur mesure et obtenez un devis personnalisé.",
};

export default async function ConfigurateurPage() {
  const visible = await getBoolSetting(SETTING_KEYS.configurateurVisible, true);
  if (!visible) return notFound();

  const models = await prisma.configuratorModel.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      groups: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  return <ConfiguratorClient models={JSON.parse(JSON.stringify(models))} />;
}
