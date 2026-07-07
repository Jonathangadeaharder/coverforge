import * as fs from 'fs';
import * as path from 'path';
import { generateMultiCoverPlan } from '../lib/coverEngine';
import { buildCoverSVG, buildMultiCoverSVG } from '../lib/coverSvg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serien-Metadaten: Beschreibungen triggern semantische Keywords der Engine.
// `multi: true` descriptions name 2+ characters → multi-character cover.
const SERIES_METADATA = [
  {
    key: 'taskmaster-sweden',
    title: 'BÄST I TEST',
    genre: 'Comedy / Show',
    description: 'A Swedish game show. An old woman, Babben, with glasses, royal prestige gold palette, prestige typography, short hair.',
  },
  {
    key: 'extra-english',
    title: 'EXTRA ENGLISH',
    genre: 'Comedy / Learning',
    description: 'An English learning sitcom. Two friends, Annie a young adult woman with long blond hair and Hector a young adult man with short brown hair, none accessory, pastel indie palette, arthouse typography.',
  },
  {
    key: 'extra-french',
    title: 'EXTRA FRENCH',
    genre: 'Comedy / Learning',
    description: 'A French learning sitcom. Two friends, Sacha a young adult woman with long brown hair and Nico a young adult man with short black hair, none accessory, pastel indie palette, arthouse typography.',
  },
  {
    key: 'extra-spanish',
    title: 'EXTRA SPANISH',
    genre: 'Comedy / Learning',
    description: 'A Spanish learning sitcom. Two friends, Lola a young adult woman with long blond hair and Pablo a young adult man with short black hair, none accessory, sunny warm comedy palette, arthouse typography.',
  },
  {
    key: 'jojo-sucht-das-glueck',
    title: 'JOJO SUCHT DAS GLÜCK',
    genre: 'Drama / Romance',
    description: 'Eine romantische deutsche Telenovela. A young adult woman, Jojo, with long brown hair, none accessory, romance love palette, prestige typography.',
  },
  {
    key: 'lmaktoub',
    title: 'LMAKTOUB',
    genre: 'Drama / Telenovela',
    description: 'A Moroccan drama series. Two friends, Hind a young adult woman with long black hair and a young adult man with short dark hair, none accessory, sunset drama blood palette, prestige typography.',
  },
  {
    key: 'nicos-weg',
    title: 'NICOS WEG',
    genre: 'Drama / Learning',
    description: 'A German learning drama series. A young adult man, Nico, with short black hair, beard bart, neon cyber palette, arthouse typography.',
  },
];

const OUTPUT_DIR = path.resolve(__dirname, '../../../Vidiom/web/static/catalog-covers');

async function main() {
  console.log('Generating covers for all catalog series...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Creating output directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const item of SERIES_METADATA) {
    console.log(`Generating cover for: ${item.title}`);

    const plan = await generateMultiCoverPlan(item.title, item.description, item.genre);
    const isMulti = plan.characters.length > 1;
    const svgContent = isMulti
      ? buildMultiCoverSVG(plan.main, plan.characters, item.title)
      : buildCoverSVG(plan.main, item.title);

    const filename = `${item.key}.svg`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, svgContent, 'utf-8');

    const charSummary = plan.characters
      .map((c, i) => `char${i + 1}=${c.gender}/${c.hairStyle}/${c.expression}/${c.clothingStyle}`)
      .join(' ');
    console.log(`Saved: ${outputPath}`);
    console.log(`  multi=${isMulti ? plan.characters.length + ' chars' : 'single'} Palette:${plan.main.palette.name} Scene:${plan.main.sceneElement} | ${charSummary}`);
  }

  console.log('All covers generated successfully!');
}

main().catch(console.error);
