import { env } from "../env";
let push = require("pushsafer-notifications");

let p = new push({
  k: env.PUSHSAFER_PRIVATE_KEY,
  debug: env.NODE_ENV === "development",
});

export function sendNotification(
  title: string,
  message: string,
  device: string,
  critical: boolean = false,
  url?: string,
  urlTitle?: string
) {
  let msg = {
    t: title,
    m: message,
    s: critical ? 2 : 1, // 2 is critical alert, 1 is normal
    v: critical ? 3 : 1, // 2 is strong vibration, 1 is normal vibration
    // i: critical ? "CRITICAL ICON URL HERE" : "NORMAL ICON URL HERE", // TODO: create icons, serve to cloudinary and add ulrs here
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
