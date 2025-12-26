import { env } from "./env";
import pino from "pino";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});
