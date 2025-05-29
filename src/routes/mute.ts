import { Router, Request, Response } from "express";
import { muteDevice, unmuteDevice } from "../services/muteService";

const muteRouter = Router();

muteRouter.post(
  "/mute/:deviceId/:duration",
  async (req: Request, res: Response) => {
    const deviceId = Number(req.params.deviceId);
    const duration = Number(req.params.duration);
    if (
      isNaN(deviceId) ||
      isNaN(duration) ||
      (duration !== 3 && duration !== 6 && duration !== 12 && duration !== 24)
    ) {
      res.status(400).json({ error: "Invalid deviceId or duration" });
      return;
    }

    await muteDevice(deviceId, duration);

    res.json({ ok: true, mutedFor: "3h" });
  }
);

muteRouter.post("/unmute/:deviceId", async (req: Request, res: Response) => {
  await unmuteDevice(Number(req.params.deviceId));
  res.json({ ok: true });
});

export default muteRouter;
