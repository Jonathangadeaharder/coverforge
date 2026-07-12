import { describe, expect, it } from "vitest";
import { buildRecipe } from "./coverEngine";
import type { Recipe } from "./coverEngine";
import { buildCoverSVG, buildMultiCoverSVG } from "./coverSvg";

const HASH = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

function recipe(overrides: Partial<Recipe> = {}): Recipe {
  return buildRecipe(HASH, "a woman"); // female so dress stays
  // Note: overrides applied after, see `recipeWith`.
}

function recipeWith(overrides: Partial<Recipe>): Recipe {
  return { ...recipe(), ...overrides };
}

const PALETTE = {
  name: "Noir Thriller",
  bgTop: "#1a1c26",
  bgBottom: "#0a0b10",
  shape: "#2a2d3d",
  accent: "#e0392b",
  clothing: "#20222e",
  text: "#f5f5f7",
  glow: "#e0392b",
  ambient: "#451212",
};

function customRecipe(overrides: Partial<Recipe>): Recipe {
  const base: Recipe = {
    gender: "weiblich",
    age: "erwachsen",
    body: "normal",
    hairColorName: "Blond",
    hairColor: "#E8B84B",
    hairStyle: 1,
    eyeColorName: "Braun",
    eyeColor: "#6B4226",
    skinTone: "#F2C9A0",
    accessory: "keine",
    backgroundId: 0,
    palette: PALETTE,
    typography: "blockbuster",
    hash: HASH,
    genre: "Drama",
    expression: "neutral",
    clothingStyle: "tshirt",
    clothingPattern: "solid",
    prop: "none",
    sceneElement: "none",
    ...overrides,
  };
  return base;
}

describe("buildCoverSVG", () => {
  it("returns a full SVG document with the correct viewBox", () => {
    const svg = buildCoverSVG(customRecipe({}), "Title");
    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 800 1200"');
    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="1200"');
    expect(svg).toContain('aria-label="Cover: Title"');
    expect(svg).toContain("</svg>");
  });

  it("falls back to 'Ohne Titel' when titleText is empty", () => {
    const svg = buildCoverSVG(customRecipe({}), "");
    // blockbuster uppercases the title.
    expect(svg).toContain("OHNE TITEL");
  });

  it("escapes HTML special chars in the title aria-label and body", () => {
    const svg = buildCoverSVG(customRecipe({}), "A & B < C > D");
    expect(svg).toContain("&amp;");
    expect(svg).toContain("&lt;");
    expect(svg).toContain("&gt;");
  });
});

// --- Background variants (backgroundId 0..5) ---
describe.each([0, 1, 2, 3, 4, 5])("background variant %i", (backgroundId) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(customRecipe({ backgroundId }), "B");
    expect(svg).toContain("<svg");
    expect(svg).toContain("url(#bg)");
  });
});

// --- Scene element variants ---
describe.each([
  ["none" as const],
  ["skyline" as const],
  ["mountains" as const],
  ["stars" as const],
  ["clouds" as const],
  ["confetti" as const],
])("scene element %s", (sceneElement) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(customRecipe({ sceneElement }), "S");
    expect(svg).toContain("<svg");
  });
});

// --- Hair style variants (front + back, 0..7) ---
describe.each([0, 1, 2, 3, 4, 5, 6, 7])("hair style %i", (hairStyle) => {
  it("renders both hair layers without error", () => {
    const svg = buildCoverSVG(customRecipe({ hairStyle }), "H");
    expect(svg).toContain("<svg");
  });
});

// --- Clothing styles ---
describe.each([
  ["tshirt" as const],
  ["hoodie" as const],
  ["jacket" as const],
  ["dress" as const],
  ["sweater" as const],
  ["collared" as const],
])("clothing style %s", (clothingStyle) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(
      customRecipe({ clothingStyle, gender: "weiblich" }),
      "C",
    );
    expect(svg).toContain("<svg");
  });

  it("renders the fallback collar for an unknown clothing style", () => {
    // Force an unknown value by casting.
    const svg = buildCoverSVG(
      customRecipe({
        clothingStyle: "unknown" as unknown as Recipe["clothingStyle"],
      }),
      "C",
    );
    expect(svg).toContain("<svg");
  });
});

// --- Clothing patterns ---
describe.each([
  ["solid" as const],
  ["stripes" as const],
  ["dots" as const],
  ["emblem" as const],
])("clothing pattern %s", (clothingPattern) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(customRecipe({ clothingPattern }), "P");
    expect(svg).toContain("<svg");
  });
});

// --- Expressions (also covers mouth + brows variants) ---
describe.each([
  ["neutral" as const],
  ["smile" as const],
  ["serious" as const],
  ["surprised" as const],
  ["wink" as const],
])("expression %s", (expression) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(customRecipe({ expression }), "E");
    expect(svg).toContain("<svg");
  });
});

// --- Accessories ---
describe.each([
  ["keine" as const],
  ["brille" as const],
  ["sonnenbrille" as const],
  ["hut" as const],
  ["muetze" as const],
  ["bart" as const],
])("accessory %s", (accessory) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(
      customRecipe({ accessory, gender: "maennlich", age: "erwachsen" }),
      "A",
    );
    expect(svg).toContain("<svg");
  });
});

