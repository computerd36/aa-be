import { Prisma } from "@prisma/client";
import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { logger } from "../logger";
import { requirePushsaferSecret } from "../middlewares/requirePushsaferSecret";
import { createUser, deleteUser } from "../services/userService";

const webhookRouter = Router();

// Pushsafer posts its webhooks as multipart/form-data
const upload = multer();

const DeviceIdSchema = z.string().regex(/^\d+$/);

// zod schemas for device actions. `name` is only sent on add-device, and
// createUser cannot work without it, so it is required there and absent here.
const AddDeviceSchema = z.object({
  action: z.literal("add-device"),
  id: DeviceIdSchema,
  name: z.string(),
  group: z.string().optional(),
});

const DeleteDeviceSchema = z.object({
  action: z.literal("delete-device"),
  id: DeviceIdSchema,
});

const DeviceActionSchema = z.discriminatedUnion("action", [
  AddDeviceSchema,
  DeleteDeviceSchema,
]);

type DeviceAction = z.infer<typeof DeviceActionSchema>;

// any payload carrying an `action` field is meant to be a device action,
// even when it fails the stricter validation above
const DeviceActionShapeSchema = z.object({ action: z.string() });

// zod schema for message transmission confirmation
const MessageTransmissionSchema = z.object({
  status: z.number(),
  success: z.string(),
  available: z.number(),
  message_ids: z.string(),
});

/**
 * Pushsafer sends the payload either as a `json` field inside the multipart
 * form data or directly as the request body.
 *
 * @throws {SyntaxError} If the `json` field contains malformed JSON.
 */
function extractPayload(req: Request): unknown {
  const rawJson = req.body?.json;

  if (!rawJson || typeof rawJson !== "string") return req.body;

  return JSON.parse(rawJson);
}

/** Prisma's "record to delete does not exist" error. */
function isRecordNotFoundError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

async function handleDeviceAction(data: DeviceAction): Promise<void> {
  if (data.action === "delete-device") {
    await deleteUser(data.id);
    logger.info({ deviceId: data.id }, "User deleted successfully");
    return;
  }

  // add-device: drop the user still registered for this device, if any.
  // Anything other than "no such user" is a real failure and must bubble up.
  try {
    await deleteUser(data.id);
    logger.info({ deviceId: data.id }, "Existing user deleted");
  } catch (err) {
    if (!isRecordNotFoundError(err)) throw err;

    logger.info(
      { deviceId: data.id },
      "No existing user found, proceeding with creation"
    );
  }

  await createUser({
    id: data.id,
    name: data.name,
    group: data.group,
  });
  logger.info({ deviceId: data.id }, "User created successfully");
}

webhookRouter.post(
  "/pushsafer",
  requirePushsaferSecret,
  upload.none(),
  async (req: Request, res: Response) => {
    let payload: unknown;

    try {
      payload = extractPayload(req);
    } catch (err) {
      logger.error(
        { err, rawJson: req.body?.json },
        "Failed to parse JSON from multipart field"
      );
      res.sendStatus(400);
      return;
    }

    logger.debug(
      { payload, contentType: req.headers["content-type"] },
      "Pushsafer webhook received"
    );

    try {
      // Handle device actions
      const deviceActionResult = DeviceActionSchema.safeParse(payload);
      if (deviceActionResult.success) {
        await handleDeviceAction(deviceActionResult.data);
        res.sendStatus(204);
        return;
      }

      // A device action that does not validate (e.g. add-device without a
      // name) cannot be processed and will not succeed on a retry either.
      if (DeviceActionShapeSchema.safeParse(payload).success) {
        logger.warn(
          { payload, issues: deviceActionResult.error.issues },
          "Invalid device action payload"
        );
        res.sendStatus(400);
        return;
      }

      // Handle message transmission confirmations
      const messageResult = MessageTransmissionSchema.safeParse(payload);
      if (messageResult.success) {
        const { success, available } = messageResult.data;
        logger.info({ success, available }, "Message transmission confirmed");
        res.sendStatus(204);
        return;
      }

      // Log unhandled webhook types for debugging
      logger.info({ payload }, "Unhandled webhook payload");
      res.sendStatus(204);
    } catch (err) {
      logger.error({ err }, "Webhook error");
      res.sendStatus(500);
    }
  }
);

export default webhookRouter;
