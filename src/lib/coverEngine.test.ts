import { describe, expect, it } from "vitest";
import {
  AGE_LABEL,
  BODY_LABEL,
  buildRecipe,
  buildRecipeWithSteps,
  generateCoverRecipe,
  generateMultiCoverPlan,
  GENDER_LABEL,
  normalize,
  parseCharacterDescriptions,
  PRESET_MOVIES,
  sha256Hex,
  ACC_LABEL,
  TYPO_LABEL,
} from "./coverEngine";

// 64-char hex (32 bytes) — every byte is 0x00..0x0f so all seg()/getAttr
// indices are deterministic.
const HASH_ZERO =
  "0000000000000000000000000000000000000000000000000000000000000000";

const HASH_F =
  "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

describe("normalize", () => {
  it("trims, lowercases, and collapses whitespace", () => {
    expect(normalize("  Hello   World  ")).toBe("hello world");
  });
  it("returns empty string for whitespace-only input", () => {
    expect(normalize("   ")).toBe("");
  });
});

describe("sha256Hex", () => {
  it("returns a 64-char hex string for given text", async () => {
    const h = await sha256Hex("test");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for identical normalized input", async () => {
    expect(await sha256Hex("Hello")).toBe(await sha256Hex(" hello "));
  });

  it("falls back to hashing 'leer' for empty/whitespace input", async () => {
    expect(await sha256Hex("")).toBe(await sha256Hex("leer"));
    expect(await sha256Hex("   ")).toBe(await sha256Hex("leer"));
  });
});

