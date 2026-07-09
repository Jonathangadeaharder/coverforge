#import "@preview/cetz:0.5.2": canvas, draw
#import "@preview/fletcher:0.5.8" as fletcher: diagram, node, edge

// Draw character function in CeTZ
#let draw-character(r, cx, scale) = {
  draw.group({
    draw.translate((cx, 0))
    draw.scale(scale)
    draw.translate((-4, 0))
    
    // Proportional dimensions based on Age
    let age-dims = (
      kind: (rx: 1.12, ry: 1.18, cy: 7.20),
      erwachsen: (rx: 1.00, ry: 1.16, cy: 7.38),
      alt: (rx: 0.98, ry: 1.16, cy: 7.38)
    )
    let d = age-dims.at(r.age)
    
    let skin = rgb(r.skin-tone)
    let skin-dark = skin.darken(14%)
    let hair-color = rgb(r.hair-color)
    let hair-color-dark = hair-color.darken(15%)
    let eye-color = rgb(r.eye-color)
    let acc-color = rgb(r.palette.accent)
    let cc = rgb(r.palette.clothing)
    let cd = cc.darken(20%)
    
    let top = d.cy + d.ry
    
    // Hand positions based on Body
    let sh = 1.58
    if r.body == "duenn" { sh = 1.18 }
    else if r.body == "muskuloes" { sh = 1.82 }
    else if r.body == "dick" { sh = 2.10 }
    if r.gender == "weiblich" { sh = sh * 0.9 }
    
    let hand-x-left = 4.0 - sh - 0.20
    let hand-x-right = 4.0 + sh + 0.20
    let hand-y = 3.6

    // 1. Hair Back
    let hw = d.rx + 0.26
    if r.hair-style == 3 or r.hair-style == 4 {
      // Long loose hair back
      draw.line(
        (4 - hw, d.cy + 0.30),
        (4 - hw - 0.10, d.cy - 2.60),
        (4 - hw + 0.20, d.cy - 4.30),
        (4 - hw + 0.34, d.cy - 4.70),
        (4 - d.rx + 0.10, d.cy - 0.40),
        (4 + d.rx - 0.10, d.cy - 0.40),
        (4 + hw - 0.34, d.cy - 4.70),
        (4 + hw - 0.20, d.cy - 4.30),
        (4 + hw + 0.10, d.cy - 2.60),
        (4 + hw, d.cy + 0.30),
        close: true,
        fill: hair-color-dark,
        stroke: none
      )
    } else if r.hair-style == 6 {
      // Afro back puff
      draw.circle((4, d.cy - d.ry + 0.20), radius: (d.rx + 0.46, d.ry + 0.42), fill: hair-color-dark, stroke: none)
    } else if r.hair-style == 7 {
      // Braids back
      draw.line(
        (4 - hw + 0.10, d.cy + 0.20),
        (4 - hw, d.cy - 2.00),
        (4 - hw + 0.10, d.cy - 3.90),
        (4 - hw + 0.30, d.cy - 4.60),
        (4 - d.rx + 0.14, d.cy - 0.40),
        (4 + d.rx - 0.14, d.cy - 0.40),
        (4 + hw - 0.30, d.cy - 4.60),
        (4 + hw - 0.10, d.cy - 3.90),
        (4 + hw, d.cy - 2.00),
        (4 + hw - 0.10, d.cy + 0.20),
        close: true,
        fill: hair-color-dark,
        stroke: none
      )
    }

    // 1.5 Character Separation Outline / Shadow
    let shadow-color = rgb(r.palette.ambient)
    let bulge = 0.96
    if r.body == "dick" { bulge = 1.12 }
    else if r.body == "muskuloes" { bulge = 1.0 }
    
    // Draw torso shadow outline
    draw.line(
      (4 - 0.38, 6.0),
      (4 - 0.38, 5.66),
      (4 - sh, 5.6),
      (4 - sh, 4.7),
      (4 - sh * bulge, 1.5),
      (4 - sh * bulge, 0.0),
      (4 + sh * bulge, 0.0),
      (4 + sh * bulge, 1.5),
      (4 + sh, 4.7),
      (4 + sh, 5.6),
      (4 + 0.38, 5.66),
      (4 + 0.38, 6.0),
      close: true,
      fill: shadow-color,
      stroke: (paint: shadow-color, thickness: 32pt, join: "round")
    )
    // Draw neck shadow outline
    draw.rect((4 - 0.38, d.cy - d.ry + 0.40), (4 + 0.38, 6.0), fill: shadow-color, stroke: (paint: shadow-color, thickness: 32pt, join: "round"))
    // Draw head shadow outline
    draw.circle((4, d.cy), radius: (d.rx, d.ry), fill: shadow-color, stroke: (paint: shadow-color, thickness: 32pt))

    // 2. Torso & Clothing
    draw.line(
      (4 - 0.38, 6.0),
      (4 - 0.38, 5.66),
      (4 - sh, 5.6),
      (4 - sh, 4.7),
      (4 - sh * bulge, 1.5),
      (4 - sh * bulge, 0.0),
      (4 + sh * bulge, 0.0),
      (4 + sh * bulge, 1.5),
      (4 + sh, 4.7),
      (4 + sh, 5.6),
      (4 + 0.38, 5.66),
      (4 + 0.38, 6.0),
      close: true,
      fill: cc,
      stroke: none
    )
    
    // Pattern on clothing
    if r.clothing-pattern == "stripes" {
      draw.line((4 - sh, 1.0), (4 + sh, 3.0), stroke: 4pt + cd)
      draw.line((4 - sh, 2.5), (4 + sh, 4.5), stroke: 4pt + cd)
      draw.line((4 - sh, 4.0), (4 + sh, 6.0), stroke: 4pt + cd)
    } else if r.clothing-pattern == "dots" {
      draw.circle((4 - 0.5, 2.0), radius: 0.08, fill: cd, stroke: none)
      draw.circle((4 + 0.5, 2.0), radius: 0.08, fill: cd, stroke: none)
      draw.circle((4, 3.0), radius: 0.08, fill: cd, stroke: none)
      draw.circle((4 - 0.6, 4.0), radius: 0.08, fill: cd, stroke: none)
      draw.circle((4 + 0.6, 4.0), radius: 0.08, fill: cd, stroke: none)
    }
    
    // Collar styles
    let collar-y = d.cy - d.ry - 0.30
    if r.clothing-style == "tshirt" {
      draw.arc((4, collar-y + 0.46), start: 200deg, stop: 340deg, radius: 0.46, stroke: (paint: cd, thickness: 4pt), anchor: "center")
    } else if r.clothing-style == "hoodie" {
      draw.rect((4 - 0.6, collar-y + 0.1), (4 + 0.6, collar-y - 0.4), fill: cd, radius: 0.18, stroke: none)
      draw.circle((4, collar-y - 0.54), radius: 0.06, fill: acc-color, stroke: none)
    } else if r.clothing-style == "jacket" {
      draw.line(
        (4 - 0.46, collar-y),
        (4 - 0.16, collar-y - 0.8),
        (4, collar-y - 0.5),
        (4 + 0.16, collar-y - 0.8),
        (4 + 0.46, collar-y),
        close: true,
        fill: cd,
        stroke: none
      )
      draw.circle((4, collar-y - 1.0), radius: 0.07, fill: acc-color, stroke: none)
      draw.circle((4, collar-y - 1.3), radius: 0.07, fill: acc-color, stroke: none)
    } else if r.clothing-style == "sweater" {
      draw.circle((4, collar-y - 0.04), radius: (0.44, 0.2), fill: cd, stroke: none)
    } else if r.clothing-style == "collared" {
      draw.line((4 - 0.46, collar-y), (4, collar-y - 0.7), (4 + 0.46, collar-y), close: true, fill: cd, stroke: none)
      draw.circle((4, collar-y - 0.9), radius: 0.05, fill: acc-color, stroke: none)
    }
    
    // 3. Neck
    draw.rect((4 - 0.38, d.cy - d.ry + 0.40), (4 + 0.38, 6.0), fill: skin-dark, stroke: none)
    
    // 4. Head
    draw.circle((4, d.cy), radius: (d.rx, d.ry), fill: skin, stroke: none)
    
    // Ears
    draw.circle((4 - d.rx + 0.06, d.cy - 0.06), radius: 0.18, fill: skin, stroke: none)
    draw.circle((4 + d.rx - 0.06, d.cy - 0.06), radius: 0.18, fill: skin, stroke: none)

    // Nose
    draw.line(
      (4 - 0.06, d.cy - 0.06 - 0.22),
      (4 - 0.1, d.cy - 0.06 - 0.40),
      (4 + 0.04, d.cy - 0.06 - 0.40),
      fill: none,
      stroke: (paint: skin-dark, thickness: 2pt)
    )

    // Cheek blush
    if r.age == "kind" or r.expression == "smile" {
      draw.circle((4 - 0.52, d.cy - 0.06 - 0.34), radius: 0.16, fill: rgb("#ff8f8f").lighten(20%), stroke: none, opacity: 30%)
      draw.circle((4 + 0.52, d.cy - 0.06 - 0.34), radius: 0.16, fill: rgb("#ff8f8f").lighten(20%), stroke: none, opacity: 30%)
    }

    // Eyes
    let eye-y = d.cy - (if r.age == "kind" { 0.14 } else { 0.06 })
    let eye-dx = if r.age == "kind" { 0.40 } else { 0.36 }
    let eye-r = if r.age == "kind" { 0.11 } else { 0.09 }
    
    if r.expression == "wink" {
      // Left eye closed line
      draw.line((4 - eye-dx - eye-r - 0.05, eye-y), (4 - eye-dx + eye-r + 0.05, eye-y), stroke: (paint: rgb("#161616"), thickness: 1.5pt))
      // Right eye open
      draw.circle((4 + eye-dx, eye-y), radius: (eye-r + 0.05, eye-r + 0.01), fill: rgb("#ffffff"), stroke: none)
      draw.circle((4 + eye-dx, eye-y), radius: eye-r, fill: eye-color, stroke: none)
      draw.circle((4 + eye-dx, eye-y), radius: eye-r * 0.5, fill: rgb("#161616"), stroke: none)
      draw.circle((4 + eye-dx - 0.03, eye-y + 0.03), radius: eye-r * 0.25, fill: rgb("#ffffff"), stroke: none)
    } else if r.expression == "surprised" {
      draw.circle((4 - eye-dx, eye-y), radius: (eye-r + 0.07, eye-r + 0.04), fill: rgb("#ffffff"), stroke: none)
      draw.circle((4 - eye-dx, eye-y), radius: eye-r + 0.01, fill: eye-color, stroke: none)
      draw.circle((4 - eye-dx, eye-y), radius: eye-r * 0.5, fill: rgb("#161616"), stroke: none)
      draw.circle((4 - eye-dx - 0.03, eye-y + 0.04), radius: eye-r * 0.25, fill: rgb("#ffffff"), stroke: none)
      
      draw.circle((4 + eye-dx, eye-y), radius: (eye-r + 0.07, eye-r + 0.04), fill: rgb("#ffffff"), stroke: none)
      draw.circle((4 + eye-dx, eye-y), radius: eye-r + 0.01, fill: eye-color, stroke: none)
      draw.circle((4 + eye-dx, eye-y), radius: eye-r * 0.5, fill: rgb("#161616"), stroke: none)
      draw.circle((4 + eye-dx - 0.03, eye-y + 0.04), radius: eye-r * 0.25, fill: rgb("#ffffff"), stroke: none)
    } else {
      draw.circle((4 - eye-dx, eye-y), radius: (eye-r + 0.05, eye-r + 0.01), fill: rgb("#ffffff"), stroke: none)
      draw.circle((4 - eye-dx, eye-y), radius: eye-r, fill: eye-color, stroke: none)
      draw.circle((4 - eye-dx, eye-y), radius: eye-r * 0.5, fill: rgb("#161616"), stroke: none)
      draw.circle((4 - eye-dx - 0.03, eye-y + 0.03), radius: eye-r * 0.25, fill: rgb("#ffffff"), stroke: none)
      
      draw.circle((4 + eye-dx, eye-y), radius: (eye-r + 0.05, eye-r + 0.01), fill: rgb("#ffffff"), stroke: none)
      draw.circle((4 + eye-dx, eye-y), radius: eye-r, fill: eye-color, stroke: none)
      draw.circle((4 + eye-dx, eye-y), radius: eye-r * 0.5, fill: rgb("#161616"), stroke: none)
      draw.circle((4 + eye-dx - 0.03, eye-y + 0.03), radius: eye-r * 0.25, fill: rgb("#ffffff"), stroke: none)
    }

    // Eyebrows
    let brow-y = eye-y + eye-r + 0.14
    let brow-color = hair-color.darken(10%)
    if r.expression == "surprised" {
      draw.arc((4 - eye-dx, brow-y + 0.06), start: 20deg, stop: 160deg, radius: 0.22, stroke: (paint: brow-color, thickness: 2.5pt), anchor: "center")
      draw.arc((4 + eye-dx, brow-y + 0.06), start: 20deg, stop: 160deg, radius: 0.22, stroke: (paint: brow-color, thickness: 2.5pt), anchor: "center")
    } else if r.expression == "serious" {
      draw.line((4 - eye-dx - 0.18, brow-y + 0.06), (4 - eye-dx + 0.18, brow-y - 0.06), stroke: (paint: brow-color, thickness: 3.5pt))
      draw.line((4 + eye-dx + 0.18, brow-y + 0.06), (4 + eye-dx - 0.18, brow-y - 0.06), stroke: (paint: brow-color, thickness: 3.5pt))
    } else {
      draw.line((4 - eye-dx - 0.15, brow-y), (4 - eye-dx + 0.15, brow-y), stroke: (paint: brow-color, thickness: 2pt))
      draw.line((4 + eye-dx - 0.15, brow-y), (4 + eye-dx + 0.15, brow-y), stroke: (paint: brow-color, thickness: 2pt))
    }

    // Mouth
    let mouth-y = eye-y - 0.62
    let mouth-color = skin.darken(40%)
    if r.expression == "smile" {
      draw.arc((4, mouth-y + 0.18), start: 200deg, stop: 340deg, radius: 0.28, stroke: (paint: mouth-color, thickness: 2.5pt), anchor: "center")
    } else if r.expression == "serious" {
      draw.line((4 - 0.22, mouth-y), (4 + 0.22, mouth-y), stroke: (paint: mouth-color, thickness: 2.5pt))
    } else if r.expression == "surprised" {
      draw.circle((4, mouth-y - 0.12), radius: (0.14, 0.16), fill: mouth-color, stroke: none)
    } else {
      draw.arc((4, mouth-y + 0.1), start: 210deg, stop: 330deg, radius: 0.24, stroke: (paint: mouth-color, thickness: 2pt), anchor: "center")
    }

    // Hair Front
    if r.hair-style == 1 {
      // Short hair cap (geometric dome)
      draw.circle((4, top), radius: (d.rx + 0.04, 0.4), fill: hair-color, stroke: none)
    } else if r.hair-style == 2 {
      // Mohawk (spiky polygon)
      draw.line(
        (4 - 0.22, top - 0.30),
        (4 - 0.28, top + 0.90),
        (4, top + 1.10),
        (4 + 0.28, top + 0.90),
        (4 + 0.22, top - 0.30),
        close: true,
        fill: hair-color,
        stroke: none
      )
    } else if r.hair-style == 3 {
      // Long hair front cap
      draw.circle((4, top), radius: (d.rx + 0.02, 0.36), fill: hair-color, stroke: none)
    } else if r.hair-style == 5 {
      // Bun on top
      draw.circle((4, top + 0.28), radius: (0.34, 0.28), fill: hair-color, stroke: none)
    }

    // Accessory
    let ink = rgb("#15161c")
    if r.accessory == "brille" {
      draw.rect((4 - eye-dx - 0.26, eye-y - 0.2), (4 - eye-dx + 0.26, eye-y + 0.2), radius: 0.12, stroke: 1.5pt + ink, fill: none)
      draw.rect((4 + eye-dx - 0.26, eye-y - 0.2), (4 + eye-dx + 0.26, eye-y + 0.2), radius: 0.12, stroke: 1.5pt + ink, fill: none)
      draw.line((4 - eye-dx + 0.26, eye-y), (4 + eye-dx - 0.26, eye-y), stroke: 1.5pt + ink)
    } else if r.accessory == "sonnenbrille" {
      draw.rect((4 - eye-dx - 0.26, eye-y - 0.2), (4 - eye-dx + 0.26, eye-y + 0.2), radius: 0.12, fill: rgb("#1c1c1e"), stroke: 1.5pt + ink)
      draw.rect((4 + eye-dx - 0.26, eye-y - 0.2), (4 + eye-dx + 0.26, eye-y + 0.2), radius: 0.12, fill: rgb("#1c1c1e"), stroke: 1.5pt + ink)
      draw.line((4 - eye-dx - 0.20, eye-y - 0.10), (4 - eye-dx + 0.10, eye-y + 0.08), stroke: 2.5pt + acc-color, opacity: 80%)
      draw.line((4 + eye-dx - 0.20, eye-y - 0.10), (4 + eye-dx + 0.10, eye-y + 0.08), stroke: 2.5pt + acc-color, opacity: 80%)
      draw.line((4 - eye-dx + 0.26, eye-y - 0.14), (4 + eye-dx - 0.26, eye-y - 0.14), stroke: 4pt + ink)
    } else if r.accessory == "hut" {
      // Hat brim
      draw.circle((4.0, top - 0.24), radius: (d.rx + 0.34, 0.26), fill: acc-color.darken(25%), stroke: none)
      // Hat body
      draw.line(
        (4 - d.rx + 0.06, top - 0.24),
        (4 - d.rx + 0.06, top + 0.78),
        (4.0, top + 0.82),
        (4 + d.rx - 0.06, top + 0.78),
        (4 + d.rx - 0.06, top - 0.24),
        close: true,
        fill: acc-color,
        stroke: none
      )
      // Hat ribbon
      draw.rect((4 - d.rx + 0.06, top - 0.24), (4 + d.rx - 0.06, top + 0.04), fill: acc-color.darken(25%), stroke: none)
    } else if r.accessory == "muetze" {
      // Beanie body
      draw.line(
        (4 - d.rx - 0.04, d.cy - 0.20),
        (4 - d.rx - 0.08, top + 0.40),
        (4 + d.rx + 0.08, top + 0.40),
        (4 + d.rx + 0.04, d.cy - 0.20),
        close: true,
        fill: acc-color,
        stroke: none
      )
      // Beanie brim
      draw.rect((4 - d.rx - 0.06, d.cy - 0.30), (4 + d.rx + 0.06, d.cy - 0.10), fill: cc, stroke: none, radius: 0.08)
      // Pompon
      draw.circle((4.0, top + 0.46), radius: 0.1, fill: rgb("#ffffff"), stroke: none)
    } else if r.accessory == "bart" {
      // Beard outline - Y-axis flipped (Typst Y grows up, SVG Y grows down)
      let jaw-y = d.cy - d.ry + 0.30
      draw.line(
        (4 - d.rx + 0.20, eye-y - 0.40),
        (4 - d.rx + 0.14, jaw-y - 0.10),
        (4.0, jaw-y - 0.30),
        (4 + d.rx - 0.14, jaw-y - 0.10),
        (4 + d.rx - 0.20, eye-y - 0.40),
        (4 + 0.40, eye-y - 0.78),
        (4.0, eye-y - 0.72),
        (4 - 0.40, eye-y - 0.78),
        close: true,
        fill: hair-color-dark,
        stroke: none
      )
    }

    // Props
    if r.prop == "coffee" {
      draw.translate((hand-x-right, hand-y))
      draw.rotate(5deg)
      draw.line((-0.20, -0.30), (0.20, -0.30), (0.24, 0.30), (-0.24, 0.30), close: true, fill: rgb("#ffffff"), stroke: none)
      draw.line((-0.18, -0.10), (0.18, -0.10), (0.20, 0.20), (-0.20, 0.20), close: true, fill: acc-color, stroke: none)
      draw.arc((0.22, 0.0), start: 270deg, stop: 90deg, radius: 0.14, stroke: (paint: rgb("#ffffff"), thickness: 2.5pt))
      draw.line((-0.08, 0.34), (-0.06, 0.44), (-0.12, 0.54), stroke: 2pt + cd, opacity: 60%)
      draw.line((0.08, 0.34), (0.10, 0.44), (0.04, 0.54), stroke: 2pt + cd, opacity: 60%)
    } else if r.prop == "phone" {
      draw.translate((hand-x-right, hand-y - 0.2))
      draw.rotate(8deg)
      draw.rect((-0.23, -0.41), (0.23, 0.41), radius: 0.08, fill: rgb("#1c1c1e"), stroke: none)
      draw.rect((-0.20, -0.38), (0.20, 0.38), radius: 0.06, fill: rgb("#2a2a2e"), stroke: none)
      draw.rect((-0.18, -0.33), (0.18, 0.33), radius: 0.04, fill: acc-color.darken(10%), stroke: none, opacity: 50%)
      draw.circle((0.0, -0.36), radius: 0.04, fill: rgb("#444444"), stroke: none, opacity: 70%)
    } else if r.prop == "pen" {
      draw.translate((hand-x-right, hand-y - 0.3))
      draw.rotate(30deg)
      draw.rect((-0.05, -0.55), (0.05, 0.55), radius: 0.05, fill: acc-color, stroke: none)
      draw.line((0.0, 0.55), (-0.05, 0.55), (0.0, 0.75), (0.05, 0.55), close: true, fill: acc-color.darken(30%), stroke: none)
      draw.rect((-0.05, -0.55), (0.05, -0.35), radius: 0.05, fill: acc-color.lighten(30%), stroke: none)
    } else if r.prop == "book" {
      draw.translate((hand-x-left, hand-y - 0.1))
      draw.rotate(-10deg)
      draw.rect((-0.40, -0.52), (0.40, 0.52), radius: 0.04, fill: acc-color, stroke: none)
      draw.rect((-0.36, -0.48), (0.36, 0.48), radius: 0.02, fill: acc-color.lighten(20%), stroke: none, opacity: 60%)
      draw.rect((-0.32, -0.52), (-0.26, 0.52), fill: acc-color.darken(20%), stroke: none)
      draw.line((-0.22, 0.25), (0.32, 0.25), stroke: 2pt + acc-color, opacity: 50%)
      draw.line((-0.22, 0.10), (0.32, 0.10), stroke: 2pt + acc-color, opacity: 50%)
      draw.line((-0.22, -0.05), (0.22, -0.05), stroke: 2pt + acc-color, opacity: 50%)
    } else if r.prop == "guitar" {
      draw.translate((hand-x-left, d.cy - d.ry - 1.20))
      draw.rotate(-15deg)
      draw.circle((0.0, 0.0), radius: (0.34, 0.40), fill: acc-color, stroke: none)
      draw.circle((0.0, 0.0), radius: (0.18, 0.22), fill: acc-color.darken(30%), stroke: none, opacity: 50%)
      draw.rect((-0.03, -0.2), (0.03, 1.1), fill: acc-color.darken(20%), radius: 0.03, stroke: none)
      draw.rect((-0.10, 1.1), (0.10, 1.34), fill: acc-color.darken(10%), radius: 0.04, stroke: none)
      draw.line((-0.04, 0.1), (-0.04, 1.2), stroke: 1.5pt + acc-color.lighten(40%), opacity: 80%)
      draw.line((0.0, 0.1), (0.0, 1.2), stroke: 1.5pt + acc-color.lighten(40%), opacity: 80%)
      draw.line((0.04, 0.1), (0.04, 1.2), stroke: 1.5pt + acc-color.lighten(40%), opacity: 80%)
    } else if r.prop == "headphones" {
      let head-y = d.cy
      let ear1x = 4.0 - d.rx + 0.08
      let ear2x = 4.0 + d.rx - 0.08
      draw.arc((4.0, head-y), start: 20deg, stop: 160deg, radius: d.rx + 0.06, stroke: (paint: rgb("#2c2c2e"), thickness: 8pt), anchor: "center")
      draw.rect((ear1x - 0.16, head-y - 0.20), (ear1x + 0.16, head-y + 0.22), radius: 0.10, fill: rgb("#1c1c1e"), stroke: none)
      draw.rect((ear2x - 0.16, head-y - 0.20), (ear2x + 0.16, head-y + 0.22), radius: 0.10, fill: rgb("#1c1c1e"), stroke: none)
      draw.rect((ear1x - 0.12, head-y - 0.16), (ear1x + 0.12, head-y + 0.16), radius: 0.08, fill: acc-color, stroke: none, opacity: 50%)
      draw.rect((ear2x - 0.12, head-y - 0.16), (ear2x + 0.12, head-y + 0.16), radius: 0.08, fill: acc-color, stroke: none, opacity: 50%)
    } else if r.prop == "umbrella" {
      draw.translate((hand-x-right, d.cy - d.ry - 1.20))
      draw.arc((0.50, 1.00), start: 0deg, stop: 180deg, radius: 0.50, fill: acc-color, stroke: none, opacity: 85%, anchor: "center")
      draw.arc((0.50, 1.00), start: 0deg, stop: 180deg, radius: 0.50, fill: acc-color.darken(20%), stroke: none, opacity: 50%, anchor: "center")
      draw.line((0.50, 0.00), (0.50, 1.80), stroke: 5pt + acc-color.darken(30%), stroke-linecap: "round")
      draw.arc((0.46, 0.10), start: 180deg, stop: 360deg, radius: 0.06, stroke: (paint: acc-color.darken(30%), thickness: 5pt), anchor: "center")
    } else if r.prop == "camera" {
      draw.translate((hand-x-right - 0.3, hand-y))
      draw.rotate(-5deg)
      draw.rect((-0.45, -0.33), (0.45, 0.33), radius: 0.08, fill: rgb("#2c2c2e"), stroke: none)
      draw.rect((-0.21, 0.33), (0.21, 0.42), radius: 0.04, fill: rgb("#3a3a3c"), stroke: none)
      draw.circle((0.0, 0.0), radius: 0.24, fill: rgb("#1c1c1e"), stroke: none)
      draw.circle((0.0, 0.0), radius: 0.18, fill: acc-color.darken(10%), stroke: none, opacity: 70%)
      draw.circle((0.0, 0.0), radius: 0.10, fill: rgb("#0a0a0a"), stroke: none)
      draw.circle((-0.05, 0.06), radius: 0.04, fill: rgb("#ffffff"), stroke: none, opacity: 30%)
      draw.circle((0.27, 0.12), radius: 0.06, fill: acc-color, stroke: none, opacity: 80%)
    } else if r.prop == "speech" {
      let bx = 4.0 + d.rx + 0.20
      let by = top + 0.40
      draw.rect((bx, by), (bx + 1.20, by + 0.70), radius: 0.16, fill: rgb("#ffffff"), stroke: none, opacity: 93%)
      draw.line((bx + 0.14, by), (bx, by - 0.20), (bx + 0.34, by), close: true, fill: rgb("#ffffff"), stroke: none, opacity: 93%)
      draw.circle((bx + 0.30, by + 0.35), radius: 0.08, fill: acc-color, stroke: none, opacity: 80%)
      draw.circle((bx + 0.60, by + 0.35), radius: 0.08, fill: acc-color, stroke: none, opacity: 80%)
      draw.circle((bx + 0.90, by + 0.35), radius: 0.08, fill: acc-color, stroke: none, opacity: 80%)
    }
  })
}

