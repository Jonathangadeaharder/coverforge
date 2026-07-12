// Voll-deterministische Cover-Engine.
// Gleiche Beschreibung -> exakt gleiches Cover. Keine KI, kein Zufall.
// Der SHA-256-Hash der normalisierten Beschreibung steuert jedes Attribut.
// Produkt aus allen Pools: ~5 Mrd. einzigartige Covers möglich.

export type Gender = "maennlich" | "weiblich";
export type Age = "kind" | "erwachsen" | "alt";
export type Body = "duenn" | "normal" | "muskuloes" | "dick";
export type Accessory =
  "keine" | "brille" | "sonnenbrille" | "hut" | "muetze" | "bart";
export type TypographyStyle = "blockbuster" | "prestige" | "scifi" | "arthouse";
export type Expression = "neutral" | "smile" | "serious" | "surprised" | "wink";
export type ClothingStyle =
  "tshirt" | "hoodie" | "jacket" | "dress" | "sweater" | "collared";
export type ClothingPattern = "solid" | "stripes" | "dots" | "emblem";
export type Prop =
  | "none"
  | "book"
  | "phone"
  | "guitar"
  | "coffee"
  | "headphones"
  | "pen"
  | "umbrella"
  | "camera"
  | "speech";
export type SceneElement =
  "none" | "skyline" | "mountains" | "stars" | "clouds" | "confetti";

export interface Palette {
  name: string;
  bgTop: string;
  bgBottom: string;
  shape: string;
  accent: string;
  clothing: string;
  text: string;
  glow: string;
  ambient: string;
}

export interface Recipe {
  gender: Gender;
  age: Age;
  body: Body;
  hairColorName: string;
  hairColor: string;
  hairStyle: number;
  eyeColorName: string;
  eyeColor: string;
  skinTone: string;
  accessory: Accessory;
  backgroundId: number;
  palette: Palette;
  typography: TypographyStyle;
  hash: string;
  genre: string;
  // New fields
  expression: Expression;
  clothingStyle: ClothingStyle;
  clothingPattern: ClothingPattern;
  prop: Prop;
  sceneElement: SceneElement;
}

export interface HashStepDetail {
  attributeName: string;
  byteIndex: string;
  hexValue: string;
  intValue: number;
  poolSize: number;
  resultIndex: number;
  resultValue: string;
}

export interface DeterministicResult {
  normalizedText: string;
  hash: string;
  recipe: Recipe;
  steps: HashStepDetail[];
}

// --- Options-Pools -------------------------------------------------------

const GENDERS: Gender[] = ["maennlich", "weiblich"];
const AGES: Age[] = ["kind", "erwachsen", "alt"];
const BODIES: Body[] = ["duenn", "normal", "muskuloes", "dick"];

const HAIR = [
  { name: "Blond", color: "#E8B84B" },
  { name: "Braun", color: "#6B4226" },
  { name: "Rot", color: "#C0392B" },
  { name: "Schwarz", color: "#1B1B22" },
];

const EYES = [
  { name: "Braun", color: "#6B4226" },
  { name: "Blau", color: "#3AA0E0" },
  { name: "Grün", color: "#4CA46A" },
];

const SKIN = ["#F2C9A0", "#E4B08A", "#C68642", "#8D5524"];

const ACCESSORIES: Accessory[] = [
  "keine",
  "brille",
  "sonnenbrille",
  "hut",
  "muetze",
  "bart",
];

const TYPOGRAPHY: TypographyStyle[] = [
  "blockbuster",
  "prestige",
  "scifi",
  "arthouse",
];

const EXPRESSIONS: Expression[] = [
  "neutral",
  "smile",
  "serious",
  "surprised",
  "wink",
];

const CLOTHING_STYLES: ClothingStyle[] = [
  "tshirt",
  "hoodie",
  "jacket",
  "dress",
  "sweater",
  "collared",
];

const CLOTHING_PATTERNS: ClothingPattern[] = [
  "solid",
  "stripes",
  "dots",
  "emblem",
];

const PROPS: Prop[] = [
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
];

