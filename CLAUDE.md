# EnergiDrop / Fishwater Flats Biogas Promo Video — Project Memory

## What this is
A ~4:42 (282s) animated promotional video for the Fishwater Flats Biogas Facility
(Straits Energy Holdings / EnergiDrop / Anaergia EPC), built on the `animations.jsx`
Stage/Sprite timeline engine. Corporate documentary tone, modeled on a Victor Valley
reference video's beat structure.

## 3D plant model + flythrough realignment + impact/scene b-roll (this session)
- `FWF Plant 3D Model.html` — plain-HTML three.js massing model (three-d-stage starter,
  pinned import map) of the plant: 3× Triton digesters, gas-holder dome, CHP block +
  stacks, BGU vessels, CO₂ capsule, flare, feedstock tanks. Named meshes/materials →
  downloadable OBJ+MTL / GLB via the stage toolbar. Camera props are `_camera`/`_controls`
  (`.target`)/`_object` — dolly with `_camera.position.lerp(target,f)` for crisp captures.
  Two hero views captured/cropped → `assets/3d/plant_3d.png` (used IN the video as the
  "3D Preliminary Plant Model" ModelShot in all 3 cuts).
- SiteDiagram flythrough now zooms in IMAGE-FRACTION space (SITE_KEYFRAMES fx/fy/z):
  satellite (faint, opacity 0.4) + full-frame CAD overlay share ONE eased cam transform
  (`translate((0.5-fx)*100%,(0.5-fy)*100%) scale(z)`, transformOrigin `fx% fy%`), with a
  centered highlight ring. The old world-space `worldToScreen` markers were the misaligned
  element — removed (STRUCTURES/worldToScreen/UNIT left defined but unused). Full-footprint
  open/close keyframes centered on the plant patch (fx0.56, fy0.6).
- Impact cards: all 10 dimensions carry b-roll via BenefitCard `video` (opacity 0.5 behind
  vignette); "10 Dimensions" title uses sifting (waste separation). Object-property paths
  (`video: 'assets/...'`) require the merged-regen COLON rule (`: 'assets/...'` -> __resources)
  on top of the attribute/`=` rules. Clips capped ~5s to fit the 30 MiB bundle limit.
- Merged/sources regen auto-extracts the asset union from fwf-scene.jsx; per-cut scene-video
  exclusions (reg: no cng/co2; inv: no outfall/cng/co2). Bundles: full 27.8 / reg 25.2 / inv 23.0 MB.

## Key files
- `Fishwater Flats Video.dc.html` — the live, editable DC (source of truth). Edit this one.
- `fwf-scene.jsx` — the scene/timeline logic (Stage children, all Sprite components:
  StatCard, ModelShot, MapShot, CadReference, FootageSlot, StatusBadge, ScriptDrawer/VO
  script, impact cards, etc). Mounted via `<x-import component-from-global-scope="FWFVideo">`.
- `animations.jsx` — starter timeline engine (Stage/Sprite/easing/export). Copied into
  THIS project root — must live here, not just the reference design-system project.
- `assets/` — real logos (EnergiDrop, Straits Energy Holdings, transparent EnergiDrop),
  real 3D-model captures (`assets/3d/01–10-3d.png`, cropped clean of tool chrome),
  real Google Maps satellite captures (`assets/maps/gmaps_*.png`, cropped clean of
  map-tool chrome/controls — crop box was 0,54,870,426 from 924×540 originals),
  CAD reference sheet, piping routing reference.
- `Fishwater Flats Video - Standalone.html` — offline-bundled export (~8.2MB, all
  assets/fonts inlined via `super_inline_html`). Regenerate via the merged-jsx approach
  below if `fwf-scene.jsx` changes — don't hand-edit the bundled file.

## Standalone export recipe (if asked again)
`<x-import>` with space-separated `from` URLs doesn't reliably resolve during bundling.
Working approach: concatenate `animations.jsx` + `fwf-scene.jsx` source into one file
(`fwf-scene.merged.jsx`), rewrite all `src="assets/..."` references to
`src={window.__resources.res_<slug>}`, declare each as an `ext-resource-dependency`
meta tag, mount via a single `<x-import component-from-global-scope="FWFVideo"
from="./fwf-scene.merged.jsx">`, then run `super_inline_html`.

