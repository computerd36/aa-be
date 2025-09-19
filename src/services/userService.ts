import { getMessage } from "~/constants/messages";
import { prismaClient } from "../../prisma/prismaClient";
import { parseDeviceName } from "../utils/devicename";
import { sendNotification } from "./notificationService";
import { User } from "@prisma/client";

/**
 * Creates a new user in the database based on the provided device data.
 *
 * @param {Object} deviceData - The data of the device to create a user for.
 * @param {string} deviceData.id - The ID of the device.
 * @param {string} deviceData.name - The name of the device.
 * @param {string} [deviceData.group] - Optional group for the user (e.g., "dev").
 * @param {string} [deviceData.guest] - Optional guest identifier.
 *
 * @returns {Promise<User>} A promise that resolves to the created User object.
 * @throws {Error} If the device name format is invalid or if user creation fails.
 */
export async function createUser(deviceData: {
  id: string;
  name: string;
  group?: string;
  guest?: string;
}): Promise<User> {
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
      value: parsed.value / 100, // convert to m value (e.g., 75 cm -> 0.75 m)
      role: deviceData.group === "dev" ? "dev" : "user",
    },
  });

  console.log(`User created: ${user.name} (Device ID: ${deviceId})`);

  // send test notification to the user

  const welcomeMessage = getMessage(user.language, "welcome");

  sendNotification(
    "welcome",
    welcomeMessage.title,
    welcomeMessage.body(
      user.name,
      user.deviceId,
      user.language,
      user.value.toString(),
      user.metric as "level" | "flowrate"
    ),
    user.deviceId.toString(),
    user.id.toString(),
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
