import { Router } from "express";
import { getStatus } from "../services/statusService";
import { logger } from "../logger";

const statusRouter = Router();

statusRouter.get("/", async (req, res) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (error) {
    logger.error({ err: error }, "Error fetching status");
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

export default statusRouter;
