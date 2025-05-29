import { SUPPORTED_LANGUAGES } from "~/constants/constants";
import { PushsaferNameObject } from "~/resources";

export function parseDeviceName(name: string): PushsaferNameObject | null {
  const nameParts = name.split("-");

  if (nameParts.length !== 4) return null;

  const userName = nameParts[0].trim();
  const language = nameParts[1].trim().toLowerCase();
  const metric = nameParts[2].trim().toLowerCase();
  const value = Math.round(parseFloat(nameParts[3].trim()) * 10) / 10;

  if (!userName || userName.length < 3 || userName.length > 20) return null;
  if (isNaN(value)) return null;
  if (!SUPPORTED_LANGUAGES.includes(language)) return null;
  if (metric !== "level" && metric !== "flowrate") return null;

  return {
    name: userName,
    language,
    metric: metric as "level" | "flowrate",
    value,
  };
}

export function formatDeviceName(data: PushsaferNameObject): string {
  return `${data.name}-${data.language}-${data.metric}-${data.value}`;
}
