import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  SAIHEBRO_API_BASE_URL: z.string().url(),
  SAIHEBRO_API_PATH: z.string().default("/datos/apiopendata"),
  SAIHEBRO_BASE_PORT: z.coerce.number().default(443),
  SAIHEBRO_API_KEY: z.string().min(1, "SAIHEBRO_API_KEY is required"),
  POSTGRES_DATABASE_URL: z.string().url().optional(),
});

export const env = EnvSchema.parse(process.env);
