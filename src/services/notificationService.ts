import { MessageType } from "@prisma/client";
import { env } from "../env";
import { prismaClient } from "../../prisma/prismaClient";
import { logger } from "~/logger";

// inteface for sendNotification parameters
interface SendNotificationParams {
  type: MessageType;
  title: string;
  message: string;
  deviceId: string;
  userId: string;
  isCritical: boolean;
  url?: string;
  urlTitle?: string;
}

let push = require("pushsafer-notifications");

let p = new push({
  k: env.PUSHSAFER_PRIVATE_KEY,
  debug: env.NODE_ENV === "development",
});

/**
 * Sends a notification using the Pushsafer service.
 *
 * @param {SendNotificationParams} params - The notification parameters.
 * @returns {Promise<boolean>} - A promise that resolves to true if the notification was sent successfully, false otherwise.
 */
export function sendNotificationAsync({
  type,
  title,
  message,
  deviceId,
  userId,
  isCritical,
  url,
  urlTitle,
}: SendNotificationParams): Promise<boolean> {
  return new Promise((resolve) => {
    const msg = {
      t: title,
      m: message,
      s: isCritical ? 62 : 12,
      v: isCritical ? 3 : 1,
      i: isCritical ? 74 : 4,
      d: deviceId,
      u: url,
      ut: urlTitle,
    };

    p.send(msg, async (err: Error, result: any) => {
      const success = !err;

      try {
        await prismaClient.notification.create({
          data: {
            deviceId: deviceId,
            userId: userId,
            type: type,
            title: title,
            message: message,
            success: success,
            errorMessage: err ? err.message : null,
          },
        });
      } catch (error_) {
        logger.error({ err: error_ }, "Failed to log notification");
      }

      if (err) {
        logger.error(
          { err, result },
          "Pushsafer notification failed"
        );
        resolve(false);
      } else {
        logger.info({ result }, "Pushsafer notification sent");
        resolve(true);
      }
    });
  });
}
