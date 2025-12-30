import multer from "multer";
import { Router, Request, Response } from "express";
import { z } from "zod";
import { createUser, deleteUser } from "../services/userService";
import { logger } from "../logger";
import { requirePushsaferIP } from "~/middlewares/requirePushsaferIP";

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
  requirePushsaferIP,
  async (req: Request, res: Response) => {
    try {
      // Debug
      logger.info({ body: req.body }, "Raw req.body");
      logger.info({ json: req.body.json }, "req.body.json");
      logger.info({ contentType: req.headers["content-type"] }, "Content-Type");

      let body;

      // Check if we have a 'json' field in the multipart form data
      if (req.body.json) {
        try {
          body = JSON.parse(req.body.json);
          logger.info({ parsedBody: body }, "Parsed JSON from multipart field");
        } catch (parseError) {
          logger.error(
            { err: parseError, rawJson: req.body.json },
            "Failed to parse JSON from multipart field"
          );
          res.sendStatus(400);
          return;
        }
      } else {
        // Fallback to direct body
        body = req.body;
        logger.info({ body }, "Using direct body");
      }

      logger.info({ payload: body }, "Final processed payload");

      // Handle device actions
      const deviceActionResult = DeviceActionSchema.safeParse(body);
      if (deviceActionResult.success) {
        const data = deviceActionResult.data;

        switch (data.action) {
          case "add-device":
            // check if user already exists, if so delete old one
            try {
              await deleteUser(data.id);
              logger.info(`Existing user with ID ${data.id} deleted`);
            } catch (error) {
              logger.info(
                `No existing user found with ID ${data.id}, proceeding with creation`
              );
            }

            await createUser({
              id: data.id,
              name: data.name,
              group: data.group,
              guest: data.guest,
            });
            logger.info("User created successfully");
            break;
          case "delete-device":
            await deleteUser(data.id);
            logger.info("User deleted successfully");
            break;
          default:
            logger.warn(
              { action: data.action, id: data.id },
              "Unhandled action"
            );
            break;
        }

        res.sendStatus(204);
        return;
      }

      // Handle message transmission confirmations
      const messageResult = MessageTransmissionSchema.safeParse(body);
      if (messageResult.success) {
        const data = messageResult.data;
        logger.info(
          `Message transmission confirmed: ${data.success}, Available: ${data.available}`
        );
        res.sendStatus(204);
        return;
      }

      // Log unhandled webhook types for debugging
      logger.info({ payload: body }, "Unhandled webhook payload");
      res.sendStatus(204);
    } catch (err) {
      logger.error({ err }, "Webhook error");
      res.sendStatus(500);
    }
  }
);

export default webhookRouter;
