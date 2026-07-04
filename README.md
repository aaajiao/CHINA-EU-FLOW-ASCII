# CHINA-EU FLOW ASCII

An ASCII data visualization of China→EU cross-border e-commerce parcel logistics
(Shein / Temu, 2020–2025) — the "deflation export" flowing through the de minimis
customs channel, rendered as a 1-bit ink/paper terminal.

Part of [aaajiao](https://eventstructure.com)'s **Symbiosis** project; the visual
language follows its sibling piece [1bit / 嵌合体废墟](https://github.com/aaajiao/1bit).

## What you see

- An ASCII Earth (16,200 spherical quads, [glyphcss](https://github.com/apresmoi/glyphcss)
  solid render) with a flat-map view, morphing between the two.
- Parcel particles flying the great-circle routes: `@` heavy glyphs = Shein,
  `*` light glyphs = Temu. Hub pillars scale with yearly volume.
- A 2020–2025 timeline. As deflation export intensifies, the duotone palette
  drifts through the four mental-state rooms of the 1bit game:
  ABSORPTION amber → IN_BETWEEN violet → INFO_OVERFLOW cyan → POLARIZED red.
- Full TUI chrome: IBM VGA 8×16 bitmap font, box-drawing frames, character
  widgets, reverse-video states. `[ INVERT ]` (or `I`) swaps ink and paper.

## Controls

```
[DRAG] ORBIT   [SCROLL] ZOOM   [2020-2025] TIMELINE   [|>] AUTOPLAY
[ GLOBE ] / [ FLAT ]   [ INVERT ] or I   [ INFO ] context & methodology
```

## Run

Single self-contained `index.html` — land-mask data and font are inlined; the
only external request is the glyphcss ES-module import from esm.sh. ES modules
need an HTTP origin, so serve the folder with any static server:

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

## Data

Volume = **total EU low-value (<€150) parcel imports** — the European Commission /
DG TAXUD official series — of which ~91% (2024) is China→EU. Annual counts are
official for 2022–2025 (1.4B, 2.3B, 4.6B, ~5.9B); 2020–2021 are estimated from the
Commission's pre-reform ~1B/year baseline (no systematic customs count existed
before the 1 July 2021 IOSS reform). 2025 is a completed-year actual, not a
projection. Regulatory milestones are sourced to the European Parliament and the
Council of the EU (Consilium) — including the €3-per-item duty that ended de minimis
on 1 July 2026. The Shein/Temu split is triangulated from DSA monthly-active-user
disclosures and Cargo Facts Consulting air-freight tonnage — a modeled estimate,
not a published parcel-level figure. Per-year sources appear in the panel and the
INFO overlay.

## Credits

- Renderer: [glyphcss](https://github.com/apresmoi/glyphcss) (MIT) by apresmoi
- Font: "WebPlus IBM VGA 8x16" — [The Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/)
  by VileR, CC BY-SA 4.0
- Land mask baked from [world-atlas](https://github.com/topojson/world-atlas)
  (Natural Earth 110m)
