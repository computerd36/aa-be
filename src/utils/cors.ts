/**
 * Brings an origin into the form browsers actually send in the `Origin`
 * header: scheme + host + optional port, with no trailing slash. Keeps a
 * configured origin like "https://alertaigua.es/" from silently failing to
 * match the "https://alertaigua.es" the browser sends.
 */
export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}
