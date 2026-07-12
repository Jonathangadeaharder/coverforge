import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "./coverEngine";

// --- Mocks for volatile deps (filesystem + typst subprocess via coverTypst) ---
const fsMock = {
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(() => "<svg></svg>"),
  unlinkSync: vi.fn(),
};

vi.mock("fs", () => ({ ...fsMock, default: fsMock }));

const generateTypstCodeMock = vi.fn(
  () => "#render-cover(...)", // pure stub — only checks it's called
);
const compileTypstMock = vi.fn(async () => "/tmp/render-x.svg");

vi.mock("./coverTypst", () => ({
  generateTypstCode: generateTypstCodeMock,
  compileTypst: compileTypstMock,
}));

// Capture the server-fn handler so we can invoke it directly without the
// TanStack Start runtime/transform pipeline (the vite plugin that rewrites
// `.handler(fn)` into `.handler(extractedFn, fn)` does not run under vitest).
let capturedHandler: (ctx: { data: unknown }) => Promise<unknown>;

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      validator: () => builder,
      inputValidator: () => builder,
      middleware: () => builder,
      handler: (fn: (ctx: { data: unknown }) => Promise<unknown>) => {
        capturedHandler = fn;
        // The exported server fn is callable; route through the captured handler.
        const fn_ = async (opts: { data: unknown }) =>
          capturedHandler({ data: opts.data });
        return fn_;
      },
    };
    return builder;
  },
}));

// Silence console.error from the catch branch.
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

const { renderCoverFn } = await import("./coverServer");

function baseRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    gender: "maennlich",
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
    palette: {
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
    typography: "blockbuster",
    hash: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
    genre: "Drama",
    expression: "neutral",
    clothingStyle: "tshirt",
    clothingPattern: "solid",
    prop: "none",
    sceneElement: "none",
    ...overrides,
  };
}

describe("renderCoverFn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMock.existsSync.mockReturnValue(true);
    generateTypstCodeMock.mockReturnValue("#render-cover(...)");
    compileTypstMock.mockResolvedValue("/tmp/render-x.svg");
  });

  it("generates typst code, compiles, reads the svg, and returns success", async () => {
    const main = baseRecipe();
    const chars = [baseRecipe({ gender: "weiblich" })];
    const result = await renderCoverFn({
      data: { main, characters: chars, title: "My Cover" },
    });

    expect(generateTypstCodeMock).toHaveBeenCalledWith(main, chars, "My Cover");
    expect(compileTypstMock).toHaveBeenCalledTimes(1);
    expect(fsMock.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining("render-"),
      "utf-8",
    );
    expect(fsMock.unlinkSync).toHaveBeenCalledWith(
      expect.stringContaining("render-"),
    );
    expect(result).toEqual({ success: true, svg: "<svg></svg>" });
  });

  it("creates the temp directory when it does not exist", async () => {
    fsMock.existsSync.mockReturnValue(false);

    await renderCoverFn({
      data: {
        main: baseRecipe(),
        characters: [],
        title: "Solo",
      },
    });

    expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });

  it("returns a failure result when the compiled svg file is missing", async () => {
    fsMock.existsSync.mockReturnValue(false); // output svg missing after compile

    const result = await renderCoverFn({
      data: {
        main: baseRecipe(),
        characters: [],
        title: "Solo",
      },
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to compile Typst cover.",
    });
    expect(fsMock.readFileSync).not.toHaveBeenCalled();
  });

  it("returns a failure result with the error message when compileTypst throws an Error", async () => {
    compileTypstMock.mockRejectedValue(new Error("typst broke"));

    const result = await renderCoverFn({
      data: {
        main: baseRecipe(),
        characters: [],
        title: "Solo",
      },
    });

    expect(result).toEqual({ success: false, error: "typst broke" });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("falls back to String(err) when a non-Error is thrown", async () => {
    compileTypstMock.mockRejectedValue("string failure");

    const result = await renderCoverFn({
      data: {
        main: baseRecipe(),
        characters: [],
        title: "Solo",
      },
    });

    expect(result).toEqual({ success: false, error: "string failure" });
  });

  it("reuses an existing temp directory when present", async () => {
    fsMock.existsSync.mockReturnValue(true);

    await renderCoverFn({
      data: { main: baseRecipe(), characters: [], title: "Solo" },
    });

    // Directory already exists -> mkdirSync not called.
    expect(fsMock.mkdirSync).not.toHaveBeenCalled();
  });
});
