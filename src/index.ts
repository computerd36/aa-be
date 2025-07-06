import express from "express";
import { prismaClient } from "../prisma/prismaClient";
import "./services/waterDataScheduler";
import { env } from "./env";

// routers
import webhookRouter from "./routes/webhook";
import statusRouter from "./routes/status";

// utils
import { rateLimiter } from "./utils/ratelimit";
import { configureCORS } from "./configureCORS";

// express initialization
const app = express();
const port = env.PORT;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// CORS setup
configureCORS(app);

async function main() {
  app.get("/", (req, res) => {
    res.send("AlertAigües API is running!");
  });

  app.use("/webhook", webhookRouter);
  app.use("/status", statusRouter);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
