import cors from "cors";
import express from "express";
import { env } from "./env";

export function configureCORS(app: express.Express) {
  console.log("CORS Origins configured:", env.CORS_ORIGINS);

  app.use(
    cors({
      origin: (origin, callback) => {
        console.log("CORS request from origin:", origin);
        console.log("Allowed origins:", env.CORS_ORIGINS);

        if (!origin) return callback(null, true);

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
