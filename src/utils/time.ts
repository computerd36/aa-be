import { APP_TIMEZONE } from "../constants/constants";

/**
 * Get current timestamp in UTC (for comparisons and calculations)
 */
export function nowTimestamp(): number {
  return Date.now();
}

/**
 * Get current time as Date object in app timezone
 * Returns a Date object that when displayed will show Madrid time
 */
export function now(): Date {
  return new Date();
}

/**
 * Parse SAIH Ebro sensor timestamp string into Date object
 * SAIH Ebro timestamps are in Madrid local time format: "YYYY-MM-DD HH:mm:ss"
 * Convert from Madrid local time to UTC
 */
export function parseSaihDateTime(s: string): Date {
  // Parse date components
  const [datePart, timePart] = s.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  // Create a date representing this time in Madrid timezone
  // Use a temporary date to determine the offset
  const tempDate = new Date(year, month - 1, day, hour, minute, second);

  // Get the timezone offset for Madrid at this date (handles DST)
  const madridOffsetMs = getMadridTimezoneOffset(tempDate);

  // Create UTC date by subtracting the Madrid offset
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - madridOffsetMs);
}

/**
 * Get Madrid timezone offset in milliseconds for a given date
 */
function getMadridTimezoneOffset(date: Date): number {
  // Use Intl.DateTimeFormat to get the offset
  const utcDate = new Date(date.getTime());
  const madridDate = new Date(utcDate.toLocaleString("en-US", { timeZone: APP_TIMEZONE }));
  const utcTime = new Date(utcDate.toLocaleString("en-US", { timeZone: "UTC" }));

  return madridDate.getTime() - utcTime.getTime();
}

/**
 * Convert any Date to app timezone for display
 * Returns a formatted string in app timezone
 */
export function toAppTimezone(date: Date): string {
  return date.toLocaleString("sv-SE", {
    timeZone: APP_TIMEZONE,
  });
}

/**
 * Get current time formatted in app timezone
 */
export function nowFormatted(): string {
  return toAppTimezone(new Date());
}
