import cors from "cors";
import express from "express";
import { env } from "./env";
import { logger } from "./logger";

export function configureCORS(app: express.Express) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // no origin allowed so postman works

        // check if the origin is in the allowed CORS origins
        if (env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          logger.info({ origin }, `CORS origin blocked: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
}