const SCENE_ELEMENTS: SceneElement[] = [
  "none",
  "skyline",
  "mountains",
  "stars",
  "clouds",
  "confetti",
];

export const PALETTES: Palette[] = [
  {
    name: "Noir Thriller",
    bgTop: "#1a1c26",
    bgBottom: "#0a0b10",
    shape: "#2a2d3d",
    accent: "#e0392b",
    clothing: "#20222e",
    text: "#f5f5f7",
    glow: "#e0392b",
    ambient: "#451212",
  },
  {
    name: "Neon Cyber",
    bgTop: "#0d1030",
    bgBottom: "#05060f",
    shape: "#1a1e55",
    accent: "#00e5c7",
    clothing: "#14173a",
    text: "#eafff9",
    glow: "#00e5c7",
    ambient: "#ec38bc",
  },
  {
    name: "Sonnen-Komödie",
    bgTop: "#ffd76b",
    bgBottom: "#ff9a5a",
    shape: "#ffe9a8",
    accent: "#e8503a",
    clothing: "#2c5b8a",
    text: "#2a1a0a",
    glow: "#fff2c2",
    ambient: "#ffd700",
  },
  {
    name: "Pastell Indie",
    bgTop: "#f6d9e4",
    bgBottom: "#cfd9f2",
    shape: "#ffffff",
    accent: "#7a6cf0",
    clothing: "#3a3f6b",
    text: "#2b2440",
    glow: "#ffffff",
    ambient: "#c8a2c8",
  },
  {
    name: "Waldschatten",
    bgTop: "#1e3b30",
    bgBottom: "#0c1a15",
    shape: "#2c5545",
    accent: "#e5b64b",
    clothing: "#243b33",
    text: "#f0f5ec",
    glow: "#e5b64b",
    ambient: "#3d5a80",
  },
  {
    name: "Blut-Sonnenuntergang",
    bgTop: "#3a1030",
    bgBottom: "#160611",
    shape: "#5c1a3d",
    accent: "#ff6b4a",
    clothing: "#2a1020",
    text: "#ffe8e0",
    glow: "#ff6b4a",
    ambient: "#800020",
  },
  {
    name: "Royal Prestige",
    bgTop: "#1a2145",
    bgBottom: "#0a0d22",
    shape: "#2a3468",
    accent: "#d4af37",
    clothing: "#1e2444",
    text: "#f7f3e6",
    glow: "#d4af37",
    ambient: "#3c096c",
  },
  {
    name: "Eis & Stahl",
    bgTop: "#dfe8ef",
    bgBottom: "#9fb2c4",
    shape: "#ffffff",
    accent: "#2b6fb0",
    clothing: "#37506a",
    text: "#1a2634",
    glow: "#ffffff",
    ambient: "#8e8e93",
  },
];

// --- Hashing -------------------------------------------------------------

export function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(normalize(text) || "leer");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function seg(hex: string, i: number): number {
  return parseInt(hex.substr(i * 2, 2), 16) || 0;
}

// --- Rezept-Ableitung ----------------------------------------------------

