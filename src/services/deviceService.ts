import { prismaClient } from "../../prisma/prismaClient";
import { parseDeviceName } from "../utils/devicename";

export async function createUser(deviceData: {
  id: string;
  name?: string;
  group?: string;
  guest?: string;
}) {
  const deviceId = Number(deviceData.id);
  const deviceName = deviceData.name || `Device ${deviceId}`;
  const parsed = parseDeviceName(deviceName);

  const user = await prismaClient.user.create({
    data: {
      deviceId,
      name: parsed?.name || deviceName,
      role: deviceData.group === "dev" ? "dev" : "user",
      language: parsed?.language ?? "en",
      value: parsed?.value ?? 1.5,
    },
  });

  console.log(`User created: ${user.name} (Device ID: ${deviceId})`);
  return user;
}

export async function deleteUser(deviceId: string): Promise<void> {
  const numericDeviceId = Number(deviceId);

  await prismaClient.user.delete({
    where: { deviceId: numericDeviceId },
  });

  console.log(`User with device ID ${numericDeviceId} deleted successfully.`);
}
