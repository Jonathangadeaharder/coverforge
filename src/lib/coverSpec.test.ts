import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  coverSpecSchema,
  validateCoverSpec,
  coverSpecToPlan,
} from "./coverSpec";
import { buildMultiCoverSVG } from "./coverSvg";
import type { Recipe } from "./coverEngine";

const FIXTURE_PATH = resolve(
  __dirname,
  "__fixtures__/cover-spec.sample.json",
);
const FIXTURE = JSON.parse(readFileSync(FIXTURE_PATH, "utf-8"));

describe("coverSpecSchema", () => {
  it("accepts the canonical sample fixture", () => {
    const parsed = coverSpecSchema.parse(FIXTURE);
    expect(parsed.title).toBe("EXTRA ENGLISH");
    expect(parsed.characters).toHaveLength(2);
    expect(parsed.mood?.palette).toBe("pastell-indie");
  });

  it("requires version 1.0", () => {
    expect(() =>
      coverSpecSchema.parse({ ...FIXTURE, version: "2.0" }),
    ).toThrow();
  });

  it("rejects empty title", () => {
    expect(() =>
      coverSpecSchema.parse({ ...FIXTURE, title: "" }),
    ).toThrow();
  });

  it("requires at least one character", () => {
    expect(() =>
      coverSpecSchema.parse({ ...FIXTURE, characters: [] }),
    ).toThrow();
  });

  it("rejects more than three characters", () => {
    const c = FIXTURE.characters[0];
    expect(() =>
      coverSpecSchema.parse({ ...FIXTURE, characters: [c, c, c, c] }),
    ).toThrow();
  });

  it("rejects unknown palette", () => {
    expect(() =>
      coverSpecSchema.parse({
        ...FIXTURE,
        mood: { palette: "nonexistent-palette" },
      }),
    ).toThrow();
  });

  it("rejects unknown enum value on character", () => {
    expect(() =>
      coverSpecSchema.parse({
        ...FIXTURE,
        characters: [{ ...FIXTURE.characters[0], gender: "other" }],
      }),
    ).toThrow();
  });

  it("accepts minimal spec (title + one empty character)", () => {
    const minimal = {
      version: "1.0",
      title: "UNTITLED",
      characters: [{}],
    };
    const parsed = coverSpecSchema.parse(minimal);
    expect(parsed.characters[0]).toEqual({});
  });

  it("rejects additional top-level properties", () => {
    expect(() =>
      coverSpecSchema.parse({ ...FIXTURE, surprise: true }),
    ).toThrow();
  });
});

describe("validateCoverSpec", () => {
  it("returns parsed spec on valid input", () => {
    const spec = validateCoverSpec(FIXTURE);
    expect(spec.title).toBe("EXTRA ENGLISH");
  });

  it("throws on invalid input", () => {
    expect(() => validateCoverSpec({ version: "1.0" })).toThrow();
  });
});

describe("coverSpecToPlan", () => {
  it("maps enum values to engine-internal fields", async () => {
    const plan = await coverSpecToPlan(FIXTURE);
    const annie = plan.characters[0];
    expect(annie.gender).toBe("weiblich");
    expect(annie.age).toBe("erwachsen");
    expect(annie.hairColorName).toBe("Blond");
    expect(annie.hairColor).toBe("#E8B84B");
    expect(annie.hairStyle).toBe(3); // long
    expect(annie.expression).toBe("smile");
    expect(annie.clothingStyle).toBe("sweater");
    expect(annie.clothingPattern).toBe("stripes");
    expect(annie.prop).toBe("phone");
  });

  it("resolves palette by name to full Palette object with hex", async () => {
    const plan = await coverSpecToPlan(FIXTURE);
    expect(plan.main.palette.name).toBe("Pastell Indie");
    expect(plan.main.palette.accent).toMatch(/^#[0-9a-f]{6}$/i);
    expect(plan.main.palette.bgTop).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("inherits world-level attributes across characters", async () => {
    const plan = await coverSpecToPlan(FIXTURE);
    expect(plan.characters[0].palette.name).toBe(plan.main.palette.name);
    expect(plan.characters[1].palette.name).toBe(plan.main.palette.name);
    expect(plan.characters[0].sceneElement).toBe(plan.main.sceneElement);
    expect(plan.characters[0].typography).toBe(plan.main.typography);
  });

  it("coerces beard to glasses for female characters", async () => {
    const spec = {
      version: "1.0" as const,
      title: "BEARD TEST",
      characters: [
        {
          gender: "female" as const,
          accessory: "beard" as const,
        },
      ],
    };
    const plan = await coverSpecToPlan(spec);
    expect(plan.characters[0].accessory).toBe("brille");
  });

  it("coerces dress to sweater for male characters", async () => {
    const spec = {
      version: "1.0" as const,
      title: "DRESS TEST",
      characters: [
        {
          gender: "male" as const,
          clothingStyle: "dress" as const,
        },
      ],
    };
    const plan = await coverSpecToPlan(spec);
    expect(plan.characters[0].clothingStyle).toBe("sweater");
  });

  it("forces grey hair for elderly", async () => {
    const spec = {
      version: "1.0" as const,
      title: "ELDER",
      characters: [
        {
          age: "elderly" as const,
          hairColor: "blond" as const,
        },
      ],
    };
    const plan = await coverSpecToPlan(spec);
    expect(plan.characters[0].hairColorName).toBe("Grau (Alter)");
    expect(plan.characters[0].hairColor).toBe("#C7CAD1");
  });

  it("fills omitted fields deterministically from the spec hash", async () => {
    const minimal = {
      version: "1.0" as const,
      title: "MINIMAL",
      characters: [{}],
    };
    const plan = await coverSpecToPlan(minimal);
    const recipe: Recipe = plan.characters[0];
    // Every field should be populated, no undefined leaked through.
    expect(typeof recipe.gender).toBe("string");
    expect(typeof recipe.age).toBe("string");
    expect(typeof recipe.hairColor).toBe("string");
    expect(recipe.hairColor.startsWith("#")).toBe(true);
    expect(typeof recipe.hairStyle).toBe("number");
    expect(typeof recipe.skinTone).toBe("string");
    expect(typeof recipe.expression).toBe("string");
    expect(typeof recipe.clothingStyle).toBe("string");
    expect(typeof recipe.prop).toBe("string");
  });

  it("is deterministic — same spec yields identical recipes", async () => {
    const a = await coverSpecToPlan(FIXTURE);
    const b = await coverSpecToPlan(FIXTURE);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("produces a renderable multi-character SVG", async () => {
    const plan = await coverSpecToPlan(FIXTURE);
    const svg = buildMultiCoverSVG(plan.main, plan.characters, plan.title);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    // Two character groups expected (one transform per <g>).
    const transforms = svg.match(/<g transform=/g) ?? [];
    expect(transforms.length).toBeGreaterThanOrEqual(2);
  });
});
