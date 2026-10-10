"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveSetting, getSetting, type AboutContent, type HomeContent, type Visibility } from "@/lib/settings";
import type { CompanyInfo } from "@/lib/site";
import { bool, int, jsonList, parseSpecs, refreshSite, str, uniqueSlug } from "./helpers";

// ---- Occasion ----
export async function saveUsed(id: string | null, fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) throw new Error("Le nom est obligatoire.");
  const slug = await uniqueSlug(str(fd, "slug") || name, (s) => db.usedVehicle.findUnique({ where: { slug: s }, select: { id: true } }), id ?? undefined);
  const data = {
    name, slug, price: str(fd, "price"), year: str(fd, "year"), mileage: str(fd, "mileage"), condition: str(fd, "condition"),
    description: str(fd, "description"), characteristics: parseSpecs(str(fd, "characteristics")), images: jsonList(fd, "images"),
    sold: bool(fd, "sold"), published: bool(fd, "published"),
  };
  const saved = id ? await db.usedVehicle.update({ where: { id }, data }) : await db.usedVehicle.create({ data });
  refreshSite();
  redirect(`/admin/occasion/${saved.id}?ok=1`);
}
export async function deleteUsed(id: string) {
  await requireAdmin();
  await db.usedVehicle.delete({ where: { id } });
  refreshSite();
  redirect("/admin/occasion?ok=1");
}

// ---- Promotions ----
export async function savePromotion(id: string | null, fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title) throw new Error("Le titre est obligatoire.");
  const ends = str(fd, "endsAt");
  const data = {
    title, description: str(fd, "description"), image: str(fd, "image"), discount: str(fd, "discount"), badge: str(fd, "badge"),
    ctaLabel: str(fd, "ctaLabel"), ctaLink: str(fd, "ctaLink"), active: bool(fd, "active"), order: int(fd, "order"),
    endsAt: ends ? new Date(`${ends}T23:59:59`) : null,
  };
  const saved = id ? await db.promotion.update({ where: { id }, data }) : await db.promotion.create({ data });
  refreshSite();
  redirect(`/admin/promotions/${saved.id}?ok=1`);
}
export async function deletePromotion(id: string) {
  await requireAdmin();
  await db.promotion.delete({ where: { id } });
  refreshSite();
  redirect("/admin/promotions?ok=1");
}

// ---- Réalisations ----
export async function saveProject(id: string | null, fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title) throw new Error("Le titre est obligatoire.");
  const slug = await uniqueSlug(str(fd, "slug") || title, (s) => db.project.findUnique({ where: { slug: s }, select: { id: true } }), id ?? undefined);
  const data = { title, slug, description: str(fd, "description"), image: str(fd, "image"), location: str(fd, "location"), date: str(fd, "date"), published: bool(fd, "published") };
  const saved = id ? await db.project.update({ where: { id }, data }) : await db.project.create({ data });
  refreshSite();
  redirect(`/admin/realisations/${saved.id}?ok=1`);
}
export async function deleteProject(id: string) {
  await requireAdmin();
  await db.project.delete({ where: { id } });
  refreshSite();
  redirect("/admin/realisations?ok=1");
}

// ---- Conseils ----
export async function saveArticle(id: string | null, fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  const content = str(fd, "content");
  if (!title || !content) throw new Error("Le titre et le contenu sont obligatoires.");
  const slug = await uniqueSlug(str(fd, "slug") || title, (s) => db.article.findUnique({ where: { slug: s }, select: { id: true } }), id ?? undefined);
  const date = str(fd, "publishedAt");
  const data = {
    title, slug, content, excerpt: str(fd, "excerpt"), image: str(fd, "image"), published: bool(fd, "published"),
    publishedAt: date ? new Date(`${date}T08:00:00`) : new Date(), seoTitle: str(fd, "seoTitle"), seoDescription: str(fd, "seoDescription"),
  };
  const saved = id ? await db.article.update({ where: { id }, data }) : await db.article.create({ data });
  refreshSite();
  redirect(`/admin/conseils/${saved.id}?ok=1`);
}
export async function deleteArticle(id: string) {
  await requireAdmin();
  await db.article.delete({ where: { id } });
  refreshSite();
  redirect("/admin/conseils?ok=1");
}

// ---- Contenus & paramètres ----
export async function saveHome(fd: FormData) {
  await requireAdmin();
  const cur = await getSetting("home_content");
  const keys = Object.keys(cur) as (keyof HomeContent)[];
  const next = Object.fromEntries(keys.map((k) => [k, str(fd, k) ?? ""])) as HomeContent;
  await saveSetting("home_content", next);
  refreshSite();
  redirect("/admin/contenu?ok=1");
}

export async function saveAbout(fd: FormData) {
  await requireAdmin();
  const stats = [0, 1, 2, 3].map((i) => ({ value: str(fd, `stat${i}v`) ?? "", label: str(fd, `stat${i}l`) ?? "" }));
  const next: AboutContent = { title: str(fd, "title") ?? "", intro: str(fd, "intro") ?? "", body: str(fd, "body") ?? "", image: str(fd, "image") ?? "", stats };
  await saveSetting("about_content", next);
  refreshSite();
  redirect("/admin/contenu?ok=1#a-propos");
}

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const visibility: Visibility = { occasion: bool(fd, "v_occasion"), promotions: bool(fd, "v_promotions"), realisations: bool(fd, "v_realisations"), conseils: bool(fd, "v_conseils") };
  const cur = await getSetting("company");
  const company = Object.fromEntries((Object.keys(cur) as (keyof CompanyInfo)[]).map((k) => [k, str(fd, `c_${k}`) ?? ""])) as CompanyInfo;
  await Promise.all([saveSetting("visibility", visibility), saveSetting("company", company)]);
  refreshSite();
  redirect("/admin/parametres?ok=1");
}

// ---- Demandes ----
export async function updateInquiry(id: string, fd: FormData) {
  await requireAdmin();
  await db.inquiry.update({ where: { id }, data: { status: str(fd, "status") ?? "nouveau", notes: str(fd, "notes") } });
  redirect(`/admin/demandes/${id}?ok=1`);
}
export async function deleteInquiry(id: string) {
  await requireAdmin();
  await db.inquiry.delete({ where: { id } });
  redirect("/admin/demandes?ok=1");
}
