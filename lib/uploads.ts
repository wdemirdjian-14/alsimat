import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { slugify } from "./utils";

/** Dossier persistant des fichiers envoyés (volume Docker en production). */
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif", "image/gif"];

function safeName(original: string) {
  const ext = path.extname(original);
  return `${slugify(path.basename(original, ext)).slice(0, 60) || "fichier"}-${randomBytes(3).toString("hex")}`;
}

/** Image publique (catalogue, réalisations…) : convertie en WebP, 2000 px max. Renvoie l'URL publique. */
export async function savePublicImage(file: File, hint?: string) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Format d'image non pris en charge.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Image trop lourde (25 Mo maximum).");
  const dir = path.join(UPLOAD_DIR, "public", new Date().toISOString().slice(0, 7));
  await mkdir(dir, { recursive: true });
  const name = safeName(hint || file.name) + ".webp";
  const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${path.relative(path.join(UPLOAD_DIR, "public"), path.join(dir, name)).split(path.sep).join("/")}`;
}

/** Pièce jointe privée (SAV) : stockée hors du dossier public, lisible uniquement depuis l'admin. */
export async function savePrivateFile(file: File, folder: string) {
  const allowed = [...IMAGE_TYPES, "application/pdf", "video/mp4", "video/quicktime"];
  if (!allowed.includes(file.type)) throw new Error(`Format non accepté : ${file.name}`);
  if (file.size > 15 * 1024 * 1024) throw new Error(`Fichier trop lourd (15 Mo max) : ${file.name}`);
  const dir = path.join(UPLOAD_DIR, "private", folder);
  await mkdir(dir, { recursive: true });
  const name = safeName(file.name) + path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `${folder}/${name}`;
}

/** Résout un chemin demandé en restant confiné dans le dossier racine donné. */
export function resolveInside(root: string, parts: string[]) {
  const target = path.resolve(root, ...parts);
  return target.startsWith(path.resolve(root) + path.sep) ? target : null;
}

export const MIME: Record<string, string> = {
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif",
  ".avif": "image/avif", ".heic": "image/heic", ".pdf": "application/pdf", ".mp4": "video/mp4", ".mov": "video/quicktime",
};
