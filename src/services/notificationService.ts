import { env } from "../env";
let push = require("pushsafer-notifications");

let p = new push({
  k: env.PUSHSAFER_PRIVATE_KEY,
  debug: env.NODE_ENV === "development",
});

/**
 * Sends a notification using Pushsafer.
 *
 * @param {string} title - The title of the notification.
 * @param {string} message - The message content of the notification.
 * @param {string} device - The device identifier to send the notification to.
 * @param {boolean} [isCritical=false] - Whether the notification is critical (default is false).
 * @param {string} [url] - Optional URL to include in the notification.
 * @param {string} [urlTitle] - Optional title for the URL link in the notification.
 */
export function sendNotification(
  title: string,
  message: string,
  device: string,
  isCritical: boolean = false,
  url?: string,
  urlTitle?: string
) {
  let msg = {
    t: title,
    m: message,
    s: isCritical ? 62 : 12,
    v: isCritical ? 3 : 1,
    i: isCritical ? 74 : 4,
    d: device,
    u: url,
    ut: urlTitle,
  };

  p.send(msg, (err: Error, result: any) => {
    if (err) {
      console.error("Error sending Pushsafer notification:", err);
    } else {
      console.log("Pushsafer notification sent successfully:", result);
    }
  });
}
