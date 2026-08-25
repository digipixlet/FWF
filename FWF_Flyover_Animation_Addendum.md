## FWF biogas facility — 3D flyover animation (25 Aug 2026)

- **Deliverable**: `FWF Flyover.dc.html` — a Google Earth-style flyover into the Fishwater
  Flats biogas facility, built on the real exported plant GLB (`fwf-biogas-plant.glb`) and the
  original Earth Studio camera path (`flyover-path.js`, 541 points, 45s at 24fps).
- **Camera path**: orbital start (~57,500 km altitude) descending through atmosphere, coastline
  approach over Algoa Bay, arrival at the works, then a low ground-level survey through the
  digesters, gas holder, upgrading skid, CHP hall and flare stack before climbing out.
- **Anchor / calibration**: site anchor lat/lon `-33.878529, 25.619647`, heading `22.5°` — locked
  from the production handoff's CAD calibration, used to convert camera lat/lon/altitude frames
  into local Three.js coordinates (east/up/south).
- **Visual treatment**: altitude-driven sky/fog palette (space black → upper-atmosphere navy →
  ground haze), starfield fading in above ~30km, atmosphere rim glow on the orbital approach,
  terrain grid fading in near the ground. FOV widens from 20° to ~34° as the camera descends for
  a more dramatic, low altitude feel.
- **UI chrome**: dark glass HUD (EnergiDrop panel treatment) — eyebrow + facility title top left,
  live altitude/coordinate readout top right, chapter caption bottom left (ORBITAL → DESCENT →
  APPROACH → ARRIVAL → SURVEY → DETAIL → EGRESS), and a scrub/play transport bar bottom.
- **Tweaks**: flight speed (0.25×–2×), ground FOV boost, terrain grid toggle.
- **Files**: `flyover-scene.jsx` (Three.js scene + camera rig), `flyover-path.js` (camera frame
  data extracted from the Earth Studio export), `fwf-biogas-plant.glb` (real exported model).

### For design-system import
This flyover reuses the EnergiDrop video-graphics motion language (dark canvas, Barlow
Condensed eyebrows/uppercase labels, JetBrains Mono coordinate/timecode readouts, blue accent,
glass panel chrome) — treat it as a new example under `ui_kits/video-graphics/` (3D flyover /
establishing shot) rather than a new visual direction.
