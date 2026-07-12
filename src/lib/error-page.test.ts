import { describe, expect, it } from "vitest";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage", () => {
  it("returns an HTML doctype string", () => {
    const html = renderErrorPage();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain('<html lang="en">');
  });

  it("includes the error title and copy", () => {
    const html = renderErrorPage();
    expect(html).toContain("This page didn't load");
    expect(html).toContain("Something went wrong on our end");
  });

  it("renders a primary retry button and a home link", () => {
    const html = renderErrorPage();
    expect(html).toContain("Try again");
    expect(html).toContain("location.reload()");
    expect(html).toContain("Go home");
    expect(html).toContain('href="/"');
  });

  it("embeds styling", () => {
    const html = renderErrorPage();
    expect(html).toContain("<style>");
    expect(html).toContain(".primary");
    expect(html).toContain(".secondary");
  });
});
