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

Eurostat · European Commission (DG TAXUD) · IATA · Cargo Facts Consulting ·
Reuters / FT market reports. 2024–2025 figures include projections; per-year
sources are shown in the panel and the INFO overlay.

## Credits

- Renderer: [glyphcss](https://github.com/apresmoi/glyphcss) (MIT) by apresmoi
- Font: "WebPlus IBM VGA 8x16" — [The Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/)
  by VileR, CC BY-SA 4.0
- Land mask baked from [world-atlas](https://github.com/topojson/world-atlas)
  (Natural Earth 110m)
