// parsing a saih ebro sensor timestamp string into js date object
export function parseLocalDateTime(s: string): Date {
  return new Date(s.replace(" ", "T"));
}