export function buildRecipe(hash: string, text = ""): Recipe {
  const steps: HashStepDetail[] = [];
  const lowerText = text.toLowerCase();

  const getAttr = <T extends string>(
    name: string,
    byteIndex: number,
    pool: T[],
  ): T => {
    const hexSlice = hash.substring(byteIndex * 2, byteIndex * 2 + 2);
    const intValue = parseInt(hexSlice, 16);
    const poolSize = pool.length;
    const resultIndex = intValue % poolSize;
    const resultValue = pool[resultIndex];

    steps.push({
      attributeName: name,
      byteIndex: `Byte ${byteIndex + 1} (Hex: ${hexSlice})`,
      hexValue: hexSlice,
      intValue,
      poolSize,
      resultIndex,
      resultValue: String(resultValue),
    });

    return resultValue;
  };

  // 1. Gender
  let gender = getAttr("Geschlecht", 0, GENDERS);
  if (
    /\b(frau|maedchen|mädchen|woman|girl|she|her|sie|lola|bridget|sacha|annie|hind|halima)\b/.test(
      lowerText,
    )
  ) {
    gender = "weiblich";
  } else if (
    /\b(mann|junge|man|boy|he|him|his|er|nico|hector|sam|pablo|david|sweden)\b/.test(
      lowerText,
    )
  ) {
    gender = "maennlich";
  }

  // 2. Age
  let age = getAttr("Alter", 1, AGES);
  if (
    /\b(kind|youth|child|kid|boy|girl|junge|maedchen|mädchen)\b/.test(lowerText)
  ) {
    age = "kind";
  } else if (
    /\b(alt|greis|old|aging|chemistry teacher|babben|concierge)\b/.test(
      lowerText,
    )
  ) {
    age = "alt";
  } else if (
    /\b(junger|junge|adult|erwachsen|man|woman|mann|frau|colocataires|colleagues|friends)\b/.test(
      lowerText,
    )
  ) {
    age = "erwachsen";
  }

  // 3. Body
  let body = getAttr("Körperbau", 2, BODIES);
  if (/\b(muskuloes|muskulös|muscular|ken|strong|athletic)\b/.test(lowerText)) {
    body = "muskuloes";
  } else if (
    /\b(dick|kraeftig|kräftig|fat|chubby|large|stout)\b/.test(lowerText)
  ) {
    body = "dick";
  } else if (/\b(duenn|dünn|thin|slim|lanky)\b/.test(lowerText)) {
    body = "duenn";
  } else if (/\b(normal|average|fit)\b/.test(lowerText)) {
    body = "normal";
  }

  // 4. Hair color
  let hairPick = HAIR[seg(hash, 3) % HAIR.length];
  if (/\b(blond|blonde|fair)\b/.test(lowerText)) {
    hairPick = { name: "Blond", color: "#E8B84B" };
  } else if (/\b(braun|brown|brunette)\b/.test(lowerText)) {
    hairPick = { name: "Braun", color: "#6B4226" };
  } else if (/\b(rot|red|ginger)\b/.test(lowerText)) {
    hairPick = { name: "Rot", color: "#C0392B" };
  } else if (
    /\b(schwarz|black|dark|dunkel|dunkle|spanier|moroccan|marokko|arab|darija)\b/.test(
      lowerText,
    )
  ) {
    hairPick = { name: "Schwarz", color: "#1B1B22" };
  }

  // 5. Hair style (0-7, expanded)
  let hairStyle = seg(hash, 4) % 8;
  if (/\b(lang|long|curly|locken|waves)\b/.test(lowerText)) {
    hairStyle = 3; // long loose
  } else if (/\b(pferdeschwanz|ponytail|zopf)\b/.test(lowerText)) {
    hairStyle = 4;
  } else if (/\b(dutt|bun|chignon)\b/.test(lowerText)) {
    hairStyle = 5;
  } else if (/\b(afro)\b/.test(lowerText)) {
    hairStyle = 6;
  } else if (/\b(zöpfe|braids|geflochten)\b/.test(lowerText)) {
    hairStyle = 7;
  } else if (/\b(kurz|short|cropped)\b/.test(lowerText)) {
    hairStyle = 1;
  } else if (/\b(glatze|bald|shaved)\b/.test(lowerText)) {
    hairStyle = 0;
  } else if (/\b(mohawk|irokese)\b/.test(lowerText)) {
    hairStyle = 2;
  }

  const eyePick = EYES[seg(hash, 5) % EYES.length];
  const skinTone = SKIN[seg(hash, 6) % SKIN.length];

  // 6. Accessory
  let accessory = getAttr("Accessoire", 7, ACCESSORIES);
  if (/\b(brille|glasses|spectacles)\b/.test(lowerText)) {
    accessory = "brille";
  } else if (/\b(sonnenbrille|sunglasses)\b/.test(lowerText)) {
    accessory = "sonnenbrille";
  } else if (/\b(hut|hat)\b/.test(lowerText)) {
    accessory = "hut";
  } else if (/\b(muetze|mütze|beanie|cap)\b/.test(lowerText)) {
    accessory = "muetze";
  } else if (/\b(bart|beard|mustache|schnurrbart|moustach)\b/.test(lowerText)) {
    accessory = "bart";
  } else if (/\b(keine|none|no accessory)\b/.test(lowerText)) {
    accessory = "keine";
  }

  const backgroundId = seg(hash, 8) % 6;

  // 7. Palette
  let palette = PALETTES[seg(hash, 9) % PALETTES.length];
  if (/\b(noir|thriller|dark|düster|crime)\b/.test(lowerText)) {
    palette = PALETTES.find((p) => p.name === "Noir Thriller") || palette;
  } else if (/\b(cyberpunk|neon|cyber|scifi)\b/.test(lowerText)) {
    palette = PALETTES.find((p) => p.name === "Neon Cyber") || palette;
  } else if (
    /\b(komödie|comedy|funny|sun|warm|spain|spanien|spanisch)\b/.test(lowerText)
  ) {
    palette = PALETTES.find((p) => p.name === "Sonnen-Komödie") || palette;
  } else if (
    /\b(indie|pastell|pastel|romance|love|liebe|french|französisch|english|englisch)\b/.test(
      lowerText,
    )
  ) {
    palette = PALETTES.find((p) => p.name === "Pastell Indie") || palette;
  } else if (
    /\b(forest|wald|nature|grün|green|schwarzwald)\b/.test(lowerText)
  ) {
    palette = PALETTES.find((p) => p.name === "Waldschatten") || palette;
  } else if (
    /\b(blood|sunset|red|romantik|marokko|moroc|darija|drama)\b/.test(lowerText)
  ) {
    palette =
      PALETTES.find((p) => p.name === "Blut-Sonnenuntergang") || palette;
  } else if (
    /\b(royal|prestige|crown|gold|throne|game|sweden|schwedisch)\b/.test(
      lowerText,
    )
  ) {
    palette = PALETTES.find((p) => p.name === "Royal Prestige") || palette;
  }

  // 8. Typography
  let typography = getAttr("Typografie", 10, TYPOGRAPHY);
  if (
    /\b(cyberpunk|scifi|science fiction|tech|computer|hacker)\b/.test(lowerText)
  ) {
    typography = "scifi";
  } else if (
    /\b(action|thriller|crime|blockbuster|action-komödie)\b/.test(lowerText)
  ) {
    typography = "blockbuster";
  } else if (
    /\b(indie|arthouse|documentary|independ|pastell|komödie|comedy)\b/.test(
      lowerText,
    )
  ) {
    typography = "arthouse";
  } else if (
    /\b(drama|romance|history|epische|telenovela|prestige|liebe|betrug|schicksal)\b/.test(
      lowerText,
    )
  ) {
    typography = "prestige";
  }

  // 9. Expression (byte 11)
  let expression = EXPRESSIONS[seg(hash, 11) % EXPRESSIONS.length];
  if (
    /\b(lachen|lacht|smile|happy|glücklich|fröhlich|funny|comedy)\b/.test(
      lowerText,
    )
  ) {
    expression = "smile";
  } else if (
    /\b(ernst|serious|streng|düster|noir|thriller)\b/.test(lowerText)
  ) {
    expression = "serious";
  } else if (
    /\b(überrascht|surprised|shocked|shocked|schock)\b/.test(lowerText)
  ) {
    expression = "surprised";
  } else if (/\b(zwinkern|wink|flirt|zwinkert)\b/.test(lowerText)) {
    expression = "wink";
  }

  // 10. Clothing style (byte 12)
  let clothingStyle = CLOTHING_STYLES[seg(hash, 12) % CLOTHING_STYLES.length];
  if (/\b(hoodie|kapuze|kapuzenpullover)\b/.test(lowerText)) {
    clothingStyle = "hoodie";
  } else if (/\b(jacke|jacket|mantel|coat|blazer)\b/.test(lowerText)) {
    clothingStyle = "jacket";
  } else if (/\b(kleid|dress|robe)\b/.test(lowerText)) {
    clothingStyle = "dress";
  } else if (/\b(pullover|sweater|strick)\b/.test(lowerText)) {
    clothingStyle = "sweater";
  } else if (/\b(hemd|collared|shirt|bluse)\b/.test(lowerText)) {
    clothingStyle = "collared";
  } else if (/\b(tshirt|t-shirt)\b/.test(lowerText)) {
    clothingStyle = "tshirt";
  }

  // 11. Clothing pattern (byte 13)
  let clothingPattern =
    CLOTHING_PATTERNS[seg(hash, 13) % CLOTHING_PATTERNS.length];
  if (/\b(streifen|stripes|gestreift)\b/.test(lowerText)) {
    clothingPattern = "stripes";
  } else if (/\b(punkte|dots|gepunktet)\b/.test(lowerText)) {
    clothingPattern = "dots";
  } else if (/\b(emblem|logo|wappen)\b/.test(lowerText)) {
    clothingPattern = "emblem";
  }

  // 12. Prop (byte 14-15 combined for 10-item pool)
  let prop = PROPS[seg(hash, 14) % PROPS.length];
  if (/\b(buch|book|lesen|reading|library)\b/.test(lowerText)) {
    prop = "book";
  } else if (/\b(handy|phone|smartphone|mobile)\b/.test(lowerText)) {
    prop = "phone";
  } else if (/\b(gitarre|guitar|musik|musik)\b/.test(lowerText)) {
    prop = "guitar";
  } else if (/\b(kaffee|coffee|café|tasse)\b/.test(lowerText)) {
    prop = "coffee";
  } else if (
    /\b(kopfhörer|headphones|earphones|musik hören)\b/.test(lowerText)
  ) {
    prop = "headphones";
  } else if (/\b(stift|pen|pencil|schreiben|writing)\b/.test(lowerText)) {
    prop = "pen";
  } else if (/\b(regenschirm|umbrella|regen|rain)\b/.test(lowerText)) {
    prop = "umbrella";
  } else if (/\b(kamera|camera|foto|fotograf)\b/.test(lowerText)) {
    prop = "camera";
  } else if (/\b(sprechblase|speech|bubble|talking)\b/.test(lowerText)) {
    prop = "speech";
  } else if (/\b(keine prop|no prop)\b/.test(lowerText)) {
    prop = "none";
  }

  // 13. Scene element (byte 15)
  let sceneElement = SCENE_ELEMENTS[seg(hash, 15) % SCENE_ELEMENTS.length];
  if (/\b(skyline|city|stadt|urban|metro)\b/.test(lowerText)) {
    sceneElement = "skyline";
  } else if (/\b(berge|mountains|natur|alpen|landscape)\b/.test(lowerText)) {
    sceneElement = "mountains";
  } else if (/\b(sterne|stars|space|weltraum|galaxy|nacht)\b/.test(lowerText)) {
    sceneElement = "stars";
  } else if (/\b(wolken|clouds|sky|himmel)\b/.test(lowerText)) {
    sceneElement = "clouds";
  } else if (
    /\b(konfetti|confetti|party|celebration|feier)\b/.test(lowerText)
  ) {
    sceneElement = "confetti";
  }

  // Constraints
  if (accessory === "bart" && (gender === "weiblich" || age === "kind")) {
    accessory = "brille";
  }
  if (accessory === "muetze" && age === "alt") {
    accessory = "brille";
  }
  // Dress only for female (otherwise fallback to sweater)
  if (clothingStyle === "dress" && gender === "maennlich") {
    clothingStyle = "sweater";
  }

  const hairColor = age === "alt" ? "#C7CAD1" : hairPick.color;
  const hairColorName = age === "alt" ? "Grau (Alter)" : hairPick.name;

  return {
    gender,
    age,
    body,
    hairColorName,
    hairColor,
    hairStyle,
    eyeColorName: eyePick.name,
    eyeColor: eyePick.color,
    skinTone,
    accessory,
    backgroundId,
    palette,
    typography,
    hash,
    genre: "",
    expression,
    clothingStyle,
    clothingPattern,
    prop,
    sceneElement,
  };
}

