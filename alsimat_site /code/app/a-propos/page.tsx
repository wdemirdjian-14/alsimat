import { AboutPageClient } from "./about-client";
import { getJsonSetting, SETTING_KEYS, DEFAULT_ABOUT_CONTENT, AboutContent } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'À propos - Alsimat',
  description: 'Découvrez l\'histoire d\'Alsimat, spécialiste en tracteurs et nacelles électriques depuis 2018.',
};

export default async function AboutPage() {
  const content = await getJsonSetting<AboutContent>(SETTING_KEYS.aboutContent, DEFAULT_ABOUT_CONTENT);
  return <AboutPageClient content={content} />;
}
