import { getAdmin } from "@/lib/auth";

/** Modèle de fichier d'import (CSV, s'ouvre dans Excel). */
export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = [
    ["Liste", "Catégorie", "Société", "Prénom", "Nom", "Fonction", "E-mail", "Téléphone", "Code postal", "Ville", "Département", "Région", "Site web", "Source", "Origine"],
    ["Campings Bretagne", "camping", "Camping des Pins", "Marie", "Durand", "Gérante", "contact@camping-des-pins.fr", "02 98 00 00 00", "29000", "Quimper", "29", "Bretagne", "https://camping-des-pins.fr", "Salon 2026", "Carte de visite"],
    ["Mairies Loiret|Collectivités", "collectivite", "Mairie de Exemple", "", "", "Services techniques", "mairie@exemple.fr", "", "45000", "Orléans", "45", "Centre-Val de Loire", "", "Annuaire service-public.fr", "Données publiques"],
  ];
  const csv = "﻿" + rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="modele-import-contacts-alsimat.csv"' } });
}