export function buildRecipeWithSteps(
  hash: string,
  text = "",
): DeterministicResult {
  const recipe = buildRecipe(hash, text);
  const steps: HashStepDetail[] = [];

  const addStep = (
    attributeName: string,
    isOverridden: boolean,
    resultValue: string,
    idx: number,
    pool: string[],
  ) => {
    const hexSlice = hash.substring(idx * 2, idx * 2 + 2);
    const intValue = parseInt(hexSlice, 16);
    steps.push({
      attributeName,
      byteIndex: isOverridden
        ? "Semantische Analyse (Override)"
        : `Byte ${idx + 1} (Hex: ${hexSlice})`,
      hexValue: isOverridden ? "-" : hexSlice,
      intValue: isOverridden ? 0 : intValue,
      poolSize: pool.length,
      resultIndex: pool.indexOf(resultValue),
      resultValue,
    });
  };

  const defaultGender =
    GENDERS[parseInt(hash.substring(0, 2), 16) % GENDERS.length];
  addStep(
    "Geschlecht",
    recipe.gender !== defaultGender,
    recipe.gender,
    0,
    GENDERS,
  );

  const defaultAge = AGES[parseInt(hash.substring(2, 4), 16) % AGES.length];
  addStep("Alter", recipe.age !== defaultAge, recipe.age, 1, AGES);

  const defaultBody =
    BODIES[parseInt(hash.substring(4, 6), 16) % BODIES.length];
  addStep("Körperbau", recipe.body !== defaultBody, recipe.body, 2, BODIES);

  {
    const hexSlice = hash.substring(8, 10);
    const intValue = parseInt(hexSlice, 16);
    const defaultHairStyle = intValue % 8;
    const isStyleOverridden = recipe.hairStyle !== defaultHairStyle;
    steps.push({
      attributeName: "Frisur",
      byteIndex: isStyleOverridden
        ? "Semantische Analyse (Override)"
        : `Byte 5 (Hex: ${hexSlice})`,
      hexValue: isStyleOverridden ? "-" : hexSlice,
      intValue: isStyleOverridden ? 0 : intValue,
      poolSize: 8,
      resultIndex: recipe.hairStyle,
      resultValue: String(recipe.hairStyle),
    });
  }

  addStep(
    "Accessoire",
    recipe.accessory !== ACCESSORIES[seg(hash, 7) % ACCESSORIES.length],
    recipe.accessory,
    7,
    ACCESSORIES,
  );
  addStep(
    "Palette",
    false,
    recipe.palette.name,
    9,
    PALETTES.map((p) => p.name),
  );
  addStep("Typografie", false, recipe.typography, 10, TYPOGRAPHY);
  addStep("Ausdruck", false, recipe.expression, 11, EXPRESSIONS);
  addStep("Kleidungsstil", false, recipe.clothingStyle, 12, CLOTHING_STYLES);
  addStep(
    "Kleidungsmuster",
    false,
    recipe.clothingPattern,
    13,
    CLOTHING_PATTERNS,
  );
  addStep("Requisite", false, recipe.prop, 14, PROPS);
  addStep("Szenenelement", false, recipe.sceneElement, 15, SCENE_ELEMENTS);

  return { normalizedText: normalize(text), hash, recipe, steps };
}

