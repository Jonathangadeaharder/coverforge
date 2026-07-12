import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import type { Recipe } from "./coverEngine";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to escape Typst strings
function esc(str: string): string {
  return str.replace(/["\\]/g, "\\$&");
}

// Formats a single JS Recipe object into a Typst dictionary
function formatRecipe(r: Recipe): string {
  const p = r.palette;
  return `(
    gender: "${r.gender}",
    age: "${r.age}",
    body: "${r.body}",
    hair-style: ${r.hairStyle},
    hair-color: "${r.hairColor}",
    eye-color: "${r.eyeColor}",
    skin-tone: "${r.skinTone}",
    accessory: "${r.accessory}",
    expression: "${r.expression}",
    clothing-style: "${r.clothingStyle}",
    clothing-pattern: "${r.clothingPattern}",
    prop: "${r.prop}",
    scene-element: "${r.sceneElement}",
    palette: (
      bg-top: "${p.bgTop}",
      bg-bottom: "${p.bgBottom}",
      accent: "${p.accent}",
      glow: "${p.glow}",
      text: "${p.text}",
      ambient: "${p.ambient}",
      shape: "${p.shape}",
      clothing: "${p.clothing}",
    ),

    typography: "${r.typography}",
    genre: "${r.genre}",
    hash: "${r.hash}",
  )`;
}

// Generates Typst code that imports coverforge.typ and calls render-cover
export function generateTypstCode(
  mainRecipe: Recipe,
  characterRecipes: Recipe[],
  titleText: string,
): string {
  const mainFormatted = formatRecipe(mainRecipe);
  const charsFormatted = characterRecipes.map(formatRecipe).join(",\n");
  const templatePath = "/src/lib/coverforge.typ";

  return `
#import "${templatePath}": render-cover

#render-cover(
  ${mainFormatted},
  (
    ${charsFormatted},
  ),
  "${esc(titleText)}",
  "${esc(mainRecipe.genre)}"
)

`;
}

// Compiles generated Typst code to SVG/PNG using the local Typst CLI
export async function compileTypst(
  typstCode: string,
  outputPath: string,
): Promise<string> {
  const tmpDir = path.resolve(process.cwd(), ".temp-typst");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const inputPath = path.join(tmpDir, `cover-${Date.now()}.typ`);
  fs.writeFileSync(inputPath, typstCode, "utf-8");

  try {
    // Run local typst compiler with --root set to project root
    await execAsync(
      `/opt/homebrew/bin/typst compile --root "${process.cwd()}" "${inputPath}" "${outputPath}"`,
    );
    return outputPath;
  } finally {
    // Clean up temporary Typst source file
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
  }
}
