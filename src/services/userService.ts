import { prismaClient } from "../../prisma/prismaClient";
import { parseDeviceName } from "../utils/devicename";
import { sendNotification } from "./notificationService";

export async function createUser(deviceData: {
  id: string;
  name: string;
  group?: string;
  guest?: string;
}) {
  const deviceId = Number(deviceData.id);
  const deviceName = deviceData.name;
  const parsed = parseDeviceName(deviceName);

  if (!parsed) {
    throw new Error(`Invalid device name format: ${deviceName}`);
  }

  const user = await prismaClient.user.create({
    data: {
      deviceId,
      name: parsed.name,
      role: deviceData.group === "dev" ? "dev" : "user",
      language: parsed.language,
      value: parsed.value,
    },
  });

  console.log(`User created: ${user.name} (Device ID: ${deviceId})`);

  // send test notification to the user

  sendNotification(
    "Welcome to AlertAigua!",
    `Hello ${user.name}, your device has been successfully registered with AlertAigua with the following details:\n\nDevice ID: ${user.deviceId}\nRole: ${user.role}\nLanguage: ${user.language}\nValue: ${user.value}`,
    user.deviceId.toString(),
    false
  );

  return user;
}

export async function deleteUser(deviceId: string): Promise<void> {
  const numericDeviceId = Number(deviceId);

  await prismaClient.user.delete({
    where: { deviceId: numericDeviceId },
  });

  console.log(`User with device ID ${numericDeviceId} deleted successfully.`);
}
