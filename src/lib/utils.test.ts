import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional values via clsx", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("a", false && "no", "b", undefined, null, "c")).toBe("a b c");
  });

  it("dedupes conflicting tailwind classes via twMerge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges mixed conditional and tailwind conflicts", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("text-sm", true && "text-lg", "font-bold")).toBe(
      "text-lg font-bold",
    );
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