describe("buildRecipe", () => {
  it("derives a recipe purely from the hash when text is empty", () => {
    const r = buildRecipe(HASH_ZERO, "");
    // byte 0 = 0x00 -> GENDERS[0] = maennlich
    expect(r.gender).toBe("maennlich");
    expect(r.age).toBe("kind"); // AGES[0]
    expect(r.body).toBe("duenn"); // BODIES[0]
    expect(r.hairStyle).toBe(0); // 0 % 8
    expect(r.accessory).toBe("keine"); // ACCESSORIES[0]
    expect(r.backgroundId).toBe(0);
    expect(r.palette.name).toBe("Noir Thriller"); // PALETTES[0]
    expect(r.typography).toBe("blockbuster"); // TYPOGRAPHY[0]
    expect(r.expression).toBe("neutral"); // EXPRESSIONS[0]
    expect(r.clothingStyle).toBe("tshirt"); // CLOTHING_STYLES[0]
    expect(r.clothingPattern).toBe("solid"); // CLOTHING_PATTERNS[0]
    expect(r.prop).toBe("none"); // PROPS[0]
    expect(r.sceneElement).toBe("none"); // SCENE_ELEMENTS[0]
    expect(r.genre).toBe("");
    expect(r.hairColorName).toBe("Blond");
    expect(r.eyeColorName).toBe("Braun");
  });

  it("uses the max indices when hash is all 0xff", () => {
    const r = buildRecipe(HASH_F, "");
    expect(r.gender).toBe("weiblich"); // 255 % 2 = 1
    // 255 % 3 = 0 -> AGES[0] = kind
    expect(r.age).toBe("kind");
    expect(r.body).toBe("dick"); // 255 % 4 = 3
    expect(r.hairStyle).toBe(7); // 255 % 8 = 7
    // Grey hair is forced when age === "alt" — but age is "kind" here.
  });

  it("forces grey hair for alt age", () => {
    // hash byte 1 must give AGES index 2 ("alt"): need value % 3 == 2
    // Build a hash where byte 1 is 0x02.
    const hash = "00" + "02" + "00".repeat(30);
    const r = buildRecipe(hash, "");
    expect(r.age).toBe("alt");
    expect(r.hairColor).toBe("#C7CAD1");
    expect(r.hairColorName).toBe("Grau (Alter)");
  });

  // --- Gender overrides ---
  it.each([
    ["a woman and her friends", "weiblich"],
    ["the girl named annie", "weiblich"],
    ["frau lola", "weiblich"],
    ["a man called nico", "maennlich"],
    ["the boy hector", "maennlich"],
    ["david from sweden", "maennlich"],
  ])("overrides gender from text %s -> %s", (text, gender) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.gender).toBe(gender);
  });

  // --- Age overrides ---
  it.each([
    ["a kind child", "kind"],
    ["an alt greis", "alt"],
    ["a young adult man", "erwachsen"],
  ])("overrides age from text %s -> %s", (text, age) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.age).toBe(age);
  });

  // --- Body overrides ---
  it.each([
    ["muskuloes muscular", "muskuloes"],
    ["dick and chubby", "dick"],
    ["duenn and thin", "duenn"],
    ["normal average fit", "normal"],
  ])("overrides body from text %s -> %s", (text, body) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.body).toBe(body);
  });

  // --- Hair color overrides ---
  it.each([
    ["blonde hair", "Blond"],
    ["brown brunette hair", "Braun"],
    ["red ginger hair", "Rot"],
    ["black dark hair", "Schwarz"],
  ])("overrides hair color from text %s -> %s", (text, name) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.hairColorName).toBe(name);
  });

  // --- Hair style overrides ---
  it.each([
    ["long curly hair", 3],
    ["ponytail zopf", 4],
    ["dutt bun", 5],
    ["afro", 6],
    ["zöpfe braids", 7],
    ["short cropped", 1],
    ["glatze bald", 0],
    ["mohawk irokese", 2],
  ])("overrides hair style from text %s -> %i", (text, style) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.hairStyle).toBe(style);
  });

  // --- Accessory overrides ---
  it.each([
    ["brille glasses", "brille"],
    ["sonnenbrille sunglasses", "sonnenbrille"],
    ["hut hat", "hut"],
    ["muetze beanie cap", "muetze"],
    // beard requires male + adult to avoid the beard->brille constraint.
    ["an adult man with a bart beard", "bart"],
    ["keine none", "keine"],
  ])("overrides accessory from text %s -> %s", (text, acc) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.accessory).toBe(acc);
  });

  it("converts beard to brille for female characters (constraint)", () => {
    // "frau bart" -> gender weiblich + accessory bart -> brille
    const r = buildRecipe(HASH_ZERO, "frau bart");
    expect(r.gender).toBe("weiblich");
    expect(r.accessory).toBe("brille");
  });

  it("converts beard to brille for children (constraint)", () => {
    const r = buildRecipe(HASH_ZERO, "kind bart");
    expect(r.age).toBe("kind");
    expect(r.accessory).toBe("brille");
  });

  it("converts muetze to brille for alt age (constraint)", () => {
    const r = buildRecipe(HASH_ZERO, "alt muetze beanie");
    expect(r.age).toBe("alt");
    expect(r.accessory).toBe("brille");
  });

  it("converts dress to sweater for male characters (constraint)", () => {
    const r = buildRecipe(HASH_ZERO, "mann dress");
    expect(r.gender).toBe("maennlich");
    expect(r.clothingStyle).toBe("sweater");
  });

  // --- Palette overrides ---
  it.each([
    ["noir thriller dark", "Noir Thriller"],
    ["cyberpunk neon cyber", "Neon Cyber"],
    ["komödie comedy sun spain", "Sonnen-Komödie"],
    ["indie pastell romance love french", "Pastell Indie"],
    ["forest wald nature green", "Waldschatten"],
    ["blood sunset red marokko drama", "Blut-Sonnenuntergang"],
    ["royal prestige crown gold sweden", "Royal Prestige"],
  ])("overrides palette from text %s -> %s", (text, name) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.palette.name).toBe(name);
  });

  // --- Typography overrides ---
  it.each([
    ["cyberpunk scifi tech hacker", "scifi"],
    ["action thriller blockbuster", "blockbuster"],
    ["indie arthouse documentary comedy", "arthouse"],
    ["drama romance prestige liebe", "prestige"],
  ])("overrides typography from text %s -> %s", (text, typo) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.typography).toBe(typo);
  });

  // --- Expression overrides ---
  it.each([
    ["lachen smile happy", "smile"],
    ["ernst serious noir", "serious"],
    ["überrascht surprised shocked", "surprised"],
    ["zwinkern wink flirt", "wink"],
  ])("overrides expression from text %s -> %s", (text, expr) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.expression).toBe(expr);
  });

  // --- Clothing style overrides ---
  it.each([
    ["hoodie kapuze", "hoodie"],
    ["jacke jacket mantel", "jacket"],
    // dress is only kept for female characters.
    ["a woman in a kleid dress robe", "dress"],
    ["pullover sweater strick", "sweater"],
    ["hemd collared bluse", "collared"],
    ["tshirt", "tshirt"],
  ])("overrides clothing style from text %s -> %s", (text, style) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.clothingStyle).toBe(style);
  });

  // --- Clothing pattern overrides ---
  it.each([
    ["streifen stripes", "stripes"],
    ["punkte dots gepunktet", "dots"],
    ["emblem logo wappen", "emblem"],
  ])("overrides clothing pattern from text %s -> %s", (text, pattern) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.clothingPattern).toBe(pattern);
  });

  // --- Prop overrides ---
  it.each([
    ["buch book library", "book"],
    ["handy phone smartphone", "phone"],
    ["gitarre guitar", "guitar"],
    ["kaffee coffee café", "coffee"],
    ["kopfhörer headphones", "headphones"],
    ["stift pen pencil", "pen"],
    ["regenschirm umbrella rain", "umbrella"],
    ["kamera camera foto", "camera"],
    ["sprechblase speech bubble", "speech"],
    ["keine prop no prop", "none"],
  ])("overrides prop from text %s -> %s", (text, prop) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.prop).toBe(prop);
  });

  // --- Scene element overrides ---
  it.each([
    ["skyline city urban", "skyline"],
    ["berge mountains alpen", "mountains"],
    ["sterne stars space nacht", "stars"],
    ["wolken clouds sky himmel", "clouds"],
    ["konfetti confetti party", "confetti"],
  ])("overrides scene element from text %s -> %s", (text, sc) => {
    const r = buildRecipe(HASH_ZERO, text);
    expect(r.sceneElement).toBe(sc);
  });
});

