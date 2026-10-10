type Tone = "neutral" | "green" | "amber" | "red" | "blue";
export const INQUIRY_TYPES: Record<string, { label: string; tone: Tone }> = {
  devis: { label: "Devis", tone: "green" },
  contact: { label: "Contact", tone: "blue" },
  sav: { label: "SAV", tone: "amber" },
};
export const INQUIRY_STATUS: Record<string, { label: string; tone: Tone }> = {
  nouveau: { label: "Nouveau", tone: "amber" },
  en_cours: { label: "En cours", tone: "blue" },
  traite: { label: "Traité", tone: "green" },
  archive: { label: "Archivé", tone: "neutral" },
};
