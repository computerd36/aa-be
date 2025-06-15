import cors from "cors";
import express from "express";
import { env } from "./env";

export function configureCORS(app: express.Express) {
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
}
