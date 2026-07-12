// CoverSpec v1.0 — renderer-agnostic cover description.
// This is the SOLE contract between any model that analyses an episode
// and the coverforge rendering engine. Another model may produce a
// CoverSpec JSON; another engine may consume it. The schema lives at
// ../coverforge-trainer/schema/cover-spec.schema.json (canonical).
//
// The TS consumer maps neutral English enums to the engine's German-internal
// Recipe fields, resolves palette name -> full Palette object (hex stays
// engine-side), and fills any omitted fields deterministically from the hash
// so a partial spec still yields a complete, reproducible cover.

import { z } from "zod";
import {
  type Accessory,
  type Age,
  type Body,
  buildRecipe,
  type ClothingPattern,
  type ClothingStyle,
  type Expression,
  type Gender,
  normalize,
  PALETTES,
  type Palette,
  type Prop,
  type Recipe,
  type SceneElement,
  sha256Hex,
  type TypographyStyle,
} from "./coverEngine";

// --- Zod schema (mirrors schema/cover-spec.schema.json) ------------------

const moodSchema = z
  .strictObject({
    palette: z
      .enum([
        "noir-thriller",
        "neon-cyber",
        "sonnen-komoedie",
        "pastell-indie",
        "waldschatten",
        "blut-sonnenuntergang",
        "royal-prestige",
        "eis-stahl",
      ])
      .optional(),
    sceneElement: z
      .enum(["none", "skyline", "mountains", "stars", "clouds", "confetti"])
      .optional(),
    typography: z
      .enum(["blockbuster", "prestige", "scifi", "arthouse"])
      .optional(),
  })
  .optional();

const characterSchema = z.strictObject({
  gender: z.enum(["male", "female"]).optional(),
  age: z.enum(["child", "adult", "elderly"]).optional(),
  body: z.enum(["thin", "normal", "muscular", "stout"]).optional(),
  hairColor: z.enum(["blond", "brown", "red", "black", "grey"]).optional(),
  hairStyle: z
    .enum([
      "bald",
      "short",
      "mohawk",
      "long",
      "ponytail",
      "bun",
      "afro",
      "braids",
    ])
    .optional(),
  eyeColor: z.enum(["brown", "blue", "green"]).optional(),
  skinTone: z.enum(["light", "medium", "tan", "deep"]).optional(),
  accessory: z
    .enum(["none", "glasses", "sunglasses", "hat", "beanie", "beard"])
    .optional(),
  expression: z
    .enum(["neutral", "smile", "serious", "surprised", "wink"])
    .optional(),
  clothingStyle: z
    .enum(["tshirt", "hoodie", "jacket", "dress", "sweater", "collared"])
    .optional(),
  clothingPattern: z.enum(["solid", "stripes", "dots", "emblem"]).optional(),
  prop: z
    .enum([
      "none",
      "book",
      "phone",
      "guitar",
      "coffee",
      "headphones",
      "pen",
      "umbrella",
      "camera",
      "speech",
    ])
    .optional(),
});

const sourceSchema = z
  .strictObject({
    subtitleEpisodeCount: z.number().int().min(0).optional(),
    modelId: z.string().max(80).optional(),
  })
  .optional();

export const coverSpecSchema = z.strictObject({
  version: z.literal("1.0"),
  title: z.string().min(1).max(120),
  genre: z.string().max(80).optional(),
  mood: moodSchema,
  characters: z.array(characterSchema).min(1).max(3),
  source: sourceSchema,
});

export type CoverSpec = z.infer<typeof coverSpecSchema>;
export type CoverSpecCharacter = z.infer<typeof characterSchema>;
export type CoverSpecMood = z.infer<typeof moodSchema>;

export function validateCoverSpec(input: unknown): CoverSpec {
  return coverSpecSchema.parse(input);
}

// --- Enum mappings (neutral -> engine-internal) --------------------------

const PALETTE_BY_NAME: Record<string, Palette> = Object.fromEntries(
  PALETTES.map((p, i) => [paletteNameKey(p.name, i), p]),
);