### Video b-roll + size limit (added this session)
`SceneShell` (Outfall/CHP/CNG/CO2 beats) and `ClosingAerial` now play real stock
b-roll via `window.VideoSprite` (export-aware, timeline-synced). Source clips live in
`assets/footage/*.mp4`; the COMPRESSED versions actually used are `assets/footage/sm/*.mp4`
(~0.5–1.7MB each). Compression MUST be done in the normal-speed PREVIEW, not `run_script`
(that sandbox suspends rAF/throttles timers → realtime capture hangs). Working recipe:
`video.play()` + `video.captureStream()` → `MediaRecorder('video/mp4;codecs=avc1', ~1.3Mbps)`,
record until `ended`. Raw 720p clips (~5MB each) blow past `super_inline_html`'s 30 MiB
limit; compressed clips keep each bundle ~18–23MB. Per-cut video sets: full=5, regulator=3
(outfall/chp/closing), investor=2 (chp/closing). PDF pages also can't be rendered in
`run_script` (too slow) — render via a preview HTML + pdf.js, then `snapshot_element` each canvas.

## Content/structural decisions locked in
- Opening: generic capacity-strain framing (Markman Canal reference), no specific
  location claim as fact.
- Interviews: styled quote cards (name/title/soundbite) stand in for real SOT footage;
  VO script also documents which beats are SOT-only (no VO under them) — see
  `VO_SCRIPT` array in `fwf-scene.jsx` (~line 852), keep in sync with beat timings
  whenever Sprite start/end times change.
- CAD/3D: real coordinates and real captured stills from
  `uploads/FWF_Video_Production_Handoff/motion/fwf_3d_model_standalone.html`, not
  hand-drawn. `ModelShot` components now double as `<image-slot>` drop zones — user
  can drag real drone/site footage onto them to replace the render.
- Real Google Maps imagery (site overview, regional, pipeline corridor, metro wide,
  close orbital) used for flyover/flythrough beats instead of vector diagrams.
- `StatusBadge` ("Existing on Site" / "Proposed — To Be Built") added to every
  MapShot/ModelShot beat to distinguish current-state vs. future-build content.
- Impact section: 10 dimensions use branded illustration placeholders (stock photo
  search came back empty) — user may drop in real photos via image-slot later.
- Real transparent-background EnergiDrop logo + Straits Energy Holdings logo used on
  title/end cards.

## Impact-card b-roll + StatCard bg + flythrough/model alignment (this session)
- All 10 impact dimensions now have b-roll card backgrounds (`BenefitCard` `video` field,
  VideoSprite @0.5 opacity behind vignette): 01 aeraerial · 02 leaves · 03 aerbasin ·
  04 agri · 05 commerce · 06 petro · 07 agri2 · 08 mulch · 09 anchovies · 10 trio.
  "10 Dimensions" title card uses sifting (waste separation). Impact clips capped ~5s
  @660k (cards are 4.5s) to keep full bundle <30 MiB. `BENEFITS` object-property paths
  (`video: 'assets/...'`) need the merged-regen COLON rule (`: 'assets/...'` -> __resources)
  in addition to the attribute/`=` rules — else they don't resolve in the bundle.
- StatCard beats (~155 ML/day / ~74 t/day / Since 1976) got darkened bg stills
  (`statbg_water/solids/site.jpg`, extracted from outfall/mulch/closing footage).
- SiteDiagram flythrough REWRITTEN: satellite + full-frame CAD overlay were never
  registered (CAD is full-bleed, satellite plant is a tiny central patch) — that was the
  misalignment. Now both share ONE cam transform driven by SITE_KEYFRAMES in image-fraction
  space (fx,fy,z), zooming across the CAD layout's own labeled sections (digesters 14/15/16,
  CHP cluster, gas treatment, BGU) with a centered highlight ring; old worldToScreen marker
  circles removed. Tune fx/fy per keyframe if section framing drifts.
- MapShot got a smooth eased zoom-to-focus (`MapImg`, easeInOutCubic); aerial-approach
  metro shots pushed toward the site (fx0.6/fy0.62). Source maps are 870px — deep zoom
  still softens (would need higher-res captures to fully de-blur).
- 3D model renders: neutral light-grey CAD sheet keyed to transparent (01/02/04-3d.png)
  so the model composites on the dark site backdrop instead of a white sheet.
