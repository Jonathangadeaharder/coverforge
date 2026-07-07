import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { CoverGenerator } from "@/components/CoverGenerator";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen studio-grid">
      <header className="border-b border-border/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold leading-none text-foreground">
                Coverforge
              </div>
              <div className="text-xs text-muted-foreground">
                Deterministischer Cover-Generator
              </div>
            </div>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            SHA-256 · SVG-Assemblierung · kein Server, keine KI
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10 max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Aus jeder Beschreibung ein Cover — mathematisch reproduzierbar.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Der Text wird normalisiert und per SHA-256 gehasht. Aus den
            Hash-Segmenten werden Charakter, genetische Merkmale, Accessoires,
            Hintergrund und Typografie abgeleitet und als geschichtete Vektor-SVGs
            im Signature-Flat-Look zusammengesetzt. Gleicher Text erzeugt immer
            exakt dasselbe Cover.
          </p>
        </section>

        <CoverGenerator />
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Voll-deterministisch · Vektor-Export als SVG &amp; PNG
      </footer>
    </div>
  );
}