describe("buildRecipeWithSteps", () => {
  it("returns a DeterministicResult with normalized text, hash, recipe, and steps", () => {
    const res = buildRecipeWithSteps(HASH_ZERO, "A woman");
    expect(res.normalizedText).toBe("a woman");
    expect(res.hash).toBe(HASH_ZERO);
    expect(res.recipe.gender).toBe("weiblich");
    expect(res.steps.length).toBeGreaterThan(10);
    // First step is gender.
    expect(res.steps[0].attributeName).toBe("Geschlecht");
    // Override steps carry the "Semantische Analyse" marker.
    const overrideStep = res.steps.find((s) =>
      String(s.byteIndex).includes("Override"),
    );
    expect(overrideStep).toBeDefined();
  });

  it("marks non-overridden attributes with Byte index", () => {
    const res = buildRecipeWithSteps(HASH_ZERO, "");
    const palStep = res.steps.find((s) => s.attributeName === "Palette");
    expect(palStep?.byteIndex).toContain("Byte");
    expect(palStep?.hexValue).not.toBe("-");
  });

  it("includes the Frisur step with poolSize 8", () => {
    const res = buildRecipeWithSteps(HASH_ZERO, "");
    const hairStep = res.steps.find((s) => s.attributeName === "Frisur");
    expect(hairStep?.poolSize).toBe(8);
  });
});

