import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2d3436] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <div className="mb-4">
              <div className="relative h-10 w-[150px] brightness-0 invert">
                <Image
                  src="/brand/alsimat-logo.png"
                  alt="Alsimat"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre spécialiste tracteurs et nacelles électriques. Des solutions 100% électriques pour les professionnels.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[#7FBF7F] font-semibold mb-4">Navigation</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 text-sm hover:text-white transition-colors">Accueil</Link>
              <Link href="/gammes/tracteurs-electriques" className="block text-gray-400 text-sm hover:text-white transition-colors">Tracteurs électriques</Link>
              <Link href="/gammes/nacelles-tractables" className="block text-gray-400 text-sm hover:text-white transition-colors">Nacelles tractables</Link>
              <Link href="/realisations" className="block text-gray-400 text-sm hover:text-white transition-colors">Réalisations</Link>
              <Link href="/a-propos" className="block text-gray-400 text-sm hover:text-white transition-colors">À propos</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#7FBF7F] font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <a href="tel:+33620376133" className="flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#7FBF7F]" />
                <span suppressHydrationWarning>06 20 37 61 33</span>
              </a>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-[#7FBF7F]" />
                <span suppressHydrationWarning>contact@alsimat.fr</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-[#7FBF7F] mt-0.5" />
                <span>France</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Alsimat. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
