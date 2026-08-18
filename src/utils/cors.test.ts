import { describe, it, expect } from "vitest";
import { normalizeOrigin } from "./cors";

describe("normalizeOrigin", () => {
  it("strips a trailing slash", () => {
    expect(normalizeOrigin("https://alertaigua.es/")).toBe(
      "https://alertaigua.es"
    );
  });

  it("strips repeated trailing slashes", () => {
    expect(normalizeOrigin("https://alertaigua.es///")).toBe(
      "https://alertaigua.es"
    );
  });

  it("leaves an already normalized origin untouched", () => {
    expect(normalizeOrigin("https://alertaigua.es")).toBe(
      "https://alertaigua.es"
    );
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeOrigin("  https://alertaigua.es/  ")).toBe(
      "https://alertaigua.es"
    );
  });

  it("keeps the port", () => {
    expect(normalizeOrigin("http://localhost:5173/")).toBe(
      "http://localhost:5173"
    );
  });
});