import { SavClient } from "./sav-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Demander votre SAV - Alsimat',
  description: 'Soumettez une demande de service après-vente pour votre véhicule électrique Alsimat.',
};

export default function SavPage() {
  return <SavClient />;
}
