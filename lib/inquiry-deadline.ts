/** Engagement affiché au client : recontact sous 48 h. */
export const RESPONSE_HOURS = 48;

export function deadline(createdAt: Date, now = Date.now()) {
  const left = createdAt.getTime() + RESPONSE_HOURS * 3600_000 - now;
  const h = Math.round(left / 3600_000);
  if (left <= 0) return { label: `En retard de ${Math.max(1, -h)} h`, tone: "red" as const, late: true };
  if (h <= 12) return { label: `${h} h restantes`, tone: "amber" as const, late: false };
  return { label: `${h} h restantes`, tone: "green" as const, late: false };
}
