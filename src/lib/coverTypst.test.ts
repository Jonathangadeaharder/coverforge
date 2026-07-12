import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "./coverEngine";

// --- Mocks for volatile deps (typst CLI subprocess + filesystem) ----------
const execAsyncMock = vi.fn();

vi.mock("util", () => ({
  promisify: () => execAsyncMock,
}));

vi.mock("child_process", () => ({
  exec: vi.fn(),
}));

const fsMock = {
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  readFileSync: vi.fn(() => "svg-content"),
};

vi.mock("fs", () => ({ ...fsMock, default: fsMock }));

const { compileTypst, generateTypstCode } = await import("./coverTypst");

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

describe("generateTypstCode", () => {
  it("emits an import for coverforge.typ and a render-cover call", () => {
    const main = baseRecipe();
    const code = generateTypstCode(main, [], "My Title");
    expect(code).toContain('#import "/src/lib/coverforge.typ": render-cover');
    expect(code).toContain("#render-cover(");
    expect(code).toContain('"My Title"');
    expect(code).toContain('"Drama"');
  });

  it("formats the main recipe and each character recipe as Typst dictionaries", () => {
    const main = baseRecipe({ genre: "Sci-Fi" });
    const chars = [
      baseRecipe({ gender: "weiblich", hairStyle: 3 }),
      baseRecipe({ body: "dick" }),
    ];
    const code = generateTypstCode(main, chars, "Group");
    expect(code).toContain('gender: "maennlich"');
    expect(code).toContain('gender: "weiblich"');
    expect(code).toContain('body: "dick"');
    expect(code).toContain("hair-style: 3");
    // Palette sub-dict present.
    expect(code).toContain("bg-top:");
    expect(code).toContain("palette: (");
  });

  it("escapes double quotes and backslashes in the title", () => {
    const main = baseRecipe();
    const code = generateTypstCode(main, [], 'He said "hi" \\ done');
    expect(code).toContain('\\"hi\\"');
    expect(code).toContain("\\\\ done");
  });

  it("handles an empty character list", () => {
    const code = generateTypstCode(baseRecipe(), [], "Solo");
    expect(code).toContain("#render-cover(");
    // Empty chars array renders as an empty tuple entry.
    expect(code).toContain("(\n    ,\n  )");
  });
});

describe("compileTypst", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMock.existsSync.mockReturnValue(true);
    execAsyncMock.mockReset();
  });

  it("writes the source to a temp file, runs typst, and returns the output path", async () => {
    execAsyncMock.mockResolvedValue({ stdout: "", stderr: "" });

    const out = await compileTypst("#render-cover", "/tmp/out.svg");

    expect(fsMock.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("cover-"),
      "#render-cover",
      "utf-8",
    );
    expect(execAsyncMock).toHaveBeenCalledTimes(1);
    const cmd = execAsyncMock.mock.calls[0][0] as string;
    expect(cmd).toContain("typst compile");
    expect(cmd).toContain("--root");
    expect(cmd).toContain("/tmp/out.svg");
    expect(out).toBe("/tmp/out.svg");
    // Temp source cleaned up.
    expect(fsMock.unlinkSync).toHaveBeenCalledWith(
      expect.stringContaining("cover-"),
    );
  });

  it("creates the temp directory when it does not exist", async () => {
    fsMock.existsSync.mockReturnValue(false);
    execAsyncMock.mockResolvedValue({ stdout: "", stderr: "" });

    await compileTypst("code", "/tmp/out.svg");

    expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });

  it("re-throws typst failures but still cleans up the temp source", async () => {
    execAsyncMock.mockRejectedValue(new Error("typst compile error"));

    await expect(compileTypst("bad", "/tmp/out.svg")).rejects.toThrow(
      "typst compile error",
    );
    expect(fsMock.unlinkSync).toHaveBeenCalledWith(
      expect.stringContaining("cover-"),
    );
  });

  it("does not throw when the temp source file is already gone in finally", async () => {
    fsMock.existsSync.mockReturnValue(false);
    execAsyncMock.mockResolvedValue({ stdout: "", stderr: "" });

    await expect(compileTypst("code", "/tmp/out.svg")).resolves.toBe(
      "/tmp/out.svg",
    );
    // unlinkSync not called because existsSync returned false in finally.
    expect(fsMock.unlinkSync).not.toHaveBeenCalled();
  });
});
