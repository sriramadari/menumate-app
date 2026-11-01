/**
 * Table QR payload: a compact, human-readable triple so a scanned code is
 * recognisably ours and easy to type by hand when a camera isn't usable.
 *
 *   MENUMATE:r1:t2
 */
const PREFIX = "MENUMATE";

export function buildTableQr({ restaurantId, tableId }) {
  return `${PREFIX}:${restaurantId}:${tableId}`;
}

/** Returns { restaurantId, tableId } or null when the code isn't ours. */
export function parseTableQr(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return null;

  const parts = text.split(":");
  if (parts.length !== 3) return null;
  if (parts[0].toUpperCase() !== PREFIX) return null;

  const [, restaurantId, tableId] = parts;
  if (!restaurantId || !tableId) return null;

  return { restaurantId, tableId };
}
