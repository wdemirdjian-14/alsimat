/** Valeurs par défaut — modifiables depuis l'admin (Paramètres > Entreprise). */
export const SITE_URL = (process.env.SITE_URL || "https://alsimat.com").replace(/\/$/, "");

export type CompanyInfo = {
  name: string;
  legalName: string;
  tagline: string;
  phone: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  region: string;
  hours: string;
  serviceArea: string;
  siret: string;
  director: string;
  linkedin: string;
  facebook: string;
  instagram: string;
};

export const DEFAULT_COMPANY: CompanyInfo = {
  name: "Alsimat",
  legalName: "Alsimat",
  tagline: "Spécialiste de la golfette électrique, du conseil au service après-vente",
  phone: "06 20 37 61 33",
  email: "contact@alsimat.com",
  street: "",
  postalCode: "",
  city: "",
  region: "",
  hours: "Du lundi au vendredi, 8h30 – 18h",
  serviceArea: "France",
  siret: "",
  director: "",
  linkedin: "",
  facebook: "",
  instagram: "",
};

export const telHref = (phone: string) => "tel:" + phone.replace(/[^\d+]/g, "").replace(/^0/, "+33");
