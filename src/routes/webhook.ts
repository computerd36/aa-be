import { Router, Request, Response } from "express";
import { z } from "zod";
import { createUser, deleteUser } from "../services/userService";

export const webhookRouter = Router();

// zod base schema for device actions
const DeviceActionSchema = z.object({
  action: z.enum(["add-device", "delete-device"]),
  id: z.string().regex(/^\d+$/),

  // only for add-device:
  name: z.string().optional(),
  group: z.string().optional(),
  guest: z.string().optional(),
});

// zod chema for message transmission confirmation
const MessageTransmissionSchema = z.object({
  status: z.number(),
  success: z.string(),
  available: z.number(),
  message_ids: z.string(),
});

// union zod schema to handle all possible payloads
export const PushSaferSchema = z.union([
  DeviceActionSchema,
  MessageTransmissionSchema,
  z.object({}).passthrough(), // allow other fields for debugging
]);

webhookRouter.post("/pushsafer", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Handle device actions
    const deviceActionResult = DeviceActionSchema.safeParse(body);
    if (deviceActionResult.success) {
      const data = deviceActionResult.data;

      if (data.action === "add-device") {
        await createUser({
          id: data.id,
          name: data.name,
          group: data.group,
          guest: data.guest,
        });
      } else if (data.action === "delete-device") {
        await deleteUser(data.id);
      }

      res.sendStatus(204);
      return;
    }

    // Handle message transmission confirmations
    const messageResult = MessageTransmissionSchema.safeParse(body);
    if (messageResult.success) {
      const data = messageResult.data;
      console.log(
        `Message transmission confirmed: ${data.success}, Available: ${data.available}`
      );
      res.sendStatus(204);
      return;
    }

    // loggign unhandled webhook types for debugging
    console.log("Unhandled webhook payload:", JSON.stringify(body, null, 2));
    res.sendStatus(204);
  } catch (err) {
    console.error("Webhook error", err);
    res.sendStatus(500);
  }
});

export default webhookRouter;
