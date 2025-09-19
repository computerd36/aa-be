import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseSaihDateTime, now, nowTimestamp, toAppTimezone, nowFormatted } from "./time";

describe("Time utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("nowTimestamp", () => {
    it("returns current UTC timestamp", () => {
      const mockTime = new Date("2025-07-06T12:00:00.000Z").getTime();
      vi.setSystemTime(mockTime);

      expect(nowTimestamp()).toBe(mockTime);
    });
  });

  describe("now", () => {
    it("returns current time as Date object", () => {
      const mockTime = new Date("2025-07-06T12:00:00.000Z");
      vi.setSystemTime(mockTime);

      const currentTime = now();

      expect(currentTime).toBeInstanceOf(Date);
      expect(currentTime.getTime()).toBe(mockTime.getTime());
    });
  });

  describe("parseSaihDateTime", () => {
    it("converts Madrid time to UTC (summer time)", () => {
      const input = "2025-07-06 14:30:00"; // Madrid time
      const date = parseSaihDateTime(input);

      // Madrid is UTC+2 in summer, so 14:30 Madrid = 12:30 UTC
      expect(date.toISOString()).toBe("2025-07-06T12:30:00.000Z");
    });

    it("converts Madrid time to UTC (winter time)", () => {
      const input = "2025-01-06 14:30:00"; // Madrid time
      const date = parseSaihDateTime(input);

      // Madrid is UTC+1 in winter, so 14:30 Madrid = 13:30 UTC
      expect(date.toISOString()).toBe("2025-01-06T13:30:00.000Z");
    });
  });

  describe("toAppTimezone", () => {
    it("formats UTC date in Madrid timezone", () => {
      const utcDate = new Date("2025-07-06T12:00:00.000Z");
      const madridString = toAppTimezone(utcDate);

      // Madrid time should be UTC+2 in summer (CEST)
      expect(madridString).toBe("2025-07-06 14:00:00");
    });

    it("handles winter time correctly", () => {
      const utcDate = new Date("2025-01-06T12:00:00.000Z");
      const madridString = toAppTimezone(utcDate);

      // Madrid time should be UTC+1 in winter (CET)
      expect(madridString).toBe("2025-01-06 13:00:00");
    });
  });

  describe("nowFormatted", () => {
    it("returns current time formatted in Madrid timezone", () => {
      vi.setSystemTime(new Date("2025-07-06T12:00:00.000Z"));

      const formatted = nowFormatted();

      expect(formatted).toBe("2025-07-06 14:00:00");
    });
  });
});
