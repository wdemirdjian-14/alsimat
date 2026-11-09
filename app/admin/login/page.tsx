import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-svh place-items-center bg-ink p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Image src="/logo-alsimat.png" alt="Alsimat" width={130} height={49} className="mx-auto h-11 w-auto" />
        <h1 className="mt-6 text-center text-xl font-bold">Espace administration</h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm"><Link href="/admin/mot-de-passe-oublie" className="text-ink/55 underline hover:text-ink">Mot de passe oublié ?</Link></p>
      </div>
    </main>
  );
}
