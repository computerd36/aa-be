import express from "express";
import { prismaClient } from "../prisma/prismaClient";
import { env } from "./env";

// let waterDataScheduler run on server start
import "./jobs/waterDataScheduler";

// routers
import webhookRouter from "./routes/webhook";
import statusRouter from "./routes/status";

// utils
import { rateLimiter } from "./utils/ratelimit";
import { configureCORS } from "./configureCORS";
import { logger } from "./logger";

// express initialization
const app = express();
const port = env.PORT;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// set trust proxy for correct client IP retrieval (pushsafer allowed ips check)
app.set("trust proxy", 1);

// CORS setup
configureCORS(app);

async function main() {
  app.get("/", (req, res) => {
    res.send("AlertAigües API is running!");
  });

  app.use("/webhook", webhookRouter);
  app.use("/status", statusRouter);

  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  await prismaClient.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch(async (e) => {
  logger.error({ err: e }, "Failed to start server");
  await prismaClient.$disconnect();
  process.exit(1);
});