describe("generateCoverRecipe", () => {
  it("hashes the description and returns a DeterministicResult", async () => {
    const res = await generateCoverRecipe("a noir thriller");
    expect(res.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(res.recipe.palette.name).toBe("Noir Thriller");
    expect(res.steps).toEqual([]);
  });

  it("uses the legacy (title, desc, genre) signature", async () => {
    const res = await generateCoverRecipe("My Title", "a comedy", "Comedy");
    expect(res.recipe.palette.name).toBe("Sonnen-Komödie");
    expect(res.recipe.genre).toBe("Comedy");
  });

  it("falls back to titleOrDescription when description is undefined", async () => {
    const a = await generateCoverRecipe("a noir thriller");
    const b = await generateCoverRecipe("a noir thriller", undefined);
    expect(b.hash).toBe(a.hash);
  });

  it("sets genre on the recipe when provided", async () => {
    const res = await generateCoverRecipe("test", "test", "Custom Genre");
    expect(res.recipe.genre).toBe("Custom Genre");
  });
});

describe("label maps", () => {
  it("covers all gender labels", () => {
    expect(GENDER_LABEL.maennlich).toBe("Männlich");
    expect(GENDER_LABEL.weiblich).toBe("Weiblich");
  });
  it("covers all age labels", () => {
    expect(AGE_LABEL.kind).toBe("Kind");
    expect(AGE_LABEL.erwachsen).toBe("Erwachsen");
    expect(AGE_LABEL.alt).toBe("Alt");
  });
  it("covers all body labels", () => {
    expect(BODY_LABEL.duenn).toBe("Dünn");
    expect(BODY_LABEL.normal).toBe("Normal");
    expect(BODY_LABEL.muskuloes).toBe("Muskulös");
    expect(BODY_LABEL.dick).toBe("Kräftig");
  });
  it("covers all accessory labels", () => {
    expect(ACC_LABEL.bart).toBe("Bart");
    expect(ACC_LABEL.sonnenbrille).toBe("Sonnenbrille");
  });
  it("covers all typography labels", () => {
    expect(TYPO_LABEL.scifi).toBe("Sci-Fi");
    expect(TYPO_LABEL.arthouse).toBe("Arthouse");
  });
  it("PRESET_MOVIES is a non-empty list of unique ids", () => {
    const ids = PRESET_MOVIES.map((m) => m.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of PRESET_MOVIES) {
      expect(typeof m.title).toBe("string");
      expect(typeof m.description).toBe("string");
    }
  });
});

describe("parseCharacterDescriptions", () => {
  it("returns empty for empty string", () => {
    expect(parseCharacterDescriptions("")).toEqual([]);
  });

  it("returns empty for whitespace-only string", () => {
    expect(parseCharacterDescriptions("   ")).toEqual([]);
  });

  it("returns empty for a description with no person cue", () => {
    expect(parseCharacterDescriptions("a dark forest at night")).toEqual([]);
  });

  it("returns empty for a single person (not multi)", () => {
    expect(parseCharacterDescriptions("a tall man with a hat")).toEqual([]);
  });

  it("splits two characters joined by a conjunction", () => {
    const subs = parseCharacterDescriptions("a tall man and a short woman");
    expect(subs).toHaveLength(2);
    expect(subs[0]).toContain("tall man");
    expect(subs[1]).toContain("short woman");
  });

  it("splits list form separated by commas", () => {
    const subs = parseCharacterDescriptions("one tall man, one short woman");
    expect(subs).toHaveLength(2);
  });

  it("keeps appositives as one segment", () => {
    // "A young woman, Jojo, with brown hair" should NOT split on the name.
    const subs = parseCharacterDescriptions(
      "a young woman, jojo, with brown hair and a tall man",
    );
    expect(subs).toHaveLength(2);
    expect(subs[0]).toContain("jojo");
  });

  it("caps at 3 characters", () => {
    const subs = parseCharacterDescriptions(
      "a man and a woman and a boy and a girl",
    );
    expect(subs.length).toBeLessThanOrEqual(3);
  });

  it("returns empty when wantsMulti but no person segments", () => {
    expect(parseCharacterDescriptions("two forests and three skies")).toEqual(
      [],
    );
  });

  it("supports German conjunctions (und, mit, neben)", () => {
    const subs = parseCharacterDescriptions("ein mann und eine frau");
    expect(subs).toHaveLength(2);
  });
});

describe("generateMultiCoverPlan", () => {
  it("returns a single-character plan when description has no multi split", async () => {
    const plan = await generateMultiCoverPlan("Solo", "a tall man", "Drama");
    expect(plan.title).toBe("Solo");
    expect(plan.main).toBeDefined();
    expect(plan.characters).toHaveLength(1);
    expect(plan.characters[0]).toBe(plan.main);
    expect(plan.main.genre).toBe("Drama");
  });

  it("returns a multi-character plan for two people", async () => {
    const plan = await generateMultiCoverPlan(
      "Duo",
      "a tall man named nico and a short woman called annie",
    );
    expect(plan.characters.length).toBe(2);
    // Name gender pinning.
    const nico = plan.characters.find((c) => c.gender === "maennlich");
    const annie = plan.characters.find((c) => c.gender === "weiblich");
    expect(nico).toBeDefined();
    expect(annie).toBeDefined();
    // Inherited world attributes.
    expect(plan.characters[0].palette).toBe(plan.main.palette);
    expect(plan.characters[0].typography).toBe(plan.main.typography);
    expect(plan.characters[0].sceneElement).toBe(plan.main.sceneElement);
    expect(plan.characters[0].backgroundId).toBe(plan.main.backgroundId);
  });

  it("re-applies the dress->sweater constraint after inheritance", async () => {
    // Force male + dress via text on a multi-character description.
    const plan = await generateMultiCoverPlan(
      "T",
      "a man in a dress and a woman in a dress",
    );
    for (const c of plan.characters) {
      if (c.gender === "maennlich") {
        expect(c.clothingStyle).not.toBe("dress");
      }
    }
  });

  it("re-applies the beard->brille constraint after name-pinned gender", async () => {
    const plan = await generateMultiCoverPlan(
      "T",
      "annie with a beard and nico with a beard",
    );
    // annie is female -> beard must be converted to brille.
    const annie = plan.characters.find((c) => c.gender === "weiblich");
    expect(annie?.accessory).toBe("brille");
  });
});
