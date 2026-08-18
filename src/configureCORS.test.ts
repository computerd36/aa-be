import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { configureCORS } from "./configureCORS";

const ALLOWED_ORIGIN = "https://alertaigua.es";
const BLOCKED_ORIGIN = "https://evil.example.com";

vi.mock("./env", () => ({
  env: {
    CORS_ORIGINS: ["https://alertaigua.es"],
  },
}));

vi.mock("./logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  configureCORS(app);
  app.get("/status", (_req, res) => {
    res.json({ ok: true });
  });

  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Expected server to be listening on a TCP port");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("configureCORS", () => {
  it("allows an origin on the allowlist", async () => {
    const res = await fetch(`${baseUrl}/status`, {
      headers: { Origin: ALLOWED_ORIGIN },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe(ALLOWED_ORIGIN);
  });

  it("allows requests without an Origin header, so tools like Postman work", async () => {
    const res = await fetch(`${baseUrl}/status`);

    expect(res.status).toBe(200);
  });

  describe("blocked origin", () => {
    it("omits the Access-Control-Allow-Origin header", async () => {
      const res = await fetch(`${baseUrl}/status`, {
        headers: { Origin: BLOCKED_ORIGIN },
      });

      expect(res.headers.get("access-control-allow-origin")).toBeNull();
    });

    it("does not turn the rejection into a server error", async () => {
      const res = await fetch(`${baseUrl}/status`, {
        headers: { Origin: BLOCKED_ORIGIN },
      });

      expect(res.status).toBe(200);
    });
  });
});