- Bundle sizes: full 28.9MB / regulator 26.4MB / investor 24.2MB.

## Footage control system (this session)
Every b-roll surface is now a swappable/droppable slot via `VideoSlot` (wraps
`window.VideoSprite`, timeline-synced). A fixed `FootageManager` overlay (portaled
to `document.body` via `FootageManagerPortal` so it lives OUTSIDE the scaled Stage
and never appears in the exported video) gives: per-shot stock-library dropdown
(`STOCK` map, 16 clips) + Upload (file) + Reset, plus an "Edit on canvas" mode that
lets the user drag a video file straight onto a shot. Persistence is browser-only
(user's choice): library picks in `localStorage` (`fwf_footage_lib`), dropped files
as blobs in IndexedDB (`fwf_footage`/`clips`, keyed by slotId, rehydrated on load).
`FootageStore` is a small pub/sub singleton. 17 slots: 4 scene beats (stable ids
`scene-outfall/chp/cng/co2`), 10 impact-card bgs (`impact-<labelslug>`), `title-bg`,
`blockflow-bg`, `closing-aerial` — all seeded in FootageManager's mount effect so the
panel lists them immediately (no need to scrub). Overrides do NOT bake into exports
(browser-only); the STOCK library + panel DO ship in the standalone bundles, so bundle
viewers get the same swap/drop control offline. Because STOCK references every clip,
the per-cut scene-video exclusions were DROPPED — all three standalone sources now
declare the full 37-meta asset set (bundles ~25.3 MB each, still <30). If reducing
size again, do NOT re-exclude cng/co2/outfall without making STOCK/seed conditional.
Open follow-up the user flagged: a timing/label editor — BUILT (see below).

## Timing & label editor (this session)
Shadowed `window.Sprite` as a local `Sprite` (destructure aliases it to `RawSprite`):
a sprite passed a `label` prop registers as an editable beat and honours timing
overrides; every other sprite passes straight through unchanged (zero behaviour change).
`EditStore` (pub/sub singleton, mirrors FootageStore) holds per-beat `{start,end}`
timing overrides (localStorage `fwf_timing`) and per-field label text (localStorage
`fwf_labels`), keyed by `beatId = 'beat:'+start+':'+end`. A fixed top-LEFT `TimingEditor`
panel (portaled to body alongside FootageManager, so it never appears in exports) lists
all registered beats in timeline order with numeric in/out inputs + per-field text inputs
+ Reset all. ~36 beats registered. Label-editable beats (read overrides at component top,
expose `fields`): MapShot, ModelShot, QuoteCard, StatCard, ChapterTitle, CadReference.
Timing-only beats (label prop only): TitleCard, Outfall/CHP/CNG/CO2 scenes, SiteDiagram,
ClosingAerial, EndCard, all 10 impact BenefitCards. Known limits: BlockFlow section and
sub-sprites (FlowNode/FlowLine/ProcessCopy) are NOT registered (complex internal
choreography); scene-beat TITLES (Outfall etc.) are hardcoded in SceneShell so not in the
label editor (edit in-place instead); beatIds are NOT cut-namespaced, so a beat with
identical start+end across cuts shares one override (rare; acceptable). Overrides are
browser-only, not baked into exports — same policy as footage.

## GES fly-in + footage update (this session)
- `SiteDiagramScene` and `FlyThroughScene` both now alias `GESFlyInScene` — a two-phase
  CSS animation driven by keyframes extracted from the uploaded GES project files:
  Phase 1 (35% of beat): altitude descent from `FWF Fly in .esp` (alt 1.0→0.474→0.34,
  normalized); Phase 2: low-altitude orbit pan from `FWF.esp` across 6 named waypoints
  (Digesters→CHP→Gas Holder→CO₂→Full plant). Base imagery is `assets/maps/fwf_site_layout.png`
  (Anaergia satellite + blue CAD overlay, copied from `uploads/FWF Site layout-f4386a06.png`).
- STOCK map + FootageManager: added `'Gemini AI Visualisation'` (`assets/footage/gemini_v1.mp4`,
  copied from `uploads/Gemini V1.mp4`) and `'Denmark Biogas Plant'`
  (`assets/footage/sm/denmark_plant.mp4`). Title-card default swapped to Gemini V1.
- ModelShot default site backdrop changed from `gmaps_site_overview.png` → `fwf_site_layout.png`.
- `MapShot` beat at 181s now references `fwf_site_layout.png` (was `gmaps_flythrough_base.png`).
- GES camera keyframes persisted at `assets/ges_flyin.json` for reference.
- Preferred 3D model: `24-0503 B01 001 (3).pdf` (client specified) — PDF render extraction
  requires manual export; drop stills onto the `ModelShot` image-slot drop-zones once available.
- Standalone bundle (`Fishwater Flats Video - Standalone.html`) NOT yet re-generated with these
  changes — re-run the merged-jsx recipe (see below) after confirming the live DC looks correct.

## 3D model colour update + PDF views (this session)
- `FWF Plant 3D Model.html` materials updated to match `FWF 3d models incorporated .pdf` BIM palette:
  digester shell `#3d8a44` (green), dome tops `#dedad0` (cream), site pad `#c2b88a` (beige),
  gas holder dome `#b8c8d8` (grey-blue), CHP accent `#2b60b0` (blue). Gas holder radius 15→20m.
- Composite 4-view render extracted from PDF → `assets/3d/01-model-pdf.jpg` (6998×4943, 8.7 MB)
  and `assets/3d/plant_3d_pdf.jpg`. Canvas cropping timed out on the large file; individual crops
  (02/04/05/06/07/09-3d.png) remain as old three-d-stage renders — re-capture from updated
  `FWF Plant 3D Model.html` once the model looks correct and drop onto image-slot zones.
- `fwf-scene.jsx` `plant_3d.png` references → `plant_3d_pdf.jpg` (shows all 4 PDF views).
- To replace remaining stills: open `FWF Plant 3D Model.html`, use the toolbar to position each
  hero view, `snapshot_element('three-d-stage')` → save to `assets/3d/XX-3d.png`.

## Footage revision v2 — recasts & implementation status (Aug 2026)
Reference doc: `uploads/FWF_Footage_Revision_v2_and_Shot_Instructions.md` (full audit,
evidence tiers, shot-change script, implementation order).

### Phase-lock fix (applied in v2.1)
`PhaseLockedVideo` replaces `window.VideoSprite` inside `VideoSlot` — uses `useSprite`
`localTime` so every slot opens on frame one instead of an arbitrary `global_t % span`
position. All 16 slots previously jump-cut mid-shot; 15 of 16 had measurable defects.
Beat-length spans were set at the same time (see v2.1 deploy notes above).

### Footage recasts — status per slot

| Slot | Beat | Current clip | Verdict | Target clip (uploads/) | Status |
|---|---|---|---|---|---|
| `blockflow-bg` | 20 s | `aerbasin` (5.3 s — freezes 14.8 s) | 🔁 MANDATORY | `0_Water_Treatment_*.mp4` (44.3 s) | ⏳ NOT YET APPLIED |
| `closing-aerial` | 11 s | `closing_aerial` (European WWTW — wrong site) | 🔁 + ⚠️ TRUTH | `0_Biogas_Plant_Bioenergy_Facility` | ⏳ NOT YET APPLIED |
| `scene-cng` | 6 s | `cng` (pipeline valve — wrong subject) | 🔁 | `5025374_Natural_Gas_1280x720.mp4` (audition) | ⏳ NOT YET APPLIED |
| `scene-co2` | 4 s | `co2` (fenced pipework) | ✅ KEEP | — | done |
| `scene-chp` | 7 s | `chp` (pipe racks — no genset) | 🎬 SHOOT #1 | interim: keep, span 7 | keep until shoot |
| `scene-outfall` | 8 s | `outfall` (turbid discharge) | ✅ KEEP | — | done |
| `title-bg` | 3 s | `sifting` | ✅ KEEP | — | done |
| `impact-01` | 4.5 s | `aeraerial` | 🔁 | `0_Oyster_Oysters` (audition, 11.1 s) | ⏳ NOT YET APPLIED |
| `impact-02` | 4.5 s | `leaves` (tea factory ≠ food waste) | 🔁 | `4953605_Household_Food_Waste_1280x720.mp4` **windowed start=6 end=10.5** (opening 4 s motion=80, too busy) | ⏳ NOT YET APPLIED |
| `impact-03` | 4.5 s | `aerbasin` | ✅ KEEP | — | done |
| `impact-04` | 4.5 s | `agri` (grain silos ≠ WWTW) | 🔁 | `0_Aerial_Wastewater_Treatment_Plant_1280x720.mp4` (10.0 motion — ideal) | ⏳ NOT YET APPLIED |
| `impact-05` | 4.5 s | `commerce` (dome digesters + solar) | ✅ KEEP — best card | — | done |
| `impact-06` | 4.5 s | `petro` (tank farm) | 🔁 | `2044970_Alaska_Pipeline_1280x720.mp4` (9.3 s, motion 12.2) | ⏳ NOT YET APPLIED |
| `impact-07` | 4.5 s | `agri2` (grain silos ≠ CO₂) | 🔁 | `0_Abstract_Alcohol` (verified CO₂-labelled tanks, motion 20.6) | ⏳ NOT YET APPLIED — clip not confirmed in uploads |
| `impact-08` | 4.5 s | `mulch` (steaming compost) | ✅ KEEP | — | done |
| `impact-09` | 4.5 s | `anchovies` 🐟 (wrong subject entirely) | 🔁 | `0_Pile_Wood_Chips` (13.7 s) interim; source kiln footage long-term | ⏳ NOT YET APPLIED — clip not confirmed in uploads |
| `impact-10` | 4.5 s | `trio` (hi-vis workers) | ✅ KEEP | — | done |

### Clips available in uploads/ not yet compressed into assets/footage/sm/
These raw 1280×720 source files exist in uploads/ and need compression (MediaRecorder
~1.3 Mbps recipe, PREVIEW only — not run_script) before adding to the sm/ folder:
- `0_Aeration_Aerial_1280x720.mp4` — bench (WWTW texture)
- `0_Aeration_Basin_Wastewater_Treatment_1280x720.mp4` — bench
- `0_Aerial_Agricultural_1280x720.mp4` — ✗ not useful (grain silos)
- `0_Aerial_Agriculture_1280x720.mp4` — closing-aerial alt
- `0_Aerial_Topdown_1280x720.mp4` — outfall alt
- `0_Aerial_Wastewater_1280x720.mp4` — bench
- `0_Aerial_Wastewater_Treatment_Plant_1280x720.mp4` → **impact-04**
- `0_Anchovies_Dried_1280x720.mp4` — retired (replaced by wood chips)
- `0_Architecture_Round_Circle_Bridge_1280x720.mp4` — bench
- `0_Commerce_Energy_1280x720.mp4` — bench
- `0_Environment_Aerial_1280x720.mp4` — bench
- `0_Industrial_Pipelines_1280x672.mp4` — bench
- `0_Landscape_Scenery_Water_1280x720.mp4` — bench
- `0_Leaves_Factory_1280x720.mp4` — bench (current `leaves` incumbent)
- `0_Mulch_Steam_1280x720.mp4` — bench
- `0_Petrochemical_Fuel_1280x720.mp4` — bench
- `0_Pipeline_Valve_1280x720.mp4` — current `cng` incumbent
- `0_Pipelines_Industrial_1280x720.mp4` — bench
- `0_Pipes_Water_Treatment_1280x720.mp4` — bench
- `0_Plastic_Waste_1280x720.mp4` — 🚫 QUARANTINED (organics ≠ plastics)
- `0_Polluted_Water_Water_Pollution_1280x720.mp4` — bench
- `0_Recycling_Economy_1280x720.mp4` — 🚫 QUARANTINED
- `0_Sifting_Soil_1280x720.mp4` — current `sifting` (title-bg)
- `0_Sugarcane_Juice_1280x720.mp4` — bench
- `0_Sustainability_Eco_friendly_1280x672.mp4` — bench
- `0_Tea_Tea_Roller_1280x720.mp4` — bench
- `0_Underwater_Water_1280x720.mp4` — bench
- `1288501_Fuel_Kerosene_1280x720.mp4` — bench
- `1442109_Industrial_Water_1280x720.mp4` — bench
- `1462791_Overhead_View_1280x720.mp4` — 🚫 too dark (brightness 0.17)
- `1550345_Soapy_Dirty_1280x720.mp4` — bench
- `2044970_Alaska_Pipeline_1280x720.mp4` → **impact-06**
- `2065325_Aerial_Top_1280x720.mp4` — bench
- `2248992_Plastic_Waste_1280x720.mp4` — 🚫 QUARANTINED
- `456387_Pipes_Piping_1280x720.mp4` — bench
- `4953605_Household_Food_Waste_1280x720.mp4` → **impact-02** (windowed 6–10.5 s)
- `5025374_Natural_Gas_1280x720.mp4` → **scene-cng** (audition)
- `6036337_Hiker_Couple_1280x720.mp4` — 🚫 benched (lifestyle, wrong tone)
- `612968_Iceland_Geothermal_1280x720.mp4` — 🚫 do not use (steam vents ≠ CHP "running today")
- `638032_Abundance_Aluminum_1280x720.mp4` — 🚫 QUARANTINED
- `657709_Iceland_Geothermal_1280x720.mp4` — 🚫 do not use
- `6518002_Modern_Wastewater_1280x720.mp4` — current `closing_aerial` incumbent (recast pending)
- `7023091_Trio_Waste_1280x720.mp4` — current `trio` (impact-10, keep)
- `Versatile biogas plant with membrane technology (850 Nm³_h) in Denmark.mp4` → `denmark_plant.mp4`
- `n2_aeraerial.mp4`, `n2_aerbasin.mp4`, `n2_agri.mp4`, `n2_agri2.mp4`, `n2_aluminum.mp4`,
  `n2_commerce.mp4`, `n2_ewaste.mp4`, `n2_petro.mp4`, `n2_plastic.mp4`, `n2_trio.mp4` — n2 compressed set
- `nf_anchovies.mp4`, `nf_foodwaste.mp4`, `nf_leaves.mp4`, `nf_leaves2.mp4`, `nf_mulch.mp4`,
  `nf_recycling.mp4`, `nf_sifting.mp4`, `nf_sugarcane.mp4`, `nf_sustainability.mp4`, `nf_tea.mp4` — nf compressed set

### Missing from uploads (not yet sourced)
- `0_Water_Treatment` (44.3 s) — mandatory blockflow-bg recast; must be ≥20 s duration
- `0_Biogas_Plant_Bioenergy_Facility` — closing-aerial recast; must be ≥11 s
- `0_Abstract_Alcohol` (CO₂-labelled tanks) — impact-07
- `0_Pile_Wood_Chips` (13.7 s) — impact-09 interim
- `0_Oyster_Oysters` (11.1 s) — impact-01 audition candidate

### Real-shoot priorities (outranks all stock)
① **Phase 1 pilot CHP running** — wide + mid + genset detail (scene-chp, statbg)
② **Site drone orbit + top-down** — the actual FWF works (closing-aerial, statbg_site, opening 0:05–0:15)
③ **Outfall / consolidation tank, ground level** (scene-outfall)
④ **Feedstock receiving activity** — once Phase 2 construction begins

### Quarantined — never use in this film
`0_Plastic_Waste`, `2248992_Plastic_Waste`, `0_E_waste_Recycling`, `0_Recycling_Economy`,
`638032_Abundance_Aluminum` (FWF digests organics — plastics/e-waste imply wrong feedstock),
`6036337_Hiker_Couple` (lifestyle, wrong tone), `1462791_Overhead_View` (brightness 0.17 — black
under grade), `612968_Iceland_Geothermal`, `657709_Iceland_Geothermal` (steam vents under
"running today" factual claim).

## Known gaps / open items
- Real drone/site footage: generic + themed stock b-roll (landmark-free) now fills the
  SceneShell, ClosingAerial and all 10 impact cards (compressed, offline-embedded).
  Interview SOT + remaining ModelShot slots are still `<image-slot>` drop zones.
- Compressed b-roll plays at native fps in-browser but is bitrate-reduced (~1.3Mbps)
  to fit the 30 MiB bundle limit; swap higher-quality clips into `assets/footage/sm/`
  (same filenames) and re-bundle if quality needs to rise.
- 3D model stills 01/02/04-3d.png replaced with the corrected model (VIEW 2/4/3 from
  `24-0503 B01 001 3D model corrected (CHP).pdf`), title-block/Anaergia branding cropped
  off. Detail shots 05/06/07/09-3d.png still use the earlier captures.
- Video export to .mp4 must be triggered by the USER from the player's own Export
  Video button (client-side action) — cannot be done from tool calls.
- gen_pptx is not applicable to this format (continuous timeline, not per-slide deck).

## Design system
Bound to EnergiDrop Design System at
`/projects/25c6bffe-6ff6-4d93-a4fa-33bf6ce78853/`. Brand palette was sampled directly
from the EnergiDrop logo (blue / gold-flame / sky / gray) — check there before adding
any new colors.

## Storyboard source of truth — FWF Storyboard R0v3
`uploads/FWF Storyboard R0v3.docx` / `.pdf` is the client's narrative & storyboard
framework (Discussion Draft, R0v2 text inside R0v3 file). Plain-text extract saved at
`storyboard-text.txt` (re-extract via the docx-zip run_script recipe if the file
changes). This is the authoritative narrative spec — the built video is a condensed
~4:42 cut of it.

### Chapter architecture (storyboard proposes ~8–9 min primary film, 19 scenes)
Opening (0:00) → Ch1 The place and the problem (S1 city under pressure / S2 environmental
consequence / S3 industry's second problem) → Ch2 The central idea (S4 two problems→one
opportunity / S5 what is being built) → Ch3 How the system works (S6 feedstock / S7
anaerobic digestion / S8 biogas cleaning & upgrading / S9 purified liquid CO₂ / S10
biomethane delivery: 10A dedicated pipeline, 10B virtual pipeline, 10C vehicle fuel /
S11 renewable power & self-sufficiency / S12 digestate & nutrients) → Ch4 Why it matters
(S13 municipality/regulators / S14 industrial customers / S15 waste suppliers / S16
investors) → Ch5 Why this can happen (S17 development completed / S18 delivery ecosystem)
→ Closing (S19 future state / final statement). Storyboard wants VISIBLE chapter titles.
Shorter cuts (90s / 3-min regulator / 3-min investor / explainer modules) derive from it.

### Confirmed facts from storyboard (use these exact figures; "subject to confirmation")
- 155 ML/day wastewater intake; ~74 t/day dry solids/dry matter (municipal sludge base load).
- Original plant infrastructure dates from 1976.
- >200 t/day external source-separated organics identified (NOT mixed municipal refuse).
- Phase 2 target raw biogas ~2,400 Nm³/h; biogas ~60% methane.
- 3 high-solids CSTR digesters, mesophilic, target availability >95%, ~21-day HRT.
- CO₂ ~30 tpd, food/beverage-grade, cryogenic.
- Dedicated pipeline ~7.5 km (anchor route, in development); virtual pipeline ~22 km; CNG
  vehicle fuel = future expansion.
- Planned operating life >25 years; >15 years of development to date.
- Central story = three connected NMB challenges: municipal sludge/organic-waste
  management + Swartkops/Fishwater Flats environmental pressure + industrial demand for
  reliable lower-carbon energy. Position as INTEGRATED INFRASTRUCTURE, not equipment.

### Narrative disciplines the storyboard mandates (important)
1. Explanatory & stakeholder-neutral primary film — NOT an investor pitch (financials go
   in a separate investor cut).
2. Consistent 5-level status coding used everywhere (maps/graphics/film): **Completed /
   Contracted / In finalisation / In development / Future expansion**. Per the memo:
   Puregas = executed term sheet; Borbet = GSA negotiations (NOT contracted); Volkswagen
   & Swartkops = earlier commercial stages. Never present these as equally committed.
3. Verify counterparties & disclosure rights — do NOT name/show/logo any customer,
   supplier, funder, tech provider or municipal party unless disclosure confirmed. Use
   generic descriptions ("a nearby automotive component manufacturer") otherwise.
4. Explain jargon (CSTR, PSA, HRT, biomethane, digestate) visually + plain language.
5. Build in safety & operational-continuity messaging (gas handling, cryo storage, tanker
   loading, WWTW interface) — not just a regulator footnote.
6. Show physical movement — sludge/organics → digestion → biogas → biomethane+CO₂ →
   industry/transport/power is the visual spine.
7. Tone: constructive, solutions-focused; must NOT imply municipal failure.

### Review findings — built cut vs R0v3 (open items to reconcile with the client)
- Named/implied counterparties in the build ("Perseverance Industrial" destination,
  end-card partner wall: Anaergia/Straits/EnergiDrop/Sustain/DBSA/GetInvest/NMBM, named
  interviewee "Darius Boshoff", "CO₂ offtake termsheet signed", "Agreements in Place")
  conflict with disclosure discipline #3 and status-coding #2 until confirmed.
- Only a 2-level StatusBadge (Existing/Proposed) exists; storyboard wants the 5-level scheme.
- Opening uses national stats (8.5M t landfilled, R59bn load-shedding) rather than the
  storyboard's site-specific place-and-problem framing (155 ML/day, 74 t/day, 1976, estuary).
  NMBM quote "we were out of compliance" risks implying municipal failure (violates tone note).
- Missing headline facts: 155 ML/day, 74 t/day, 1976, 2,400 Nm³/h, ~60% methane, 21-day HRT,
  >95% availability. External-organics figure differs (build "50,000 t/yr" ≈137 t/day vs
  storyboard ">200 t/day").
- Visible caption "The Victor Valley Shot" (ModelShot ~215–220s) is an internal production
  reference that leaked on-screen — should be renamed.
- Build runtime 4:42 vs storyboard's 8–9 min primary film (acceptable as a condensed cut).



## v2.1 deploy + 3D animation + review (this session, 28 Jul 2026)
- **Animated 3D flythrough replaces stills**: 6 frame-sequences (16 eased frames each) rendered
  from FWF Plant 3D Model via save_screenshot camera positioning (stage._camera/_controls) →
  assets/3d/seq/<full|digesters|chp|holder|co2|feedstock>/NN.jpg. `FRAMES` map (literal paths so
  merged-regen rewrites each to __resources) + `SeqImg` (opacity frame-swap synced to beat
  progress) in fwf-scene.jsx; ModelShot takes seq=. Wired 14 ModelShot beats. Realtime
  MediaRecorder canvas capture WEDGES the preview — do NOT use it; frame-sequence via
  save_screenshot is the working path. Dep metas regenerated from asset union (131 metas/entry).
- **SiteDiagram flythrough now sequences OVER the 3D model**: base plate = SeqImg FRAMES.full,
  CAD overlay screen-blended on top (was satellite base). Per user "re sequence this over the model".
- **3D model upgraded + interactive**: FWF Plant 3D Model.html has richer geometry (double-membrane
  domes, stairs, CHP louvers/radiators, digestate tanks, cold box, fence, roads), floating labels,
  fly-to systems panel, click-to-select raycaster + spec cards, labels/spin toggles. controls/camera
  are ready.controls||stage._controls (ready object may lack controls). v1 backup: FWF Plant 3D Model v1.html.
- **Playback phase-lock fix (v2.1 deploy doc)**: added PhaseLockedVideo (uses useSprite localTime,
  keeps data-om-exportable-video-play-* attrs) in place of window.VideoSprite inside VideoSlot —
  fixes the global-playhead modulo bug that jump-cut 15/16 slots. Slot spans set to beat length:
  scene-outfall 11→8, chp 8→7, cng 12→6, co2 8→4; impact end 4→(item.vEnd??4.5) with vStart/vEnd
  window override support; closing-aerial end 9→Math.max(0.5,end-start).
- **VO_SCRIPT v2.1**: shot directions/slot ids/spans added to every beat (timings/wording/silence
  unchanged). Subtitles + CC toggle + explainer scripts (all 3 long cuts) already live from prior session.
- **Feedback recorder**: gold "Record Feedback" panel (portaled, not in export) — voice (mic +
  live en-ZA STT) + text-only notes, timecode-stamped, saves one JSON bundle to send back.
- **PENDING USER UPLOADS (footage recasts from v2 doc, NOT applied — files absent)**: blockflow-bg
  →0_Water_Treatment (kills 14.8s freeze), closing-aerial→0_Biogas_Plant_Bioenergy_Facility,
  impact 02→Household_Food_Waste(window 6-10.5), 04→Aerial_WWTP, 07→Abstract_Alcohol, 09→Wood_Chips.
  Add clips to assets/footage/sm/ then swap BENEFITS video keys + FootageStore.register + stock= props.
- **Owner-flagged, not fixed**: pipeline 7.7 km on-screen vs locked KMZ 7.69 km; statbg_site is not FWF;
  "~22 km virtual pipeline" softened to "additional routes under evaluation"; runtime comment fixed to 282s.
- Script PDFs: "Fishwater Flats Video - Full Cut Script.html" (+ Script Book all-cuts) with per-beat stills.
