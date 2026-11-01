/**
 * Regenerates the demo table QR codes in docs/qr/.
 *
 *   node scripts/generate-qr.mjs
 *
 * Payloads must match lib/qr.js -> buildTableQr().
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "qr");

const TABLES = [
  { file: "spice-route-table-2.png", restaurantId: "r1", tableId: "t2", label: "Spice Route · Table 2" },
  { file: "dosa-junction-table-1.png", restaurantId: "r2", tableId: "t5", label: "Dosa Junction · Table 1" },
  { file: "charminar-table-1.png", restaurantId: "r3", tableId: "t6", label: "Charminar Biryani · Table 1" },
];

await mkdir(outDir, { recursive: true });

for (const t of TABLES) {
  const payload = `MENUMATE:${t.restaurantId}:${t.tableId}`;

  await QRCode.toFile(join(outDir, t.file), payload, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#000000ff", light: "#ffffffff" },
  });

  console.log(`${t.file.padEnd(30)} ${payload}  (${t.label})`);
}

console.log(`\n${TABLES.length} codes written to docs/qr/`);
