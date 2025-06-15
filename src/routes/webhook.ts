import multer from "multer";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { createUser, deleteUser } from "../services/userService";

const webhookRouter = Router();

// Configure multer to handle multipart/form-data
const upload = multer();

// zod base schema for device actions
const DeviceActionSchema = z.object({
  action: z.enum(["add-device", "delete-device"]),
  id: z.string().regex(/^\d+$/),

  // only for add-device:
  name: z.string().optional(),
  group: z.string().optional(),
  guest: z.string().optional(),
});

// zod schema for message transmission confirmation
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

webhookRouter.post(
  "/pushsafer",
  upload.none(),
  async (req: Request, res: Response) => {
    try {
      // Debug
      console.log("Raw req.body:", req.body);
      console.log("req.body.json:", req.body.json);
      console.log("Content-Type:", req.headers["content-type"]);

      let body;

      // Check if we have a 'json' field in the multipart form data
      if (req.body.json) {
        try {
          body = JSON.parse(req.body.json);
          console.log("Parsed JSON from multipart field:", body);
        } catch (parseError) {
          console.error(
            "Failed to parse JSON from multipart field:",
            parseError
          );
          console.log("Raw json field content:", req.body.json);
          res.sendStatus(400);
          return;
        }
      } else {
        // Fallback to direct body
        body = req.body;
        console.log("Using direct body:", body);
      }

      console.log("Final processed payload:", JSON.stringify(body, null, 2));

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
          console.log("User created successfully");
        } else if (data.action === "delete-device") {
          await deleteUser(data.id);
          console.log("User deleted successfully");
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

      // Log unhandled webhook types for debugging
      console.log("Unhandled webhook payload:", JSON.stringify(body, null, 2));
      res.sendStatus(204);
    } catch (err) {
      console.error("Webhook error", err);
      res.sendStatus(500);
    }
  }
);

export default webhookRouter;
