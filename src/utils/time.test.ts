import { describe, it, expect } from "vitest";
import { parseLocalDateTime } from "./time";

describe("parseLocalDateTime", () => {
  it("parses a standard timestamp string correctly", () => {
    const input = "2025-07-06 14:30:00";
    const date = parseLocalDateTime(input);
    expect(date.toISOString()).toBe("2025-07-06T12:30:00.000Z"); // utc offset (+2 hours)
  });
});
