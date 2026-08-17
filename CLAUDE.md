# Fishwater Flats Biogas Promotional Video

## Project overview

A 4-minute (240s) animated promotional video for the **Fishwater Flats Biogas Facility** in Gqeberha, Eastern Cape, South Africa. Built as a single-page HTML animation using a custom timeline engine (animations.jsx / Stage/Sprite pattern). Client is **Straits Energy Holdings** / **EnergiDrop**.

## Key files

| File | Purpose |
|------|---------|
| `Fishwater Flats Video.dc.html` | Entry point — mounts `fwf-scene.merged.jsx` |
| `fwf-scene.merged.jsx` | **Main scene file** — all animation logic, scenes, and composition (~2700 lines) |
| `assets/fwf-data.js` | Ground-truth site data: structures, coordinates, benefits, interview quotes |
| `assets/earth_studio_kf.js` | Google Earth Studio keyframes for satellite flyover animation |
| `assets/esri_tile_preload.js` | ESRI tile URLs to preload for satellite map scenes |
| `image-slot.js` | `<image-slot>` web component — drag-and-drop image placeholders |
| `video-slot.js` | `<video-slot>` web component — drag-and-drop video placeholders |

## Animation engine

The file embeds a full copy of `animations.jsx` (the Omelette animation engine) at the top, followed by the FWF scene code. Key exports on `window`:

- `Stage` — root container; owns playhead, scrubber, video export
- `Sprite({ start, end })` — mounts children only while playhead is in `[start, end]`
- `useSprite()` → `{ localTime, progress, duration }`
- `useTime()` → current playhead time in seconds
- `TextSprite`, `ImageSprite`, `RectSprite`, `VideoSprite` — built-in animated elements
- `Easing`, `interpolate`, `animate`, `clamp` — animation math utilities

The main component is `FWFVideo` (registered on `window`), rendered inside `<Stage width={1920} height={1080} duration={240}>`.

## Brand palette

```js
const BLUE      = '#0090E0';   // EnergiDrop primary
const BLUE_DEEP = '#0A4E82';
const BLUE_INK  = '#071522';
const GOLD      = '#FBB708';   // flame accent
const ORANGE    = '#F0901F';
const SKY       = '#8FE0FF';   // light blue
const GRAY      = '#9098A8';
const INK       = '#050A0F';   // near-black background
```

Typography: `'Barlow Condensed'` (headings, labels) + `'Barlow'` (body, subtitles). Loaded from Google Fonts.

## Scene structure (240s)

Scenes are composed as `<Sprite start={N} end={M}>` blocks. Key beats:

| Time | Scene |
|------|-------|
| 0–8 | `TitleCard` — opening drone flyover + logos |
| 8–22 | Stat cards (waste volumes, energy output, water, jobs) |
| 22–28 | `LocationZoom` — Earth Studio flyover zooming into site |
| 28–52 | Ground/drone b-roll placeholders (`FootageSlot`) + live site scenes |
| 52–75 | `BlockFlowScene` — animated process block-flow diagram |
| 75–105 | `ExistingToProposedScene` — site aerial → THREE.js 3D build reveal |
| 105–140 | `EarthFlyover` + `ThreeFlyover` — satellite + 3D camera paths |
| 140–180 | Interview `QuoteCard` beats (NMBM, Darius, Principal, Yaniv) |
| 180–210 | Animated scenes: `OutfallScene`, `CHPScene`, `CNGScene`, `CO2Scene` |
| 210–240 | Benefits sequence + closing title card |

## Video/image slots

Every footage placeholder is a `<video-slot id="..." label="...">` or `<image-slot id="...">`. The `id` must be stable — it's used to persist dropped footage across reloads. Slot labels reference actual footage filenames (e.g. `IMG_2290.MOV · WWTW Outfall`).

## THREE.js plant model

`buildPlant(THREE)` constructs a procedural 3D model of the facility with named mesh groups. Phase-reveal logic in `ExistingToProposedScene` scales mesh groups in at their designated reveal times. Model is cached after first build (`_plantCache`).

Earth Studio keyframes drive camera position/orientation via `lerpKF(t)` → `esToThreePos(kf)` / `esLookDir(heading, tilt)`.

## Site data (from `fwf-data.js`)

```js
window.FWF_STRUCTURES  // array of plant structures with phase, coordinates, kind
window.FWF_SITE_BOUNDS // { minX, maxX, minY, maxY } in site-local metres
window.FWF_BENEFITS    // 10 benefit cards with metric + label
window.FWF_INTERVIEWS  // 4 interview subjects: nmbm, darius, principal, yaniv
```

Site anchor: `-33.878529, 25.619647`, rotation `22.5°`. Coordinates are site-local metres.

## Resource loading

All image/video assets are preloaded to `data:` URLs via `preloadResources()` before the scene renders. The resource cache `RES_CACHE` maps resource IDs to data URLs. The helper `R(id, fallback)` resolves a resource with fallback to the project path.

Assets live in `assets/`: logos, 3D render stills (`3d_01_3d.png` … `3d_09_3d.png`), Google Maps screenshots, stock photography, and CAD reference image.

## Standalone export

`Fishwater Flats Video - Standalone v3.html` is a self-contained bundle (all assets inlined). Regenerate with `super_inline_html` from the DC entry point.

## Design system

EnergiDrop Design System — blue/gold palette, Barlow type family. See `/projects/25c6bffe-6ff6-4d93-a4fa-33bf6ce78853/` for full system.
