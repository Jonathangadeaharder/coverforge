// Deterministische SVG-Assemblierung im Flat-Signature-Look.
// Alle Layer teilen exakt dasselbe Koordinatensystem: viewBox 0 0 800 1200.
// Der Hals-Anschluss ist bei jeder Statur identisch breit -> nahtlose Kombination.

import type {
  Recipe,
  TypographyStyle,
  Expression,
  ClothingStyle,
  ClothingPattern,
  Prop,
  SceneElement,
} from "./coverEngine";

const W = 800;
const H = 1200;
const CX = 400;

const AGE_DIMS: Record<Recipe["age"], { rx: number; ry: number; cy: number }> = {
  kind: { rx: 112, ry: 118, cy: 480 },
  erwachsen: { rx: 100, ry: 116, cy: 462 },
  alt: { rx: 98, ry: 116, cy: 462 },
};

const NECK_HALF = 38;
const NECK_BOTTOM = 600;

const SHOULDER_BASE: Record<Recipe["body"], number> = {
  duenn: 118,
  normal: 158,
  muskuloes: 200,
  dick: 190,
};

function darken(hex: string, amt = 0.16): string {
  const n = hex.replace("#", "");
  const r = Math.max(0, Math.round(parseInt(n.substr(0, 2), 16) * (1 - amt)));
  const g = Math.max(0, Math.round(parseInt(n.substr(2, 2), 16) * (1 - amt)));
  const b = Math.max(0, Math.round(parseInt(n.substr(4, 2), 16) * (1 - amt)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function lighten(hex: string, amt = 0.2): string {
  const n = hex.replace("#", "");
  const r = Math.min(255, Math.round(parseInt(n.substr(0, 2), 16) + (255 - parseInt(n.substr(0, 2), 16)) * amt));
  const g = Math.min(255, Math.round(parseInt(n.substr(2, 2), 16) + (255 - parseInt(n.substr(2, 2), 16)) * amt));
  const b = Math.min(255, Math.round(parseInt(n.substr(4, 2), 16) + (255 - parseInt(n.substr(4, 2), 16)) * amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// --- LAYER 1: Hintergrund ------------------------------------------------

function background(r: Recipe): string {
  const p = r.palette;
  const shapes: string[] = [];
  switch (r.backgroundId) {
    case 0: // Strahlen
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const x = CX + Math.cos(a) * 900;
        const y = 470 + Math.sin(a) * 900;
        const a2 = a + 0.13;
        const x2 = CX + Math.cos(a2) * 900;
        const y2 = 470 + Math.sin(a2) * 900;
        if (i % 2 === 0)
          shapes.push(
            `<path d="M${CX} 470 L${x} ${y} L${x2} ${y2} Z" fill="${p.shape}" opacity="0.55"/>`,
          );
      }
      break;
    case 1: // konzentrische Kreise
      for (let i = 6; i >= 1; i--)
        shapes.push(
          `<circle cx="${CX}" cy="440" r="${i * 130}" fill="none" stroke="${p.shape}" stroke-width="14" opacity="0.5"/>`,
        );
      break;
    case 2: // Raster / Grid
      for (let i = 0; i <= 10; i++) {
        shapes.push(
          `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="${H}" stroke="${p.shape}" stroke-width="2" opacity="0.4"/>`,
        );
        shapes.push(
          `<line x1="0" y1="${i * 120}" x2="${W}" y2="${i * 120}" stroke="${p.shape}" stroke-width="2" opacity="0.4"/>`,
        );
      }
      break;
    case 3: // Punkte-Halbton
      for (let y = 0; y < 12; y++)
        for (let x = 0; x < 8; x++)
          shapes.push(
            `<circle cx="${x * 110 + 40}" cy="${y * 110 + 40}" r="${8 + ((x + y) % 3) * 4}" fill="${p.shape}" opacity="0.4"/>`,
          );
      break;
    case 4: // aufgehende Sonne / Halbkreis
      shapes.push(
        `<circle cx="${CX}" cy="900" r="520" fill="${p.shape}" opacity="0.55"/>`,
      );
      shapes.push(
        `<circle cx="${CX}" cy="430" r="230" fill="${p.glow}" opacity="0.28"/>`,
      );
      break;
    default: // 5: diagonale Streifen
      for (let i = -6; i < 16; i++)
        if (i % 2 === 0)
          shapes.push(
            `<path d="M${i * 90} 0 L${i * 90 + 90} 0 L${i * 90 - 400} ${H} L${i * 90 - 490} ${H} Z" fill="${p.shape}" opacity="0.4"/>`,
          );
  }
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.bgTop}"/>
      <stop offset="1" stop-color="${p.bgBottom}"/>
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.42"/>
    </radialGradient>
    <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" floodOpacity="0.3"/>
    </filter>
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g>${shapes.join("")}</g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>`;
}

// --- LAYER 1.5: Scene elements (between bg and character) ----------------

function scene(r: Recipe): string {
  const p = r.palette;
  const sc = r.sceneElement;
  if (sc === "none") return "";

  if (sc === "skyline") {
    // Abstract flat city skyline silhouette at horizon
    const buildings = [
      [80, 900, 60, 200],
      [150, 920, 50, 180],
      [210, 880, 70, 220],
      [290, 910, 40, 190],
      [340, 860, 80, 240],
      [430, 890, 55, 210],
      [495, 870, 65, 230],
      [570, 905, 45, 195],
      [625, 875, 75, 225],
      [710, 900, 50, 200],
    ];
    const rects = buildings
      .map(
        ([x, y, w, h]) =>
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.shape}" opacity="0.6"/>` +
          `<rect x="${x + 8}" y="${y + 14}" width="10" height="10" fill="${p.accent}" opacity="0.9"/>` +
          `<rect x="${x + 26}" y="${y + 14}" width="10" height="10" fill="${p.glow}" opacity="0.7"/>`,
      )
      .join("");
    return `<g opacity="0.7">${rects}</g>`;
  }

  if (sc === "mountains") {
    const col = p.shape;
    const col2 = darken(p.bgBottom, 0.15);
    return `<g opacity="0.65">
      <polygon points="0,${H} 180,740 360,${H}" fill="${col}" opacity="0.55"/>
      <polygon points="120,${H} 360,680 600,${H}" fill="${darken(col, 0.1)}" opacity="0.7"/>
      <polygon points="300,${H} 520,720 740,${H}" fill="${col2}" opacity="0.5"/>
      <polygon points="480,${H} 700,760 ${W},${H}" fill="${col}" opacity="0.4"/>
    </g>`;
  }

  if (sc === "stars") {
    // Deterministic star field from hash
    const stars: string[] = [];
    const hash = r.hash;
    for (let i = 0; i < 28; i++) {
      const hByte = parseInt(hash.substr((i * 2) % 60, 2), 16);
      const hByte2 = parseInt(hash.substr((i * 2 + 1) % 60, 2), 16);
      const sx = (hByte * 3.2) % W;
      const sy = (hByte2 * 4.8) % 700;
      const sr = 1.5 + (i % 4);
      const bright = i % 5 === 0 ? "1" : "0.7";
      stars.push(
        `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr}" fill="${p.glow}" opacity="${bright}"/>`,
      );
      if (i % 7 === 0) {
        stars.push(
          `<path d="M${sx},${sy - sr * 2.5} L${sx + 1},${sy} L${sx},${sy + sr * 2.5} L${sx - 1},${sy} Z" fill="${p.accent}" opacity="0.8"/>`,
        );
      }
    }
    return `<g>${stars.join("")}</g>`;
  }

  if (sc === "clouds") {
    const cc = lighten(p.bgTop, 0.35);
    const clouds = [
      { x: 80, y: 200, r: 50 },
      { x: 160, y: 190, r: 70 },
      { x: 260, y: 205, r: 55 },
      { x: 520, y: 170, r: 65 },
      { x: 630, y: 180, r: 80 },
      { x: 720, y: 168, r: 55 },
    ];
    return `<g opacity="0.45">
      ${clouds.map((c) => `<ellipse cx="${c.x}" cy="${c.y}" rx="${c.r}" ry="${c.r * 0.6}" fill="${cc}"/>`).join("")}
    </g>`;
  }

  if (sc === "confetti") {
    const hash = r.hash;
    const pieces: string[] = [];
    const colors = [p.accent, p.glow, p.shape, lighten(p.accent, 0.4), "#ffffff"];
    for (let i = 0; i < 24; i++) {
      const hb = parseInt(hash.substr((i * 2) % 58, 2), 16);
      const hb2 = parseInt(hash.substr((i * 2 + 2) % 58, 2), 16);
      const cx2 = (hb * 3.1) % W;
      const cy2 = (hb2 * 4.7) % 1000 + 60;
      const rot = (hb + hb2) % 180;
      const col = colors[i % colors.length];
      if (i % 3 === 0) {
        pieces.push(
          `<rect x="${cx2}" y="${cy2}" width="14" height="8" rx="2" fill="${col}" opacity="0.85" transform="rotate(${rot},${cx2},${cy2})"/>`,
        );
      } else if (i % 3 === 1) {
        pieces.push(`<circle cx="${cx2}" cy="${cy2}" r="5" fill="${col}" opacity="0.75"/>`);
      } else {
        pieces.push(
          `<polygon points="${cx2},${cy2 - 7} ${cx2 + 6},${cy2 + 5} ${cx2 - 6},${cy2 + 5}" fill="${col}" opacity="0.8"/>`,
        );
      }
    }
    return `<g>${pieces.join("")}</g>`;
  }

  return "";
}

// --- LAYER 2: Hair back --------------------------------------------------

function hairBack(r: Recipe): string {
  const d = AGE_DIMS[r.age];
  const hs = r.hairStyle;
  const w = d.rx + 26;
  const hl = r.hairColor;
  const hd = darken(hl, 0.1);

  // Long loose (style 3): both genders
  if (hs === 3) {
    return `<path d="M${CX - w} ${d.cy - 30}
      C${CX - w - 10} ${d.cy + 260} ${CX - w + 20} ${d.cy + 430} ${CX - w + 34} ${d.cy + 470}
      L${CX - d.rx + 10} ${d.cy + 40}
      Q${CX} ${d.cy - d.ry - 44} ${CX + d.rx - 10} ${d.cy + 40}
      L${CX + w - 34} ${d.cy + 470}
      C${CX + w - 20} ${d.cy + 430} ${CX + w + 10} ${d.cy + 260} ${CX + w} ${d.cy - 30} Z"
      fill="${hd}"/>`;
  }

  // Braids (style 7): long with braid pattern
  if (hs === 7) {
    return `<path d="M${CX - w + 10} ${d.cy - 20}
      C${CX - w} ${d.cy + 200} ${CX - w + 10} ${d.cy + 390} ${CX - w + 30} ${d.cy + 460}
      L${CX - d.rx + 14} ${d.cy + 40}
      Q${CX} ${d.cy - d.ry - 40} ${CX + d.rx - 14} ${d.cy + 40}
      L${CX + w - 30} ${d.cy + 460}
      C${CX + w - 10} ${d.cy + 390} ${CX + w} ${d.cy + 200} ${CX + w - 10} ${d.cy - 20} Z"
      fill="${hd}"/>
      <path d="M${CX - w + 14} ${d.cy + 60} C${CX - w + 24} ${d.cy + 80} ${CX - w + 14} ${d.cy + 100} ${CX - w + 24} ${d.cy + 120}" fill="none" stroke="${hl}" stroke-width="5" opacity="0.6"/>
      <path d="M${CX + w - 14} ${d.cy + 60} C${CX + w - 24} ${d.cy + 80} ${CX + w - 14} ${d.cy + 100} ${CX + w - 24} ${d.cy + 120}" fill="none" stroke="${hl}" stroke-width="5" opacity="0.6"/>`;
  }

  // Afro (style 6): wide puff
  if (hs === 6) {
    return `<ellipse cx="${CX}" cy="${d.cy - d.ry + 20}" rx="${d.rx + 46}" ry="${d.ry + 42}" fill="${hl}" opacity="0.9"/>`;
  }

  // Ponytail back (style 4)
  if (hs === 4) {
    return `<path d="M${CX - 18} ${d.cy - d.ry + 20}
      Q${CX} ${d.cy - d.ry - 30} ${CX + 18} ${d.cy - d.ry + 20}
      L${CX + 22} ${d.cy + 240}
      Q${CX} ${d.cy + 280} ${CX - 22} ${d.cy + 240} Z"
      fill="${hd}" opacity="0.92"/>`;
  }

  // Legacy: female long default (style 2 or style ≥ 2 not caught above for female)
  if (r.gender === "weiblich" && hs === 2) {
    return `<path d="M${CX - w} ${d.cy - 30}
      C${CX - w - 10} ${d.cy + 260} ${CX - w + 20} ${d.cy + 430} ${CX - w + 34} ${d.cy + 470}
      L${CX - d.rx + 10} ${d.cy + 40}
      Q${CX} ${d.cy - d.ry - 44} ${CX + d.rx - 10} ${d.cy + 40}
      L${CX + w - 34} ${d.cy + 470}
      C${CX + w - 20} ${d.cy + 430} ${CX + w + 10} ${d.cy + 260} ${CX + w} ${d.cy - 30} Z"
      fill="${darken(hl, 0.08)}"/>`;
  }

  return "";
}

// --- LAYER 3: Clothing ---------------------------------------------------

function torsoPath(r: Recipe): string {
  let sh = SHOULDER_BASE[r.body];
  if (r.gender === "weiblich") sh *= 0.9;
  const bulge = r.body === "dick" ? 1.12 : r.body === "muskuloes" ? 1.0 : 0.96;
  const L = CX - sh;
  const R = CX + sh;
  return `M${CX - NECK_HALF} ${NECK_BOTTOM}
    C${CX - NECK_HALF} ${NECK_BOTTOM + 34} ${L} ${640} ${L} ${730}
    C${L} ${900} ${CX - sh * bulge} ${1050} ${CX - sh * bulge} ${H}
    L${CX + sh * bulge} ${H}
    C${CX + sh * bulge} ${1050} ${R} ${900} ${R} ${730}
    C${R} ${640} ${CX + NECK_HALF} ${NECK_BOTTOM + 34} ${CX + NECK_HALF} ${NECK_BOTTOM} Z`;
}

function patternDefs(id: string, pat: ClothingPattern, baseColor: string, accent: string): string {
  if (pat === "solid") return "";
  if (pat === "stripes") {
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
      <rect width="10" height="20" fill="${darken(baseColor, 0.22)}"/>
    </pattern>`;
  }
  if (pat === "dots") {
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="22" height="22">
      <circle cx="11" cy="11" r="4" fill="${darken(baseColor, 0.3)}" opacity="0.7"/>
    </pattern>`;
  }
  if (pat === "emblem") return "";
  return "";
}

function clothing(r: Recipe): string {
  const c = r.palette.clothing;
  const cd = darken(c, 0.2);
  const d = AGE_DIMS[r.age];
  const collarY = d.cy + d.ry + 30;
  const cs = r.clothingStyle;
  const cp = r.clothingPattern;
  const accent = r.palette.accent;

  const patId = "cp";
  const hasPat = cp !== "solid" && cp !== "emblem";
  const patDef = patternDefs(patId, cp, c, accent);
  const fillMain = hasPat ? `url(#${patId})` : c;

  let body = `<path d="${torsoPath(r)}" fill="${c}"/>`;
  if (hasPat) {
    body += `<path d="${torsoPath(r)}" fill="${fillMain}" opacity="0.55"/>`;
  }

  let collar = "";
  if (cs === "tshirt") {
    collar =
      `<path d="M${CX - 46} ${collarY} Q${CX} ${collarY + 26} ${CX + 46} ${collarY}" fill="none" stroke="${cd}" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M${CX - 90} ${collarY + 20} Q${CX} ${collarY + 70} ${CX + 90} ${collarY + 20}" fill="none" stroke="${accent}" stroke-width="6" opacity="0.85"/>`;
  } else if (cs === "hoodie") {
    // Hood shape
    collar =
      `<path d="M${CX - 60} ${collarY - 10} Q${CX} ${collarY - 60} ${CX + 60} ${collarY - 10} L${CX + 50} ${collarY + 20} Q${CX} ${collarY + 40} ${CX - 50} ${collarY + 20} Z" fill="${cd}" opacity="0.85"/>` +
      `<path d="M${CX - 20} ${collarY + 20} L${CX + 20} ${collarY + 20}" stroke="${accent}" stroke-width="3" opacity="0.6"/>` +
      `<circle cx="${CX}" cy="${collarY + 54}" r="6" fill="${accent}" opacity="0.7"/>`;
  } else if (cs === "jacket") {
    // Lapels + buttons
    collar =
      `<path d="M${CX - 46} ${collarY} L${CX - 16} ${collarY + 80} L${CX} ${collarY + 50} L${CX + 16} ${collarY + 80} L${CX + 46} ${collarY} L${CX + 30} ${collarY - 20} Q${CX} ${collarY - 40} ${CX - 30} ${collarY - 20} Z" fill="${darken(c, 0.3)}" opacity="0.9"/>` +
      `<circle cx="${CX}" cy="${collarY + 100}" r="7" fill="${accent}" opacity="0.8"/>` +
      `<circle cx="${CX}" cy="${collarY + 130}" r="7" fill="${accent}" opacity="0.8"/>`;
  } else if (cs === "dress") {
    // Wide A-line dress for female
    collar =
      `<path d="M${CX - 46} ${collarY} Q${CX} ${collarY + 26} ${CX + 46} ${collarY}" fill="none" stroke="${lighten(c, 0.3)}" stroke-width="3"/>` +
      `<path d="M${CX - 80} ${collarY + 40} Q${CX} ${collarY + 60} ${CX + 80} ${collarY + 40}" fill="none" stroke="${accent}" stroke-width="5" opacity="0.7"/>`;
  } else if (cs === "sweater") {
    // Ribbed bottom + crew neck
    collar =
      `<ellipse cx="${CX}" cy="${collarY + 4}" rx="44" ry="20" fill="${cd}" opacity="0.8"/>` +
      `<path d="M${CX - 90} ${collarY + 40} Q${CX} ${collarY + 80} ${CX + 90} ${collarY + 40}" fill="none" stroke="${lighten(c, 0.18)}" stroke-width="5" opacity="0.6"/>`;
  } else if (cs === "collared") {
    // Button-down collar
    collar =
      `<path d="M${CX - 46} ${collarY} L${CX} ${collarY + 70} L${CX + 46} ${collarY}" fill="${darken(c, 0.18)}"/>` +
      `<path d="M${CX - 46} ${collarY} L${CX - 24} ${collarY + 38} L${CX} ${collarY + 20} L${CX + 24} ${collarY + 38} L${CX + 46} ${collarY}" fill="${darken(c, 0.28)}"/>` +
      `<circle cx="${CX}" cy="${collarY + 90}" r="5" fill="${accent}" opacity="0.7"/>` +
      `<circle cx="${CX}" cy="${collarY + 116}" r="5" fill="${accent}" opacity="0.7"/>`;
  } else {
    // Fallback default V
    collar =
      `<path d="M${CX - 46} ${collarY} L${CX} ${collarY + 60} L${CX + 46} ${collarY} Z" fill="${cd}"/>` +
      `<path d="M${CX - 90} ${collarY + 20} Q${CX} ${collarY + 70} ${CX + 90} ${collarY + 20}" fill="none" stroke="${accent}" stroke-width="6" opacity="0.85"/>`;
  }

  // Emblem on chest
  let emblem = "";
  if (cp === "emblem") {
    emblem = `<circle cx="${CX}" cy="${collarY + 170}" r="18" fill="${accent}" opacity="0.6"/>
      <path d="M${CX - 8} ${collarY + 162} L${CX + 8} ${collarY + 162} L${CX + 12} ${collarY + 178} L${CX} ${collarY + 190} L${CX - 12} ${collarY + 178} Z" fill="${lighten(accent, 0.3)}" opacity="0.9"/>`;
  }

  return `<defs>${patDef}</defs>` + body + collar + emblem;
}

// --- LAYER 4: Face -------------------------------------------------------

function face(r: Recipe): string {
  const d = AGE_DIMS[r.age];
  const skin = r.skinTone;
  const skinD = darken(skin, 0.14);
  const eyeY = d.cy + (r.age === "kind" ? 14 : 6);
  const eyeDX = r.age === "kind" ? 40 : 36;
  const eyeR = r.age === "kind" ? 11 : 9;
  const expr = r.expression;
  const parts: string[] = [];

  // Neck
  parts.push(
    `<rect x="${CX - NECK_HALF}" y="${d.cy + d.ry - 40}" width="${NECK_HALF * 2}" height="90" rx="18" fill="${skinD}"/>`,
  );

  // Head shape — oval, round, angular based on hash nibble
  const hashNibble = parseInt(r.hash.substr(30, 1), 16) % 3;
  if (hashNibble === 0) {
    // Standard oval
    parts.push(`<ellipse cx="${CX}" cy="${d.cy}" rx="${d.rx}" ry="${d.ry}" fill="${skin}"/>`);
  } else if (hashNibble === 1) {
    // Rounder
    parts.push(`<ellipse cx="${CX}" cy="${d.cy}" rx="${d.rx + 8}" ry="${d.ry - 6}" fill="${skin}"/>`);
  } else {
    // Slightly angular: clipped ellipse
    parts.push(
      `<path d="M${CX} ${d.cy - d.ry} Q${CX + d.rx + 10} ${d.cy - d.ry + 30} ${CX + d.rx} ${d.cy} Q${CX + d.rx + 8} ${d.cy + d.ry - 20} ${CX} ${d.cy + d.ry} Q${CX - d.rx - 8} ${d.cy + d.ry - 20} ${CX - d.rx} ${d.cy} Q${CX - d.rx - 10} ${d.cy - d.ry + 30} ${CX} ${d.cy - d.ry} Z" fill="${skin}"/>`,
    );
  }

  // Self-shadow
  parts.push(
    `<path d="M${CX} ${d.cy - d.ry} A${d.rx} ${d.ry} 0 0 1 ${CX} ${d.cy + d.ry} Z" fill="${skinD}" opacity="0.28"/>`,
  );

  // Ears
  parts.push(
    `<circle cx="${CX - d.rx + 6}" cy="${d.cy + 6}" r="18" fill="${skin}"/><circle cx="${CX + d.rx - 6}" cy="${d.cy + 6}" r="18" fill="${skin}"/>`,
  );

  // Cheek blush (kind + happy expression)
  if (r.age === "kind" || expr === "smile")
    parts.push(
      `<circle cx="${CX - 52}" cy="${eyeY + 34}" r="16" fill="#ff8f8f" opacity="0.3"/><circle cx="${CX + 52}" cy="${eyeY + 34}" r="16" fill="#ff8f8f" opacity="0.3"/>`,
    );

  // Eyes — expression-aware
  for (const s of [-1, 1]) {
    const ex = CX + s * eyeDX;
    if (expr === "wink" && s === 1) {
      // Closed wink eye (right side)
      parts.push(
        `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeR + 5}" ry="${eyeR + 1}" fill="#ffffff"/>` +
          `<path d="M${ex - eyeR - 3} ${eyeY} Q${ex} ${eyeY + eyeR * 2} ${ex + eyeR + 3} ${eyeY}" fill="none" stroke="${darken(r.hairColor, 0.1)}" stroke-width="4" stroke-linecap="round"/>`,
      );
    } else if (expr === "surprised") {
      // Wide eyes
      parts.push(
        `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeR + 7}" ry="${eyeR + 4}" fill="#ffffff"/>` +
          `<circle cx="${ex}" cy="${eyeY}" r="${eyeR + 1}" fill="${r.eyeColor}"/>` +
          `<circle cx="${ex}" cy="${eyeY}" r="${eyeR * 0.5}" fill="#161616"/>` +
          `<circle cx="${ex - 3}" cy="${eyeY - 4}" r="${eyeR * 0.25}" fill="#ffffff"/>`,
      );
    } else {
      // Normal / smile / serious eyes
      parts.push(
        `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeR + 5}" ry="${eyeR + 1}" fill="#ffffff"/>` +
          `<circle cx="${ex}" cy="${eyeY}" r="${eyeR}" fill="${r.eyeColor}"/>` +
          `<circle cx="${ex}" cy="${eyeY}" r="${eyeR * 0.5}" fill="#161616"/>` +
          `<circle cx="${ex - 3}" cy="${eyeY - 3}" r="${eyeR * 0.25}" fill="#ffffff"/>`,
      );
    }
  }

  // Eyebrows — expression-aware
  const browY = eyeY - eyeR - 14;
  const browColor = darken(r.hairColor, 0.05);
  if (expr === "surprised") {
    // Raised brows
    parts.push(
      `<path d="M${CX - eyeDX - 14} ${browY - 6} Q${CX - eyeDX} ${browY - 14} ${CX - eyeDX + 14} ${browY - 6}" fill="none" stroke="${browColor}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M${CX + eyeDX - 14} ${browY - 6} Q${CX + eyeDX} ${browY - 14} ${CX + eyeDX + 14} ${browY - 6}" fill="none" stroke="${browColor}" stroke-width="5" stroke-linecap="round"/>`,
    );
  } else if (expr === "serious") {
    // Furrowed brows
    parts.push(
      `<path d="M${CX - eyeDX - 14} ${browY - 2} Q${CX - eyeDX} ${browY + 6} ${CX - eyeDX + 14} ${browY - 2}" fill="none" stroke="${browColor}" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M${CX + eyeDX - 14} ${browY - 2} Q${CX + eyeDX} ${browY + 6} ${CX + eyeDX + 14} ${browY - 2}" fill="none" stroke="${browColor}" stroke-width="7" stroke-linecap="round"/>`,
    );
  } else if (r.gender === "weiblich") {
    parts.push(
      `<path d="M${CX - eyeDX - 13} ${browY + 3} Q${CX - eyeDX} ${browY - 2} ${CX - eyeDX + 13} ${browY + 3}" fill="none" stroke="${browColor}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M${CX + eyeDX - 13} ${browY + 3} Q${CX + eyeDX} ${browY - 2} ${CX + eyeDX + 13} ${browY + 3}" fill="none" stroke="${browColor}" stroke-width="5" stroke-linecap="round"/>`,
    );
  } else {
    const browW = 26;
    parts.push(
      `<rect x="${CX - eyeDX - browW / 2}" y="${browY}" width="${browW}" height="7" rx="3.5" fill="${browColor}"/>` +
        `<rect x="${CX + eyeDX - browW / 2}" y="${browY}" width="${browW}" height="7" rx="3.5" fill="${browColor}"/>`,
    );
  }

  // Nose
  parts.push(
    `<path d="M${CX - 6} ${eyeY + 22} Q${CX - 10} ${eyeY + 40} ${CX + 4} ${eyeY + 40}" fill="none" stroke="${skinD}" stroke-width="4" stroke-linecap="round"/>`,
  );

  // Mouth — expression-driven
  const mouthY = eyeY + 62;
  const mouthColor = darken(skin, 0.4);
  if (expr === "smile") {
    // Big happy smile + teeth
    parts.push(
      `<path d="M${CX - 28} ${mouthY} Q${CX} ${mouthY + 32} ${CX + 28} ${mouthY}" fill="none" stroke="${mouthColor}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M${CX - 20} ${mouthY} Q${CX} ${mouthY + 22} ${CX + 20} ${mouthY}" fill="white" stroke="none"/>`,
    );
  } else if (expr === "serious") {
    // Straight flat line
    parts.push(
      `<path d="M${CX - 22} ${mouthY + 4} L${CX + 22} ${mouthY + 4}" fill="none" stroke="${mouthColor}" stroke-width="5" stroke-linecap="round"/>`,
    );
  } else if (expr === "surprised") {
    // Open O mouth
    parts.push(
      `<ellipse cx="${CX}" cy="${mouthY + 12}" rx="14" ry="16" fill="${mouthColor}" opacity="0.9"/>`,
    );
  } else if (expr === "wink") {
    // Half-smile / smirk
    parts.push(
      `<path d="M${CX - 20} ${mouthY + 2} Q${CX + 4} ${mouthY + 20} ${CX + 22} ${mouthY}" fill="none" stroke="${mouthColor}" stroke-width="5" stroke-linecap="round"/>`,
    );
  } else if (r.age === "kind") {
    parts.push(
      `<path d="M${CX - 24} ${mouthY} Q${CX} ${mouthY + 22} ${CX + 24} ${mouthY}" fill="none" stroke="${mouthColor}" stroke-width="5" stroke-linecap="round"/>`,
    );
  } else {
    parts.push(
      `<path d="M${CX - 22} ${mouthY} Q${CX} ${mouthY + 10} ${CX + 22} ${mouthY}" fill="none" stroke="${mouthColor}" stroke-width="5" stroke-linecap="round"/>`,
    );
  }

  // Age wrinkles
  if (r.age === "alt")
    parts.push(
      `<path d="M${CX - eyeDX - 18} ${eyeY + 14} q10 6 20 0 M${CX + eyeDX - 2} ${eyeY + 14} q10 6 20 0 M${CX - 34} ${d.cy - d.ry + 42} q34 -8 68 0" fill="none" stroke="${skinD}" stroke-width="2.5" opacity="0.6"/>`,
    );

  return parts.join("");
}

// --- LAYER 5: Hair front -------------------------------------------------

function hairFront(r: Recipe): string {
  const d = AGE_DIMS[r.age];
  const top = d.cy - d.ry;
  const hl = r.hairColor;
  const hd = darken(hl, 0.18);
  const hs = r.hairStyle;

  // 0: Bald / shaved
  if (hs === 0) return "";

  // 1: Short cropped
  if (hs === 1)
    return `<path d="M${CX - d.rx - 4} ${d.cy - 40}
      Q${CX - d.rx} ${top - 26} ${CX + 30} ${top - 30}
      Q${CX + d.rx + 6} ${top - 24} ${CX + d.rx + 2} ${d.cy - 34}
      Q${CX + d.rx - 40} ${top + 30} ${CX - 10} ${top + 26}
      Q${CX - d.rx + 20} ${top + 34} ${CX - d.rx - 4} ${d.cy - 40} Z" fill="${hl}"/>`;

  // 2: Mohawk
  if (hs === 2) {
    return `<path d="M${CX - 22} ${d.cy - 30} Q${CX - 28} ${top - 90} ${CX} ${top - 110} Q${CX + 28} ${top - 90} ${CX + 22} ${d.cy - 30} Q${CX + 14} ${top - 20} ${CX} ${top - 10} Q${CX - 14} ${top - 20} ${CX - 22} ${d.cy - 30} Z" fill="${hl}"/>
      <path d="M${CX - 10} ${d.cy - 26} Q${CX - 12} ${top - 60} ${CX} ${top - 80} Q${CX + 12} ${top - 60} ${CX + 10} ${d.cy - 26}" fill="none" stroke="${hd}" stroke-width="3" opacity="0.5"/>`;
  }

  // 3: Long loose (hair only at top, sides handled by hairBack)
  if (hs === 3)
    return `<path d="M${CX - d.rx - 6} ${d.cy - 6}
      Q${CX - d.rx - 12} ${top - 30} ${CX} ${top - 36}
      Q${CX + d.rx + 12} ${top - 30} ${CX + d.rx + 6} ${d.cy - 6}
      Q${CX + d.rx - 24} ${top + 54} ${CX + 24} ${top + 40}
      Q${CX} ${top + 66} ${CX - 30} ${top + 42}
      Q${CX - d.rx + 24} ${top + 54} ${CX - d.rx - 6} ${d.cy - 6} Z" fill="${hl}"/>`;

  // 4: Ponytail
  if (hs === 4) {
    return `<path d="M${CX - d.rx - 4} ${d.cy - 18}
      Q${CX - d.rx - 6} ${top - 30} ${CX} ${top - 34}
      Q${CX + d.rx + 6} ${top - 30} ${CX + d.rx + 4} ${d.cy - 18}
      Q${CX + d.rx - 30} ${top + 40} ${CX + 20} ${top + 30}
      Q${CX} ${top + 58} ${CX - 40} ${top + 34}
      Q${CX - d.rx + 28} ${top + 44} ${CX - d.rx - 4} ${d.cy - 18} Z" fill="${hl}"/>
      <path d="M${CX - d.rx - 4} ${d.cy - 18} Q${CX - d.rx - 6} ${top - 30} ${CX} ${top - 34} L${CX} ${top + 4} Q${CX - d.rx + 28} ${top + 44} ${CX - d.rx - 4} ${d.cy - 18} Z" fill="${hd}" opacity="0.5"/>
      <ellipse cx="${CX}" cy="${d.cy - d.ry - 30}" rx="12" ry="8" fill="${hd}"/>`;
  }

  // 5: Bun / chignon
  if (hs === 5) {
    return `<path d="M${CX - d.rx + 6} ${d.cy - 34}
      Q${CX} ${top - 12} ${CX + d.rx - 6} ${d.cy - 34}
      Q${CX + d.rx - 20} ${top + 46} ${CX} ${top + 34}
      Q${CX - d.rx + 20} ${top + 46} ${CX - d.rx + 6} ${d.cy - 34} Z" fill="${hl}" opacity="0.92"/>
      <ellipse cx="${CX}" cy="${top - 28}" rx="34" ry="28" fill="${hl}"/>
      <ellipse cx="${CX}" cy="${top - 28}" rx="28" ry="22" fill="${hd}" opacity="0.4"/>`;
  }

  // 6: Afro
  if (hs === 6) {
    return `<ellipse cx="${CX}" cy="${d.cy - d.ry + 20}" rx="${d.rx + 46}" ry="${d.ry + 42}" fill="${hl}" opacity="0.95"/>
      <ellipse cx="${CX}" cy="${d.cy - d.ry + 15}" rx="${d.rx + 32}" ry="${d.ry + 28}" fill="${hd}" opacity="0.3"/>`;
  }

  // 7: Braids (top cap)
  if (hs === 7) {
    return `<path d="M${CX - d.rx - 4} ${d.cy - 18}
      Q${CX - d.rx - 6} ${top - 30} ${CX} ${top - 34}
      Q${CX + d.rx + 6} ${top - 30} ${CX + d.rx + 4} ${d.cy - 18}
      Q${CX + d.rx - 30} ${top + 40} ${CX + 20} ${top + 30}
      Q${CX} ${top + 58} ${CX - 40} ${top + 34}
      Q${CX - d.rx + 28} ${top + 44} ${CX - d.rx - 4} ${d.cy - 18} Z" fill="${hl}"/>
      <path d="M${CX - 8} ${top - 8} L${CX + 8} ${top - 8} L${CX + 12} ${top + 30} L${CX - 12} ${top + 30} Z" fill="${hd}" opacity="0.5"/>`;
  }

  // Default female medium
  return `<path d="M${CX - d.rx - 12} ${d.cy + 70}
    Q${CX - d.rx - 18} ${top - 28} ${CX} ${top - 34}
    Q${CX + d.rx + 18} ${top - 28} ${CX + d.rx + 12} ${d.cy + 70}
    Q${CX + d.rx - 18} ${d.cy + 30} ${CX + d.rx - 34} ${top + 60}
    Q${CX} ${top + 30} ${CX - d.rx + 34} ${top + 60}
    Q${CX - d.rx + 18} ${d.cy + 30} ${CX - d.rx - 12} ${d.cy + 70} Z" fill="${hl}"/>`;
}

// --- LAYER 6: Accessory --------------------------------------------------

function accessory(r: Recipe): string {
  const d = AGE_DIMS[r.age];
  const eyeY = d.cy + (r.age === "kind" ? 14 : 6);
  const eyeDX = r.age === "kind" ? 40 : 36;
  const ink = "#15161c";

  if (r.accessory === "brille") {
    return (
      `<g fill="none" stroke="${ink}" stroke-width="6">` +
      `<rect x="${CX - eyeDX - 26}" y="${eyeY - 20}" width="52" height="40" rx="12"/>` +
      `<rect x="${CX + eyeDX - 26}" y="${eyeY - 20}" width="52" height="40" rx="12"/>` +
      `<line x1="${CX - eyeDX + 26}" y1="${eyeY}" x2="${CX + eyeDX - 26}" y2="${eyeY}"/>` +
      `</g>`
    );
  }

  if (r.accessory === "sonnenbrille") {
    const a = r.palette.accent;
    return (
      `<g stroke="#111111" stroke-width="1" fill="#1C1C1E" filter="url(#soft-shadow)">` +
      `<polygon points="${CX - eyeDX - 24},${eyeY - 16} ${CX - eyeDX + 24},${eyeY - 16} ${CX - eyeDX + 20},${eyeY + 14} ${CX - eyeDX - 20},${eyeY + 14}"/>` +
      `<polygon points="${CX + eyeDX - 24},${eyeY - 16} ${CX + eyeDX + 24},${eyeY - 16} ${CX + eyeDX + 20},${eyeY + 14} ${CX + eyeDX - 20},${eyeY + 14}"/>` +
      `<path d="M${CX - eyeDX - 20} ${eyeY - 10} L${CX - eyeDX + 10} ${eyeY + 8}" stroke="${a}" stroke-width="2.5" stroke-opacity="0.8"/>` +
      `<path d="M${CX + eyeDX - 20} ${eyeY - 10} L${CX + eyeDX + 10} ${eyeY + 8}" stroke="${a}" stroke-width="2.5" stroke-opacity="0.8"/>` +
      `<line x1="${CX - eyeDX + 24}" y1="${eyeY - 14}" x2="${CX + eyeDX - 24}" y2="${eyeY - 14}" stroke="#111" stroke-width="4"/>` +
      `</g>`
    );
  }

  if (r.accessory === "hut") {
    const top = d.cy - d.ry;
    const a = r.palette.accent;
    const ad = darken(a, 0.25);
    return (
      `<g filter="url(#soft-shadow)">` +
      `<ellipse cx="${CX}" cy="${top + 24}" rx="${d.rx + 34}" ry="26" fill="${ad}"/>` +
      `<path d="M${CX - d.rx + 6} ${top + 24} Q${CX - d.rx + 6} ${top - 78} ${CX} ${top - 82} Q${CX + d.rx - 6} ${top - 78} ${CX + d.rx - 6} ${top + 24} Z" fill="${a}"/>` +
      `<rect x="${CX - d.rx + 6}" y="${top - 4}" width="${(d.rx - 6) * 2}" height="20" fill="${ad}"/>` +
      `</g>`
    );
  }

  if (r.accessory === "muetze") {
    const top = d.cy - d.ry;
    const a = r.palette.accent;
    const s = r.palette.clothing;
    return (
      `<g filter="url(#soft-shadow)">` +
      `<path d="M${CX - d.rx - 4} ${d.cy - 20} C${CX - d.rx - 8} ${top - 40} ${CX + d.rx + 8} ${top - 40} ${CX + d.rx + 4} ${d.cy - 20} Z" fill="${a}"/>` +
      `<rect x="${CX - d.rx - 6}" y="${d.cy - 30}" width="${(d.rx + 6) * 2}" height="20" rx="8" fill="${s}"/>` +
      `<circle cx="${CX}" cy="${top - 46}" r="10" fill="#ffffff" fill-opacity="0.9"/>` +
      `</g>`
    );
  }

  if (r.accessory === "bart") {
    const skinD = darken(r.hairColor, 0.05);
    const jawY = d.cy + d.ry - 30;
    return `<path d="M${CX - d.rx + 20} ${eyeY + 40}
      Q${CX - d.rx + 14} ${jawY + 10} ${CX} ${jawY + 30}
      Q${CX + d.rx - 14} ${jawY + 10} ${CX + d.rx - 20} ${eyeY + 40}
      Q${CX + 40} ${eyeY + 78} ${CX} ${eyeY + 72}
      Q${CX - 40} ${eyeY + 78} ${CX - d.rx + 20} ${eyeY + 40} Z" fill="${skinD}"/>`;
  }

  return "";
}

// --- LAYER 7: Prop (held item) -------------------------------------------

function prop(r: Recipe): string {
  const d = AGE_DIMS[r.age];
  const sh = SHOULDER_BASE[r.body];
  const handY = d.cy + d.ry + 200;
  const handL = CX - sh - 20;
  const handR = CX + sh + 20;
  const acc = r.palette.accent;
  const p = r.prop;

  if (p === "none") return "";

  if (p === "book") {
    return `<g transform="translate(${handL - 40}, ${handY - 30}) rotate(-10)">
      <rect x="0" y="0" width="80" height="104" rx="4" fill="${acc}" opacity="0.9"/>
      <rect x="4" y="4" width="72" height="96" rx="2" fill="${lighten(acc, 0.2)}" opacity="0.6"/>
      <rect x="8" y="0" width="6" height="104" fill="${darken(acc, 0.2)}"/>
      <line x1="12" y1="25" x2="72" y2="25" stroke="${acc}" stroke-width="2" opacity="0.5"/>
      <line x1="12" y1="40" x2="72" y2="40" stroke="${acc}" stroke-width="2" opacity="0.5"/>
      <line x1="12" y1="55" x2="60" y2="55" stroke="${acc}" stroke-width="2" opacity="0.5"/>
    </g>`;
  }

  if (p === "phone") {
    return `<g transform="translate(${handR - 10}, ${handY - 50}) rotate(8)">
      <rect x="0" y="0" width="46" height="82" rx="8" fill="#1c1c1e" opacity="0.95"/>
      <rect x="3" y="3" width="40" height="76" rx="6" fill="#2a2a2e" opacity="0.8"/>
      <rect x="5" y="5" width="36" height="66" rx="4" fill="${darken(acc, 0.1)}" opacity="0.5"/>
      <circle cx="23" cy="78" r="4" fill="#444" opacity="0.7"/>
    </g>`;
  }

  if (p === "guitar") {
    return `<g transform="translate(${handL - 30}, ${d.cy + d.ry + 40}) rotate(-15)">
      <ellipse cx="30" cy="120" rx="34" ry="40" fill="${acc}" opacity="0.9"/>
      <ellipse cx="30" cy="120" rx="18" ry="22" fill="${darken(acc, 0.3)}" opacity="0.5"/>
      <rect x="27" y="0" width="6" height="130" rx="3" fill="${darken(acc, 0.2)}"/>
      <rect x="20" y="0" width="20" height="24" rx="4" fill="${darken(acc, 0.1)}"/>
      <line x1="24" y1="10" x2="24" y2="120" stroke="${lighten(acc, 0.4)}" stroke-width="1.5" opacity="0.8"/>
      <line x1="28" y1="10" x2="28" y2="120" stroke="${lighten(acc, 0.4)}" stroke-width="1.5" opacity="0.8"/>
      <line x1="32" y1="10" x2="32" y2="120" stroke="${lighten(acc, 0.4)}" stroke-width="1.5" opacity="0.8"/>
    </g>`;
  }

  if (p === "coffee") {
    return `<g transform="translate(${handR - 20}, ${handY - 20}) rotate(5)">
      <path d="M4 0 L44 0 L40 60 L8 60 Z" fill="white" opacity="0.9" rx="4"/>
      <path d="M8 6 L40 6 L36 54 L12 54 Z" fill="${acc}" opacity="0.6"/>
      <path d="M44 16 Q58 18 56 32 Q54 46 42 44" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <path d="M6 -4 Q8 -14 16 -10 Q20 -6 14 0" fill="none" stroke="${darken(acc, 0.2)}" stroke-width="3" opacity="0.6"/>
      <path d="M16 -6 Q18 -16 26 -12 Q30 -8 24 -2" fill="none" stroke="${darken(acc, 0.2)}" stroke-width="3" opacity="0.6"/>
    </g>`;
  }

  if (p === "headphones") {
    const ey = d.cy + (r.age === "kind" ? 14 : 6);
    const topH = d.cy - d.ry - 10;
    const ear1x = CX - d.rx + 8;
    const ear2x = CX + d.rx - 8;
    return `<g>
      <path d="M${ear1x} ${ey} Q${CX} ${topH - 40} ${ear2x} ${ey}" fill="none" stroke="#2c2c2e" stroke-width="10" stroke-linecap="round"/>
      <rect x="${ear1x - 16}" y="${ey - 20}" width="32" height="42" rx="10" fill="#1c1c1e" opacity="0.95"/>
      <rect x="${ear2x - 16}" y="${ey - 20}" width="32" height="42" rx="10" fill="#1c1c1e" opacity="0.95"/>
      <rect x="${ear1x - 12}" y="${ey - 16}" width="24" height="34" rx="8" fill="${acc}" opacity="0.5"/>
      <rect x="${ear2x - 12}" y="${ey - 16}" width="24" height="34" rx="8" fill="${acc}" opacity="0.5"/>
    </g>`;
  }

  if (p === "pen") {
    return `<g transform="translate(${handR - 6}, ${handY - 60}) rotate(30)">
      <rect x="0" y="0" width="10" height="110" rx="5" fill="${acc}" opacity="0.95"/>
      <polygon points="0,110 10,110 5,130" fill="${darken(acc, 0.3)}"/>
      <rect x="0" y="0" width="10" height="20" rx="5" fill="${lighten(acc, 0.3)}"/>
      <rect x="1" y="22" width="8" height="4" fill="${darken(acc, 0.4)}" opacity="0.7"/>
    </g>`;
  }

  if (p === "umbrella") {
    return `<g transform="translate(${handR - 20}, ${d.cy + d.ry + 30})">
      <path d="M0 100 Q2 20 50 0 Q98 20 100 100" fill="${acc}" opacity="0.85"/>
      <path d="M0 100 Q2 60 50 60 Q98 60 100 100" fill="${darken(acc, 0.2)}" opacity="0.5"/>
      <line x1="50" y1="0" x2="50" y2="180" stroke="${darken(acc, 0.3)}" stroke-width="5" stroke-linecap="round"/>
      <path d="M50 160 Q58 185 46 190" fill="none" stroke="${darken(acc, 0.3)}" stroke-width="5" stroke-linecap="round"/>
    </g>`;
  }

  if (p === "camera") {
    return `<g transform="translate(${handR - 50}, ${handY - 40}) rotate(-5)">
      <rect x="0" y="10" width="90" height="66" rx="8" fill="#2c2c2e" opacity="0.95"/>
      <rect x="24" y="0" width="34" height="18" rx="4" fill="#3a3a3c"/>
      <circle cx="45" cy="44" r="24" fill="#1c1c1e"/>
      <circle cx="45" cy="44" r="18" fill="${darken(acc, 0.1)}" opacity="0.7"/>
      <circle cx="45" cy="44" r="10" fill="#0a0a0a"/>
      <circle cx="40" cy="38" r="4" fill="white" opacity="0.3"/>
      <rect x="72" y="18" width="12" height="12" rx="3" fill="${acc}" opacity="0.8"/>
    </g>`;
  }

  if (p === "speech") {
    // Speech bubble above character's head
    const bx = CX + d.rx + 20;
    const by = d.cy - d.ry - 80;
    return `<g>
      <rect x="${bx}" y="${by}" width="120" height="70" rx="16" fill="white" opacity="0.93"/>
      <polygon points="${bx + 14},${by + 70} ${bx},${by + 90} ${bx + 34},${by + 70}" fill="white" opacity="0.93"/>
      <circle cx="${bx + 30}" cy="${by + 35}" r="8" fill="${acc}" opacity="0.8"/>
      <circle cx="${bx + 60}" cy="${by + 35}" r="8" fill="${acc}" opacity="0.8"/>
      <circle cx="${bx + 90}" cy="${by + 35}" r="8" fill="${acc}" opacity="0.8"/>
    </g>`;
  }

  return "";
}

// --- LAYER 8: Typography -------------------------------------------------

interface TypoSpec {
  family: string;
  weight: number;
  italic: boolean;
  spacing: number;
  upper: boolean;
  hardShadow: boolean;
  rule: boolean;
}

const TYPO: Record<TypographyStyle, TypoSpec> = {
  blockbuster: {
    family: "'Arial Black', 'Helvetica Neue', Impact, sans-serif",
    weight: 900,
    italic: false,
    spacing: -2,
    upper: true,
    hardShadow: true,
    rule: false,
  },
  prestige: {
    family: "Georgia, 'Times New Roman', serif",
    weight: 500,
    italic: true,
    spacing: 3,
    upper: false,
    hardShadow: false,
    rule: false,
  },
  scifi: {
    family: "'Courier New', Consolas, monospace",
    weight: 700,
    italic: false,
    spacing: 4,
    upper: true,
    hardShadow: false,
    rule: true,
  },
  arthouse: {
    family: "'Helvetica Neue', Arial, sans-serif",
    weight: 300,
    italic: false,
    spacing: 9,
    upper: true,
    hardShadow: false,
    rule: false,
  },
};

function splitTitle(title: string): string[] {
  if (title.length <= 14) return [title];
  const mid = Math.floor(title.length / 2);
  let best = -1;
  for (let i = 0; i < title.length; i++) {
    if (title[i] === " " && (best === -1 || Math.abs(i - mid) < Math.abs(best - mid)))
      best = i;
  }
  if (best === -1) return [title];
  return [title.slice(0, best), title.slice(best + 1)];
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function titleLayer(r: Recipe, raw: string): string {
  const spec = TYPO[r.typography];
  const t = spec.upper ? raw.toUpperCase() : raw;
  const lines = splitTitle(t);
  const longest = Math.max(...lines.map((l) => l.length), 1);

  let size = Math.min(150, Math.round((760 / longest) * 1.55));
  if (r.typography === "arthouse") size = Math.min(size, 54);
  if (r.typography === "prestige") size = Math.min(size, 96);
  size = Math.max(30, size);

  const color = r.palette.text;
  const startY = r.typography === "arthouse" ? 110 : 190;
  const lineH = size * 1.02;
  const tspans = lines
    .map(
      (l, i) =>
        `<tspan x="${CX}" y="${startY + i * lineH}">${esc(l)}</tspan>`,
    )
    .join("");

  const common = `text-anchor="middle" font-family="${spec.family}" font-weight="${spec.weight}" font-size="${size}" letter-spacing="${spec.spacing}" ${spec.italic ? 'font-style="italic"' : ""}`;

  let out = "";
  if (spec.hardShadow) {
    out += `<text ${common} fill="${r.palette.accent}" opacity="0.9" transform="translate(6,7)">${tspans}</text>`;
  }
  out += `<text ${common} fill="${color}">${tspans}</text>`;

  if (r.genre) {
    const genreY = startY + (lines.length - 1) * lineH + size + 8;
    out += `<text text-anchor="middle" x="${CX}" y="${genreY}" fill="${r.palette.accent}" opacity="0.85" font-family="${spec.italic ? "Georgia, serif" : "sans-serif"}" font-size="16" font-weight="600" letter-spacing="6">${esc(r.genre.toUpperCase())}</text>`;
  }

  if (spec.rule) {
    const ruleY = startY - size - 6;
    const ruleY2 = startY + (lines.length - 1) * lineH + 26;
    out += `<line x1="${CX - 150}" y1="${ruleY}" x2="${CX + 150}" y2="${ruleY}" stroke="${r.palette.accent}" stroke-width="4"/>`;
    out += `<line x1="${CX - 150}" y1="${ruleY2}" x2="${CX + 150}" y2="${ruleY2}" stroke="${r.palette.accent}" stroke-width="4"/>`;
  }
  if (r.typography === "arthouse") {
    out += `<line x1="${CX - 120}" y1="${startY + 26}" x2="${CX + 120}" y2="${startY + 26}" stroke="${color}" stroke-width="1.5" opacity="0.7"/>`;
  }
  if (r.typography === "prestige") {
    const decoY = startY + (lines.length - 1) * lineH + 40;
    out += `<g stroke="${r.palette.accent}" stroke-width="2" opacity="0.85"><line x1="${CX - 140}" y1="${decoY}" x2="${CX - 20}" y2="${decoY}"/><line x1="${CX + 20}" y1="${decoY}" x2="${CX + 140}" y2="${decoY}"/><circle cx="${CX}" cy="${decoY}" r="4" fill="${r.palette.accent}" stroke="none"/></g>`;
  }
  return out;
}

// --- Character group (all layers for one character, centered on CX=400) --

function buildCharacterGroup(r: Recipe): string {
  return (
    hairBack(r) +
    clothing(r) +
    face(r) +
    hairFront(r) +
    accessory(r) +
    prop(r)
  );
}

// Character layout slots. Characters drawn at CX=400, Y-grounded at 1200.
// Scale around (0, 1200) so feet stay on the ground.
interface CharSlot {
  cx: number;   // target horizontal center
  scale: number; // scale factor (1.0 = full size)
  zIndex: number; // higher = rendered on top
}

function layoutSlots(count: number): CharSlot[] {
  if (count === 1) return [{ cx: 400, scale: 1.0, zIndex: 0 }];
  if (count === 2) {
    // One slightly back-left, one forward-right for depth
    return [
      { cx: 260, scale: 0.82, zIndex: 0 },
      { cx: 560, scale: 0.88, zIndex: 1 },
    ];
  }
  // 3 characters: left and right slightly smaller/behind, center forward
  return [
    { cx: 180, scale: 0.70, zIndex: 0 },
    { cx: 400, scale: 0.78, zIndex: 2 },
    { cx: 620, scale: 0.70, zIndex: 1 },
  ];
}

function charTransform(slot: CharSlot): string {
  const { cx, scale: s } = slot;
  const dx = cx - 400 * s;
  const dy = 1200 * (1 - s);
  return `translate(${dx.toFixed(2)},${dy.toFixed(2)}) scale(${s})`;
}

// --- Master-Zusammenbau --------------------------------------------------

export function buildCoverSVG(r: Recipe, titleText: string): string {
  return buildMultiCoverSVG(r, [r], titleText);
}

export function buildMultiCoverSVG(
  mainRecipe: Recipe,
  characterRecipes: Recipe[],
  titleText: string,
): string {
  const slots = layoutSlots(characterRecipes.length);

  // Sort by zIndex so lower-z chars are drawn first (behind)
  const sorted = slots
    .map((slot, i) => ({ slot, recipe: characterRecipes[i] ?? characterRecipes[0] }))
    .sort((a, b) => a.slot.zIndex - b.slot.zIndex);

  const chars = sorted
    .map(
      ({ slot, recipe }) =>
        `<g transform="${charTransform(slot)}">${buildCharacterGroup(recipe)}</g>`,
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cover: ${esc(titleText)}">
  ${background(mainRecipe)}
  <g>${scene(mainRecipe)}</g>
  ${chars}
  <g>${titleLayer(mainRecipe, titleText || "Ohne Titel")}</g>
</svg>`;
}

