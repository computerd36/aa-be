import { prismaClient } from "../../prisma/prismaClient";
import { parseDeviceName } from "../utils/devicename";

interface AddDevicePayload {
  id: string;
  name: string;
  group?: string;
  guest?: string;
}

export async function upsertDevice(p: AddDevicePayload) {
  const deviceId = Number(p.id);
  const parsed = parseDeviceName(p.name); // { language, alertLevel } | null

  await prismaClient.user.upsert({
    where: { deviceId },
    update: {
      name: p.name,
      role: p.group === "dev" ? "dev" : "user",
      ...(parsed && {
        language: parsed.language,
        value: parsed.value,
      }),
    },
    create: {
      deviceId,
      name: p.name,
      role: p.group === "dev" ? "dev" : "user",
      language: parsed?.language ?? "en",
      value: parsed?.value ?? 1.5,
    },
  });
}