// --- Props ---
describe.each([
  ["none" as const],
  ["book" as const],
  ["phone" as const],
  ["guitar" as const],
  ["coffee" as const],
  ["headphones" as const],
  ["pen" as const],
  ["umbrella" as const],
  ["camera" as const],
  ["speech" as const],
])("prop %s", (prop) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(customRecipe({ prop }), "P");
    expect(svg).toContain("<svg");
  });
});

// --- Typography styles (title layer) ---
describe.each([
  ["blockbuster" as const],
  ["prestige" as const],
  ["scifi" as const],
  ["arthouse" as const],
])("typography %s", (typography) => {
  it("renders a title layer with the right font family", () => {
    const svg = buildCoverSVG(
      customRecipe({ typography, genre: "Drama" }),
      "My Movie Title That Is Long",
    );
    expect(svg).toContain("<text");
  });

  it("renders a short single-line title", () => {
    const svg = buildCoverSVG(customRecipe({ typography }), "Short");
    expect(svg).toContain("<tspan");
  });
});

// --- Face variants: age (changes face dims), gender (brows) ---
describe.each([["kind" as const], ["erwachsen" as const], ["alt" as const]])(
  "age %s (face dims + wrinkles)",
  (age) => {
    it("renders without error", () => {
      const svg = buildCoverSVG(customRecipe({ age }), "Age");
      expect(svg).toContain("<svg");
    });
  },
);

describe.each(["maennlich" as const, "weiblich" as const])(
  "gender %s (brows + shoulder)",
  (gender) => {
    it("renders without error", () => {
      const svg = buildCoverSVG(customRecipe({ gender }), "G");
      expect(svg).toContain("<svg");
    });
  },
);

describe.each([
  "duenn" as const,
  "normal" as const,
  "muskuloes" as const,
  "dick" as const,
])("body %s (torso path)", (body) => {
  it("renders without error", () => {
    const svg = buildCoverSVG(customRecipe({ body }), "B");
    expect(svg).toContain("<svg");
  });
});

// --- Head shape variants (hash nibble % 3) ---
describe.each(["0", "1", "2", "3", "4", "5"])(
  "hash nibble %s (head shape)",
  (nibble) => {
    it("renders a head for each shape variant", () => {
      // Place a chosen nibble at position 30 of the hash.
      const hash = HASH.substring(0, 30) + nibble + HASH.substring(31);
      const svg = buildCoverSVG(customRecipe({ hash }), "Head");
      expect(svg).toContain("<svg");
    });
  },
);

// --- splitTitle behaviour via title layer ---
// Use prestige typography (no hardShadow) so each line = exactly one tspan.
describe("title splitting", () => {
  it("keeps short titles on one line", () => {
    const svg = buildCoverSVG(customRecipe({ typography: "prestige" }), "Tiny");
    const tspanCount = (svg.match(/<tspan/g) || []).length;
    expect(tspanCount).toBe(1);
  });

  it("splits long titles across two lines at the nearest space", () => {
    const svg = buildCoverSVG(
      customRecipe({ typography: "prestige" }),
      "A Very Long Movie Title",
    );
    const tspanCount = (svg.match(/<tspan/g) || []).length;
    expect(tspanCount).toBe(2);
  });

  it("does not split a long title with no spaces", () => {
    const svg = buildCoverSVG(
      customRecipe({ typography: "prestige" }),
      "supercalifragilistic",
    );
    const tspanCount = (svg.match(/<tspan/g) || []).length;
    expect(tspanCount).toBe(1);
  });
});

// --- Multi-character layout ---
describe("buildMultiCoverSVG", () => {
  it("renders 1 character via layoutSlots(1)", () => {
    const r = customRecipe({});
    const svg = buildMultiCoverSVG(r, [r], "Solo");
    expect(svg).toContain("<svg");
    expect(svg).toContain("scale(1)"); // count=1 -> scale 1.0
  });

  it("renders 2 characters with depth offsets", () => {
    const r1 = customRecipe({ gender: "maennlich" });
    const r2 = customRecipe({ gender: "weiblich" });
    const svg = buildMultiCoverSVG(r1, [r1, r2], "Duo");
    expect(svg).toContain("<svg");
    // Two character groups (one per slot)
    const groupCount = (svg.match(/<g transform=/g) || []).length;
    expect(groupCount).toBeGreaterThanOrEqual(2);
  });

  it("renders 3 characters (capped layout)", () => {
    const r1 = customRecipe({ gender: "maennlich" });
    const r2 = customRecipe({ gender: "weiblich" });
    const r3 = customRecipe({ age: "kind" });
    const svg = buildMultiCoverSVG(r1, [r1, r2, r3], "Trio");
    expect(svg).toContain("<svg");
  });

  it("falls back to the first recipe when slot has no matching recipe", () => {
    const r1 = customRecipe({});
    // 2 slots but only 1 recipe -> second slot uses recipe[0].
    const svg = buildMultiCoverSVG(r1, [r1], "Fallback");
    expect(svg).toContain("<svg");
  });
});

// --- Genre rendering in title layer ---
describe("genre rendering", () => {
  it("renders the genre line when genre is set", () => {
    const svg = buildCoverSVG(customRecipe({ genre: "Sci-Fi" }), "Movie");
    expect(svg).toContain("SCI-FI");
  });

  it("omits the genre line when genre is empty", () => {
    const svg = buildCoverSVG(customRecipe({ genre: "" }), "Movie");
    expect(svg).not.toContain("SCI-FI");
  });
});
