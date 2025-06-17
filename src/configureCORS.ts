import cors from "cors";
import express from "express";
import { env } from "./env";

export function configureCORS(app: express.Express) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // no origin allowed so postman works

        // check if the origin is in the allowed CORS origins
        if (env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          console.log("CORS blocked for origin:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
}
