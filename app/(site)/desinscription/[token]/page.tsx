import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { unsubscribeByToken } from "@/lib/unsubscribe";

export const metadata: Metadata = { title: "Désinscription", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { token } = await params;
  const done = (await searchParams).ok;
  const r = await db.campaignRecipient.findUnique({ where: { token }, include: { contact: true } });
  async function confirm() {
    "use server";
    await unsubscribeByToken(token);
    redirect(`/desinscription/${token}?ok=1`);
  }
  return (
    <div className="container-x max-w-xl pt-40 pb-24 text-center">
      {!r ? (
        <p className="text-lg">Ce lien n'est plus valide.</p>
      ) : done || r.contact.unsubscribed ? (
        <>
          <h1 className="text-3xl font-extrabold">C'est fait.</h1>
          <p className="mt-4 text-ink-soft">L'adresse {r.contact.email} ne recevra plus nos e-mails d'information. Vous pouvez toujours nous contacter quand vous le souhaitez.</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold">Se désinscrire</h1>
          <p className="mt-4 text-ink-soft">Ne plus recevoir les e-mails d'information d'Alsimat à l'adresse <strong>{r.contact.email}</strong> ?</p>
          <form action={confirm} className="mt-8"><button className="btn-primary">Confirmer la désinscription</button></form>
        </>
      )}
    </div>
  );
}
