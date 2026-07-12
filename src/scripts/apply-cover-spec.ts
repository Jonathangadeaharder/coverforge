// CLI consumer of a CoverSpec JSON file. Validates the spec, maps it to engine
// recipes, renders a multi-character SVG cover, writes <slug>.svg.
// Usage: pnpm dlx tsx src/scripts/apply-cover-spec.ts <cover.json> [--out <dir>]
// Composes with the Python trainer's infer.py (subtitle → CoverSpec JSON).

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { coverSpecToPlan, validateCoverSpec } from "../lib/coverSpec";
import { buildCoverSVG, buildMultiCoverSVG } from "../lib/coverSvg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv: string[]): { specPath: string; outDir: string } {
  const positional = argv.filter((a) => !a.startsWith("--"));
  if (positional.length < 1) {
    console.error("Usage: apply-cover-spec.ts <cover.json> [--out <dir>]");
    process.exit(2);
  }
  const specPath = path.resolve(positional[0]);
  const outIdx = argv.indexOf("--out");
  const outDir =
    outIdx >= 0 && argv[outIdx + 1]
      ? path.resolve(argv[outIdx + 1])
      : path.resolve(__dirname, "../../../Vidiom/web/static/catalog-covers");
  return { specPath, outDir };
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cover"
  );
}

async function main(): Promise<void> {
  const { specPath, outDir } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(specPath)) {
    console.error(`CoverSpec file not found: ${specPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(specPath, "utf-8");
  let spec: unknown;
  try {
    spec = JSON.parse(raw);
  } catch (err) {
    console.error(`Invalid JSON in ${specPath}:`, err);
    process.exit(1);
  }

  // Validate against the canonical zod schema.
  let validated;
  try {
    validated = validateCoverSpec(spec);
  } catch (err) {
    console.error(`CoverSpec validation failed:`, err);
    process.exit(1);
  }

  const plan = await coverSpecToPlan(validated);
  const isMulti = plan.characters.length > 1;
  const svg = isMulti
    ? buildMultiCoverSVG(plan.main, plan.characters, plan.title)
    : buildCoverSVG(plan.main, plan.title);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const filename = `${slugify(plan.title)}.svg`;
  const outputPath = path.join(outDir, filename);
  fs.writeFileSync(outputPath, svg, "utf-8");

  console.log(`CoverSpec -> SVG: ${outputPath}`);
  console.log(
    `  multi=${isMulti ? plan.characters.length + " chars" : "single"} palette=${plan.main.palette.name} scene=${plan.main.sceneElement} typo=${plan.main.typography}`,
  );
  for (const [i, c] of plan.characters.entries()) {
    console.log(
      `  char${i + 1}: ${c.gender}/${c.age}/${c.hairStyle}/${c.expression}/${c.clothingStyle}/${c.prop}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
