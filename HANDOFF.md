# Fishwater Flats Biogas Promo Video — Handoff / New-Discussion Seed

Condensed context so a fresh discussion can continue without re-deriving state.
For deep detail see `CLAUDE.md` (full project memory) and `storyboard-text.txt` (R0v3 facts).

## What this project is
A ~4:42 animated corporate-documentary promo for the **Fishwater Flats wastewater-to-energy
facility** (Straits Energy = Project Owner; EnergiDrop = Power & Project Management Partner),
Nelson Mandela Bay, South Africa. Built on the `animations.jsx` Stage/Sprite timeline engine.
Follows a 6-chapter storyboard: place → problem → central idea → system mechanics → impact →
future state.

## Deliverables (three cuts, all share one JSX source)
1. **Full cut** — 4:42, complete narrative.
2. **Regulator cut** — 3 min, stakeholder-neutral tone.
3. **Investor cut** — 3 min, investment-thesis-first framing.

Each exports to a self-contained **offline standalone HTML (~25.3 MB)**, full stock library +
control panels baked in.

## Source-of-truth files
- `Fishwater Flats Video.dc.html` — live editable full cut (edit this).
- `Fishwater Flats Video - Regulator Cut (3 min).dc.html`, `… Investor Cut (3 min).dc.html` — live cuts.
- `fwf-scene.jsx` — shared timeline logic (all Sprite/beat components; exports FWFVideo /
  FWFRegulatorCut / FWFInvestorCut). **All three cuts mount this — one edit propagates.**
- `fwf-scene.merged.jsx` — asset-inlined build source (regenerated from animations.jsx + fwf-scene.jsx).
- `Fishwater Flats Video -Standalone-.dc.html` (+ Regulator/Investor variants) — bundler entry points.
- `Fishwater Flats Video - Standalone.html` (+ Regulator/Investor) — final offline exports.
- `FWF Plant 3D Model.html` — single three.js massing model (downloadable OBJ/GLB); its captured
  views are the in-video ModelShots.
- `CLAUDE.md` — full memory. `storyboard-text.txt` — R0v3 narrative/facts.

## Build/export recipe (repeat when fwf-scene.jsx changes)
1. Regenerate `fwf-scene.merged.jsx`: concat `animations.jsx` + `fwf-scene.jsx`, rewrite every
   `assets/…` ref (both JSX attr form `x="assets/…"` and JS-string form `'assets/…'`, incl. the
   object-property COLON case) to `window.__resources.res_<slug>`. Verify **0 leftover `assets/` refs**.
2. `super_inline_html` each `… -Standalone-.dc.html` → friendly `… Standalone.html`.
3. Keep bundles **< 30 MiB** (super_inline_html hard limit). Video b-roll uses the compressed
   `assets/footage/sm/*.mp4` (~0.5–1.7 MB each), NOT the raw clips.
4. Compression must run in the **normal-speed preview** (MediaRecorder on captureStream), never
   in run_script (sandbox throttles rAF → hangs).

## Features built (all browser-persisted; NOT baked into exports)
- **Footage control panel** (top-right): all 17 b-roll slots (4 scene beats, 10 impact cards,
  title-bg, blockflow-bg, closing-aerial). Per-shot: pick from 16-clip STOCK library, upload own
  file, reset, or drag-drop onto the shot in "Edit on canvas" mode. Library picks → localStorage;
  dropped files → IndexedDB. Portaled to body so it never appears in the exported video.
- **Timing & Labels editor** (top-left): ~36 beats in timeline order, editable in/out times +
  label text, Reset all, and **Snap end-to-end** (chains each beat to start when the prior ends,
  durations preserved — closes gaps/overlaps). Overrides in localStorage. Also portaled out of Stage.
- **Maps**: all 6 Google Maps graphics scrubbed of every business POI — place names / roads /
  beaches only. Originals backed up in `assets/maps/_orig/`.
- **3D**: one consolidated, pipe-dressed three.js plant model; its captures replace all in-video
  3D renders AND the model downloads as OBJ/GLB. Flythrough re-centered on the plant patch and
  aligned to the CAD sections.

## Known gaps / open items
- Real drone/site + interview SOT footage still to be shot; remaining ModelShot/interview slots
  are `<image-slot>` drop zones. Stock b-roll (landmark/brand-free) fills everything else.
- Compressed b-roll is bitrate-reduced (~1.3 Mbps) to fit 30 MiB; swap higher-quality clips into
  `assets/footage/sm/` (same names) and re-bundle to raise quality.
- Final VO recording + sound design pending (scripts/timecodes in place for all 3 cuts; see
  `VO_SCRIPT` in fwf-scene.jsx — keep in sync when beat timings change).
- Video → .mp4 export must be triggered by the USER via the player's Export Video button
  (client-side); cannot be done from tool calls.
- Panel/editor overrides are browser-only by design — they do NOT bake into the standalone files.

## Design system
Bound to **EnergiDrop Design System** at `/projects/25c6bffe-6ff6-4d93-a4fa-33bf6ce78853/`.
Palette sampled from the EnergiDrop logo (blue / gold-flame / sky / gray). Check there before
adding any color.
