import { notFound } from "next/navigation";
import { redirectIfAny } from "@/lib/redirects";

/** Toute adresse inconnue : redirection gérée dans l'admin (SEO > Redirections), sinon 404. */
export default async function CatchAll({ params }: { params: Promise<{ path: string[] }> }) {
  await redirectIfAny((await params).path.join("/"));
  notFound();
}
