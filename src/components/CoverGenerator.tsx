import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Shuffle,
  FileCode2,
  Copy,
  Check,
  Sliders,
  Hash,
  Tv,
  Eye,
  Info,
  Layers,
  Grid,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateCoverRecipe,
  generateMultiCoverPlan,
  buildRecipe,
  buildRecipeWithSteps,
  type Recipe,
  type DeterministicResult,
  type HashStepDetail,
  type Gender,
  type Age,
  type Body,
  type Accessory,
  type TypographyStyle,
  PRESET_MOVIES,
  ACC_LABEL,
  AGE_LABEL,
  BODY_LABEL,
  GENDER_LABEL,
  TYPO_LABEL,
} from "@/lib/coverEngine";
import { buildCoverSVG, buildMultiCoverSVG } from "@/lib/coverSvg";
import { cn } from "@/lib/utils";

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
      <span
        className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white/15"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-xs font-medium text-foreground">{color}</div>
      </div>
    </div>
  );
}

// --- Manual attribute controls config ---

const MANUAL_POOLS = {
  gender: ["maennlich", "weiblich"] as Gender[],
  age: ["kind", "erwachsen", "alt"] as Age[],
  body: ["duenn", "normal", "muskuloes", "dick"] as Body[],
  accessory: ["keine", "brille", "sonnenbrille", "hut", "muetze", "bart"] as Accessory[],
  typography: ["blockbuster", "prestige", "scifi", "arthouse"] as TypographyStyle[],
};

const MANUAL_LABELS: Record<string, Record<string, string>> = {
  gender: { maennlich: "Männlich", weiblich: "Weiblich" },
  age: { kind: "Kind", erwachsen: "Erwachsen", alt: "Alt" },
  body: { duenn: "Dünn", normal: "Normal", muskuloes: "Muskulös", dick: "Kräftig" },
  accessory: {
    keine: "Keine", brille: "Brille", sonnenbrille: "Sonnenbrille",
    hut: "Hut", muetze: "Mütze", bart: "Bart",
  },
  typography: {
    blockbuster: "Blockbuster", prestige: "Prestige",
    scifi: "Sci-Fi", arthouse: "Arthouse",
  },
};

const MANUAL_CONFIG = [
  { key: "gender" as const, label: "Geschlecht", cols: 2 },
  { key: "age" as const, label: "Alter", cols: 3 },
  { key: "body" as const, label: "Statur", cols: 4 },
  { key: "accessory" as const, label: "Accessoire", cols: 3 },
  { key: "typography" as const, label: "Typografie", cols: 2 },
] as const;

