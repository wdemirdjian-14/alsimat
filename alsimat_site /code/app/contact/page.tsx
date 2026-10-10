import { ContactClient } from "./contact-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Contact / Devis - Alsimat',
  description: 'Contactez Alsimat pour un devis ou une demande d\'information.',
};

export default function ContactPage() {
  return <ContactClient />;
}
