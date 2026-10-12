"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { bool, int, jsonList, parseSpecs, refreshSite, str, uniqueSlug } from "./helpers";

export async function saveVehicle(id: string | null, fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) throw new Error("Le nom est obligatoire.");
  const slug = await uniqueSlug(str(fd, "slug") || name, (s) => db.vehicle.findUnique({ where: { slug: s }, select: { id: true } }), id ?? undefined);
  const categoryIds = fd.getAll("categories").map(String);
  const data = {
    name,
    slug,
    price: str(fd, "price"),
    shortDescription: str(fd, "shortDescription"),
    description: str(fd, "description"),
    characteristics: parseSpecs(str(fd, "characteristics")),
    images: jsonList(fd, "images"),
    featured: bool(fd, "featured"),
    published: bool(fd, "published"),
    order: int(fd, "order"),
    seoTitle: str(fd, "seoTitle"),
    seoDescription: str(fd, "seoDescription"),
    spotlight: bool(fd, "spotlight"),
    tagline: str(fd, "tagline"),
    brand: str(fd, "brand"),
    vehicleType: str(fd, "vehicleType"),
    sku: str(fd, "sku"),
    video: str(fd, "video"),
    datasheet: str(fd, "datasheet"),
    equipment: str(fd, "equipment"),
    colors: (str(fd, "colors") ?? "").split(",").map((c) => c.trim()).filter(Boolean),
    upholstery: (str(fd, "upholstery") ?? "").split(",").map((c) => c.trim()).filter(Boolean),
  };
  const saved = id
    ? await db.vehicle.update({ where: { id }, data: { ...data, categories: { deleteMany: {}, create: categoryIds.map((categoryId) => ({ categoryId })) } } })
    : await db.vehicle.create({ data: { ...data, categories: { create: categoryIds.map((categoryId) => ({ categoryId })) } } });
  refreshSite();
  redirect(`/admin/vehicules/${saved.id}?ok=1`);
}

export async function duplicateVehicle(id: string) {
  await requireAdmin();
  const v = await db.vehicle.findUniqueOrThrow({ where: { id }, include: { categories: true } });
  const slug = await uniqueSlug(`${v.slug}-copie`, (s) => db.vehicle.findUnique({ where: { slug: s }, select: { id: true } }));
  const copy = await db.vehicle.create({
    data: {
      name: `${v.name} (copie)`, slug, price: v.price, shortDescription: v.shortDescription, description: v.description,
      characteristics: v.characteristics ?? {}, images: v.images, featured: false, published: false, order: v.order,
      categories: { create: v.categories.map((c) => ({ categoryId: c.categoryId })) },
    },
  });
  redirect(`/admin/vehicules/${copy.id}`);
}

export async function deleteVehicle(id: string) {
  await requireAdmin();
  await db.vehicle.delete({ where: { id } });
  refreshSite();
  redirect("/admin/vehicules?ok=1");
}

export async function saveCategory(id: string | null, fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) throw new Error("Le nom est obligatoire.");
  const slug = await uniqueSlug(str(fd, "slug") || name, (s) => db.category.findUnique({ where: { slug: s }, select: { id: true } }), id ?? undefined);
  const parentId = str(fd, "parentId");
  const data = {
    name, slug,
    parentId: parentId && parentId !== id ? parentId : null,
    description: str(fd, "description"),
    intro: str(fd, "intro"),
    image: str(fd, "image"),
    order: int(fd, "order"),
    published: bool(fd, "published"),
    seoTitle: str(fd, "seoTitle"),
    seoDescription: str(fd, "seoDescription"),
  };
  const saved = id ? await db.category.update({ where: { id }, data }) : await db.category.create({ data });
  refreshSite();
  redirect(`/admin/gammes/${saved.id}?ok=1`);
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await db.category.delete({ where: { id } });
  refreshSite();
  redirect("/admin/gammes?ok=1");
}
