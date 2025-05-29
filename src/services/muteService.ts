import { addHours } from "date-fns";
import { prismaClient } from "../../prisma/prismaClient";

export async function muteDevice(deviceId: number, hours: number) {
  await prismaClient.user.update({
    where: { deviceId },
    data: { mutedUntil: addHours(new Date(), hours) },
  });
}

export async function unmuteDevice(deviceId: number) {
  await prismaClient.user.update({
    where: { deviceId },
    data: { mutedUntil: null },
  });
}