function paletteNameKey(name: string, _i: number): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GENDER_MAP: Record<string, Gender> = {
  male: "maennlich",
  female: "weiblich",
};
const AGE_MAP: Record<string, Age> = {
  child: "kind",
  adult: "erwachsen",
  elderly: "alt",
};
const BODY_MAP: Record<string, Body> = {
  thin: "duenn",
  normal: "normal",
  muscular: "muskuloes",
  stout: "dick",
};
const HAIR_COLOR_MAP: Record<string, { name: string; color: string }> = {
  blond: { name: "Blond", color: "#E8B84B" },
  brown: { name: "Braun", color: "#6B4226" },
  red: { name: "Rot", color: "#C0392B" },
  black: { name: "Schwarz", color: "#1B1B22" },
  grey: { name: "Grau", color: "#C7CAD1" },
};
const HAIR_STYLE_MAP: Record<string, number> = {
  bald: 0,
  short: 1,
  mohawk: 2,
  long: 3,
  ponytail: 4,
  bun: 5,
  afro: 6,
  braids: 7,
};
const EYE_COLOR_MAP: Record<string, { name: string; color: string }> = {
  brown: { name: "Braun", color: "#6B4226" },
  blue: { name: "Blau", color: "#3AA0E0" },
  green: { name: "Grün", color: "#4CA46A" },
};
const SKIN_TONE_MAP: Record<string, string> = {
  light: "#F2C9A0",
  medium: "#E4B08A",
  tan: "#C68642",
  deep: "#8D5524",
};
const ACCESSORY_MAP: Record<string, Accessory> = {
  none: "keine",
  glasses: "brille",
  sunglasses: "sonnenbrille",
  hat: "hut",
  beanie: "muetze",
  beard: "bart",
};
const TYPOGRAPHY_MAP: Record<string, TypographyStyle> = {
  blockbuster: "blockbuster",
  prestige: "prestige",
  scifi: "scifi",
  arthouse: "arthouse",
};
const EXPRESSION_MAP: Record<string, Expression> = {
  neutral: "neutral",
  smile: "smile",
  serious: "serious",
  surprised: "surprised",
  wink: "wink",
};
const CLOTHING_STYLE_MAP: Record<string, ClothingStyle> = {
  tshirt: "tshirt",
  hoodie: "hoodie",
  jacket: "jacket",
  dress: "dress",
  sweater: "sweater",
  collared: "collared",
};
const CLOTHING_PATTERN_MAP: Record<string, ClothingPattern> = {
  solid: "solid",
  stripes: "stripes",
  dots: "dots",
  emblem: "emblem",
};
const PROP_MAP: Record<string, Prop> = {
  none: "none",
  book: "book",
  phone: "phone",
  guitar: "guitar",
  coffee: "coffee",
  headphones: "headphones",
  pen: "pen",
  umbrella: "umbrella",
  camera: "camera",
  speech: "speech",
};
const SCENE_ELEMENT_MAP: Record<string, SceneElement> = {
  none: "none",
  skyline: "skyline",
  mountains: "mountains",
  stars: "stars",
  clouds: "clouds",
  confetti: "confetti",
};

// --- Constraints (mirror buildRecipe invariants) ------------------------

function applyConstraints(r: Recipe): void {
  if (r.accessory === "bart" && (r.gender === "weiblich" || r.age === "kind")) {
    r.accessory = "brille";
  }
  if (r.accessory === "muetze" && r.age === "alt") {
    r.accessory = "brille";
  }
  if (r.clothingStyle === "dress" && r.gender === "maennlich") {
    r.clothingStyle = "sweater";
  }
}

// --- Spec -> Recipe mapping ----------------------------------------------

export interface CoverSpecPlan {
  main: Recipe;
  characters: Recipe[];
  title: string;
}