// --- Label-Maps für UI --------------------------------------------------

export const GENDER_LABEL: Record<Gender, string> = {
  maennlich: "Männlich",
  weiblich: "Weiblich",
};

export const AGE_LABEL: Record<Age, string> = {
  kind: "Kind",
  erwachsen: "Erwachsen",
  alt: "Alt",
};

export const BODY_LABEL: Record<Body, string> = {
  duenn: "Dünn",
  normal: "Normal",
  muskuloes: "Muskulös",
  dick: "Kräftig",
};

export const ACC_LABEL: Record<Accessory, string> = {
  keine: "Keine",
  brille: "Brille",
  sonnenbrille: "Sonnenbrille",
  hut: "Hut",
  muetze: "Mütze",
  bart: "Bart",
};

export const TYPO_LABEL: Record<TypographyStyle, string> = {
  blockbuster: "Blockbuster",
  prestige: "Prestige",
  scifi: "Sci-Fi",
  arthouse: "Arthouse",
};

// --- Preset-Bibliothek ---------------------------------------------------

export const PRESET_MOVIES: Array<{
  id: string;
  title: string;
  genre: string;
  description: string;
}> = [
  {
    id: "nicos-weg",
    title: "NICOS WEG",
    genre: "Drama / Learning",
    description:
      "A German learning drama series. A young adult man, Nico, with short black hair, beard bart, neon cyber palette, arthouse typography.",
  },
  {
    id: "extra-english",
    title: "EXTRA ENGLISH",
    genre: "Comedy / Learning",
    description:
      "An English learning sitcom. A young adult woman, Annie, with long blond hair, none accessory, pastel indie palette, arthouse typography.",
  },
  {
    id: "lmaktoub",
    title: "LMAKTOUB",
    genre: "Drama / Telenovela",
    description:
      "A Moroccan drama series. A young adult woman, Hind, with long black hair, none accessory, sunset drama blood palette, prestige typography.",
  },
  {
    id: "taskmaster-sweden",
    title: "BÄST I TEST",
    genre: "Comedy / Show",
    description:
      "A Swedish game show. An old woman, Babben, with glasses, royal prestige gold palette, prestige typography, short hair.",
  },
  {
    id: "random-thriller",
    title: "DARK FREQUENCY",
    genre: "Sci-Fi / Thriller",
    description:
      "A cyberpunk noir thriller. A young adult man with short dark hair, glasses, neon cyber palette, scifi typography. Urban skyline confetti.",
  },
];

