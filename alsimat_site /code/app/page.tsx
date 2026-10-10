import { prisma } from "@/lib/db";
import { HeroSection } from "@/components/hero-section";
import { GammesSection } from "@/components/gammes-section";
import { WhySection } from "@/components/why-section";
import { CtaSection } from "@/components/cta-section";
import { PromotionsHome } from "@/components/promotions-home";
import {
  getJsonSetting,
  getBoolSetting,
  SETTING_KEYS,
  DEFAULT_HOME_CONTENT,
  HomeContent,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, content, promotionsVisible] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
    }),
    getJsonSetting<HomeContent>(SETTING_KEYS.homeContent, DEFAULT_HOME_CONTENT),
    getBoolSetting(SETTING_KEYS.promotionsVisible, true),
  ]);

  let promotions: any[] = [];
  if (promotionsVisible) {
    promotions = await prisma.promotion.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 3,
    });
  }

  return (
    <>
      <HeroSection content={content} />
      {promotionsVisible && promotions.length > 0 && (
        <PromotionsHome
          promotions={promotions.map((p: any) => ({
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
      )}
      <GammesSection
        categories={categories ?? []}
        title={content.gammesTitle}
        subtitle={content.gammesSubtitle}
      />
      <WhySection />
      <CtaSection title={content.ctaTitle} subtitle={content.ctaSubtitle} />
    </>
  );
}