// Main Coverforge Page Layout & Render Function
#let render-cover(main, characters, title, genre) = {
  let p = main.palette
  
  set page(
    width: 800pt,
    height: 1200pt,
    margin: 0pt,
    fill: rgb(p.bg-bottom)
  )

  // 1. Background gradient layer
  place(top + left, rect(width: 800pt, height: 1200pt, fill: gradient.linear(rgb(p.bg-top), rgb(p.bg-bottom), angle: 90deg), stroke: none))
  
  // 2. Scene Elements
  if main.scene-element == "skyline" {
    place(bottom + left, dy: -200pt, canvas(length: 100pt, {
      let sh-col = rgb(p.shape)
      let acc-col = rgb(p.accent)
      draw.rect((0.2, 0), (1.8, 2.5), fill: sh-col.lighten(10%), stroke: none)
      draw.rect((2.0, 0), (3.6, 3.2), fill: sh-col, stroke: none)
      draw.rect((3.8, 0), (4.5, 2.0), fill: sh-col.lighten(15%), stroke: none)
      draw.rect((4.8, 0), (6.2, 2.8), fill: sh-col, stroke: none)
      draw.rect((6.5, 0), (7.8, 2.2), fill: sh-col.lighten(10%), stroke: none)
      
      // Lit windows
      draw.rect((2.4, 2.2), (2.6, 2.5), fill: acc-col, stroke: none)
      draw.rect((2.8, 2.2), (3.0, 2.5), fill: acc-col, stroke: none)
      draw.rect((5.2, 2.0), (5.4, 2.3), fill: acc-col, stroke: none)
    }))
  } else if main.scene-element == "mountains" {
    place(bottom + left, dy: -100pt, canvas(length: 100pt, {
      let sh-col = rgb(p.shape)
      draw.line((0.0, 0.0), (1.8, 2.6), (3.6, 0.0), close: true, fill: sh-col.lighten(10%), stroke: none)
      draw.line((1.2, 0.0), (3.6, 3.2), (6.0, 0.0), close: true, fill: sh-col, stroke: none)
      draw.line((3.0, 0.0), (5.2, 2.8), (7.4, 0.0), close: true, fill: sh-col.lighten(5%), stroke: none)
      draw.line((4.8, 0.0), (7.0, 2.4), (8.0, 0.0), close: true, fill: sh-col.darken(10%), stroke: none)
    }))
  } else if main.scene-element == "stars" {
    place(top + left, canvas(length: 100pt, {
      let glow-col = rgb(p.glow)
      draw.circle((1.2, 9.5), radius: 0.05, fill: glow-col, stroke: none)
      draw.circle((2.6, 8.2), radius: 0.03, fill: glow-col, stroke: none)
      draw.circle((3.1, 10.1), radius: 0.04, fill: glow-col, stroke: none)
      draw.circle((5.8, 9.2), radius: 0.05, fill: glow-col, stroke: none)
      draw.circle((6.7, 7.8), radius: 0.03, fill: glow-col, stroke: none)
      draw.circle((7.2, 9.9), radius: 0.04, fill: glow-col, stroke: none)
    }))
  }
  
  // 3. Characters Rendering inside a CeTZ Canvas
  place(top + left, canvas(
    length: 100pt,
    {
      // Determine slot positions based on character count
      let slots = ()
      if characters.len() == 1 {
        slots = ((cx: 4.0, scale: 1.0),)
      } else if characters.len() == 2 {
        slots = ((cx: 2.8, scale: 0.85), (cx: 5.2, scale: 0.85))
      } else {
        slots = ((cx: 2.0, scale: 0.75), (cx: 4.0, scale: 0.85), (cx: 6.0, scale: 0.75))
      }
      
      for (i, slot) in slots.enumerate() {
        let char-recipe = characters.at(i)
        draw-character(char-recipe, slot.cx, slot.scale)
      }
    }
  ))
  
  // 4. Fletcher diagram relation overlay (if we have more than 1 character)
  if characters.len() > 1 {
    place(top + left, dx: 0pt, dy: 0pt, diagram(
      cell-size: 100pt,
      // Create relationship node anchors above characters' heads
      node((2.8, 4.0), name: <c1>, shape: circle, radius: 0pt, stroke: none),
      node((5.2, 4.0), name: <c2>, shape: circle, radius: 0pt, stroke: none),
      edge(<c1>, <c2>, "<->", stroke: 2pt + rgb(p.accent), label: [Duo], label-pos: 0.5, label-sep: 6pt)
    ))
  }

  // 5. Typography Layer
  place(
    bottom + center,
    dy: -180pt,
    block(
      width: 600pt,
      align(center)[
        #text(
          fill: rgb(p.text),
          font: "Liberation Sans",
          size: 56pt,
          weight: "bold",
          tracking: 2pt,
        )[#upper(title)]
        
        #v(8pt)
        #line(length: 120pt, stroke: 3pt + rgb(p.accent))
        #v(8pt)
        
        #text(
          fill: rgb(p.accent),
          font: "Liberation Sans",
          size: 14pt,
          weight: "medium",
          tracking: 5pt,
        )[#upper(genre)]
      ]
    )
  )
}
