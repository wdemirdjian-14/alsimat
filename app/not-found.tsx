import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-ink px-4 text-center text-white">
      <div>
        <Image src="/logo-alsimat.png" alt="Alsimat" width={150} height={56} className="mx-auto h-12 w-auto brightness-0 invert" />
        <p className="mt-10 font-display text-8xl font-extrabold text-brand-300">404</p>
        <h1 className="mt-4 text-2xl font-bold">Cette page n'existe pas ou a été déplacée.</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Retour à l'accueil</Link>
          <Link href="/gammes/golfette-utilitaire" className="btn-light">Voir le catalogue</Link>
        </div>
      </div>
    </main>
  );
}
