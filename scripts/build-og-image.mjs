#!/usr/bin/env node
/**
 * Rasterises public/og-default.svg into public/og-default.png.
 *
 * Open Graph consumers — Slack, LinkedIn, X, iMessage — do not render SVG, so
 * the PNG is the file that actually ships. The SVG is the editable source; this
 * keeps the two from drifting.
 *
 * Run after editing the SVG:  npm run og
 *
 * @resvg/resvg-js is imported on demand and is not a declared dependency — see
 * the note at the import below.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// Imported on demand rather than declared as a dependency. The card changes
// about as often as the brand does, the PNG is committed, and this repo's CI
// runs `bun install --frozen-lockfile` — so adding a dependency that only a
// manual script needs would cost every build an install for nothing.
let Resvg;
try {
  ({ Resvg } = await import("@resvg/resvg-js"));
} catch {
  console.error(
    "This script needs @resvg/resvg-js, which is deliberately not a dependency.\n" +
      "Install it just for this run, then re-run:\n\n" +
      "  bun add -d @resvg/resvg-js && bun run og && bun remove @resvg/resvg-js\n",
  );
  process.exit(1);
}

const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = readFileSync(join(pub, "og-default.svg"), "utf8");

// 1200x630 is the size Facebook, LinkedIn and X all document for a large card.
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();

writeFileSync(join(pub, "og-default.png"), png);
console.log(`✓ Wrote public/og-default.png (${png.length.toLocaleString()} bytes)`);
