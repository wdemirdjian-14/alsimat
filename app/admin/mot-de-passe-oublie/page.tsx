import Image from "next/image";
import { ResetRequestForm } from "@/components/admin/access-forms";

export const metadata = { title: "Mot de passe oublié", robots: { index: false, follow: false } };

export default function ForgotPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-ink p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Image src="/logo-alsimat.png" alt="Alsimat" width={130} height={49} className="mx-auto h-11 w-auto" />
        <h1 className="mt-6 text-center text-xl font-bold">Mot de passe oublié</h1>
        <p className="mt-2 text-center text-sm text-ink/60">Indiquez votre e-mail : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
        <ResetRequestForm />
      </div>
    </main>
  );
}