// --- Schnellzugriff für Skripte ------------------------------------------

export async function generateCoverRecipe(
  titleOrDescription: string,
  description?: string,
  genre?: string,
): Promise<DeterministicResult> {
  // Legacy (title, desc, genre) signature used by CoverGenerator + scripts.
  const descText = description ?? titleOrDescription;
  const hash = await sha256Hex(descText);
  const recipe = buildRecipe(hash, descText);
  if (genre) recipe.genre = genre;
  return { normalizedText: normalize(descText), hash, recipe, steps: [] };
}

// --- Multi-Character Parsing --------------------------------------------

// Person descriptor words: a segment qualifies as a character description
// when it contains one of these. Group words ("friends", "pair", "duo") and
// bare names are excluded so "Two friends, Annie a young woman" stays one
// segment and "A young woman, Jojo, with brown hair" doesn't split on the
// name appositive.
const PERSON_DESCRIPTOR =
  /\b(mann|frau|junge|maedchen|mädchen|man|woman|boy|girl|child|kind|adult|alt|greis|guy|person|lehrer|lehrerin|detective|programmierer|uhrmacher|sidekick|lehrling)\b/i;

// Broad detection: does the description mention people at all? Includes names
// and group words. Used only to distinguish character covers from pure
// atmosphere descriptions.
const PERSON_CUE =
  /\b(mann|frau|junge|maedchen|mädchen|man|woman|boy|girl|child|kind|adult|alt|greis|guy|person|friend|friends|colleague|colleagues|pair|duo|trio|lehrer|lehrerin|detective|programmierer|uhrmacher|sidekick|lehrlinge|nico|nicco|hector|sam|pablo|david|annie|sacha|lola|hind|halima|jojo|babben)\b/i;

