import { prismaClient } from "../prisma/prismaClient";
import "./jobs/waterDataCron";
import express from "express";

//router
import muteRouter from "./routes/mute";
import webhookRouter from "./routes/webhook";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {
  app.get("/", (req, res) => {
    res.send("AlertAigües API is running!");
  });

  app.use("/mute", muteRouter);
  app.use("/webhook", webhookRouter);

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
