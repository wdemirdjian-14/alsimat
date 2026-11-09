export const CAMPAIGN_STATUS: Record<string, { label: string; tone: "neutral" | "green" | "amber" | "blue" | "red" }> = {
  brouillon: { label: "Brouillon", tone: "neutral" },
  programmee: { label: "Programmée", tone: "blue" },
  envoi: { label: "Envoi en cours", tone: "amber" },
  envoyee: { label: "Envoyée", tone: "green" },
  pause: { label: "En pause", tone: "red" },
};