const CONJUNCTION_REGEX =
  /\b(?:und|and|mit|with|alongside|neben|sowie|begleitet von)\b/i;

// Known character names → fixed gender cue so parsing is stable.
const NAME_GENDER: Record<string, "maennlich" | "weiblich"> = {
  nico: "maennlich",
  nicco: "maennlich",
  hector: "maennlich",
  sam: "maennlich",
  pablo: "maennlich",
  david: "maennlich",
  annie: "weiblich",
  sacha: "weiblich",
  lola: "weiblich",
  hind: "weiblich",
  halima: "weiblich",
  jojo: "weiblich",
  babben: "weiblich",
};

export interface MultiCoverPlan {
  main: Recipe;
  characters: Recipe[];
  title: string;
}

// Split a description into per-character sub-descriptions.
// Splits on conjunctions (and/und/mit/...) always, and on commas only when
// both adjacent fragments contain a person descriptor. This keeps appositives
// like "A young woman, Jojo, with brown hair" as one segment while still
// catching list form "one tall man, one short woman".
export function parseCharacterDescriptions(description: string): string[] {
  const text = description.trim();
  if (!text) return [];

  const wantsMulti = /\b(two|drei|three|pair|duo|trio|zwei)\b/i.test(text);

  // First split on conjunctions.
  const byConj = text
    .split(CONJUNCTION_REGEX)
    .map((s) => s.trim())
    .filter(Boolean);

  // Then split each fragment on commas where both sides have a person
  // descriptor. This keeps appositives like "A young woman, Jojo, with brown
  // hair" as one segment while still catching "one tall man, one short woman".
  const expanded: string[] = [];
  for (const frag of byConj) {
    const commaParts = frag.split(",");
    if (commaParts.length < 2) {
      expanded.push(frag);
      continue;
    }
    // Walk parts, merging a part into the previous when either side lacks a
    // person descriptor (appositive case).
    const merged: string[] = [];
    for (const part of commaParts) {
      const p = part.trim();
      if (!p) continue;
      const prev = merged[merged.length - 1];
      if (prev && PERSON_DESCRIPTOR.test(prev) && PERSON_DESCRIPTOR.test(p)) {
        merged.push(p);
      } else if (prev) {
        merged[merged.length - 1] = `${prev}, ${p}`;
      } else {
        merged.push(p);
      }
    }
    expanded.push(...merged);
  }

  const personSegments = expanded.filter((s) => PERSON_DESCRIPTOR.test(s));

  // Need at least 2 person-segments for a multi-character cover.
  if (personSegments.length < 2 && !wantsMulti) return [];
  if (personSegments.length === 0) return [];

  // Cap at 3 — layout only supports 1..3 characters.
  return personSegments.slice(0, 3).length >= 2
    ? personSegments.slice(0, 3)
    : [];
}

