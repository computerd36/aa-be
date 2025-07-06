import { getMessage } from "~/constants/messages";
import { prismaClient } from "../../prisma/prismaClient";
import { parseDeviceName } from "../utils/devicename";
import { sendNotification } from "./notificationService";
import { User } from "@prisma/client";

export async function createUser(deviceData: {
  id: string;
  name: string;
  group?: string;
  guest?: string;
}): Promise<User> {
  // TODO: remove this later
  console.log("Device name:", deviceData.name);

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
      language: parsed.language,
      value: parsed.value,
      role: deviceData.group === "dev" ? "dev" : "user",
    },
  });

  console.log(`User created: ${user.name} (Device ID: ${deviceId})`);

  // send test notification to the user

  const welcomeMessage = getMessage(user.language, "welcome");

  sendNotification(
    welcomeMessage.title,
    welcomeMessage.body(
      user.name,
      user.deviceId,
      user.language,
      user.value.toString(),
      user.metric as "level" | "flowrate"
    ),
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
