import Image from "next/image";
import Link from "next/link";
import { ActivationForm } from "@/components/admin/access-forms";
import { userForToken } from "@/lib/invitations";

export const metadata = { title: "Créer mon mot de passe", robots: { index: false, follow: false } };

export default async function ActivationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await userForToken(token);
  return (
    <main className="grid min-h-svh place-items-center bg-ink p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Image src="/logo-alsimat.png" alt="Alsimat" width={130} height={49} className="mx-auto h-11 w-auto" />
        {user ? (
          <>
            <h1 className="mt-6 text-center text-xl font-bold">{user.activated ? "Nouveau mot de passe" : "Bienvenue !"}</h1>
            <p className="mt-2 text-center text-sm text-ink/60">Choisissez votre mot de passe pour accéder à l'administration Alsimat.</p>
            <ActivationForm token={token} email={user.email} askName={!user.name} />
          </>
        ) : (
          <>
            <h1 className="mt-6 text-center text-xl font-bold">Lien expiré ou déjà utilisé</h1>
            <p className="mt-2 text-center text-sm text-ink/60">Demandez un nouveau lien ci-dessous ou à un administrateur.</p>
            <Link href="/admin/mot-de-passe-oublie" className="btn-primary mt-6 w-full">Recevoir un nouveau lien</Link>
          </>
        )}
      </div>
    </main>
  );
}