// Builds a per-character Recipe from a sub-description. Palette, scene,
// background and typography are inherited from the main recipe so all
// characters share one coherent visual world.
async function characterRecipe(
  subDesc: string,
  main: Recipe,
  salt: string,
): Promise<Recipe> {
  const hash = await sha256Hex(`${salt}::${subDesc}`);
  const r = buildRecipe(hash, subDesc);

  // Pin gender from known names when present (stable, no randomness).
  const lower = subDesc.toLowerCase();
  for (const [name, gender] of Object.entries(NAME_GENDER)) {
    if (new RegExp(`\\b${name}\\b`, "i").test(lower)) {
      r.gender = gender;
      break;
    }
  }

  // Inherit the world-level attributes from the main recipe.
  r.palette = main.palette;
  r.sceneElement = main.sceneElement;
  r.backgroundId = main.backgroundId;
  r.typography = main.typography;
  r.genre = main.genre;

  // Constraint re-application after inheritance + name override.
  if (r.accessory === "bart" && (r.gender === "weiblich" || r.age === "kind")) {
    r.accessory = "brille";
  }
  if (r.clothingStyle === "dress" && r.gender === "maennlich") {
    r.clothingStyle = "sweater";
  }
  return r;
}

// Builds a full multi-character cover plan. Falls back to a single-character
// plan (main only) when the description doesn't describe multiple people.
export async function generateMultiCoverPlan(
  title: string,
  description: string,
  genre?: string,
): Promise<MultiCoverPlan> {
  const mainResult = await generateCoverRecipe(title, description, genre);
  const main = mainResult.recipe;

  const subs = parseCharacterDescriptions(description);
  if (subs.length < 2) {
    return { main, characters: [main], title };
  }

  const characters = await Promise.all(
    subs.map((s, i) => characterRecipe(s, main, `char${i}`)),
  );
  return { main, characters, title };
}
