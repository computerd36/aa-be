import { describe, it, expect } from "vitest";
import { parseDeviceName } from "./devicename";
import { SUPPORTED_LANGUAGES } from "../constants/constants";

describe("parseDeviceName", () => {
  it("parses a valid device name with level correctly", () => {
    const name = "Alice-en-level-1.23";
    const result = parseDeviceName(name);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      name: "Alice",
      language: "en",
      metric: "level",
      value: 1.2,
    });
  });

  it("parses a valid device name with flowrate correctly", () => {
    const name = "Bob-ES-flowrate-3.45";
    const result = parseDeviceName(name);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      name: "Bob",
      language: "es",
      metric: "flowrate",
      value: 3.5,
    });
  });

  it("returns null for incorrect segment count", () => {
    expect(parseDeviceName("Too-Few-Parts")).toBeNull();
    expect(parseDeviceName("One-Two-Three-Four-Five")).toBeNull();
  });

  it("returns null for username too short or too long", () => {
    expect(parseDeviceName("Al-en-level-1.0")).toBeNull(); // name too short
    const longName = "A".repeat(21) + "-en-level-1.0";
    expect(parseDeviceName(longName)).toBeNull(); // name too long
  });

  it("returns null for non-numeric value segment", () => {
    expect(parseDeviceName("Alice-en-level-xyz")).toBeNull();
  });

  it("returns null for unsupported language", () => {
    expect(parseDeviceName("Alice-xx-level-1.0")).toBeNull();
    expect(SUPPORTED_LANGUAGES.includes("xx")).toBe(false);
  });

  it("returns null for invalid metric", () => {
    expect(parseDeviceName("Alice-en-temperature-1.0")).toBeNull();
  });

  it("handles whitespace and trimming correctly", () => {
    const name = "  Carol  -  en  -  level  -  2.67  ";
    const result = parseDeviceName(name);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      name: "Carol",
      language: "en",
      metric: "level",
      value: 2.7,
    });
  });

  it("supports all SUPPORTED_LANGUAGES", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const name = `User-${lang}-level-4.00`;
      const result = parseDeviceName(name);
      expect(result).not.toBeNull();
      expect(result?.language).toBe(lang);
    }
  });
});
