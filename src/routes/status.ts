import { Router } from "express";
import { getStatus } from "../services/statusService";

const statusRouter = Router();

statusRouter.get("/", async (req, res) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

export default statusRouter;