export function CoverGenerator() {
  // Input states
  const [desc, setDesc] = useState(PRESET_MOVIES[0].description);
  const [title, setTitle] = useState(PRESET_MOVIES[0].title);
  const [genre, setGenre] = useState(PRESET_MOVIES[0].genre);
  const [hashResult, setHashResult] = useState<DeterministicResult | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  // Manual override
  const [isManual, setIsManual] = useState(false);
  const [manualRecipe, setManualRecipe] = useState<Recipe | null>(null);

  // Multi-character rendering: auto-detected from description, toggleable
  const [multiChar, setMultiChar] = useState(true);
  const [charRecipes, setCharRecipes] = useState<Recipe[]>([]);

  // Copy feedback
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);

  // Deterministic hashing on title/description/genre change
  useEffect(() => {
    let active = true;
    const calc = async () => {
      setIsHashing(true);
      const result = await generateCoverRecipe(title, desc, genre);
      const plan = await generateMultiCoverPlan(title, desc, genre);
      if (active) {
        setHashResult(result);
        if (!isManual) {
          setManualRecipe(result.recipe);
        }
        setCharRecipes(plan.characters);
        setIsHashing(false);
      }
    };
    calc();
    return () => { active = false; };
  }, [title, desc, genre, isManual]);

  const activeRecipe = isManual ? manualRecipe : hashResult?.recipe ?? manualRecipe;

  const svg = useMemo(() => {
    if (!activeRecipe) return "";
    if (multiChar && charRecipes.length > 1) {
      return buildMultiCoverSVG(activeRecipe, charRecipes, title);
    }
    return buildCoverSVG(activeRecipe, title);
  }, [activeRecipe, charRecipes, multiChar, title]);

  const loadPreset = (preset: (typeof PRESET_MOVIES)[0]) => {
    setTitle(preset.title);
    setDesc(preset.description);
    setGenre(preset.genre);
  };

  const randomizeInputs = () => {
    const titles = [
      "DARK SILENCE", "CHRONO TRIGGER", "BAVARIA NOIR", "ROBOTIC HEART",
      "GOLDEN AGE", "NEON NIGHTS", "THE LAST CABIN", "PASTEL PARADISO",
    ];
    const descriptions = [
      "Ein packender Cyberpunk-Thriller über eine einsame Programmiererin, die eine künstliche Seele im Firmennetzwerk entdeckt.",
      "Eine herzerwärmende Arthouse-Komödie über ein Kind, das fälschlicherweise glaubt, sein Haustier sei ein außerirdischer Spion.",
      "Ein historisches Drama im nebligen Schwarzwald des 19. Jahrhunderts um einen alternden Uhrmacher und ein dunkles Familiengeheimnis.",
      "Eine rasante Action-Komödie über eine dicke, rothaarige Detektivin und ihren extrem muskulösen Sidekick in Miami.",
      "Ein tiefgründiger Dokumentarfilm über vergessene Ruinen im Dschungel und die Wissenschaft hinter uralten Himmelskarten.",
      "Ein magisches Fantasy-Epos über zwei jugendliche Lehrlinge, die versehentlich die Sternenbilder am Nachthimmel löschen.",
    ];
    const genres = [
      "Sci-Fi / Cyberpunk", "Comedy / Indie", "Drama / History",
      "Action / Comedy", "Documentary", "Fantasy / Adventure",
    ];
    setTitle(titles[Math.floor(Math.random() * titles.length)]);
    setDesc(descriptions[Math.floor(Math.random() * descriptions.length)]);
    setGenre(genres[Math.floor(Math.random() * genres.length)]);
  };

  const randomizeSeed = useCallback(() => {
    const hash = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, "0"),
    ).join("");
    const result = buildRecipeWithSteps(hash);
    setHashResult(result);
    setManualRecipe(result.recipe);
    setDesc(`Zufalls-Seed ${hash.slice(0, 8)} — manuell erzeugte Kombination.`);
  }, []);

  const toggleManual = (enabled: boolean) => {
    setIsManual(enabled);
    if (!enabled && hashResult) {
      setManualRecipe(hashResult.recipe);
    }
  };

  const updateManualAttr = (key: keyof Recipe, value: string) => {
    setManualRecipe((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const downloadSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "cover").replace(/\s+/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("SVG heruntergeladen");
  };

  const downloadPNG = () => {
    if (!svg) return;
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 800, 1200);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (!b) return;
        const pngUrl = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${(title || "cover").replace(/\s+/g, "_")}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        toast.success("PNG (800×1200) heruntergeladen");
      }, "image/png");
    };
    img.onerror = () => toast.error("PNG-Export fehlgeschlagen");
    img.src = url;
  };

  const copyHash = async () => {
    if (!hashResult) return;
    await navigator.clipboard.writeText(hashResult.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  };

  const copySvgCode = () => {
    if (!svg) return;
    navigator.clipboard.writeText(svg);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 1500);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,440px)]">
      {/* LEFT: Controls */}
      <div className="order-2 space-y-6 lg:order-1">
        {/* Box 1: Description Input & Presets */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Beschreibung
              </span>
            </div>
            <button
              onClick={randomizeInputs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-accent"
            >
              <Shuffle className="h-3 w-3" /> Zufall
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
            className="mb-3 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground outline-none ring-ring/40 transition focus:ring-2"
          />

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Genre / Tag"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground outline-none ring-ring/40 transition focus:ring-2"
            />
          </div>

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            placeholder="Beschreibe die Handlung, das Genre, die Stimmung…"
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none ring-ring/40 transition focus:ring-2"
          />

          {/* Presets */}
          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Grid className="h-3.5 w-3.5" /> PRESETS
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_MOVIES.map((p) => {
                const active = title.toUpperCase() === p.title.toUpperCase();
                return (
                  <button
                    key={p.id}
                    onClick={() => loadPreset(p)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-xs transition",
                      active
                        ? "border-primary/70 bg-primary/10 text-primary font-semibold"
                        : "border-border bg-secondary/40 text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Box 2: Hash Breakdown Table */}
        {hashResult && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  SHA-256 Workflow
                </span>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                100% Deterministisch
              </span>
            </div>

            {/* Normalized text */}
            <div className="mb-3 rounded-xl border border-border bg-secondary/30 p-3">
              <div className="mb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Normalisierter Text
              </div>
              <div className="break-all rounded-lg border border-border/50 bg-background/50 p-2 text-[11px] font-mono text-muted-foreground line-clamp-2">
                {hashResult.normalizedText}
              </div>
            </div>

            {/* Hash hex */}
            <div className="mb-3 rounded-xl border border-border bg-secondary/30 p-3">
              <div className="mb-1 flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                <span>SHA-256 Hash (64 Hex)</span>
                <button
                  onClick={copyHash}
                  className="flex items-center gap-1 transition hover:text-foreground"
                >
                  {copiedHash ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                  {copiedHash ? "Kopiert" : "Kopieren"}
                </button>
              </div>
              <div className="break-all rounded-lg border border-border/50 bg-background/50 p-2 font-mono text-xs font-bold tracking-wider text-primary">
                {hashResult.hash}
              </div>
            </div>

            {/* Steps table */}
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-12 gap-2 bg-secondary/40 p-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-5">Attribut</div>
                <div className="col-span-3">Segment</div>
                <div className="col-span-1 text-right">Int</div>
                <div className="col-span-3 text-right">Wert</div>
              </div>
              {hashResult.steps.map((step, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 border-t border-border/50 p-2.5 text-xs font-mono"
                >
                  <div className="col-span-5 font-sans font-medium text-muted-foreground">
                    <span className="mr-1 text-[10px] text-muted-foreground/50">L{i + 1}</span>
                    {step.attributeName}
                  </div>
                  <div className="col-span-3 text-muted-foreground">{step.hexValue}</div>
                  <div className="col-span-1 text-right text-primary">{step.intValue}</div>
                  <div className="col-span-3 text-right font-bold text-emerald-500">
                    {step.resultValue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Box 3: Manual Override Playground */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Modularer Baukasten
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Manuell</span>
              <button
                onClick={() => toggleManual(!isManual)}
                className={cn(
                  "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                  isManual ? "bg-primary" : "bg-secondary border border-border",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                    isManual ? "translate-x-5" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isManual && manualRecipe ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 overflow-hidden"
              >
                {MANUAL_CONFIG.map(({ key, label, cols }) => (
                  <div key={key}>
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono text-foreground">
                        {MANUAL_LABELS[key]?.[String(manualRecipe[key])] ?? String(manualRecipe[key])}
                      </span>
                    </div>
                    <div className={cn("grid gap-2", `grid-cols-${cols}`)}>
                      {MANUAL_POOLS[key].map((val) => (
                        <button
                          key={val}
                          onClick={() => updateManualAttr(key, val)}
                          className={cn(
                            "rounded-lg border py-1.5 text-xs transition",
                            manualRecipe[key] === val
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {MANUAL_LABELS[key]?.[val] ?? val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground">Deterministisch</p>
                  <p>
                    Alle Merkmale sind an den SHA-256-Hash gekoppelt. Aktiviere
                    "Manuell" um Kombinationen zu testen.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Box 4: Recipe Summary */}
        {activeRecipe && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 text-sm font-semibold text-foreground">
              Rezept
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Chip label="Geschlecht" value={GENDER_LABEL[activeRecipe.gender]} />
              <Chip label="Alter" value={AGE_LABEL[activeRecipe.age]} />
              <Chip label="Statur" value={BODY_LABEL[activeRecipe.body]} />
              <Chip label="Accessoire" value={ACC_LABEL[activeRecipe.accessory]} />
              <Chip label="Typografie" value={TYPO_LABEL[activeRecipe.typography]} />
              <Chip label="Palette" value={activeRecipe.palette.name} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Swatch label="Haare" color={activeRecipe.hairColor} />
              <Swatch label="Augen" color={activeRecipe.eyeColor} />
              <Swatch label="Akzent" color={activeRecipe.palette.accent} />
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Cover Preview */}
      <div className="order-1 lg:order-2">
        <div className="sticky top-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Vorschau</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMultiChar((v) => !v)}
                disabled={charRecipes.length < 2}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-40",
                  multiChar && charRecipes.length > 1
                    ? "border-violet-500/20 bg-violet-500/10 text-violet-500"
                    : "border-border bg-secondary/40 text-muted-foreground",
                )}
              >
                {multiChar && charRecipes.length > 1
                  ? `👥 ${charRecipes.length} Char`
                  : "👤 Single"}
              </button>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isManual
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                )}
              >
                {isManual ? "⚠ Manuell" : "✓ Deterministisch"}
              </span>
            </div>
          </div>

          <div
            ref={frameRef}
            className="cover-frame overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/40"
            dangerouslySetInnerHTML={{ __html: svg }}
          />

          {/* Export buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={downloadSVG}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-accent"
            >
              <FileCode2 className="h-4 w-4 text-primary" /> SVG
            </button>
            <button
              onClick={downloadPNG}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
            >
              <Download className="h-4 w-4" /> PNG
            </button>
            <button
              onClick={randomizeSeed}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Shuffle className="h-4 w-4" /> Seed
            </button>
            <button
              onClick={copySvgCode}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              {copiedSvg ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-primary" />}
              {copiedSvg ? "Kopiert!" : "Code"}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Vektor · 800 × 1200 · skalierbar · identischer Text = identisches Cover
          </p>
        </div>
      </div>
    </div>
  );
}
