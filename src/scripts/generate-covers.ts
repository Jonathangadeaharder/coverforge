import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { generateMultiCoverPlan } from "../lib/coverEngine";
import { compileTypst, generateTypstCode } from "../lib/coverTypst";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serien-Metadaten: Beschreibungen triggern semantische Keywords der Engine.
const SERIES_METADATA = [
  {
    key: "taskmaster-sweden",
    title: "BÄST I TEST",
    genre: "Comedy / Show",
    description:
      "A Swedish game show. An old woman, Babben, with glasses, royal prestige gold palette, prestige typography, short hair.",
  },
  {
    key: "extra-english",
    title: "EXTRA ENGLISH",
    genre: "Comedy / Learning",
    description:
      "An English learning sitcom. A young adult woman, Annie, with long blond hair, none accessory, pastel indie palette, arthouse typography.",
  },
  {
    key: "extra-french",
    title: "EXTRA FRENCH",
    genre: "Comedy / Learning",
    description:
      "A French learning sitcom. A young adult woman, Sacha, with long brown hair, none accessory, pastel indie palette, arthouse typography.",
  },
  {
    key: "extra-spanish",
    title: "EXTRA SPANISH",
    genre: "Comedy / Learning",
    description:
      "A Spanish learning sitcom. A young adult woman, Lola, with long blond hair, none accessory, sunny warm comedy palette, arthouse typography.",
  },
  {
    key: "jojo-sucht-das-glueck",
    title: "JOJO SUCHT DAS GLÜCK",
    genre: "Drama / Romance",
    description:
      "Eine romantische deutsche Telenovela. A young adult woman, Jojo, with long brown hair, none accessory, romance love palette, prestige typography.",
  },
  {
    key: "lmaktoub",
    title: "LMAKTOUB",
    genre: "Drama / Telenovela",
    description:
      "A Moroccan drama series. A young adult woman, Hind, with long black hair, none accessory, sunset drama blood palette, prestige typography.",
  },
  {
    key: "nicos-weg",
    title: "NICOS WEG",
    genre: "Drama / Learning",
    description:
      "A German learning drama series. A young adult man, Nico, with short black hair, beard bart, neon cyber palette, arthouse typography.",
  },
];

const OUTPUT_DIR = path.resolve(
  __dirname,
  "../../../Vidiom/web/static/catalog-covers",
);

async function main() {
  console.log("Generating covers for all catalog series...");

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Creating output directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const item of SERIES_METADATA) {
    console.log(`Generating cover for: ${item.title}`);

    const plan = await generateMultiCoverPlan(
      item.title,
      item.description,
      item.genre,
    );
    const typstCode = generateTypstCode(plan.main, plan.characters, item.title);

    const filename = `${item.key}.svg`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    await compileTypst(typstCode, outputPath);

    console.log(`Saved: ${outputPath}`);

    console.log(`  Characters: ${plan.characters.length}`);
    for (let i = 0; i < plan.characters.length; i++) {
      const c = plan.characters[i];
      console.log(
        `    [Char ${i + 1}] Gender:${c.gender} Age:${c.age} Hair:${c.hairColorName}/${c.hairStyle} Expr:${c.expression} Prop:${c.prop}`,
      );
    }
  }

  console.log("All covers generated successfully!");
}

main().catch(console.error);
