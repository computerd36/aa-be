import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  // CORS_ORIGINS: "http://localhost:5173,https://aa-fe-dev.up.railway.app"
  CORS_ORIGINS: z
    .string()
    .transform((str) => str.split(",").map((url) => url.trim()))
    .pipe(
      z.array(z.string().url()).min(1, "At least one CORS origin is required")
    )
    .default("http://localhost:3000"),

  // SAIHEBRO API
  SAIHEBRO_API_BASE_URL: z.string().url(),
  SAIHEBRO_BASE_PORT: z.coerce.number().default(443),
  SAIHEBRO_API_KEY: z.string().min(1, "SAIHEBRO_API_KEY is required"),

  // POSTGRESQL DB
  DATABASE_URL: z.string().url(),
});

export const env = EnvSchema.parse(process.env);