// Hash over title + characters so the cover is reproducible from the spec
// alone (independent of which model produced it). Deterministic per spec.
async function specHash(spec: CoverSpec): Promise<string> {
  const fingerprint = JSON.stringify({
    title: spec.title,
    mood: spec.mood,
    characters: spec.characters,
  });
  return sha256Hex(normalize(spec.title) + "|" + normalize(fingerprint));
}

// Resolve palette by neutral name; falls back to a hash-derived palette.
function resolvePalette(
  name: string | undefined,
  hash: string,
  byteIndex: number,
): Palette {
  if (name && PALETTE_BY_NAME[name]) return PALETTE_BY_NAME[name];
  const idx =
    parseInt(hash.substring(byteIndex * 2, byteIndex * 2 + 2), 16) || 0;
  return PALETTES[idx % PALETTES.length];
}

// Build a per-character Recipe from a CoverSpec character. Fields absent in
// the spec are filled deterministically from the spec hash (via buildRecipe)
// so a partial spec still yields a complete, stable cover. World-level
// attributes (palette, scene, background, typography, genre) are inherited
// from the main recipe to keep all characters visually coherent.
async function characterRecipe(
  c: CoverSpecCharacter,
  main: Recipe,
  salt: string,
): Promise<Recipe> {
  const subHash = await sha256Hex(`${salt}::${JSON.stringify(c)}`);
  const r = buildRecipe(subHash, "");

  if (c.gender) r.gender = GENDER_MAP[c.gender];
  if (c.age) r.age = AGE_MAP[c.age];
  if (c.body) r.body = BODY_MAP[c.body];

  // Hair color: respect spec, but `elderly` overrides to grey (engine rule).
  if (c.hairColor) {
    const mapped = HAIR_COLOR_MAP[c.hairColor];
    r.hairColorName = mapped.name;
    r.hairColor = mapped.color;
  }
  if (c.age === "elderly") {
    r.hairColorName = "Grau (Alter)";
    r.hairColor = "#C7CAD1";
  }

  if (c.hairStyle !== undefined) r.hairStyle = HAIR_STYLE_MAP[c.hairStyle];

  if (c.eyeColor) {
    const mapped = EYE_COLOR_MAP[c.eyeColor];
    r.eyeColorName = mapped.name;
    r.eyeColor = mapped.color;
  }
  if (c.skinTone) r.skinTone = SKIN_TONE_MAP[c.skinTone];
  if (c.accessory) r.accessory = ACCESSORY_MAP[c.accessory];
  if (c.expression) r.expression = EXPRESSION_MAP[c.expression];
  if (c.clothingStyle) r.clothingStyle = CLOTHING_STYLE_MAP[c.clothingStyle];
  if (c.clothingPattern)
    r.clothingPattern = CLOTHING_PATTERN_MAP[c.clothingPattern];
  if (c.prop) r.prop = PROP_MAP[c.prop];

  // Inherit world-level attributes from the main recipe.
  r.palette = main.palette;
  r.sceneElement = main.sceneElement;
  r.backgroundId = main.backgroundId;
  r.typography = main.typography;
  r.genre = main.genre;

  applyConstraints(r);
  return r;
}

export async function coverSpecToPlan(spec: CoverSpec): Promise<CoverSpecPlan> {
  const validated = coverSpecSchema.parse(spec);
  const hash = await specHash(validated);

  // Main recipe carries world-level attributes (mood, typography, genre).
  const main = buildRecipe(hash, validated.title);
  main.genre = validated.genre ?? "";

  const mood = validated.mood ?? {};
  main.palette = resolvePalette(mood.palette, hash, 9);
  if (mood.sceneElement)
    main.sceneElement = SCENE_ELEMENT_MAP[mood.sceneElement];
  if (mood.typography) main.typography = TYPOGRAPHY_MAP[mood.typography];

  applyConstraints(main);

  const characters = await Promise.all(
    validated.characters.map((c, i) => characterRecipe(c, main, `char${i}`)),
  );

  return { main, characters, title: validated.title };
}
