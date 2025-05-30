import { Router } from "express";
import { z } from "zod";
import { upsertDevice } from "../services/deviceService";

const webhookRouter = Router();

export const PushSaferSchema = z.object({
  action: z.enum(["add-device", "delete-device"]),
  id: z.string().regex(/^\d+$/),
  name: z.string(),
  group: z.string(),
  guest: z.string(),
});

webhookRouter.post("/pushsafer", async (req, res) => {
  try {
    const body = PushSaferSchema.parse(req.body);

    if (body.action === "add-device") {
      await upsertDevice(body);
    }
    // implement delete action TODO

    res.sendStatus(204);
  } catch (err) {
    console.error("Webhook error", err);
    res.sendStatus(400);
  }
});

export default webhookRouter;
