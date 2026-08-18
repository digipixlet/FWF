// FWF Biogas Facility — promotional video scene, built on animations.jsx (Stage/Sprite).
// Brand: EnergiDrop (blue / gold-flame / sky / gray) — colors sampled from EnergiDrop_Logo_Whiteback.png.
// Runtime: 4:42 (282s). (Storyboard target was 4:00; this cut runs the full 282s.)
// No live footage exists yet — DRONE/GROUND/PILOT beats render as clearly-labelled
// placeholder frames; interview beats render as styled sound-bite quote cards.

(function () {
  const { Sprite: RawSprite, TextSprite, ImageSprite, Easing, interpolate, clamp, useSprite, useTime } = window;

  // ── Brand palette ──────────────────────────────────────────────────────────
  const BLUE      = '#0090E0';
  const BLUE_DEEP = '#0A4E82';
  const BLUE_INK  = '#071522';
  const GOLD      = '#FBB708';
  const ORANGE    = '#F0901F';
  const SKY       = '#8FE0FF';
  const GRAY      = '#9098A8';
  const INK       = '#050A0F';
  const PANEL_BG  = 'rgba(9,20,32,0.86)';
  const BORDER    = 'rgba(0,144,224,0.35)';
  const HAIR      = 'rgba(143,224,255,0.18)';
  const TXT_HI    = '#F2F7FB';
  const TXT_SUB   = '#9FB9CC';
  const TXT_DIM   = '#5E7387';

  const FH = "'Barlow Condensed', sans-serif";
  const FB = "'Barlow', sans-serif";

  const W = 1920, H = 1080;

  // ── Generic fade/slide wrapper (mirrors RectSprite's own fade timing) ──────
  function FadeBox({ x = 0, y = 0, width, height, entryDur = 0.5, exitDur = 0.4, rise = 22, style, children }) {
    const { localTime, duration } = useSprite();
    const exitStart = Math.max(0, duration - exitDur);
    let opacity = 1, ty = 0;
    if (localTime < entryDur) {
      const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
      opacity = t; ty = (1 - t) * rise;
    } else if (localTime > exitStart) {
      const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
      opacity = 1 - t; ty = -t * (rise * 0.5);
    }
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, opacity, transform: `translateY(${ty}px)`, ...style }}>
        {children}
      </div>
    );
  }

  // ── Persistent dark base (whole runtime) ───────────────────────────────────
  function BaseBg() {
    return (
      <div style={{
        position: 'absolute', inset: 0, background:
          `radial-gradient(120% 100% at 50% 0%, #0b1a26 0%, ${INK} 60%)`,
      }} />
    );
  }

  // ── Small camera glyph for placeholders ─────────────────────────────────────
  function CameraGlyph({ size = 56, color = BLUE }) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="13" width="40" height="27" rx="4" stroke={color} strokeWidth="2.5" />
        <path d="M16 13L20 7H28L32 13" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="24" cy="27" r="8.5" stroke={color} strokeWidth="2.5" />
        <circle cx="24" cy="27" r="3" fill={color} />
      </svg>
    );
  }

  function MicGlyph({ size = 56, color = BLUE }) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="18" y="4" width="12" height="24" rx="6" stroke={color} strokeWidth="2.5" />
        <path d="M12 22C12 29.5 17.4 35 24 35C30.6 35 36 29.5 36 22" stroke={color} strokeWidth="2.5" />
        <line x1="24" y1="35" x2="24" y2="43" stroke={color} strokeWidth="2.5" />
        <line x1="15" y1="43" x2="33" y2="43" stroke={color} strokeWidth="2.5" />
      </svg>
    );
  }

  // ── Footage placeholder frame (DRONE / GROUND / PILOT beats) ───────────────
  function FootageSlot({ start, end, tag, title, note, stat }) {
    const slotId = 'footage-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    return (
      <Sprite start={start} end={end}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <image-slot id={slotId} shape="rect" fit="cover"
            placeholder={tag + ' — drop real footage still: ' + title}
            style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>
        </div>
        <FadeBox x={0} y={0} width={W} height={H}>
          <div style={{
            position: 'absolute', inset: 64, borderRadius: 18,
            border: `2px dashed ${BORDER}`, background: 'rgba(0,144,224,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
            pointerEvents: 'none',
          }}>
            <CameraGlyph />
            <div style={{ fontFamily: FH, fontSize: 22, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', color: BLUE }}>
              {tag} &middot; B-ROLL PLACEHOLDER
            </div>
            <div style={{ fontFamily: FH, fontSize: 46, fontWeight: 600, color: TXT_HI, textAlign: 'center', maxWidth: 1300, lineHeight: 1.15 }}>
              {title}
            </div>
            {note && (
              <div style={{ fontFamily: FB, fontSize: 21, color: TXT_SUB, textAlign: 'center', maxWidth: 1080, fontStyle: 'italic' }}>
                {note}
              </div>
            )}
          </div>
          {stat && (
            <div style={{
              position: 'absolute', left: 100, bottom: 96, fontFamily: FH, fontSize: 25, fontWeight: 600, color: TXT_HI,
              background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 24px',
              pointerEvents: 'none',
            }}>
              {stat}
            </div>
          )}
        </FadeBox>
      </Sprite>
    );
  }

  // ── Animated motion-graphic stand-ins (no stock/real footage available for
  // these beats — Adobe Stock connector can search & license, but this
  // environment has no path to pull licensed video/image bytes into the
  // project, so these are built as on-brand animated diagrams instead). ─────
  // ── Footage control: swap stock clips + drop in real shoot footage ─────────
  // Stock library (paths become window.__resources blob URLs in the bundled cut).
  const STOCK = {
    'Outfall / consolidation': 'assets/footage/sm/outfall.mp4',
    'CHP hall': 'assets/footage/sm/chp.mp4',
    'CNG / tanker': 'assets/footage/sm/cng.mp4',
    'CO₂ / cryo': 'assets/footage/sm/co2.mp4',
    'Closing aerial': 'assets/footage/sm/closing_aerial.mp4',
    'Aeration aerial': 'assets/footage/sm/aeraerial.mp4',
    'Aeration basin': 'assets/footage/sm/aerbasin.mp4',
    'Treatment tanks': 'assets/footage/sm/agri.mp4',
    'Tank farm': 'assets/footage/sm/agri2.mp4',
    'Solar + storage': 'assets/footage/sm/commerce.mp4',
    'Gas storage': 'assets/footage/sm/petro.mp4',
    'Workers / crew': 'assets/footage/sm/trio.mp4',
    'Leaves / organics': 'assets/footage/sm/leaves.mp4',
    'Mulch / digestate': 'assets/footage/sm/mulch.mp4',
    'Ocean / anchovies': 'assets/footage/sm/anchovies.mp4',
    'Waste sorting': 'assets/footage/sm/sifting.mp4',
    'Gemini AI Visualisation': 'assets/footage/gemini_v1.mp4',
    'Denmark Biogas Plant': 'assets/footage/sm/denmark_plant.mp4',
  };

  const FootageStore = (function () {
    const listeners = new Set();
    const slots = new Map();   // id -> {label, stock}
    const libChoice = {};      // id -> STOCK label
    const fileURL = {};        // id -> objectURL of a dropped file
    const slotEls = new Map(); // id -> live DOM node (for canvas drop hit-testing)
    let db = null;
    const LS = 'fwf_footage_lib';
    try { Object.assign(libChoice, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
    const emit = () => listeners.forEach(fn => fn());
    const saveLib = () => { try { localStorage.setItem(LS, JSON.stringify(libChoice)); } catch (e) {} };
    function openDB() {
      return new Promise((res) => {
        if (db) return res(db);
        let rq; try { rq = indexedDB.open('fwf_footage', 1); } catch (e) { return res(null); }
        rq.onupgradeneeded = () => rq.result.createObjectStore('clips');
        rq.onsuccess = () => { db = rq.result; res(db); };
        rq.onerror = () => res(null);
      });
    }
    async function putBlob(id, blob) { const d = await openDB(); if (d) d.transaction('clips', 'readwrite').objectStore('clips').put(blob, id); }
    async function delBlob(id) { const d = await openDB(); if (d) d.transaction('clips', 'readwrite').objectStore('clips').delete(id); }
    (async function hydrate() {
      const d = await openDB(); if (!d) return;
      const s = d.transaction('clips', 'readonly').objectStore('clips');
      const kq = s.getAllKeys(), vq = s.getAll();
      kq.onsuccess = () => { vq.onsuccess = () => { kq.result.forEach((k, i) => { if (vq.result[i]) fileURL[k] = URL.createObjectURL(vq.result[i]); }); emit(); }; };
    })();
    return {
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      register(id, label, stock) { const p = slots.get(id); if (!p || p.label !== label) { slots.set(id, { label, stock }); emit(); } },
      list() { return Array.from(slots.entries()).map(([id, v]) => ({ id, label: v.label, stock: v.stock, lib: libChoice[id] || '', file: !!fileURL[id] })); },
      resolve(id, stock) { if (fileURL[id]) return fileURL[id]; if (libChoice[id] && STOCK[libChoice[id]]) return STOCK[libChoice[id]]; return stock; },
      setLib(id, label) { if (label) libChoice[id] = label; else delete libChoice[id]; saveLib(); emit(); },
      setFile(id, file) { if (fileURL[id]) URL.revokeObjectURL(fileURL[id]); fileURL[id] = URL.createObjectURL(file); putBlob(id, file); emit(); },
      reset(id) { if (fileURL[id]) { URL.revokeObjectURL(fileURL[id]); delete fileURL[id]; delBlob(id); } delete libChoice[id]; saveLib(); emit(); },
      setEdit(v) { window.__fwfEdit = v; emit(); },
      bindEl(id, el) { if (el) slotEls.set(id, el); else slotEls.delete(id); },
      labelOf(id) { const s = slots.get(id); return s ? s.label : id; },
      // Topmost mounted slot under a viewport point (smallest containing rect wins).
      slotAt(x, y) {
        let best = null, bestArea = Infinity;
        slotEls.forEach((el, id) => {
          if (!el || !el.isConnected) return;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return;
          if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            const area = r.width * r.height;
            if (area < bestArea) { bestArea = area; best = { id, rect: r }; }
          }
        });
        return best;
      },
    };
  })();

  function useFootage() {
    const [, set] = React.useState(0);
    React.useEffect(() => FootageStore.subscribe(() => set(n => n + 1)), []);
  }

  // Phase-locks clip playback to the SHOT's own local time (not the global
  // playhead) so every shot opens on frame one and never wraps mid-beat.
  function PhaseLockedVideo({ src, start = 0, end, speed = 1, style, ...rest }) {
    start = +start || 0; speed = +speed || 1;
    if (end != null) end = +end || undefined;
    const sp = useSprite();
    const gt = useTime();
    const t = (sp && sp.localTime !== undefined) ? sp.localTime : gt;
    const ref = React.useRef(null);
    const span = Math.max(0.001, ((end != null ? end : start + 1) - start));
    React.useEffect(() => {
      const v = ref.current;
      if (!v || v.readyState < 1) return;
      const target = start + ((t * speed) % span);
      if (Math.abs(v.currentTime - target) > 0.05) v.currentTime = target;
    }, [t, start, span, speed]);
    return (
      <video ref={ref} src={src} muted playsInline preload="auto"
        data-om-exportable-video-play-start={start}
        data-om-exportable-video-play-end={end != null ? end : start + span}
        data-om-exportable-video-play-speed={speed}
        style={{ display: 'block', objectFit: 'cover', ...style }} {...rest} />
    );
  }

  // Drop-in / swappable b-roll surface. Wraps VideoSprite; keeps timeline sync.
  function VideoSlot({ id, label, stock, start = 0, end = 8, speed = 1, style }) {
    useFootage();
    React.useEffect(() => { FootageStore.register(id, label, stock); }, [id, label]);
    const src = FootageStore.resolve(id, stock);
    const edit = !!window.__fwfEdit;
    const ref = React.useRef(null);
    // Register this slot's live DOM node so the viewport-level drop layer can
    // hit-test it (native DnD does not fire reliably inside the SVG foreignObject).
    React.useEffect(() => { FootageStore.bindEl(id, ref.current); return () => FootageStore.bindEl(id, null); }, [id]);
    return (
      <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <PhaseLockedVideo key={src} src={src} start={start} end={end} speed={speed} style={style} />
        {edit && (
          <div style={{ position: 'absolute', inset: 6, border: `2px dashed ${SKY}`, borderRadius: 8, display: 'flex', alignItems: 'flex-end', pointerEvents: 'none' }}>
            <div style={{ margin: 8, fontFamily: FB, fontSize: 13, color: '#fff', background: 'rgba(5,10,20,0.82)', padding: '4px 9px', borderRadius: 4, letterSpacing: 0.3 }}>{label} · drop clip</div>
          </div>
        )}
      </div>
    );
  }

  // Fixed control overlay (lives outside the exportable Stage → never in export).
  function FootageManager() {
    useFootage();
    React.useEffect(() => {
      const R = FootageStore.register;
      R('scene-outfall', 'GROUND · WWTW Outfall / Consolidation Tank', 'assets/footage/sm/outfall.mp4');
      R('scene-chp', 'LIVE PILOT · Phase 1 Pilot CHP Unit — Running Today', 'assets/footage/sm/chp.mp4');
      R('scene-cng', 'GROUND · CNG Tube Trailer at Loading Bay', 'assets/footage/sm/cng.mp4');
      R('scene-co2', 'GROUND · CO₂ Cryogenic Storage Vessel', 'assets/footage/sm/co2.mp4');
      R('title-bg', 'Title backdrop', 'assets/footage/gemini_v1.mp4');
      R('blockflow-bg', 'Block-flow backdrop', 'assets/footage/sm/aerbasin.mp4');
      R('closing-aerial', 'Closing aerial', 'assets/footage/sm/closing_aerial.mp4');
      R('gemini-v1', 'Gemini AI Visualisation', 'assets/footage/gemini_v1.mp4');
      R('denmark-plant', 'Denmark Biogas Plant', 'assets/footage/sm/denmark_plant.mp4');
      (typeof BENEFITS !== 'undefined' ? BENEFITS : []).forEach(b => { if (b.video) R('impact-' + b.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase(), 'Impact bg · ' + b.metric, b.video); });
    }, []);
    const [open, setOpen] = React.useState(false);
    const edit = !!window.__fwfEdit;
    const rows = FootageStore.list();
    const btn = { fontFamily: FH, fontSize: 14, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: TXT_HI, background: 'rgba(9,20,32,0.92)', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer' };
    const sel = { fontFamily: FB, fontSize: 13, color: TXT_HI, background: '#0b1622', border: `1px solid ${BORDER}`, borderRadius: 5, padding: '5px 7px', maxWidth: 190 };
    return (
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 2147483000, fontFamily: FB }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={{ ...btn, background: edit ? BLUE : btn.background, color: edit ? '#04121f' : TXT_HI }} onClick={() => FootageStore.setEdit(!edit)}>{edit ? 'Done editing' : 'Edit on canvas'}</button>
          <button style={btn} onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Footage (' + rows.length + ')'}</button>
        </div>
        {open && (
          <div style={{ marginTop: 8, width: 360, maxHeight: '78vh', overflowY: 'auto', background: 'rgba(6,13,20,0.97)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ fontFamily: FH, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: SKY, marginBottom: 4 }}>Footage — {rows.length} shots</div>
            <div style={{ fontSize: 12, color: TXT_DIM, marginBottom: 10, lineHeight: 1.4 }}>Pick a stock clip or upload your own shoot. Turn on “Edit on canvas” to drag a file straight onto a shot. Saved in this browser.</div>
            {rows.map((r) => (
              <div key={r.id} style={{ borderTop: `1px solid ${HAIR}`, padding: '9px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 600, color: TXT_HI }}>{r.label}</div>
                  {r.file ? <span style={{ fontSize: 11, color: GOLD, whiteSpace: 'nowrap' }}>● your file</span> : (r.lib ? <span style={{ fontSize: 11, color: SKY, whiteSpace: 'nowrap' }}>● stock</span> : <span style={{ fontSize: 11, color: TXT_DIM, whiteSpace: 'nowrap' }}>default</span>)}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select style={sel} value={r.file ? '' : r.lib} disabled={r.file} onChange={(e) => FootageStore.setLib(r.id, e.target.value)}>
                    <option value="">Default clip</option>
                    {Object.keys(STOCK).map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <label style={{ ...btn, fontSize: 12, padding: '5px 10px' }}>Upload<input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) FootageStore.setFile(r.id, f); }} /></label>
                  {(r.file || r.lib) && <button style={{ ...btn, fontSize: 12, padding: '5px 10px', background: 'transparent' }} onClick={() => FootageStore.reset(r.id)}>Reset</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Timing & label editor store (browser-persisted overrides) ──────────────
  const mkBid = (start, end) => 'beat:' + start + ':' + end;
  const EditStore = (function () {
    const listeners = new Set();
    const beats = new Map();   // id -> {label, ds, de, order, fields:[[name,val]]}
    const timing = {}; const text = {}; let order = 0;
    const LT = 'fwf_timing', LX = 'fwf_labels';
    try { Object.assign(timing, JSON.parse(localStorage.getItem(LT) || '{}')); } catch (e) {}
    try { Object.assign(text, JSON.parse(localStorage.getItem(LX) || '{}')); } catch (e) {}
    const emit = () => listeners.forEach(fn => fn());
    const saveT = () => { try { localStorage.setItem(LT, JSON.stringify(timing)); } catch (e) {} };
    const saveX = () => { try { localStorage.setItem(LX, JSON.stringify(text)); } catch (e) {} };
    return {
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      registerBeat(id, label, ds, de, fields) {
        const p = beats.get(id);
        if (!p) { beats.set(id, { label, ds, de, order: order++, fields: fields || [] }); emit(); }
        else if (p.label !== label || p.ds !== ds || p.de !== de || JSON.stringify(p.fields) !== JSON.stringify(fields || [])) { beats.set(id, { ...p, label, ds, de, fields: fields || [] }); emit(); }
      },
      list() { return Array.from(beats.entries()).map(([id, v]) => ({ id, label: v.label, order: v.order, fields: v.fields, start: (timing[id] && timing[id].start != null) ? timing[id].start : v.ds, end: (timing[id] && timing[id].end != null) ? timing[id].end : v.de, edited: !!timing[id] })).sort((a, b) => a.order - b.order); },
      timing(id, ds, de) { const t = timing[id] || {}; return [t.start != null ? t.start : ds, t.end != null ? t.end : de]; },
      setTiming(id, s, e) { timing[id] = { start: s, end: e }; saveT(); emit(); },
      resetTiming(id) { delete timing[id]; saveT(); emit(); },
      label(id, field, def) { const k = id + '::' + field; return text[k] != null ? text[k] : def; },
      setLabel(id, field, v) { text[id + '::' + field] = v; saveX(); emit(); },
      resetAll() { Object.keys(timing).forEach(k => delete timing[k]); Object.keys(text).forEach(k => delete text[k]); saveT(); saveX(); emit(); },
      snapAll() {
        const rows = this.list();
        let cursor = null;
        rows.forEach(r => {
          const dur = Math.max(0.1, r.end - r.start);
          const s = cursor == null ? r.start : cursor;
          timing[r.id] = { start: +s.toFixed(2), end: +(s + dur).toFixed(2) };
          cursor = s + dur;
        });
        saveT(); emit();
      },
    };
  })();

  function useEdit() {
    const [, set] = React.useState(0);
    React.useEffect(() => EditStore.subscribe(() => set(n => n + 1)), []);
  }

  // Shadow of window.Sprite: sprites given a `label` register as editable beats
  // and honour timing overrides; all other sprites pass straight through.
  function Sprite(props) {
    const { id, label, beatId, fields, start, end, children, ...rest } = props;
    useEdit();
    const bid = label != null ? (beatId || mkBid(start, end)) : null;
    React.useEffect(() => {
      if (bid) EditStore.registerBeat(bid, label, start, end, fields || []);
    }, [bid, label, start, end, JSON.stringify(fields || [])]);
    let s = start, e = end;
    if (bid) { const t = EditStore.timing(bid, start, end); s = t[0]; e = t[1]; }
    return React.createElement(RawSprite, { start: s, end: e, ...rest }, children);
  }

  function TimingEditor() {
    useEdit();
    const [open, setOpen] = React.useState(false);
    const rows = EditStore.list();
    const btn = { fontFamily: FH, fontSize: 14, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: TXT_HI, background: 'rgba(9,20,32,0.92)', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer' };
    const num = { width: 62, fontFamily: FB, fontSize: 13, color: TXT_HI, background: '#0b1622', border: `1px solid ${BORDER}`, borderRadius: 5, padding: '4px 6px' };
    const txt = { flex: 1, minWidth: 120, fontFamily: FB, fontSize: 13, color: TXT_HI, background: '#0b1622', border: `1px solid ${BORDER}`, borderRadius: 5, padding: '4px 6px' };
    return (
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 2147483000, fontFamily: FB }}>
        <button style={btn} onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Timing & Labels (' + rows.length + ')'}</button>
        {open && (
          <div style={{ marginTop: 8, width: 380, maxHeight: '82vh', overflowY: 'auto', background: 'rgba(6,13,20,0.97)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: FH, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: SKY }}>{rows.length} beats</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ ...btn, fontSize: 11, padding: '5px 9px', background: 'transparent', color: GOLD, borderColor: GOLD }} onClick={() => { if (confirm('Snap all beats end-to-end? This chains each beat to start when the previous one ends (durations kept), closing gaps and overlaps.')) EditStore.snapAll(); }}>Snap end-to-end</button>
                <button style={{ ...btn, fontSize: 11, padding: '5px 9px', background: 'transparent' }} onClick={() => EditStore.resetAll()}>Reset all</button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: TXT_DIM, marginBottom: 8, lineHeight: 1.4 }}>Set each beat’s in/out time (seconds) and edit its on-screen labels. Saved in this browser; not baked into exports.</div>
            {rows.map((r) => (
              <div key={r.id} style={{ borderTop: `1px solid ${HAIR}`, padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, fontFamily: FH, fontSize: 14, fontWeight: 600, color: r.edited ? GOLD : TXT_HI, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                  <input type="number" step="0.1" style={num} value={r.start} onChange={(e) => EditStore.setTiming(r.id, parseFloat(e.target.value) || 0, r.end)} />
                  <span style={{ color: TXT_DIM, fontSize: 12 }}>→</span>
                  <input type="number" step="0.1" style={num} value={r.end} onChange={(e) => EditStore.setTiming(r.id, r.start, parseFloat(e.target.value) || 0)} />
                  {r.edited && <button style={{ ...btn, fontSize: 11, padding: '4px 7px', background: 'transparent' }} onClick={() => EditStore.resetTiming(r.id)}>↺</button>}
                </div>
                {(r.fields || []).map(([name, val]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: TXT_DIM, width: 62, textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</span>
                    <input style={txt} value={val || ''} onChange={(e) => EditStore.setLabel(r.id, name, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Viewport-level drop catcher. Lives OUTSIDE the scaled SVG foreignObject (where
  // native drag/drop events don't fire in Chrome), so drops land reliably; it maps
  // the drop point back to the mounted VideoSlot beneath the cursor via slotAt().
  function EditDropLayer() {
    useFootage();
    const edit = !!window.__fwfEdit;
    const [hover, setHover] = React.useState(null);
    React.useEffect(() => { if (!edit) setHover(null); }, [edit]);
    if (!edit) return null;
    const onOver = (e) => {
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'copy'; } catch (err) {}
      const hit = FootageStore.slotAt(e.clientX, e.clientY);
      setHover(hit ? { id: hit.id, rect: hit.rect, label: FootageStore.labelOf(hit.id) } : null);
    };
    const onDrop = (e) => {
      e.preventDefault();
      const hit = FootageStore.slotAt(e.clientX, e.clientY);
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      setHover(null);
      if (hit && f && f.type.indexOf('video') === 0) FootageStore.setFile(hit.id, f);
    };
    return React.createElement('div', {
      onDragOver: onOver, onDragEnter: onOver, onDragLeave: () => setHover(null), onDrop,
      style: { position: 'fixed', inset: 0, zIndex: 2147482000, cursor: 'copy' },
    },
      React.createElement('div', { style: { position: 'fixed', top: 58, left: '50%', transform: 'translateX(-50%)', fontFamily: FB, fontSize: 14, color: '#fff', background: 'rgba(5,10,20,0.92)', border: `1px solid ${BORDER}`, padding: '7px 16px', borderRadius: 6, pointerEvents: 'none', letterSpacing: 0.3, whiteSpace: 'nowrap' } }, 'Edit mode — drag a video file onto any shot to replace it'),
      hover && React.createElement('div', { style: { position: 'fixed', left: hover.rect.left, top: hover.rect.top, width: hover.rect.width, height: hover.rect.height, border: `3px dashed ${SKY}`, borderRadius: 8, background: 'rgba(0,144,224,0.16)', pointerEvents: 'none', boxSizing: 'border-box' } },
        React.createElement('div', { style: { position: 'absolute', left: 10, bottom: 10, fontFamily: FB, fontSize: 14, color: '#fff', background: 'rgba(5,10,20,0.9)', padding: '5px 11px', borderRadius: 5, letterSpacing: 0.3 } }, 'Drop clip → ' + (hover.label || hover.id))
      )
    );
  }

  function FootageManagerPortal({ cut = 'Full Cut' }) {
    const RD = window.ReactDOM;
    const el = React.useMemo(() => document.createElement('div'), []);
    React.useEffect(() => { document.body.appendChild(el); return () => { try { document.body.removeChild(el); } catch (e) {} }; }, [el]);
    const kids = React.createElement(React.Fragment, null, React.createElement(EditDropLayer), React.createElement(FootageManager), React.createElement(TimingEditor), React.createElement(FeedbackRecorder, { cut }));
    if (RD && RD.createPortal) return RD.createPortal(kids, el);
    return kids;
  }

  // ── Verbal feedback recorder ──────────────────────────────────────────────
  // Fixed overlay (portaled to body → never in the exported video). Records mic
  // audio for listen-back AND runs live speech-to-text so the exported review
  // file carries readable, actionable text. Each note is stamped with the live
  // playhead timecode. "Save feedback file" downloads one .json bundle (transcript
  // text + base64 audio) to send back for the changes to be made.
  const fbIdb = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('fwf_feedback', 1);
      r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction('notes', mode); const s = t.objectStore('notes'); const rq = fn(s); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); }); };
    return {
      all: () => tx('readonly', s => s.getAll()),
      put: (rec) => tx('readwrite', s => s.put(rec)),
      del: (id) => tx('readwrite', s => s.delete(id)),
    };
  })();

  function FeedbackRecorder({ cut = 'Full Cut' }) {
    const time = useTime();
    const timeRef = React.useRef(0); timeRef.current = time;
    const [open, setOpen] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [recording, setRecording] = React.useState(false);
    const [elapsed, setElapsed] = React.useState(0);
    const [err, setErr] = React.useState('');
    const [sttOn, setSttOn] = React.useState(true);
    const mr = React.useRef(null), chunks = React.useRef([]), stream = React.useRef(null);
    const rec = React.useRef(null), liveTxt = React.useRef(''), startTC = React.useRef(0), tick = React.useRef(null);
    const [live, setLive] = React.useState('');

    React.useEffect(() => {
      fbIdb.all().then(rows => {
        if (!rows) return;
        setItems(rows.sort((a, b) => a.tc - b.tc).map(r => ({ ...r, url: r.blob ? URL.createObjectURL(r.blob) : null })));
      }).catch(() => {});
    }, []);

    const fmt = s => { s = Math.max(0, s || 0); const m = Math.floor(s / 60), ss = Math.floor(s % 60); return m + ':' + String(ss).padStart(2, '0'); };
    const hasSTT = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    const start = async () => {
      setErr('');
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.current = s;
        const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
        const m = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
        chunks.current = []; liveTxt.current = ''; setLive('');
        startTC.current = timeRef.current;
        m.ondataavailable = e => { if (e.data && e.data.size) chunks.current.push(e.data); };
        m.onstop = finalize;
        m.start(); mr.current = m;
        if (sttOn && hasSTT) {
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-ZA';
          r.onresult = ev => {
            let fin = '', intr = '';
            for (let i = ev.resultIndex; i < ev.results.length; i++) { const t = ev.results[i][0].transcript; if (ev.results[i].isFinal) fin += t; else intr += t; }
            if (fin) liveTxt.current = (liveTxt.current + ' ' + fin).trim();
            setLive((liveTxt.current + ' ' + intr).trim());
          };
          r.onerror = () => {};
          try { r.start(); rec.current = r; } catch (e) {}
        }
        setRecording(true); setElapsed(0);
        const t0 = Date.now(); tick.current = setInterval(() => setElapsed((Date.now() - t0) / 1000), 200);
      } catch (e) {
        setErr('Microphone unavailable — check browser permission.');
      }
    };

    const stop = () => {
      if (tick.current) { clearInterval(tick.current); tick.current = null; }
      try { rec.current && rec.current.stop(); } catch (e) {} rec.current = null;
      try { mr.current && mr.current.stop(); } catch (e) {}
      setRecording(false);
    };

    const finalize = async () => {
      try { stream.current && stream.current.getTracks().forEach(t => t.stop()); } catch (e) {}
      const type = (mr.current && mr.current.mimeType) || 'audio/webm';
      const blob = new Blob(chunks.current, { type });
      const dur = elapsed;
      const rec = { id: 'fb_' + Date.now(), cut, tc: startTC.current, dur, type, transcript: liveTxt.current.trim(), blob };
      try { await fbIdb.put(rec); } catch (e) {}
      setItems(list => [...list, { ...rec, url: URL.createObjectURL(blob) }].sort((a, b) => a.tc - b.tc));
      setLive('');
    };

    const setTranscript = (id, v) => {
      setItems(list => list.map(it => it.id === id ? { ...it, transcript: v } : it));
      const it = items.find(x => x.id === id);
      if (it) fbIdb.put({ id, cut: it.cut, tc: it.tc, dur: it.dur, type: it.type, transcript: v, blob: it.blob }).catch(() => {});
    };
    const del = (id) => { fbIdb.del(id).catch(() => {}); setItems(list => list.filter(it => it.id !== id)); };
    const clearAll = () => { if (!confirm('Delete all recorded feedback?')) return; items.forEach(it => fbIdb.del(it.id).catch(() => {})); setItems([]); };
    const addTextNote = async () => {
      const rec = { id: 'fb_' + Date.now(), cut, tc: timeRef.current, dur: 0, type: 'text', transcript: '', blob: null };
      try { await fbIdb.put(rec); } catch (e) {}
      setItems(list => [...list, { ...rec, url: null }].sort((a, b) => a.tc - b.tc));
    };

    const blobToB64 = b => new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.readAsDataURL(b); });
    const save = async () => {
      if (!items.length) { setErr('Nothing recorded yet.'); return; }
      const notes = [];
      for (const it of items) notes.push({ id: it.id, cut: it.cut, kind: it.type === 'text' ? 'text' : 'voice', timecodeSec: +it.tc.toFixed(2), timecode: fmt(it.tc), durationSec: +(+it.dur).toFixed(1), transcript: it.transcript || '', mime: it.blob ? it.type : '', audioBase64: it.blob ? await blobToB64(it.blob) : '' });
      const bundle = { project: 'Fishwater Flats Biogas Video', kind: 'fwf-feedback', version: 1, cut, generatedAt: new Date().toISOString(), count: notes.length, notes };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
      a.href = URL.createObjectURL(blob); a.download = 'FWF-Feedback-' + cut.replace(/\s+/g, '') + '-' + stamp + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    };

    const btn = { cursor: 'pointer', fontFamily: FH, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', border: '1px solid ' + BORDER, borderRadius: 6, padding: '7px 11px', color: TXT_HI, background: 'rgba(255,255,255,0.05)' };

    if (!open) {
      return React.createElement('button', {
        onClick: () => setOpen(true), title: 'Record verbal feedback',
        style: { position: 'fixed', right: 18, bottom: 18, zIndex: 2147483000, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: FH, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: INK, background: GOLD, border: 'none', borderRadius: 999, padding: '12px 18px', boxShadow: '0 8px 26px rgba(0,0,0,0.5)' }
      },
        React.createElement('span', { style: { width: 11, height: 11, borderRadius: '50%', background: '#c0392b', display: 'inline-block', boxShadow: '0 0 0 3px rgba(192,57,43,0.3)' } }),
        'Record Feedback');
    }

    return React.createElement('div', {
      style: { position: 'fixed', right: 18, bottom: 18, zIndex: 2147483000, width: 372, maxHeight: '82vh', display: 'flex', flexDirection: 'column', background: 'rgba(7,16,26,0.97)', border: '1px solid ' + BORDER, borderRadius: 12, boxShadow: '0 18px 50px rgba(0,0,0,0.6)', fontFamily: FB, color: TXT_HI, backdropFilter: 'blur(10px)' }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', borderBottom: '1px solid ' + HAIR } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: FH, fontWeight: 700, fontSize: 15, letterSpacing: 0.5 } }, 'Verbal Feedback'),
          React.createElement('div', { style: { fontSize: 11, color: TXT_SUB, marginTop: 1 } }, cut + ' · ' + items.length + ' note' + (items.length === 1 ? '' : 's'))),
        React.createElement('button', { onClick: () => setOpen(false), title: 'Minimize', style: { ...btn, padding: '5px 9px' } }, '–')),

      React.createElement('div', { style: { padding: '13px 15px', borderBottom: '1px solid ' + HAIR } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          recording
            ? React.createElement('button', { onClick: stop, style: { ...btn, flex: 1, background: '#c0392b', border: 'none', color: '#fff', fontSize: 13, padding: '11px' } }, '■  Stop  ·  ' + fmt(elapsed))
            : React.createElement('button', { onClick: start, style: { ...btn, flex: 1, background: GOLD, border: 'none', color: INK, fontSize: 13, padding: '11px' } },
                '●  Record at ' + fmt(time))),
        React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 12, color: TXT_SUB, cursor: hasSTT ? 'pointer' : 'default', opacity: hasSTT ? 1 : 0.5 } },
          React.createElement('input', { type: 'checkbox', checked: sttOn && !!hasSTT, disabled: !hasSTT, onChange: e => setSttOn(e.target.checked) }),
          hasSTT ? 'Auto-transcribe while recording (recommended)' : 'Live transcription not supported in this browser'),
        !recording ? React.createElement('button', { onClick: addTextNote, style: { ...btn, width: '100%', marginTop: 10, padding: '9px', background: 'rgba(255,255,255,0.04)' } }, '✎  Add text-only note at ' + fmt(time)) : null,
        recording && live ? React.createElement('div', { style: { marginTop: 9, fontSize: 12.5, lineHeight: 1.4, color: SKY, fontStyle: 'italic', maxHeight: 66, overflow: 'auto' } }, '“' + live + '…”') : null,
        err ? React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#ff9f8f' } }, err) : null),

      React.createElement('div', { style: { flex: 1, overflow: 'auto', padding: '6px 15px 12px' } },
        items.length === 0
          ? React.createElement('div', { style: { fontSize: 12.5, color: TXT_DIM, padding: '18px 4px', lineHeight: 1.5 } }, 'Pause on the moment you want to change, hit Record, and speak. Each note is stamped with the current timecode and transcribed so it can be actioned.')
          : items.map(it => React.createElement('div', { key: it.id, style: { padding: '10px 0', borderBottom: '1px solid ' + HAIR } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } },
                React.createElement('span', { style: { fontFamily: FH, fontWeight: 700, fontSize: 13, color: GOLD, letterSpacing: 0.5 } }, '@ ' + fmt(it.tc) + (it.type === 'text' ? '  ·  NOTE' : '  ·  ' + fmt(it.dur))),
                React.createElement('button', { onClick: () => del(it.id), title: 'Delete', style: { ...btn, padding: '3px 8px', fontSize: 11, color: '#ff9f8f' } }, 'Delete')),
              it.url ? React.createElement('audio', { src: it.url, controls: true, style: { width: '100%', height: 34, marginBottom: 6 } }) : null,
              React.createElement('textarea', {
                value: it.transcript, placeholder: 'Transcript / typed note…', onChange: e => setTranscript(it.id, e.target.value),
                style: { width: '100%', boxSizing: 'border-box', minHeight: 48, resize: 'vertical', fontFamily: FB, fontSize: 12.5, lineHeight: 1.4, color: TXT_HI, background: 'rgba(255,255,255,0.04)', border: '1px solid ' + HAIR, borderRadius: 6, padding: '7px 9px' } })))),

      React.createElement('div', { style: { display: 'flex', gap: 8, padding: '12px 15px', borderTop: '1px solid ' + HAIR } },
        React.createElement('button', { onClick: save, style: { ...btn, flex: 1, background: BLUE, border: 'none', color: '#fff', fontSize: 12.5, padding: '10px' } }, 'Save Feedback File'),
        items.length ? React.createElement('button', { onClick: clearAll, style: { ...btn } }, 'Clear') : null));
  }

  function SceneShell({ tag, title, stat, children, bg, bgLabel, video, videoId, videoEnd }) {
    const slotId = 'footage-' + tag.toLowerCase() + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    const { localTime } = useSprite();
    // gentle ken-burns drift on the real backing still
    const kb = 1.06 + 0.03 * Math.sin(localTime * 0.35);
    return (
      <FadeBox x={0} y={0} width={W} height={H}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 90% at 50% 30%, #0d1f2c 0%, ${INK} 70%)` }} />
        {video ? (
          <React.Fragment>
            <VideoSlot id={videoId || slotId} label={tag + ' · ' + title} stock={video} start={0} end={videoEnd || 8}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`, filter: 'brightness(0.62) saturate(1.02) contrast(1.02)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,11,0.5) 0%, rgba(3,7,11,0.2) 45%, rgba(3,7,11,0.84) 100%)', pointerEvents: 'none' }} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ position: 'absolute', inset: 0 }}>
              <image-slot id={slotId} src={bg || undefined} shape="rect" fit="cover"
                placeholder={tag + ' — drop real footage still: ' + title}
                style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>
            </div>
            {bg && (
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <img src={bg} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`, filter: 'brightness(0.5) saturate(0.9)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,11,0.55) 0%, rgba(3,7,11,0.25) 45%, rgba(3,7,11,0.82) 100%)' }} />
              </div>
            )}
            {!bg && <div style={{ position: 'absolute', inset: 40, border: `2px dashed ${BORDER}`, borderRadius: 14, pointerEvents: 'none' }} />}
          </React.Fragment>
        )}
        {!video && (
        <div style={{ position: 'absolute', right: 90, top: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 300, color: GOLD, lineHeight: 1 }}>+</div>
          <div style={{ fontFamily: FB, fontSize: 14, color: SKY, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>Drop {tag.toLowerCase()} footage here</div>
        </div>
        )}
        <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: (bg || video) ? SKY : GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}`, pointerEvents: 'none' }}>
          {tag} &middot; {video ? 'Site B-Roll' : (bg ? (bgLabel || 'Reference Imagery — Drop Site Footage') : 'Animated Placeholder — Footage Pending')}
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {children}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '26px 70px 34px', background: 'linear-gradient(0deg, rgba(3,7,11,0.9) 30%, transparent 100%)', pointerEvents: 'none' }}>
          <div style={{ fontFamily: FH, fontSize: 30, fontWeight: 700, color: TXT_HI }}>{title}</div>
          {stat && <div style={{ fontFamily: FB, fontSize: 17, color: TXT_SUB, marginTop: 6 }}>{stat}</div>}
        </div>
      </FadeBox>
    );
  }

  // Outfall / consolidation tank — animated flow schematic
  function OutfallScene({ start, end }) {
    return (
      <Sprite start={start} end={end} label="Outfall — WWTW (ground)">
        <OutfallSceneInner />
      </Sprite>
    );
  }
  function OutfallSceneInner() {
    const { localTime } = useSprite();
    const dashOffset = -((localTime * 46) % 40);
    const level = 0.42 + 0.06 * Math.sin(localTime * 1.1);
    return (
        <SceneShell tag="GROUND" title="WWTW Outfall / Consolidation Tank" stat="Fishwater Flats WWTW · Gqeberha, Eastern Cape" videoId="scene-outfall" video="assets/footage/sm/outfall.mp4" videoEnd={8}>
          <svg width="720" height="360" viewBox="0 0 720 360" fill="none">
            <rect x="40" y="40" width="220" height="200" rx="10" stroke={BLUE} strokeWidth="3" fill="rgba(0,144,224,0.05)" />
            <rect x={44} y={40 + 200 * (1 - level)} width="212" height={200 * level - 4} fill="rgba(0,144,224,0.28)" />
            <text x="150" y="270" textAnchor="middle" fontFamily="Barlow Condensed" fontSize="20" fontWeight="700" fill={TXT_SUB}>CONSOLIDATION TANK</text>
            <path d="M260 130 H 420" stroke={SKY} strokeWidth="4" strokeDasharray="14 10" strokeDashoffset={dashOffset} />
            <path d="M260 170 H 420" stroke={SKY} strokeWidth="4" strokeDasharray="14 10" strokeDashoffset={dashOffset * 0.7} />
            <rect x="420" y="90" width="240" height="120" rx="8" stroke={GOLD} strokeWidth="3" fill="rgba(251,183,8,0.05)" />
            <text x="540" y="230" textAnchor="middle" fontFamily="Barlow Condensed" fontSize="20" fontWeight="700" fill={TXT_SUB}>OUTFALL TO ESTUARY</text>
            <circle cx="540" cy="150" r="26" stroke={GOLD} strokeWidth="3" fill="none" opacity={0.5 + 0.5 * Math.sin(localTime * 2)} />
          </svg>
        </SceneShell>
    );
  }

  // CHP genset — animated turbine + live gauge
  function CHPScene({ start, end }) {
    return (
      <Sprite start={start} end={end} label="CHP pilot (ground)">
        <CHPSceneInner />
      </Sprite>
    );
  }
  function CHPSceneInner() {
    const { localTime, duration } = useSprite();
    const rampT = Math.min(1, localTime / (duration * 0.5));
    const kwe = Math.round(50 * Easing.easeOutCubic(rampT));
    const needleAngle = -90 + 180 * Easing.easeOutCubic(rampT);
    const spin = localTime * 130;
    return (
        <SceneShell tag="LIVE PILOT" title="Phase 1 Pilot CHP Unit — Running Today" stat="Phase 1 Pilot Plant · operational now · exported to NMBM LV grid" videoId="scene-chp" video="assets/footage/sm/chp.mp4" videoEnd={7}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 90 }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="90" stroke={BLUE} strokeWidth="3" fill="rgba(0,144,224,0.05)" />
              <g transform={`rotate(${spin} 110 110)`}>
                {[0, 60, 120, 180, 240, 300].map(a => (
                  <rect key={a} x="104" y="30" width="12" height="55" rx="4" fill={SKY} opacity="0.85" transform={`rotate(${a} 110 110)`} />
                ))}
              </g>
              <circle cx="110" cy="110" r="22" fill={GOLD} />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <svg width="260" height="150" viewBox="0 0 260 150">
                <path d="M20 130 A110 110 0 0 1 240 130" stroke={BORDER} strokeWidth="10" fill="none" />
                <path d="M20 130 A110 110 0 0 1 240 130" stroke={GOLD} strokeWidth="10" fill="none"
                  strokeDasharray={`${Math.PI * 110 * (rampT)} 999`} />
                <line x1="130" y1="130" x2={130 + 85 * Math.cos((needleAngle * Math.PI) / 180)} y2={130 + 85 * Math.sin((needleAngle * Math.PI) / 180)} stroke={TXT_HI} strokeWidth="4" />
                <circle cx="130" cy="130" r="8" fill={TXT_HI} />
              </svg>
              <div style={{ fontFamily: FH, fontSize: 46, fontWeight: 800, color: TXT_HI, marginTop: -10 }}>{kwe} kWe</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: GOLD, opacity: 0.55 + 0.45 * Math.sin(localTime * 5) }} />
                <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 2, color: GOLD }}>LIVE EXPORT TO GRID</div>
              </div>
            </div>
          </div>
        </SceneShell>
    );
  }

  // CNG tube trailer loading — animated gas transfer
  function CNGScene({ start, end }) {
    return (
      <Sprite start={start} end={end} label="CNG trailer (ground)">
        <CNGSceneInner />
      </Sprite>
    );
  }
  function CNGSceneInner() {
    const { localTime } = useSprite();
    const dashOffset = -((localTime * 60) % 36);
    const fill = Math.min(1, localTime / 4);
    return (
        <SceneShell tag="GROUND" title="CNG Tube Trailer at Loading Bay" stat="Virtual pipeline — additional routes under evaluation · Vehicle fuel — future expansion" videoId="scene-cng" video="assets/footage/sm/cng.mp4" videoEnd={6}>
          <svg width="760" height="300" viewBox="0 0 760 300" fill="none">
            <rect x="40" y="90" width="150" height="120" rx="10" stroke={GOLD} strokeWidth="3" fill="rgba(251,183,8,0.06)" />
            <rect x={48} y={90 + 120 * (1 - fill)} width="134" height={120 * fill - 6} fill="rgba(251,183,8,0.3)" />
            <text x="115" y="235" textAnchor="middle" fontFamily="Barlow Condensed" fontSize="18" fontWeight="700" fill={TXT_SUB}>BGU STORAGE</text>
            <path d="M190 150 H 480" stroke={GOLD} strokeWidth="5" strokeDasharray="16 10" strokeDashoffset={dashOffset} />
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x={500 + i * 55} y="80" width="40" height="140" rx="18" stroke={BLUE} strokeWidth="3" fill="rgba(0,144,224,0.08)" />
            ))}
            <text x="620" y="245" textAnchor="middle" fontFamily="Barlow Condensed" fontSize="18" fontWeight="700" fill={TXT_SUB}>CNG TUBE TRAILER</text>
          </svg>
        </SceneShell>
    );
  }

  // CO2 cryogenic vessel — animated frost/vapor
  function CO2Scene({ start, end }) {
    return (
      <Sprite start={start} end={end} label="CO₂ vessel (ground)">
        <CO2SceneInner />
      </Sprite>
    );
  }
  function CO2SceneInner() {
    const { localTime } = useSprite();
    const particles = Array.from({ length: 10 }, (_, i) => {
      const t = (localTime * 0.35 + i / 10) % 1;
      const x = 360 + Math.sin(i * 2.1) * 90;
      const y = 220 - t * 200;
      const op = Math.sin(t * Math.PI) * 0.5;
      return { x, y, op, i };
    });
    return (
        <SceneShell tag="GROUND" title="CO₂ Cryogenic Storage Vessel" stat="30 tpd · Cryogenic food-grade CO₂" videoId="scene-co2" video="assets/footage/sm/co2.mp4" videoEnd={4}>
          <svg width="720" height="360" viewBox="0 0 720 360" fill="none">
            <rect x="280" y="80" width="160" height="220" rx="80" stroke={SKY} strokeWidth="3" fill="rgba(143,224,255,0.06)" />
            <circle cx="360" cy="140" r="30" fill="rgba(143,224,255,0.18)" />
            {particles.map(p => (
              <circle key={p.i} cx={p.x} cy={p.y} r={6 + 3 * Math.sin(p.i)} fill={SKY} opacity={Math.max(0, p.op)} />
            ))}
            <text x="360" y="335" textAnchor="middle" fontFamily="Barlow Condensed" fontSize="20" fontWeight="700" fill={TXT_SUB}>CRYOGENIC CO₂ UNIT</text>
          </svg>
        </SceneShell>
    );
  }

  // ── Interview sound-bite stand-in card ──────────────────────────────────────
  function QuoteCard({ start, end, name, role, setting, quote }) {
    useEdit();
    const bid = mkBid(start, end);
    name = EditStore.label(bid, 'Name', name);
    role = EditStore.label(bid, 'Title/role', role);
    quote = EditStore.label(bid, 'Quote', quote);
    return (
      <Sprite start={start} end={end} label={'Interview · ' + (name || '')} beatId={bid} fields={[['Name', name], ['Title/role', role], ['Quote', quote]]}>
        <QuoteCardInner name={name} role={role} setting={setting} quote={quote} />
      </Sprite>
    );
  }
  function QuoteCardInner({ name, role, setting, quote }) {
    const { localTime } = useSprite();
    const slotId = 'interview-' + (name || 'sot').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    const drift = (amp, spd, ph) => amp * Math.sin(localTime * spd + ph);
    const recOn = Math.sin(localTime * 2.4) > -0.2;
    return (
      <FadeBox x={0} y={0} width={W} height={H}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(60% 60% at 72% 40%, rgba(0,144,224,0.16) 0%, transparent 70%), ${INK}`,
        }} />
        {/* real interview-footage drop zone (shows animated stand-in until filled) */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <image-slot id={slotId} shape="rect" fit="cover"
            placeholder={'INTERVIEW SOT — drop real footage: ' + (name || '')}
            style={{ width: '100%', height: '100%', display: 'block', opacity: 0.9 }}></image-slot>
        </div>
        {/* animated bokeh backdrop — stand-in for a real interview set */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 160 + drift(26, 0.32, 0), top: 160 + drift(18, 0.27, 1), width: 260, height: 260, borderRadius: '50%', background: 'rgba(251,183,8,0.10)', filter: 'blur(10px)' }} />
          <div style={{ position: 'absolute', right: 380 + drift(20, 0.24, 2), top: 500 + drift(24, 0.3, 0.5), width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,144,224,0.14)', filter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', right: 640 + drift(16, 0.2, 3), top: 300 + drift(14, 0.22, 2), width: 110, height: 110, borderRadius: '50%', background: 'rgba(143,224,255,0.10)', filter: 'blur(7px)' }} />
        </div>
        {/* interview frame reticle — corner ticks + live REC indicator */}
        <div style={{ position: 'absolute', inset: 54, pointerEvents: 'none' }}>
          {[['left','top'],['right','top'],['left','bottom'],['right','bottom']].map(([hx, vy], i) => (
            <div key={i} style={{ position: 'absolute', [hx]: 0, [vy]: 0, width: 34, height: 34, [`border${hx === 'left' ? 'Left' : 'Right'}`]: `2px solid ${BORDER}`, [`border${vy === 'top' ? 'Top' : 'Bottom'}`]: `2px solid ${BORDER}` }} />
          ))}
          <div style={{ position: 'absolute', right: 0, top: -34, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FH, fontSize: 13, fontWeight: 700, letterSpacing: 2.5, color: GOLD }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: recOn ? '#E4483C' : 'transparent', border: '1px solid #E4483C' }} />REC
          </div>
        </div>

        <div style={{ position: 'absolute', left: 130, top: 130, display: 'flex', alignItems: 'center', gap: 12 }}>
          <MicGlyph size={34} color={GOLD} />
          <div style={{ fontFamily: FH, fontSize: 19, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: GOLD }}>
            Interview &middot; Placeholder Sound Bite
          </div>
        </div>

        <div style={{ position: 'absolute', left: 130, top: 260, width: 1340 }}>
          <div style={{ fontFamily: FB, fontStyle: 'italic', fontWeight: 400, fontSize: 40, lineHeight: 1.45, color: TXT_HI }}>
            &ldquo;{quote}&rdquo;
          </div>
        </div>

        <div style={{ position: 'absolute', left: 130, bottom: 130, borderLeft: `4px solid ${BLUE}`, paddingLeft: 20 }}>
          <div style={{ fontFamily: FH, fontSize: 32, fontWeight: 700, color: TXT_HI }}>{name}</div>
          <div style={{ fontFamily: FB, fontSize: 18, color: TXT_SUB, marginTop: 2 }}>{role}</div>
          {setting && <div style={{ fontFamily: FB, fontSize: 15, color: TXT_DIM, marginTop: 8, fontStyle: 'italic' }}>{setting}</div>}
        </div>
      </FadeBox>
    );
  }

  // ── Title card ───────────────────────────────────────────────────────────
  function TitleCard({ start, end }) {
    return (
      <Sprite start={start} end={end} label="Title card">
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.8} exitDur={0.6}>
          <div style={{ position: 'absolute', inset: 0, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img src="assets/Straits_Energy_Holdings.png" style={{ height: 160 }} />
              <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: TXT_SUB }}>Project Owner</div>
              <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: BLUE }}>Powered by EnergiDrop</div>
            </div>
            <div style={{ width: 90, height: 3, background: BLUE }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img src="assets/EnergiDrop_Logo_Transparent.png" style={{ height: 90, filter: 'drop-shadow(0 0 30px rgba(0,144,224,0.25))' }} />
              <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: BLUE }}>Power &amp; Project Management Partner</div>
            </div>
            <div style={{ fontFamily: FH, fontSize: 58, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: TXT_HI, textAlign: 'center', marginTop: 6 }}>
              Fishwater Flats<br /><span style={{ color: BLUE }}>Biogas Facility</span>
            </div>
            <div style={{ fontFamily: FB, fontSize: 22, color: TXT_SUB, letterSpacing: 1 }}>
              Gqeberha &middot; Eastern Cape &middot; South Africa
            </div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── Chapter title marker (storyboard chapter architecture — non-blocking,
  // fades in top-centre at each chapter start) ──────────────────────────────
  function ChapterTitle({ num, title, start }) {
    useEdit();
    const bid = mkBid(start, start + 4.5);
    title = EditStore.label(bid, 'Title', title);
    return (
      <Sprite start={start} end={start + 4.5} label={'Chapter ' + num + ' · ' + title} beatId={bid} fields={[['Title', title]]}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.6} exitDur={0.6}>
          <div style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 22px', backdropFilter: 'blur(6px)' }}>
              <span style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD }}>CH. {num}</span>
              <span style={{ width: 1, height: 20, background: BORDER }} />
              <span style={{ fontFamily: FH, fontSize: 19, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: TXT_HI }}>{title}</span>
            </div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── Stat sequence (Section 1) ───────────────────────────────────────────
  function StatCard({ start, end, big, small, bg }) {
    useEdit();
    const bid = mkBid(start, end);
    big = EditStore.label(bid, 'Headline', big);
    small = EditStore.label(bid, 'Sub', small);
    return (
      <Sprite start={start} end={end} label={big} beatId={bid} fields={[['Headline', big], ['Sub', small]]}>
        <FadeBox x={0} y={0} width={W} height={H}>
          <div style={{ position: 'absolute', inset: 0, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 200px', overflow: 'hidden' }}>
            {bg && <img src={bg} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4) saturate(0.85) contrast(1.02)' }} />}
            {bg && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(4,9,15,0.4) 0%, rgba(4,9,15,0.82) 100%)' }} />}
            <div style={{ position: 'relative', fontFamily: FH, fontWeight: 800, fontSize: 78, color: BLUE, textAlign: 'center', lineHeight: 1.1 }}>{big}</div>
            <div style={{ position: 'relative', fontFamily: FB, fontSize: 26, color: TXT_HI, textAlign: 'center' }}>{small}</div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── Location zoom (Section 1 close) ─────────────────────────────────────
  function LocationZoom({ start, end }) {
    const steps = [
      { s: start, e: start + 2, label: 'SOUTH AFRICA', sub: null },
      { s: start + 2, e: start + 4, label: 'EASTERN CAPE', sub: 'Coastal metro region' },
      { s: start + 4, e: end, label: 'GQEBERHA', sub: 'Fishwater Flats WWTW' },
    ];
    return (
      <React.Fragment>
        <Sprite start={start} end={end}>
          <div style={{ position: 'absolute', inset: 0, background: INK }}>
            <PulsingPin start={start} end={end} />
          </div>
        </Sprite>
        {steps.map((s, i) => (
          <Sprite key={i} start={s.s} end={s.e}>
            <FadeBox x={0} y={0} width={W} height={H} entryDur={0.35} exitDur={0.3}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center' }}>
                <div style={{ fontFamily: FH, fontSize: 52, fontWeight: 800, letterSpacing: 6, color: TXT_HI, textTransform: 'uppercase' }}>{s.label}</div>
                {s.sub && <div style={{ fontFamily: FB, fontSize: 22, color: TXT_SUB, marginTop: 8 }}>{s.sub}</div>}
              </div>
            </FadeBox>
          </Sprite>
        ))}
        <Sprite start={end - 1.2} end={end}>
          <FadeBox x={0} y={860} width={W} height={80} entryDur={0.3} exitDur={0.2} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FH, fontSize: 30, fontWeight: 600, color: BLUE, letterSpacing: 1 }}>
              One site. One integrated solution.
            </div>
          </FadeBox>
        </Sprite>
      </React.Fragment>
    );
  }

  function PulsingPin({ start, end }) {
    const { localTime } = useSprite();
    const pulse = 1 + 0.18 * Math.sin(localTime * 2.4);
    return (
      <div style={{
        position: 'absolute', left: '50%', top: '46%', transform: `translate(-50%,-50%) scale(${pulse})`,
        width: 26, height: 26, borderRadius: '50%', background: GOLD, boxShadow: `0 0 0 18px rgba(251,183,8,0.14), 0 0 60px 10px rgba(251,183,8,0.25)`,
      }} />
    );
  }

  // ── Block-flow diagram (Section 2 centrepiece) ──────────────────────────
  function FlowNode({ start, end, x, y, w, label, sub, tone = BLUE }) {
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={x} y={y} width={w} entryDur={0.5} exitDur={0.3} style={{}}>
          <div style={{
            border: `2px solid ${tone}`, borderRadius: 10, background: 'rgba(5,10,15,0.7)',
            padding: '18px 22px', boxShadow: `0 0 24px -6px ${tone}`,
          }}>
            <div style={{ fontFamily: FH, fontSize: 24, fontWeight: 700, color: TXT_HI, lineHeight: 1.2 }}>{label}</div>
            {sub && <div style={{ fontFamily: FB, fontSize: 15, color: TXT_SUB, marginTop: 4 }}>{sub}</div>}
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  function FlowLine({ start, end, points, tone = BLUE }) {
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.4} exitDur={0.3}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <polyline points={points} fill="none" stroke={tone} strokeWidth="2.5" strokeDasharray="6 6" opacity="0.75" />
          </svg>
        </FadeBox>
      </Sprite>
    );
  }

  function ProcessCopy({ start, end, head, body }) {
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.35} exitDur={0.3}>
          <div style={{ position: 'absolute', left: 120, bottom: 70, maxWidth: 1160, borderLeft: `4px solid ${GOLD}`, paddingLeft: 22, background: PANEL_BG, padding: '18px 26px 18px 22px', borderRadius: 6, border: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: FH, fontSize: 17, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: GOLD }}>{head}</div>
            <div style={{ fontFamily: FB, fontSize: 24, color: TXT_HI, lineHeight: 1.4, marginTop: 8 }}>{body}</div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  function BlockFlowScene({ base }) {
    const t = base; // section start (53)
    return (
      <React.Fragment>
        <Sprite start={t} end={t + 20}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <VideoSlot id="blockflow-bg" label="Block-flow backdrop" stock="assets/footage/sm/aerbasin.mp4" start={0} end={20}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.16, filter: 'brightness(0.5) saturate(1.0)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, rgba(3,7,11,0.55) 0%, rgba(3,7,11,0.92) 100%)' }} />
          </div>
        </Sprite>
        <Sprite start={t} end={t + 20}>
          <FadeBox x={0} y={40} width={W} height={130} entryDur={0.4} exitDur={0.3} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FH, fontSize: 22, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: BLUE }}>
              Process Block Flow
            </div>
            <div style={{ fontFamily: FB, fontSize: 20, color: TXT_SUB, marginTop: 8, maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.4 }}>
              Two waste streams in, five products out &mdash; one continuous anaerobic-digestion process
            </div>
          </FadeBox>
        </Sprite>

        {/* stepped on-screen process copy (lower band), synced to the VO */}
        <ProcessCopy start={t + 0.5}  end={t + 6}  head="01 · Feedstock In"     body="Municipal sludge and source-separated food waste, FOG and organic residues are received and blended." />
        <ProcessCopy start={t + 6}    end={t + 11} head="02 · Anaerobic Digestion" body="Three mesophilic CSTR co-digesters break the blend down over a ~21-day retention, yielding ~2,400 Nm³/h of raw biogas at ~60% methane." />
        <ProcessCopy start={t + 11}   end={t + 20} head="03 · Products Out"      body="Upgrading and recovery split the output into biomethane, renewable electricity, food-grade CO₂, digestate and recovered water." />

        {/* Inputs */}
        <FlowNode start={t + 0} end={t + 20} x={120} y={330} w={330} label="WWTW Sludge" sub="Primary + secondary, ~12–14% TS" />
        <FlowNode start={t + 2} end={t + 20} x={120} y={480} w={330} label="Food Waste / FOG" sub="Organic residues, co-digestion feed" />

        {/* lines to process */}
        <FlowLine start={t + 4} end={t + 20} points="450,395 620,405 780,470" />
        <FlowLine start={t + 4} end={t + 20} points="450,545 620,510 780,470" />

        {/* Process */}
        <FlowNode start={t + 4} end={t + 20} x={790} y={410} w={340} tone={GOLD} label="3× CSTR Mesophilic Co-Digesters" sub="~2,400 Nm³/h raw biogas · ~60% methane" />

        {/* lines to outputs */}
        <FlowLine start={t + 7} end={t + 20} points="1130,460 1300,300 1470,255" />
        <FlowLine start={t + 9.5} end={t + 20} points="1130,470 1300,420 1470,405" />
        <FlowLine start={t + 12} end={t + 20} points="1130,490 1300,540 1470,555" />
        <FlowLine start={t + 14.5} end={t + 20} points="1130,510 1300,660 1470,705" />
        <FlowLine start={t + 17} end={t + 20} points="1130,520 1300,780 1470,855" />

        {/* Outputs */}
        <FlowNode start={t + 7} end={t + 20} x={1480} y={220} w={330} tone={BLUE} label="Biomethane (CNG)" sub="Industrial offtake · in development" />
        <FlowNode start={t + 9.5} end={t + 20} x={1480} y={370} w={330} tone={BLUE} label="Electricity" sub="2–5 MWe to NMBM grid" />
        <FlowNode start={t + 12} end={t + 20} x={1480} y={520} w={330} tone={SKY} label="Food-Grade CO₂" sub="30 tpd cryogenic liquefaction" />
        <FlowNode start={t + 14.5} end={t + 20} x={1480} y={670} w={330} tone={GRAY} label="Digestate" sub="Fertiliser · brick-kiln feedstock" />
        <FlowNode start={t + 17} end={t + 20} x={1480} y={820} w={330} tone={GRAY} label="Recovered Water" sub="Industrial + municipal reuse" />
      </React.Fragment>
    );
  }

  // ── Benefit icon (shared line-icon glyph set) ───────────────────────────
  function BenefitIcon({ kind, color }) {
    const common = { width: 72, height: 72, viewBox: '0 0 48 48', fill: 'none', stroke: color, strokeWidth: 2.2 };
    switch (kind) {
      case 'wave': return <svg {...common}><path d="M4 30c4-6 8-6 12 0s8 6 12 0 8-6 12 0 4 3 4 3" /><path d="M4 20c4-6 8-6 12 0s8 6 12 0 8-6 12 0" /></svg>;
      case 'landfill': return <svg {...common}><path d="M6 38h36" /><path d="M10 38l8-18 6 8 4-6 10 16" /><path d="M14 20l4-8 4 8" /></svg>;
      case 'water': return <svg {...common}><path d="M24 6c8 10 12 17 12 23a12 12 0 01-24 0c0-6 4-13 12-23z" /></svg>;
      case 'check': return <svg {...common}><circle cx="24" cy="24" r="18" /><path d="M16 25l6 6 12-13" /></svg>;
      case 'bolt': return <svg {...common}><path d="M26 4L10 28h10l-4 16 20-26H26l4-14z" strokeLinejoin="round" /></svg>;
      case 'pipe': return <svg {...common}><rect x="6" y="20" width="26" height="8" rx="4" /><circle cx="38" cy="24" r="6" /></svg>;
      case 'co2': return <svg {...common}><circle cx="16" cy="24" r="10" /><circle cx="32" cy="24" r="10" /></svg>;
      case 'leaf': return <svg {...common}><path d="M10 38C10 18 26 8 40 8c0 18-12 30-30 30z" /><path d="M12 36L34 12" /></svg>;
      case 'brick': return <svg {...common}><rect x="6" y="14" width="16" height="10" /><rect x="26" y="14" width="16" height="10" /><rect x="14" y="26" width="16" height="10" /></svg>;
      case 'people': return <svg {...common}><circle cx="17" cy="16" r="6" /><circle cx="33" cy="16" r="6" /><path d="M6 40c0-8 6-13 11-13s11 5 11 13" /><path d="M22 40c0-8 6-13 11-13s11 5 11 13" /></svg>;
      default: return null;
    }
  }

  const BENEFITS = [
    { icon: 'wave', metric: 'Ocean protection', label: 'IMPACT 01', desc: 'Odour & discharge complaints resolved at source', video: 'assets/footage/sm/aeraerial.mp4' },
    { icon: 'landfill', metric: '>200 t/day', label: 'IMPACT 02', desc: 'Approved source-separated organics diverted from landfill into a monitored, traceable feedstock system', video: 'assets/footage/sm/leaves.mp4' },
    { icon: 'water', metric: 'Water recovery', label: 'IMPACT 03', desc: 'Treated water reuse for arid Eastern Cape industry', video: 'assets/footage/sm/aerbasin.mp4' },
    { icon: 'check', metric: 'Zero cost to NMBM', label: 'IMPACT 04', desc: 'Adds sludge-processing capacity and long-term operational resilience — at no municipal expense', video: 'assets/footage/sm/agri.mp4' },
    { icon: 'bolt', metric: '2 → 5 MWe', label: 'IMPACT 05', desc: 'Renewable baseload replacing fossil fuel in hard-to-electrify industrial heat', video: 'assets/footage/sm/commerce.mp4' },
    { icon: 'pipe', metric: '7.7 km pipeline', label: 'IMPACT 06', desc: 'Biomethane to nearby industry — gas upgrading, storage & delivery under licensed safety controls', video: 'assets/footage/sm/petro.mp4' },
    { icon: 'co2', metric: '30 tpd CO₂', label: 'IMPACT 07', desc: 'Cryogenic food-grade carbon dioxide', video: 'assets/footage/sm/agri2.mp4' },
    { icon: 'leaf', metric: 'Organic fertiliser', label: 'IMPACT 08', desc: 'Digestate for Eastern Cape agriculture', video: 'assets/footage/sm/mulch.mp4' },
    { icon: 'brick', metric: 'Kiln feedstock', label: 'IMPACT 09', desc: 'Digestate cake supplied to regional brick kilns', video: 'assets/footage/sm/anchovies.mp4' },
    { icon: 'people', metric: '100+ jobs', label: 'IMPACT 10', desc: 'Construction, O&M and supply-chain employment', video: 'assets/footage/sm/trio.mp4' },
  ];

  function BenefitCard({ start, end, item, tone }) {
    return (
      <Sprite start={start} end={end}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${BLUE_INK} 0%, ${BLUE_DEEP} 140%)` }}>
          {item.video && (
            <VideoSlot id={'impact-' + item.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()} label={'Impact bg · ' + item.metric} stock={item.video} start={item.vStart ?? 0} end={item.vEnd ?? 4.5}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, filter: 'brightness(0.72) saturate(1.05)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: item.video ? 0.1 : 0.16, transform: 'scale(4.2)' }}>
            <BenefitIcon kind={item.icon} color={tone} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 42%, transparent 0%, rgba(5,10,15,0.35) 60%, rgba(5,10,15,0.92) 100%)', pointerEvents: 'none' }} />
        </div>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.25} exitDur={0.2}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 14, padding: '0 80px 64px', pointerEvents: 'none' }}>
            <div style={{ fontFamily: FH, fontSize: 18, fontWeight: 700, letterSpacing: 5, color: tone }}>{item.label}</div>
            <BenefitIcon kind={item.icon} color={tone} />
            <div style={{ fontFamily: FH, fontSize: 54, fontWeight: 800, color: TXT_HI, textAlign: 'center' }}>{item.metric}</div>
            <div style={{ fontFamily: FB, fontSize: 21, color: TXT_SUB, textAlign: 'center', maxWidth: 900 }}>{item.desc}</div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  function BenefitsSection({ base }) {
    const perCard = 4.5;
    return (
      <React.Fragment>
        <Sprite start={base} end={base + 3}>
          <FadeBox x={0} y={0} width={W} height={H}>
            <div style={{ position: 'absolute', inset: 0, background: BLUE_INK, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <VideoSlot id="title-bg" label="Title backdrop" stock="assets/footage/sm/sifting.mp4" start={0} end={3}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32, filter: 'brightness(0.7) saturate(1.05)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(5,10,20,0.35) 0%, rgba(5,10,20,0.85) 100%)' }} />
              <div style={{ position: 'relative', fontFamily: FH, fontSize: 62, fontWeight: 900, color: TXT_HI, textAlign: 'center', letterSpacing: 1 }}>
                10 Dimensions of<br /><span style={{ color: BLUE }}>Impact</span>
              </div>
            </div>
          </FadeBox>
        </Sprite>
        {BENEFITS.map((item, i) => (
          <BenefitCard key={i} start={base + 3 + i * perCard} end={base + 3 + (i + 1) * perCard} item={item}
            tone={i % 3 === 0 ? BLUE : i % 3 === 1 ? GOLD : SKY} />
        ))}
      </React.Fragment>
    );
  }

  // ── Site diagram flythrough (CAD-derived, Section 4) ────────────────────
  // Coordinates are real CAD-vector-extracted positions (meters) from
  // plant_structures_data.json — anchor Triton Digester "A" centre,
  // FWF preliminary general layout, Anaergia 24-0503-A04-001.
  const STRUCTURES = [
    { name: 'Triton Digester A', cx: 37.54, cy: 81.46, d: 43.2, phase: 'phase2', shape: 'circle' },
    { name: 'Triton Digester B', cx: 76.47, cy: 81.46, d: 43.2, phase: 'phase2', shape: 'circle' },
    { name: 'Triton Digester C', cx: 130.37, cy: 81.46, d: 43.2, phase: 'phase2', shape: 'circle' },
    { name: 'Feed Buffer Tank', cx: 103.42, cy: 73.48, d: 15.1, phase: 'phase1', shape: 'circle' },
    { name: 'Sludge Buffer Tank', cx: 160.61, cy: 74.91, d: 14.6, phase: 'phase1', shape: 'circle' },
    { name: 'Equalization Tank A', cx: 135.73, cy: 182.64, d: 13.0, phase: 'phase1', shape: 'circle' },
    { name: 'Equalization Tank B', cx: 149.61, cy: 180.42, d: 14.7, phase: 'phase1', shape: 'circle' },
    { name: 'Equalization Tank C', cx: 165.68, cy: 180.53, d: 14.6, phase: 'phase1', shape: 'circle' },
    { name: 'Emergency Flare', cx: 253.52, cy: 65.59, d: 10.0, phase: 'phase2', shape: 'circle' },
    { name: 'CHPs & Transformer Area', cx: 187.51, cy: 118.58, d: 15.0, phase: 'future', shape: 'circle' },
    { name: 'Centrate Buffer Tank', cx: 214.9, cy: 64.68, d: 4.6, phase: 'phase2', shape: 'circle' },
    { name: 'Live Bottom Bin A', x: 153.51, y: 116.92, w: 10, phase: 'existing', shape: 'rect' },
    { name: 'Live Bottom Bin B', x: 161.07, y: 116.93, w: 10, phase: 'existing', shape: 'rect' },
    { name: 'Blending Tanks', x: 149.8, y: 122.33, w: 9, phase: 'existing', shape: 'rect' },
    { name: 'Gritrex Package', x: 141.75, y: 115.07, w: 7, phase: 'existing', shape: 'rect' },
    { name: 'FOG Buffer Tank', x: 151.73, y: 129.13, w: 6, phase: 'existing', shape: 'rect' },
    { name: 'Acid Liquids Buffer', x: 156.72, y: 129.13, w: 6, phase: 'existing', shape: 'rect' },
    { name: 'Basic Liquids Buffer', x: 161.86, y: 129.0, w: 6, phase: 'existing', shape: 'rect' },
    { name: 'Polymer Make-Up Unit', x: 169.06, y: 80.28, w: 7, phase: 'phase1', shape: 'rect' },
    { name: 'Centrifuge', x: 160.28, y: 89.98, w: 8, phase: 'phase1', shape: 'rect' },
    { name: 'Existing Filtrate Buffer', x: 122.85, y: 114.26, w: 8, phase: 'existing', shape: 'rect' },
    { name: 'Existing Centrifuge', x: 125.59, y: 130.26, w: 8, phase: 'existing', shape: 'rect' },
    { name: 'Chemical Scrubber A', x: 217.71, y: 129.85, w: 8, phase: 'phase2', shape: 'rect' },
    { name: 'Chemical Scrubber B', x: 207.98, y: 129.77, w: 8, phase: 'phase2', shape: 'rect' },
    { name: 'Table Cooler / Chiller / HX', x: 203.68, y: 142.01, w: 12, phase: 'phase2', shape: 'rect' },
    { name: 'Activated Carbon Filters', x: 213.63, y: 143.65, w: 10, phase: 'phase2', shape: 'rect' },
    { name: 'External Gasholder', x: 204.24, y: 106.11, w: 22, phase: 'future', shape: 'rect' },
    { name: 'Weight Bridge', x: 175.47, y: 76.25, w: 8, phase: 'existing', shape: 'rect' },
    { name: 'Existing Building – Office', x: 196.9, y: 87.3, w: 14, phase: 'existing', shape: 'rect' },
    { name: 'BGU Area', x: 228.8, y: 83.87, w: 20, phase: 'future', shape: 'rect' },
  ];

  const PHASE_COLOR = { existing: GRAY, phase1: SKY, phase2: BLUE, future: GOLD };

  const UNIT = 6.4; // px per metre

  function worldToScreen(mx, my, focus, zoom) {
    return {
      left: W / 2 + (mx - focus.x) * UNIT * zoom,
      top: H / 2 + (my - focus.y) * UNIT * zoom,
    };
  }

  // GES aerial fly-in — camera data from Google Earth Studio project files
  // FWF Fly in .esp  (150 fr, 5 s): altitude descent 1.0 → 0.474 (normalized)
  // FWF.esp          (300 fr, 10 s): low-altitude orbit, lon/lat drift < 0.0002
  // Base imagery: FWF Site Layout (Anaergia satellite + CAD overlay, as delivered)
  // Preferred 3D renders: 24-0503 B01 001 (3).pdf — swap image-slot stills once exported

  const GES_FLYIN_ALT = [
    { t: 0.00, alt: 1.000 },
    { t: 0.80, alt: 0.474 },
    { t: 1.00, alt: 0.340 },
  ];

  const GES_ORBIT_WP = [
    { t: 0.00, fx: 0.55, fy: 0.50, z: 3.0, label: 'Fishwater Flats WWTW',    sub: 'Full plant footprint · Gqeberha, Eastern Cape' },
    { t: 0.22, fx: 0.35, fy: 0.38, z: 3.8, label: '3× Triton Digesters',     sub: 'High-solids CSTR · 43.2 m Ø · ~21-day HRT' },
    { t: 0.46, fx: 0.62, fy: 0.52, z: 4.2, label: 'CHP & Transformer Block', sub: 'Up to 5 MWe embedded generation' },
    { t: 0.66, fx: 0.76, fy: 0.46, z: 3.9, label: 'Gas Holder & BGU',        sub: '2,400 Nm³/h biomethane · CO₂ liquefaction' },
    { t: 0.84, fx: 0.78, fy: 0.62, z: 3.5, label: 'Gas Treatment & CO₂',    sub: 'Scrubbers · activated carbon · chiller train' },
    { t: 1.00, fx: 0.55, fy: 0.50, z: 2.6, label: 'One Integrated Plant',    sub: 'Feedstock → energy → CO₂ → nutrients — one site' },
  ];

  function gesAltToZoom(alt) {
    // Normalized GES altitude (1=max height) to CSS scale factor
    return Math.min(8, 1.2 / Math.pow(Math.max(0.04, alt), 0.78));
  }

  function GESFlyInScene({ start, end }) {
    return (
      <Sprite start={start} end={end} label="GES aerial fly-in · Fishwater Flats">
        <GESFlyInInner />
      </Sprite>
    );
  }

  function GESFlyInInner() {
    const { localTime, duration } = useSprite();
    const local = Math.max(0, Math.min(duration, localTime));
    const FLY_DUR = Math.min(5, duration * 0.35);
    const ORBIT_DUR = Math.max(0.01, duration - FLY_DUR);
    let zoom, fx, fy, activeLabel, activeSub;

    if (local < FLY_DUR) {
      // Phase 1: altitude descent (FWF Fly in .esp)
      const p = clamp(local / FLY_DUR, 0, 1);
      const alt = interpolate(GES_FLYIN_ALT.map(k => k.t), GES_FLYIN_ALT.map(k => k.alt), Easing.easeInOutCubic)(p);
      zoom = gesAltToZoom(alt);
      fx = 0.55; fy = 0.50;
      activeLabel = 'Fishwater Flats WWTW';
      activeSub = 'Gqeberha · Nelson Mandela Bay · Eastern Cape';
    } else {
      // Phase 2: low-altitude orbit (FWF.esp)
      const p = clamp((local - FLY_DUR) / ORBIT_DUR, 0, 1);
      fx    = interpolate(GES_ORBIT_WP.map(k => k.t), GES_ORBIT_WP.map(k => k.fx), Easing.easeInOutCubic)(p);
      fy    = interpolate(GES_ORBIT_WP.map(k => k.t), GES_ORBIT_WP.map(k => k.fy), Easing.easeInOutCubic)(p);
      zoom  = interpolate(GES_ORBIT_WP.map(k => k.t), GES_ORBIT_WP.map(k => k.z),  Easing.easeInOutCubic)(p);
      let wi = 0;
      for (let i = 0; i < GES_ORBIT_WP.length; i++) if (p >= GES_ORBIT_WP[i].t) wi = i;
      const wp   = GES_ORBIT_WP[wi];
      const wpNx = GES_ORBIT_WP[wi + 1] || wp;
      const sp   = wpNx.t > wp.t ? (p - wp.t) / (wpNx.t - wp.t) : 1;
      const slo  = sp < 0.15 ? sp / 0.15 : sp > 0.85 ? Math.max(0, (1 - sp) / 0.15) : 1;
      activeLabel = slo > 0.05 ? wp.label : '';
      activeSub   = wp.sub;
    }

    const tx = (0.5 - fx) * 100 * (zoom - 1) / zoom;
    const ty = (0.5 - fy) * 100 * (zoom - 1) / zoom;
    const entryFade  = clamp(local / 0.6, 0, 1);
    const exitFade   = clamp((duration - local) / 0.5, 0, 1);
    const boxOpacity = Math.min(entryFade, exitFade);
    const labelOpacity = local < FLY_DUR
      ? clamp((local - FLY_DUR * 0.6) / (FLY_DUR * 0.22), 0, 1)
      : clamp((local - FLY_DUR) / 0.55, 0, 1) * clamp((duration - local) / 0.5, 0, 1);

    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: boxOpacity, background: INK }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src="assets/maps/fwf_site_layout.png" alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: 'translate(' + tx + '%, ' + ty + '%) scale(' + zoom + ')',
            transformOrigin: '50% 50%', imageRendering: 'auto', willChange: 'transform',
          }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,11,0.52) 0%, rgba(3,7,11,0.07) 36%, rgba(3,7,11,0.07) 64%, rgba(3,7,11,0.88) 100%)' }} />
        <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: SKY, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: '1px solid ' + BORDER }}>
          Google Earth Studio · FWF Fly-In
        </div>
        <div style={{ position: 'absolute', left: 60, top: 78, fontFamily: FB, fontSize: 13, color: TXT_DIM }}>
          Camera path from GES project · Anaergia layout overlay · real satellite imagery
        </div>
        <StatusBadge kind="PROPOSED" />
        <div style={{ position: 'absolute', left: 60, right: 60, bottom: 66, height: 2, background: 'rgba(143,224,255,0.15)' }}>
          <div style={{ height: '100%', width: clamp(local / Math.max(1, duration), 0, 1) * 100 + '%', background: BLUE }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 92, textAlign: 'center', opacity: labelOpacity }}>
          <div style={{ fontFamily: FH, fontSize: 42, fontWeight: 700, color: TXT_HI, letterSpacing: 0.3 }}>{activeLabel}</div>
          <div style={{ fontFamily: FB, fontSize: 19, color: TXT_SUB, marginTop: 6 }}>{activeSub}</div>
        </div>
      </div>
    );
  }

  function SiteDiagramScene({ start, end }) { return <GESFlyInScene start={start} end={end} />; }

  const STATUS_MAP = {
    EXISTING:     { label: 'Existing on Site',        tone: SKY },
    PROPOSED:     { label: 'Proposed \u2014 To Be Built', tone: GOLD },
    COMPLETED:    { label: 'Completed',               tone: '#3FB98B' },
    CONTRACTED:   { label: 'Contracted',              tone: BLUE },
    FINALISATION: { label: 'In Finalisation',         tone: GOLD },
    DEVELOPMENT:  { label: 'In Development',           tone: SKY },
    FUTURE:       { label: 'Future Expansion',        tone: GRAY },
  };
  function StatusBadge({ kind }) {
    const s = STATUS_MAP[kind] || STATUS_MAP.PROPOSED;
    return (
      <div style={{ position: 'absolute', right: 60, top: 44, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FH, fontSize: 14, fontWeight: 700, letterSpacing: 2.5, color: s.tone, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.tone }} />
        {s.label}
      </div>
    );
  }

  // ── Real 3D preliminary-model stills (captured from fwf_3d_model_standalone.html) ──
  // Pre-filled with the real 3D-model capture; drag real drone/site footage onto it once
  // available to replace the render with the actual as-built shot (persists via image-slot).
  // ── 3D flythrough frame sequences (rendered from FWF Plant 3D Model) ───────
  // Each is 16 eased camera-move frames; ModelShot plays them synced to the beat
  // so the model animates instead of sitting as a still. Literal paths so the
  // merged/standalone build rewrites each to window.__resources.*.
  const FRAMES = {
    full: ['assets/3d/seq/full/01.jpg', 'assets/3d/seq/full/02.jpg', 'assets/3d/seq/full/03.jpg', 'assets/3d/seq/full/04.jpg', 'assets/3d/seq/full/05.jpg', 'assets/3d/seq/full/06.jpg', 'assets/3d/seq/full/07.jpg', 'assets/3d/seq/full/08.jpg', 'assets/3d/seq/full/09.jpg', 'assets/3d/seq/full/10.jpg', 'assets/3d/seq/full/11.jpg', 'assets/3d/seq/full/12.jpg', 'assets/3d/seq/full/13.jpg', 'assets/3d/seq/full/14.jpg', 'assets/3d/seq/full/15.jpg', 'assets/3d/seq/full/16.jpg', 'assets/3d/seq/full/17.jpg', 'assets/3d/seq/full/18.jpg', 'assets/3d/seq/full/19.jpg', 'assets/3d/seq/full/20.jpg', 'assets/3d/seq/full/21.jpg', 'assets/3d/seq/full/22.jpg', 'assets/3d/seq/full/23.jpg', 'assets/3d/seq/full/24.jpg'],
    digesters: ['assets/3d/seq/digesters/01.jpg', 'assets/3d/seq/digesters/02.jpg', 'assets/3d/seq/digesters/03.jpg', 'assets/3d/seq/digesters/04.jpg', 'assets/3d/seq/digesters/05.jpg', 'assets/3d/seq/digesters/06.jpg', 'assets/3d/seq/digesters/07.jpg', 'assets/3d/seq/digesters/08.jpg', 'assets/3d/seq/digesters/09.jpg', 'assets/3d/seq/digesters/10.jpg', 'assets/3d/seq/digesters/11.jpg', 'assets/3d/seq/digesters/12.jpg', 'assets/3d/seq/digesters/13.jpg', 'assets/3d/seq/digesters/14.jpg', 'assets/3d/seq/digesters/15.jpg', 'assets/3d/seq/digesters/16.jpg', 'assets/3d/seq/digesters/17.jpg', 'assets/3d/seq/digesters/18.jpg', 'assets/3d/seq/digesters/19.jpg', 'assets/3d/seq/digesters/20.jpg', 'assets/3d/seq/digesters/21.jpg', 'assets/3d/seq/digesters/22.jpg', 'assets/3d/seq/digesters/23.jpg', 'assets/3d/seq/digesters/24.jpg'],
    chp: ['assets/3d/seq/chp/01.jpg', 'assets/3d/seq/chp/02.jpg', 'assets/3d/seq/chp/03.jpg', 'assets/3d/seq/chp/04.jpg', 'assets/3d/seq/chp/05.jpg', 'assets/3d/seq/chp/06.jpg', 'assets/3d/seq/chp/07.jpg', 'assets/3d/seq/chp/08.jpg', 'assets/3d/seq/chp/09.jpg', 'assets/3d/seq/chp/10.jpg', 'assets/3d/seq/chp/11.jpg', 'assets/3d/seq/chp/12.jpg', 'assets/3d/seq/chp/13.jpg', 'assets/3d/seq/chp/14.jpg', 'assets/3d/seq/chp/15.jpg', 'assets/3d/seq/chp/16.jpg', 'assets/3d/seq/chp/17.jpg', 'assets/3d/seq/chp/18.jpg', 'assets/3d/seq/chp/19.jpg', 'assets/3d/seq/chp/20.jpg', 'assets/3d/seq/chp/21.jpg', 'assets/3d/seq/chp/22.jpg', 'assets/3d/seq/chp/23.jpg', 'assets/3d/seq/chp/24.jpg'],
    holder: ['assets/3d/seq/holder/01.jpg', 'assets/3d/seq/holder/02.jpg', 'assets/3d/seq/holder/03.jpg', 'assets/3d/seq/holder/04.jpg', 'assets/3d/seq/holder/05.jpg', 'assets/3d/seq/holder/06.jpg', 'assets/3d/seq/holder/07.jpg', 'assets/3d/seq/holder/08.jpg', 'assets/3d/seq/holder/09.jpg', 'assets/3d/seq/holder/10.jpg', 'assets/3d/seq/holder/11.jpg', 'assets/3d/seq/holder/12.jpg', 'assets/3d/seq/holder/13.jpg', 'assets/3d/seq/holder/14.jpg', 'assets/3d/seq/holder/15.jpg', 'assets/3d/seq/holder/16.jpg', 'assets/3d/seq/holder/17.jpg', 'assets/3d/seq/holder/18.jpg', 'assets/3d/seq/holder/19.jpg', 'assets/3d/seq/holder/20.jpg', 'assets/3d/seq/holder/21.jpg', 'assets/3d/seq/holder/22.jpg', 'assets/3d/seq/holder/23.jpg', 'assets/3d/seq/holder/24.jpg'],
    co2: ['assets/3d/seq/co2/01.jpg', 'assets/3d/seq/co2/02.jpg', 'assets/3d/seq/co2/03.jpg', 'assets/3d/seq/co2/04.jpg', 'assets/3d/seq/co2/05.jpg', 'assets/3d/seq/co2/06.jpg', 'assets/3d/seq/co2/07.jpg', 'assets/3d/seq/co2/08.jpg', 'assets/3d/seq/co2/09.jpg', 'assets/3d/seq/co2/10.jpg', 'assets/3d/seq/co2/11.jpg', 'assets/3d/seq/co2/12.jpg', 'assets/3d/seq/co2/13.jpg', 'assets/3d/seq/co2/14.jpg', 'assets/3d/seq/co2/15.jpg', 'assets/3d/seq/co2/16.jpg', 'assets/3d/seq/co2/17.jpg', 'assets/3d/seq/co2/18.jpg', 'assets/3d/seq/co2/19.jpg', 'assets/3d/seq/co2/20.jpg', 'assets/3d/seq/co2/21.jpg', 'assets/3d/seq/co2/22.jpg', 'assets/3d/seq/co2/23.jpg', 'assets/3d/seq/co2/24.jpg'],
    feedstock: ['assets/3d/seq/feedstock/01.jpg', 'assets/3d/seq/feedstock/02.jpg', 'assets/3d/seq/feedstock/03.jpg', 'assets/3d/seq/feedstock/04.jpg', 'assets/3d/seq/feedstock/05.jpg', 'assets/3d/seq/feedstock/06.jpg', 'assets/3d/seq/feedstock/07.jpg', 'assets/3d/seq/feedstock/08.jpg', 'assets/3d/seq/feedstock/09.jpg', 'assets/3d/seq/feedstock/10.jpg', 'assets/3d/seq/feedstock/11.jpg', 'assets/3d/seq/feedstock/12.jpg', 'assets/3d/seq/feedstock/13.jpg', 'assets/3d/seq/feedstock/14.jpg', 'assets/3d/seq/feedstock/15.jpg', 'assets/3d/seq/feedstock/16.jpg', 'assets/3d/seq/feedstock/17.jpg', 'assets/3d/seq/feedstock/18.jpg', 'assets/3d/seq/feedstock/19.jpg', 'assets/3d/seq/feedstock/20.jpg', 'assets/3d/seq/feedstock/21.jpg', 'assets/3d/seq/feedstock/22.jpg', 'assets/3d/seq/feedstock/23.jpg', 'assets/3d/seq/feedstock/24.jpg'],
  };
  function SeqImg({ frames, progress }) {
    const n = frames.length;
    const idx = Math.max(0, Math.min(n - 1, Math.floor(progress * n)));
    // Render ONLY the active frame (single <img> with src swap) rather than
    // mounting all N frames and opacity-toggling. Keeps the serialized DOM
    // light so the frame-by-frame video exporter doesn't time out, and removes
    // the between-frame opacity flash. Frames are already decoded/cached, so
    // swapping src is instant during both playback and export.
    return (
      <div style={{ position: 'absolute', inset: 0, background: INK }}>
        <img src={frames[idx]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  // ── True-3D site flythrough (baked from the FWF Plant 3D Model over real
  //    satellite imagery) — a one-way camera move: regional approach →
  //    descend from sky → push through the plant → follow the pipeline corridor.
  //    Replaces the old CAD image-zoom SiteDiagram. 64 frames played forward.
  // FlyThroughScene — GES fly-in alias (FWF.esp + FWF Fly in .esp camera paths)
  function FlyThroughScene({ start, end }) { return <GESFlyInScene start={start} end={end} />; }


  function ModelShot({ start, end, src, loc, cap, stat, status = 'PROPOSED', seq, site = 'assets/maps/fwf_site_layout.png' }) {
    useEdit();
    const bid = mkBid(start, end);
    loc = EditStore.label(bid, 'Location', loc);
    cap = EditStore.label(bid, 'Caption', cap);
    stat = EditStore.label(bid, 'Detail', stat);
    const slotId = 'model-' + src.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return (
      <Sprite start={start} end={end} label={cap || 'Model shot'} beatId={bid} fields={[['Location', loc], ['Caption', cap], ['Detail', stat]]}>
        <ModelShotInner slotId={slotId} src={src} seq={seq} site={site} loc={loc} cap={cap} stat={stat} status={status} />
      </Sprite>
    );
  }
  function ModelShotInner({ slotId, src, seq, site, loc, cap, stat, status }) {
    const { localTime, duration } = useSprite();
    const kb = 1.08 + 0.04 * Math.sin(localTime * 0.3);
    const rise = Math.min(1, localTime / 0.8);
    const frames = seq && FRAMES[seq];
    const progress = duration ? Math.min(1, Math.max(0, localTime / duration)) : 0;
    return (
      <React.Fragment>
        {/* real site context — blurred satellite backdrop the proposed element sits against */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: INK }}>
          <img src={site} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`, filter: 'brightness(0.42) saturate(0.85) blur(2px)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,11,0.55) 0%, rgba(3,7,11,0.35) 45%, rgba(3,7,11,0.9) 100%)' }} />
        </div>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.5} exitDur={0.4}>
          {/* framed 3D model / dropped footage, composited over the site */}
          <div style={{ position: 'absolute', left: 80, top: 118, right: 80, bottom: 190, borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: '0 34px 90px rgba(0,0,0,0.62)', transform: `translateY(${(1 - rise) * 26}px)`, opacity: rise }}>
            {frames
              ? <SeqImg frames={frames} progress={progress} />
              : <image-slot id={slotId} src={src} shape="rect" fit="cover"
                  placeholder={'Drop real footage to replace: ' + cap}
                  style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>}
          </div>
          <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: SKY, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
            {frames ? '3D Flythrough · Rendered Model' : '3D Preliminary Model · Shown Against Real Site'}
          </div>
          <StatusBadge kind={status} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 70px 30px', background: 'linear-gradient(0deg, rgba(3,7,11,0.95) 40%, transparent 100%)', pointerEvents: 'none' }}>
            <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>{loc}</div>
            <div style={{ fontFamily: FH, fontSize: 30, fontWeight: 700, color: TXT_HI, marginTop: 4 }}>{cap}</div>
            {stat && <div style={{ fontFamily: FB, fontSize: 17, color: TXT_SUB, marginTop: 6 }}>{stat}</div>}
          </div>
        </FadeBox>
      </React.Fragment>
    );
  }

  // ── Animated "plant to be built" overlay on the site-overview satellite shot ──
  function PlantFootprintOverlay({ start, end }) {
    const time = useTime();
    const t = clamp((time - start) / (end - start), 0, 1);
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.9);
    const scanY = 130 + ((time - start) * 90) % 300;
    return (
      <Sprite start={start} end={end}>
        <div style={{ position: 'absolute', left: W * 0.52, top: H * 0.34, width: 360, height: 230, pointerEvents: 'none', opacity: interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0]) }}>
          <div style={{ position: 'absolute', inset: 0, border: `2px solid ${GOLD}`, borderRadius: 6, boxShadow: `0 0 ${18 + pulse * 14}px rgba(251,183,8,${0.35 + pulse * 0.25})`, background: `rgba(251,183,8,${0.06 + pulse * 0.05})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: scanY % 230, height: 2, background: `rgba(143,224,255,${0.7})`, boxShadow: '0 0 10px rgba(143,224,255,0.9)' }} />
          <div style={{ position: 'absolute', left: 10, top: -34, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 2.5, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '5px 12px', borderRadius: 4, border: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
            Plant Footprint — Proposed
          </div>
        </div>
      </Sprite>
    );
  }

  // ── Real Google Maps satellite capture (site + region) ──────────────────
  // Smooth eased zoom that lands centered on a focus point (fx,fy as 0..1).
  // Note: source captures are 870px wide — deep zoom will soften (upscaling).
  function MapImg({ src, fx = 0.5, fy = 0.5, fromZoom = 1.03, toZoom = 1.18 }) {
    const { localTime, duration } = useSprite();
    const d = Math.max(0.001, duration);
    const p = Math.min(1, Math.max(0, localTime / d));
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
    const zoom = fromZoom + (toZoom - fromZoom) * e;
    const tx = (0.5 - fx) * 100;
    const ty = (0.5 - fy) * 100;
    const fade = Math.min(1, localTime / 0.5) * Math.min(1, Math.max(0, (duration - localTime) / 0.4));
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: fade }}>
        <img src={src} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${zoom}) translate(${tx * e}%, ${ty * e}%)`,
          transformOrigin: '50% 50%', imageRendering: 'auto', willChange: 'transform',
        }} />
      </div>
    );
  }

  function MapShot({ start, end, src, loc, cap, stat, status = 'EXISTING', fx = 0.5, fy = 0.5, toZoom = 1.16 }) {
    useEdit();
    const bid = mkBid(start, end);
    loc = EditStore.label(bid, 'Location', loc);
    cap = EditStore.label(bid, 'Caption', cap);
    stat = EditStore.label(bid, 'Detail', stat);
    return (
      <Sprite start={start} end={end} label={cap || loc || 'Map'} beatId={bid} fields={[['Location', loc], ['Caption', cap], ['Detail', stat]]}>
        <MapImg src={src} fx={fx} fy={fy} toZoom={toZoom} />
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.4} exitDur={0.35}>
          <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
            Google Maps &middot; Real Satellite Imagery
          </div>
          <StatusBadge kind={status} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '26px 70px 34px', background: 'linear-gradient(0deg, rgba(3,7,11,0.92) 30%, transparent 100%)' }}>
            <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>{loc}</div>
            <div style={{ fontFamily: FH, fontSize: 30, fontWeight: 700, color: TXT_HI, marginTop: 4 }}>{cap}</div>
            {stat && <div style={{ fontFamily: FB, fontSize: 17, color: TXT_SUB, marginTop: 6 }}>{stat}</div>}
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── Real CAD drawing reference insert ───────────────────────────────────
  function CadReference({ start, end, src, title, sub }) {
    useEdit();
    const bid = mkBid(start, end);
    title = EditStore.label(bid, 'Title', title);
    sub = EditStore.label(bid, 'Sub', sub);
    return (
      <Sprite start={start} end={end} label={title} beatId={bid} fields={[['Title', title], ['Sub', sub]]}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 90% at 50% 40%, #0d1f2c 0%, ${INK} 72%)` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(0,144,224,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(0,144,224,0.10) 1px, transparent 1px)`, backgroundSize: '46px 46px', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 70, borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.96)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
            <ImageSprite src={src} x={0} y={0} width={W - 140} height={H - 140} radius={0} fit="contain" kenBurns kenBurnsScale={1.05} entryDur={0.5} exitDur={0.4} />
          </div>
        </div>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.4} exitDur={0.3}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: '30px 60px', background: 'linear-gradient(180deg, rgba(5,10,15,0.88) 40%, transparent 100%)' }}>
            <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase' }}>Engineering Reference &middot; Real CAD Drawing</div>
            <div style={{ fontFamily: FH, fontSize: 26, fontWeight: 700, color: TXT_HI, marginTop: 4 }}>{title}</div>
            {sub && <div style={{ fontFamily: FB, fontSize: 16, color: TXT_SUB, marginTop: 4 }}>{sub}</div>}
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── Closing aerial placeholder w/ energy-flow overlay ───────────────────
  function ClosingAerial({ start, end }) {
    return (
      <Sprite start={start} end={end} label="Closing aerial">
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <VideoSlot id="closing-aerial" label="Closing aerial" stock="assets/footage/sm/closing_aerial.mp4" start={0} end={Math.max(0.5, end - start)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72) saturate(1.03)' }} />
        </div>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.6} exitDur={0.7}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,11,0.15) 0%, rgba(3,7,11,0.35) 55%, rgba(3,7,11,0.85) 100%)' }} />
          <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
            Aerial B-Roll
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center' }}>
            <div style={{ fontFamily: FH, fontSize: 44, fontWeight: 700, color: TXT_HI }}>Fishwater Flats Biogas Facility</div>
            <div style={{ fontFamily: FB, fontSize: 24, color: BLUE, marginTop: 10 }}>Powering a sustainable future for Nelson Mandela Bay</div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── End card ─────────────────────────────────────────────────────────────
  function EndCard({ start, end }) {
    const col = (title, lines) => (
      <div style={{ minWidth: 480 }}>
        <div style={{ fontFamily: FH, fontSize: 16, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: BLUE, marginBottom: 12 }}>{title}</div>
        {lines.map((l, i) => <div key={i} style={{ fontFamily: FB, fontSize: 18, color: TXT_SUB, marginBottom: 6 }}>{l}</div>)}
      </div>
    );
    return (
      <Sprite start={start} end={end} label="End card">
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.7} exitDur={0.6}>
          <div style={{ position: 'absolute', inset: 0, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <img src="assets/Straits_Energy_Holdings.png" style={{ height: 140 }} />
                <div style={{ fontFamily: FH, fontSize: 12, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: TXT_SUB }}>Project Owner</div>
                <div style={{ fontFamily: FH, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: BLUE }}>Powered by EnergiDrop</div>
              </div>
              <div style={{ width: 2, height: 54, background: BORDER }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <img src="assets/EnergiDrop_Logo_Transparent.png" style={{ height: 74 }} />
                <div style={{ fontFamily: FH, fontSize: 12, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: BLUE }}>Power &amp; Project Management</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 70 }}>
              {col('Commercial Status', ['Environmental & waste approvals — Completed', 'Phase 1 pilot — Completed', 'CO₂ offtake — term sheet, in finalisation', 'Biomethane & EPC/O&M — in development'])}
              {col('Timeline (indicative)', ['Financial close — target 2026', 'Commercial operations — target 2028'])}
              {col('Who Does What', ['Straits Energy — Project Owner', 'EnergiDrop — Power & Project Management', 'EPC / Technology Partner', 'Specialist Co-Developer'])}
            </div>
            <div style={{ fontFamily: FH, fontSize: 20, color: TXT_HI, letterSpacing: 1 }}>www.straits.energy</div>
            <div style={{ fontFamily: FB, fontSize: 14, color: TXT_DIM, maxWidth: 900, textAlign: 'center', marginTop: 6 }}>
              Project under development — subject to financial close and regulatory approvals.
            </div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── VO / SOT script — synced reference track, mapped to this cut's actual
  // (re-timed) beats. Sourced from FWF-BIO-PROMO-VID-SCRIPT-2026-07, Option B
  // opening (Markman Canal, not the reopened Brighton Beach). ─────────────────
  const VO_SCRIPT = [
    { start: 0,   end: 5,   type: 'SILENT', text: 'Logo hold over black — ambient music only, no VO. SHOT: title card, no footage.' },
    { start: 5,   end: 15,  type: 'SILENT', text: 'No narration — ambient wind/water only. SHOT: real satellite aerial approach, slow push to site. Let the pictures open the film.' },
    { start: 15,  end: 23,  type: 'VO',     text: '"Fishwater Flats treats more than sixty percent of Gqeberha’s wastewater — and when capacity runs short, the estuary feels it first." SHOT: scene-outfall, span 8, plays once. Tone = strained, NOT scandalous.' },
    { start: 23,  end: 35,  type: 'SOT',    text: 'NMBM Official SOT, no VO under it. SHOT: outdoor, WWTW perimeter, treatment infrastructure behind subject. Constructive tone — evolving infrastructure need, NOT municipal failure.' },
    { start: 35,  end: 43,  type: 'TEXT',   text: 'Three stat cards ~2.7 s each, no VO: ~155 ML/day (subject to confirmation) · ~74 t/day dry solids · since 1976. SHOT: stat stills. NOTE: statbg_site shows a plant that is NOT FWF — interim only, swap on real site photography.' },
    { start: 43,  end: 49,  type: 'VO',     text: '"One-point-two million people — and one site at the centre of it all." SHOT: regional map → metro map; the idea lands as the map resolves onto Fishwater Flats.' },
    { start: 49,  end: 57,  type: 'VO',     text: '"The Fishwater Flats Biogas Facility is being built on the existing municipal site — turning a liability into a multi-revenue green infrastructure asset." SHOT: calibrated CAD footprint overlay on real satellite. Matches on-screen caption.' },
    { start: 57,  end: 63,  type: 'VO',     text: '"It begins with what the city already produces — sludge, food waste, fats, oils and greases." SHOT: 01 · Feedstock In nodes. BED: blockflow-bg — RECAST to a >=20 s water-treatment plate (current 5.3 s clip freezes for 14.8 s).' },
    { start: 63,  end: 68,  type: 'VO',     text: '"Three co-digesters break that blend down over twenty-one days." SHOT: 02 · Anaerobic Digestion, CSTR node lights. Nm³/h and methane figures stay ON SCREEN, not in the read — the beat cannot hold them.' },
    { start: 68,  end: 77,  type: 'VO',     text: '"And what comes out is five things at once — biomethane, electricity, food-grade CO₂, digestate, and recovered water." SHOT: 03 · Products Out, five nodes cascade.' },
    { start: 77,  end: 84,  type: 'SILENT', text: 'No VO — genset runs under its own sound. SHOT: scene-chp, span 7. ⚠ Incumbent shows generic pipe racks, NOT a genset — REAL SHOOT PRIORITY №1 under the film’s strongest factual claim.' },
    { start: 84,  end: 98,  type: 'SOT',    text: 'Straits Energy engineering SOT alone, no VO. SHOT: outdoor, standing at the Phase 1 pilot CHP unit.' },
    { start: 98,  end: 146, type: 'TEXT',   text: 'No VO by design — music drives; title (3 s) + ten impact cards (4.5 s each). SHOT: every impact slot span 4.5. Recasts pending clip uploads: 02→Household_Food_Waste (window vStart 6 / vEnd 10.5 — opening 4 s measures motion 80, too busy under text), 04→Aerial_WWTP, 07→Abstract_Alcohol (verified CO₂ tanks), 09→Wood_Chips (retires the anchovies). Keep 01, 03, 05, 06, 08, 10.' },
    { start: 146, end: 162, type: 'SOT',    text: 'Straits Energy Principal SOT closes the section, no VO under or after. SHOT: indoor, office, warm light.' },
    { start: 162, end: 170, type: 'VO',     text: '"And this isn’t a concept. The Phase One pilot is running today — exporting fifty kilowatts into the municipal grid." SHOT: Proof of Concept model still, status COMPLETED.' },
    { start: 170, end: 177, type: 'VO',     text: '"The land is there. The feedstock is there. The partnerships are in place." SHOT: close-orbital satellite; VO and on-screen caption land together.' },
    { start: 177, end: 185, type: 'VO',     text: '"All on the existing municipal footprint — between estuary and ocean — where Phases Two and Three will rise." SHOT: existing-site map → coastal flythrough base.' },
    { start: 185, end: 195, type: 'VO',     text: '"This is the Phase Two and Three layout — every structure placed from the actual engineering drawings." SHOT: CAD-derived site diagram flythrough (real vector-extracted positions).' },
    { start: 195, end: 205, type: 'VO',     text: '"Three high-solids digesters form the core of the plant, working each blend for around twenty-one days." SHOT: full plant model → Triton digester row.' },
    { start: 205, end: 215, type: 'VO',     text: '"Six CHP modules feed up to five megawatts into the works’ own grid — while the gas holder and upgrading train turn raw biogas into pipeline-ready biomethane." SHOT: CHP block → gas holder + BGU.' },
    { start: 215, end: 225, type: 'VO',     text: '"A cryogenic unit recovers thirty tonnes of food-grade CO₂ a day — and the receiving zone earns gate fees on every load of organics that arrives." SHOT: CO₂ vessel → feedstock receiving.' },
    { start: 225, end: 241, type: 'SOT',    text: 'EPC technology-partner SOT alone, no VO. SHOT: indoor, commissioning / plant-floor. Name and logo only once disclosure is confirmed.' },
    { start: 241, end: 256, type: 'SILENT', text: 'No VO — ambient and on-screen stats only; highest-engagement shots in the Victor Valley reference. SHOT: scene-cng span 6 (⚠ shows a valve, not a tube trailer — recast or retitle the beat), scene-co2 span 4, pipeline corridor map. NOTE: on-screen label reads 7.7 km (locked KMZ 7.69 km).' },
    { start: 256, end: 267, type: 'VO',     text: '"Fishwater Flats Biogas Facility. Powering a sustainable future for Nelson Mandela Bay." Read slowly, let the final seconds breathe. SHOT: closing-aerial, span follows beat. ⚠ Incumbent is a European WWTW, not FWF — recast to a dome-digester biogas-plant aerial when uploaded.' },
    { start: 267, end: 282, type: 'SILENT', text: 'No VO — end card carries status, indicative timeline, roles and contact. Music fades to silence on the final frame.' },
  ];

  const VO_TYPE_COLOR = { VO: BLUE, SOT: GOLD, TEXT: SKY, SILENT: GRAY };
  const VO_TYPE_LABEL = { VO: 'VOICEOVER', SOT: 'INTERVIEW SOT', TEXT: 'ON-SCREEN TEXT ONLY', SILENT: 'NO NARRATION' };

  function ScriptDrawer({ script = VO_SCRIPT }) {
    const time = useTime();
    const [open, setOpen] = React.useState(false);
    let current = script[0];
    for (const line of script) if (time >= line.start) current = line;
    const tone = VO_TYPE_COLOR[current.type];

    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            position: 'absolute', right: 24, top: 24, pointerEvents: 'auto', cursor: 'pointer',
            fontFamily: FH, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: TXT_HI, background: 'rgba(5,10,15,0.7)', border: `1px solid ${BORDER}`, borderRadius: 6,
            padding: '8px 14px',
          }}
        >
          {open ? 'Hide Script' : 'VO / Script'}
        </button>

        {!open && (
          <div style={{
            position: 'absolute', right: 24, top: 68, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end',
            fontFamily: FB, fontSize: 14, color: 'rgba(230,240,248,0.55)',
            background: 'rgba(5,10,15,0.5)', borderRadius: 6, padding: '6px 12px', width: 'fit-content', marginLeft: 'auto',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: tone, flexShrink: 0 }} />
            <span style={{ fontFamily: FH, fontWeight: 700, letterSpacing: 1, color: tone, fontSize: 12 }}>{VO_TYPE_LABEL[current.type]}</span>
          </div>
        )}

        {open && (
          <div style={{
            position: 'absolute', right: 24, top: 68, width: 560, maxHeight: H - 110, overflowY: 'auto',
            pointerEvents: 'auto', background: 'rgba(5,10,17,0.94)', border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: '18px 20px',
          }}>
            <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>
              VO Script &amp; Interview Cue Sheet
            </div>
            {script.map((line, i) => {
              const active = current === line;
              return (
                <div key={i} style={{
                  padding: '10px 12px', marginBottom: 6, borderRadius: 6,
                  background: active ? 'rgba(0,144,224,0.14)' : 'transparent',
                  border: active ? `1px solid ${BLUE}` : '1px solid transparent',
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontFamily: FH, fontSize: 12, fontWeight: 700, color: TXT_DIM }}>
                      {Math.floor(line.start / 60)}:{String(line.start % 60).padStart(2, '0')}
                    </span>
                    <span style={{ fontFamily: FH, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: VO_TYPE_COLOR[line.type] }}>
                      {VO_TYPE_LABEL[line.type]}
                    </span>
                  </div>
                  <div style={{ fontFamily: FB, fontSize: 14, color: TXT_HI, lineHeight: 1.45, fontStyle: line.type === 'VO' ? 'italic' : 'normal' }}>
                    {line.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Subtitles / closed captions ───────────────────────────────────────────
  // One in-stage caption track per cut (appears in exports). Reads the cut's
  // script: narration (VO) is captioned verbatim (matches the voice); key
  // on-screen facts (TEXT) are captioned; interview (SOT) and card-run beats
  // already show their own on-screen text, so they are skipped to avoid doubling.
  const CCStore = (() => {
    let on = true;
    try { const v = localStorage.getItem('fwf_cc'); if (v !== null) on = v === '1'; } catch (e) {}
    const subs = new Set();
    return {
      get: () => on,
      set: (v) => { on = !!v; try { localStorage.setItem('fwf_cc', on ? '1' : '0'); } catch (e) {} subs.forEach(f => f()); },
      subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
    };
  })();
  function useCC() {
    const [, force] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => CCStore.subscribe(force), []);
    return CCStore.get();
  }
  function cleanSub(line) {
    if (!line) return null;
    const t = line.type;
    if (t === 'SILENT' || t === 'SOT') return null;
    const txt = String(line.text || '');
    const qm = txt.match(/["“”]([^"“”]+)["”]/);
    if (t === 'VO') return qm ? qm[1] : null;
    if (t === 'TEXT') {
      if (/\bcards?\b/i.test(txt)) return null;
      let s = txt.replace(/\([^()]*\)/g, '').trim();
      const c = s.indexOf(':'); if (c > -1 && c < 42) s = s.slice(c + 1).trim();
      s = s.replace(/\.?\s*No VO\.?$/i, '').trim();
      return s || null;
    }
    return null;
  }
  function SubtitleTrack({ script = VO_SCRIPT }) {
    const time = useTime();
    const on = useCC();
    React.useEffect(() => {
      if (document.getElementById('fwf-sub-kf')) return;
      const el = document.createElement('style');
      el.id = 'fwf-sub-kf';
      el.textContent = '@keyframes fwfSubIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(el);
    }, []);
    if (!on) return null;
    let line = null;
    for (const l of script) if (time >= l.start && time < l.end) line = l;
    const text = cleanSub(line);
    if (!text) return null;
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 40, padding: '0 140px', boxSizing: 'border-box' }}>
        <div key={text} style={{
          maxWidth: 1360,
          display: 'flex', alignItems: 'stretch', gap: 0,
          animation: 'fwfSubIn 0.34s cubic-bezier(0.22,0.61,0.36,1) both',
          filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.55))',
        }}>
          <div style={{ width: 4, borderRadius: '3px 0 0 3px', background: `linear-gradient(180deg, ${GOLD}, ${BLUE})`, flexShrink: 0 }} />
          <div style={{
            textAlign: 'center', fontFamily: FB, fontSize: 30, fontWeight: 500, lineHeight: 1.36,
            letterSpacing: 0.1, color: '#f4f8fb', textWrap: 'balance',
            padding: '13px 30px',
            background: 'linear-gradient(180deg, rgba(6,12,18,0.62), rgba(3,7,11,0.82))',
            backdropFilter: 'blur(9px) saturate(1.1)', WebkitBackdropFilter: 'blur(9px) saturate(1.1)',
            border: `1px solid ${BORDER}`, borderLeft: 'none', borderRadius: '0 8px 8px 0',
            textShadow: '0 1px 6px rgba(0,0,0,0.7)',
          }}>
            {text}
          </div>
        </div>
      </div>
    );
  }

  // ── Narrator — browser TTS voiceover, female South African (en-ZA) voice.
  // Speaks only VO-type lines, synced to the playhead. Preview-only: speech-
  // synthesis audio is system audio and is NOT captured by the video exporter
  // (record real VO separately for the final mp4). Portaled out of the Stage. ─
  function Narrator({ script = VO_SCRIPT }) {
    const { time, playing } = useTimeline();
    const [enabled, setEnabled] = React.useState(false);
    const cc = useCC();
    const [voices, setVoices] = React.useState([]);
    const [voiceURI, setVoiceURI] = React.useState(() => { try { return localStorage.getItem('fwf_vo_voice') || ''; } catch (e) { return ''; } });
    const lastIdxRef = React.useRef(-1);

    React.useEffect(() => {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const load = () => setVoices(synth.getVoices().filter(v => /^en/i.test(v.lang)));
      load();
      synth.addEventListener('voiceschanged', load);
      return () => synth.removeEventListener('voiceschanged', load);
    }, []);

    // Auto-pick a refined South African English female voice (private-school /
    // standard SA accent). en-ZA female first; then any en-ZA; then a female
    // British/English voice as the nearest refined-accent fallback.
    const autoVoice = React.useMemo(() => {
      const female = /leah|female|aria|zoe|zira|woman|thandi|nomsa|ayanda|naledi|lindiwe|tessa|nozomi/i;
      const male = /luke|male\b|\bman\b|david|mark|guy|ryan/i;
      const vs = voices;
      if (!vs.length) return null;
      const za = vs.filter(v => /en[-_]?za/i.test(v.lang));
      return (
        za.find(v => female.test(v.name)) ||
        za.find(v => !male.test(v.name)) ||
        za[0] ||
        vs.find(v => /en[-_]?gb/i.test(v.lang) && female.test(v.name)) ||
        vs.find(v => female.test(v.name)) ||
        vs.find(v => /en[-_]?gb/i.test(v.lang)) ||
        vs[0] || null
      );
    }, [voices]);
    const voice = React.useMemo(() => (voiceURI && voices.find(v => v.voiceURI === voiceURI)) || autoVoice, [voiceURI, voices, autoVoice]);
    const isZA = !!voice && /en[-_]?za/i.test(voice.lang);
    const voiceLabel = voice ? voice.name + ' · ' + voice.lang : '';

    let activeIdx = -1;
    for (let i = 0; i < script.length; i++) if (time >= script[i].start && time < script[i].end) activeIdx = i;

    React.useEffect(() => {
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (!enabled) { synth.cancel(); lastIdxRef.current = -1; return; }
      const line = script[activeIdx];
      if (!line || line.type !== 'VO') {
        if (lastIdxRef.current !== -1) { synth.cancel(); lastIdxRef.current = -1; }
        return;
      }
      if (activeIdx === lastIdxRef.current) return;
      // Don't start speaking while paused or scrubbing — wait for playback to
      // resume so narration always begins in sync with the beat it belongs to.
      if (!playing) return;
      lastIdxRef.current = activeIdx;
      let text = String(line.text).replace(/\([^()]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ');
      const m = text.match(/["""]([^"""]+)[""]/) || text.match(/"([^"]+)"/);
      if (m) text = m[1];
      text = text.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const u = new SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = 'en-ZA'; }
      // Pace the line to fit its beat window so narration stays locked to the
      // subtitles/visuals instead of drifting past the cut.
      const words = text.split(/\s+/).filter(Boolean).length;
      const estSec = words / 2.1;                         // measured en-ZA (Tessa) pace @ rate 1.0
      const beatSec = Math.max(1, (line.end - line.start) - 0.4);
      u.rate = Math.min(1.45, Math.max(0.9, estSec / beatSec));
      u.pitch = 1.0;
      try { synth.cancel(); synth.resume(); synth.speak(u); } catch (e) {}
    }, [enabled, activeIdx, voice, script, playing]);

    // Pause/resume the voice with the timeline (never leave it talking over a
    // paused frame), and keep Chrome's speech engine alive past its ~15s cutoff.
    React.useEffect(() => {
      const synth = window.speechSynthesis;
      if (!synth || !enabled) return;
      if (playing) { try { synth.resume(); } catch (e) {} }
      else { try { if (synth.speaking) synth.pause(); } catch (e) {} }
    }, [playing, enabled]);

    React.useEffect(() => {
      if (!enabled) return;
      const synth = window.speechSynthesis;
      if (!synth) return;
      const iv = setInterval(() => {
        try { if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); } } catch (e) {}
      }, 9000);
      return () => clearInterval(iv);
    }, [enabled]);

    React.useEffect(() => () => { try { window.speechSynthesis.cancel(); } catch (e) {} }, []);

    const toggle = () => {
      const synth = window.speechSynthesis;
      setEnabled(prev => {
        const nx = !prev;
        if (synth) {
          if (nx) {
            // Unlock speech inside the user gesture (Chrome/Safari autoplay policy).
            try { synth.cancel(); synth.resume(); const p = new SpeechSynthesisUtterance('.'); p.volume = 0; synth.speak(p); } catch (e) {}
            lastIdxRef.current = -1;
          } else { synth.cancel(); }
        }
        return nx;
      });
    };

    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const RD = window.ReactDOM;
    const el = React.useMemo(() => document.createElement('div'), []);
    React.useEffect(() => { document.body.appendChild(el); return () => { try { document.body.removeChild(el); } catch (e) {} }; }, [el]);

    const panel = (
      <div style={{ position: 'fixed', left: '50%', top: 16, transform: 'translateX(-50%)', zIndex: 2147483000,
        display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(5,10,17,0.92)',
        border: '1px solid ' + BORDER, borderRadius: 8, padding: '7px 12px 7px 9px', boxShadow: '0 6px 24px rgba(0,0,0,0.45)' }}>
        <button onClick={toggle} disabled={!supported} style={{ cursor: supported ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', gap: 8, fontFamily: FH, fontSize: 12, fontWeight: 700,
          letterSpacing: 1.5, textTransform: 'uppercase', color: enabled ? INK : TXT_HI,
          background: enabled ? GOLD : 'rgba(255,255,255,0.06)', border: '1px solid ' + (enabled ? GOLD : BORDER),
          borderRadius: 6, padding: '7px 12px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: enabled ? INK : GRAY, display: 'inline-block' }} />
          {enabled ? 'Narration On' : 'Narrate Script'}
        </button>
        <button onClick={() => CCStore.set(!cc)} title="Toggle subtitles" style={{ cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7, fontFamily: FH, fontSize: 12, fontWeight: 700,
          letterSpacing: 1.5, textTransform: 'uppercase', color: cc ? INK : TXT_HI,
          background: cc ? BLUE : 'rgba(255,255,255,0.06)', border: '1px solid ' + (cc ? BLUE : BORDER),
          borderRadius: 6, padding: '7px 12px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cc ? INK : GRAY, display: 'inline-block' }} />
          {cc ? 'Subtitles On' : 'Subtitles'}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FH, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: isZA ? BLUE : GOLD, whiteSpace: 'nowrap' }}>
              {supported ? (isZA ? 'South African voice' : (voiceLabel ? 'Nearest English voice' : 'Loading voices…')) : 'TTS unavailable'}
            </span>
            {supported && (
              <select value={voiceURI} onChange={e => { setVoiceURI(e.target.value); try { localStorage.setItem('fwf_vo_voice', e.target.value); } catch (x) {} }}
                style={{ fontFamily: FB, fontSize: 11, color: TXT_HI, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + BORDER, borderRadius: 5, padding: '3px 6px', maxWidth: 240 }}>
                <option value="">Auto — {voiceLabel || '…'}</option>
                {voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}</option>)}
              </select>
            )}
          </div>
          <span style={{ fontFamily: FB, fontSize: 10, color: TXT_DIM, whiteSpace: 'nowrap' }}>
            {supported ? 'Refined SA English · synthetic preview — cast real VO for the final' : 'Browser has no speech synthesis'}
          </span>
        </div>
      </div>
    );
    if (RD && RD.createPortal) return RD.createPortal(panel, el);
    return panel;
  }

  // ── Opening statement — problem + what Straits Energy is doing, over the
  // opening aerial. Overlays the existing beat window (no retiming). ──────────
  function OpeningStatement({ start, end, problem, action }) {
    useEdit();
    const bid = mkBid(start, end);
    problem = EditStore.label(bid, 'Problem', problem);
    action = EditStore.label(bid, 'Straits action', action);
    return (
      <Sprite start={start} end={end} label="Opening statement" beatId={bid} fields={[['Problem', problem], ['Straits action', action]]}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.6} exitDur={0.5}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,7,11,0.94) 0%, rgba(3,7,11,0.78) 46%, rgba(3,7,11,0.34) 100%)' }} />
          <div style={{ position: 'absolute', left: 72, top: 0, bottom: 0, width: 980, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30 }}>
            <div>
              <div style={{ fontFamily: FH, fontSize: 16, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>The Challenge</div>
              <div style={{ fontFamily: FH, fontSize: 42, fontWeight: 600, lineHeight: 1.18, color: TXT_HI, textWrap: 'balance' }}>{problem}</div>
            </div>
            <div style={{ width: 120, height: 3, background: BLUE }} />
            <div>
              <div style={{ fontFamily: FH, fontSize: 16, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: BLUE, marginBottom: 14 }}>What Straits Energy Is Doing</div>
              <div style={{ fontFamily: FB, fontSize: 27, fontWeight: 400, lineHeight: 1.4, color: TXT_SUB, textWrap: 'pretty' }}>{action}</div>
            </div>
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── Full timeline assembly ───────────────────────────────────────────────
  function FWFVideo() {
    return (
      <window.Stage width={W} height={H} duration={282} background={INK} persistKey="fwf-video">
        <FootageManagerPortal cut="Full Cut" />
        <BaseBg />
        <ScriptDrawer />
        <Narrator />
        <SubtitleTrack />
        <TitleCard start={0} end={5} />
        <MapShot start={5} end={15} src="assets/maps/gmaps_metro_wide.png" loc="Aerial Approach · Fishwater Flats WWTW" fx={0.6} fy={0.62} toZoom={1.28} cap="Gqeberha — Where the Coast Meets Capacity" stat="Real satellite view · WWTW outfall + coastline in frame" />
        <OpeningStatement start={5} end={15} problem="Fishwater Flats treats most of Gqeberha’s wastewater — and after decades of service, its sludge now strains the plant, the estuary and the coastline." action="Straits Energy is building an integrated biogas facility on the existing municipal site — converting that waste into clean energy, food-grade CO₂, fertiliser and recovered water." />
        <OutfallScene start={15} end={23} />
        <QuoteCard start={23} end={35} name="NMBM Official" role="Nelson Mandela Bay Municipality · Water & Sanitation"
          setting="Outdoor — WWTW perimeter, treatment infrastructure behind"
          quote="This plant carries the bay every single day. As the city has grown, so has the volume of sludge we have to manage responsibly — and that's exactly the challenge this project was built to meet." />
        <StatCard start={35} end={37.7} big="~155 ML/day" small="Wastewater received at Fishwater Flats WWTW (subject to confirmation)" bg="assets/statbg_water.jpg" />
        <StatCard start={37.7} end={40.3} big="~74 t/day" small="Dry sludge solids to be responsibly managed" bg="assets/statbg_solids.jpg" />
        <StatCard start={40.3} end={43} big="Since 1976" small="Original plant infrastructure — capacity needs have evolved" bg="assets/statbg_site.jpg" />
        <MapShot start={43} end={46} src="assets/maps/gmaps_eastern_cape_regional.png" loc="Eastern Cape · Nelson Mandela Bay" cap="Gqeberha — 1.2 million people" stat="Chronic infrastructure strain at the metro's edge" />
        <MapShot start={46} end={49} src="assets/maps/gmaps_metro_wide.png" loc="Gqeberha Metro" cap="Fishwater Flats WWTW" stat="Existing municipal site · Google Maps satellite" />

        <PlantFootprintOverlay start={49} end={57} />
        <MapShot start={49} end={57} src="assets/maps/gmaps_site_overview.png" loc="Fishwater Flats WWTW · Site Overview" cap="One site — turned into a multi-revenue green infrastructure asset" stat="WWTW boundary · proposed plant footprint · satellite-verified" />
        <BlockFlowScene base={57} />
        <CHPScene start={77} end={84} />
        <QuoteCard start={84} end={98} name="Straits Energy — Engineering" role="Transactional Engineering Advisor · Straits Energy Holdings"
          setting="Outdoor — standing at the Phase 1 pilot CHP unit"
          quote="What makes this unique is the co-digestion. We're not just processing municipal sludge — we're pulling in source-separated food waste, FOG and organic residues — and that combination significantly increases the biogas yield." />

        <BenefitsSection base={98} />
        <QuoteCard start={146} end={162} name="Straits Energy Principal" role="Straits Energy Holdings · Project Developer"
          setting="Indoor — office, warm light"
          quote="This is not a single-product energy project. This is an integrated infrastructure solution — every waste stream creates a revenue stream, and every revenue stream strengthens the investment case." />

<ModelShot start={162} end={170} src="assets/3d/07-3d.png" loc="Proof of Concept" cap="Phase 1 Pilot — Operational" stat="50 kWe exported to NMBM LV grid — live today, not a render" status="COMPLETED" />
        <ChapterTitle num="05" title="Why This Project Can Happen" start={162} />        <MapShot start={170} end={177} src="assets/maps/gmaps_site_close_orbital.png" loc="Fishwater Flats WWTW — Close Orbital" cap="The land is there. The feedstock is there." stat="Real satellite view · WWTW boundary, plant footprint and pipelines mapped in" />
        <MapShot start={177} end={181} src="assets/maps/gmaps_site_overview.png" loc="Fishwater Flats WWTW · Gqeberha" cap="The Existing Municipal Site" stat="Where Phases 2 & 3 will be built · Google Maps satellite" status="EXISTING" fx={0.66} fy={0.78} toZoom={1.5} />
        <MapShot start={181} end={185} src="assets/maps/fwf_site_layout.png" loc="Between the Estuary & the Indian Ocean" cap="On the Nelson Mandela Bay Coast" stat="Existing WWTW footprint · real satellite imagery" status="EXISTING" fx={0.6} fy={0.58} toZoom={1.5} />
        <FlyThroughScene start={185} end={195} />
        <ModelShot start={195} end={200} src="assets/3d/plant_3d_pdf.jpg" seq="full" loc="Interactive 3D Model · Full Plant" cap="3D Preliminary Plant Model" stat="3× Triton digesters · CHP complex · gas holder dome — downloadable 3D model" />
        <ModelShot start={200} end={205} src="assets/3d/02-3d.png" seq="digesters" loc="NE Elevation · Triton Digester Row" cap="Three Triton Digesters — The Process Core" stat="3× high-solids CSTR · mesophilic · ~21-day HRT · target >95% availability" />
        <ModelShot start={205} end={210} src="assets/3d/04-3d.png" seq="chp" loc="CHP + Transformer Block" cap="2 MWe → 5 MWe Embedded Generation" stat="6× CHP modules · embedded into WWTW 22kV ring main" />
        <ModelShot start={210} end={215} src="assets/3d/05-3d.png" seq="holder" loc="Gas Holder Dome + BGU" cap="Biogas Storage & Upgrading" stat="CO₂ offtake — term sheet, in finalisation · CNG + 7.7 km pipeline (in development)" status="DEVELOPMENT" />
        <ModelShot start={215} end={220} src="assets/3d/06-3d.png" seq="co2" loc="Cryogenic CO₂ Vessel · Close-Up" cap="Food-Grade Liquid CO₂" stat="~30 tpd · food/beverage-grade · cryogenic liquefaction" status="FINALISATION" />
        <ModelShot start={220} end={225} src="assets/3d/09-3d.png" seq="feedstock" loc="Feedstock Receiving Zone" cap="Co-Digestion Intake" stat="Live bottom bins · FOG tank · blending tanks — gate-fee revenue" />
        <QuoteCard start={225} end={241} name="EPC Technology Partner" role="Anaerobic Digestion Technology Provider (to be named on disclosure)"
          setting="Indoor — commissioning / plant-floor setting"
          quote="This is a proven co-digestion platform. What's being done at Fishwater Flats is deploying that proven technology where the environmental need — and the commercial case — are both exceptionally strong." />
        <CNGScene start={241} end={247} />
        <CO2Scene start={247} end={251} />
        <MapShot start={251} end={256} src="assets/maps/gmaps_pipeline_corridor_coast.png" loc="Biomethane Pipeline Corridor" cap="7.7 km anchor pipeline route" stat="Dedicated route to nearby industry · in development" />
        <ClosingAerial start={256} end={267} />

        {/* SECTION 5 — Call to Action */}
        <EndCard start={267} end={282} />
        {/* Chapter markers last so they paint above every full-bleed beat (time-gated) */}
        <ChapterTitle num="01" title="The Place and the Problem" start={5} />
        <ChapterTitle num="02" title="The Central Idea" start={49} />
        <ChapterTitle num="03" title="How the System Works" start={57} />
        <ChapterTitle num="04" title="Why It Matters" start={98} />
        <ChapterTitle num="05" title="Why This Project Can Happen" start={162} />
        <ChapterTitle num="06" title="The Future State" start={256} />
      </window.Stage>
    );
  }

  // ── 3-MINUTE REGULATOR CUT ────────────────────────────────────────────────
  // Condensed, stakeholder-neutral edit for municipal/regulatory audiences.
  // Focus: environmental relief, waste diversion, operational continuity, safety
  // and community benefit. Investor/commercial framing (revenue-stream language,
  // financial-close timeline, investment-case quote) is deliberately omitted.
  const REG_SCRIPT = [
    { start: 0,   end: 5,   type: 'SILENT', text: 'Logo hold — ambient music only.' },
    { start: 5,   end: 13,  type: 'VO',     text: '"Fishwater Flats treats most of Gqeberha’s wastewater — and decades of sludge now strain the plant and the coastline."' },
    { start: 13,  end: 21,  type: 'VO',     text: '"When the works run at capacity, it shows first in the outfall and estuary that carry the city’s water out to sea."' },
    { start: 21,  end: 31,  type: 'SOT',    text: 'NMBM Official SOT — evolving capacity need, constructive tone. On-screen quote card carries this beat.' },
    { start: 31,  end: 40,  type: 'VO',     text: '"Every day the works receive about 155 million litres of wastewater and 74 tonnes of dry sludge — on infrastructure first built in 1976."' },
    { start: 40,  end: 49,  type: 'VO',     text: '"The facility is built on the existing municipal site — no new land is taken — turning a treatment liability into managed green infrastructure."' },
    { start: 49,  end: 59,  type: 'VO',     text: '"It begins with what the city already produces — municipal sludge, plus source-separated food waste, fats, oils and greases."' },
    { start: 59,  end: 69,  type: 'VO',     text: '"Those are co-digested over about twenty-one days, and the biogas is upgraded and recovered into five useful outputs — in a process that stays fully enclosed and continuously monitored."' },
    { start: 69,  end: 76,  type: 'VO',     text: '"A pilot plant is already running on site today, generating renewable power and exporting it to the municipal grid."' },
    { start: 76,  end: 87,  type: 'SOT',    text: 'Straits Energy engineering SOT — co-digestion & operational-continuity explainer. On-screen quote card carries this beat.' },
    { start: 87,  end: 95,  type: 'VO',     text: '"The benefits reach right across the region — environmental relief, waste diverted from landfill, water recovered, and local jobs created."' },
    { start: 95,  end: 117, type: 'TEXT',   text: 'Regional & community impact cards — the icon cards carry each statement; no VO to keep the rhythm.' },
    { start: 117, end: 124, type: 'VO',     text: '"This is not a concept — the Phase 1 pilot is running now, exporting fifty kilowatts to the grid."' },
    { start: 124, end: 138, type: 'VO',     text: '"The full plant sits on the existing footprint, and every structure is placed from the actual engineering drawings."' },
    { start: 138, end: 156, type: 'VO',     text: '"Three enclosed digesters, a combined-heat-and-power block growing toward five megawatts, and gas upgrading — all engineered with gas-handling, storage and site-interface safety built in from the start."' },
    { start: 156, end: 166, type: 'SOT',    text: 'EPC technology-partner SOT — proven-platform credibility beat. On-screen quote card carries this beat.' },
    { start: 166, end: 174, type: 'VO',     text: '"Fishwater Flats Biogas Facility — powering a cleaner, more resilient future for Nelson Mandela Bay."' },
    { start: 174, end: 186, type: 'SILENT', text: 'End card carries status coding, delivery roles and contact. Music fades to silence.' },
  ];

  function FWFRegulatorCut() {
    const B = Object.fromEntries(BENEFITS.map(b => [b.icon, b]));
    return (
      <window.Stage width={W} height={H} duration={186} background={INK} persistKey="fwf-regulator">
        <FootageManagerPortal cut="Regulator Cut" />
        <BaseBg />
        <ScriptDrawer script={REG_SCRIPT} />
        <Narrator script={REG_SCRIPT} />
        <SubtitleTrack script={REG_SCRIPT} />
        <TitleCard start={0} end={5} />

        {/* CH.01 — The place and the problem */}
        <MapShot start={5} end={13} src="assets/maps/gmaps_metro_wide.png" loc="Aerial Approach · Fishwater Flats WWTW" fx={0.6} fy={0.62} toZoom={1.28} cap="Gqeberha — Where the Coast Meets Capacity" stat="Real satellite view · WWTW outfall + coastline in frame" />
        <OpeningStatement start={5} end={13} problem="Fishwater Flats treats most of Gqeberha’s wastewater — and after decades of service, its sludge now strains the plant, the estuary and the coastline." action="Straits Energy is building an integrated biogas facility on the existing municipal site — managing that waste responsibly and recovering clean energy, water and nutrients." />
        <OutfallScene start={13} end={21} />
        <QuoteCard start={21} end={31} name="NMBM Official" role="Nelson Mandela Bay Municipality · Water & Sanitation"
          setting="Outdoor — WWTW perimeter, treatment infrastructure behind"
          quote="This plant carries the bay every single day. As the city has grown, so has the volume of sludge we have to manage responsibly — and that's exactly the challenge this project was built to meet." />
        <StatCard start={31} end={34} big="~155 ML/day" small="Wastewater received at Fishwater Flats WWTW (subject to confirmation)" bg="assets/statbg_water.jpg" />
        <StatCard start={34} end={37} big="~74 t/day" small="Dry sludge solids to be responsibly managed" bg="assets/statbg_solids.jpg" />
        <StatCard start={37} end={40} big="Since 1976" small="Original plant infrastructure — capacity needs have evolved" bg="assets/statbg_site.jpg" />

        {/* CH.02 — The solution, on the existing site */}
        <PlantFootprintOverlay start={40} end={49} />
        <MapShot start={40} end={49} src="assets/maps/gmaps_site_overview.png" loc="Fishwater Flats WWTW · Site Overview" cap="Built on the existing municipal footprint — no new land take" stat="WWTW boundary · proposed plant footprint · satellite-verified" />

        {/* CH.03 — How the system works */}
        <BlockFlowScene base={49} />
        <CHPScene start={69} end={76} />
        <QuoteCard start={76} end={87} name="Straits Energy — Engineering" role="Transactional Engineering Advisor · Straits Energy Holdings"
          setting="Outdoor — standing at the Phase 1 pilot CHP unit"
          quote="What makes this work is the co-digestion. We combine municipal sludge with source-separated food waste, FOG and organic residues — a fully enclosed, continuously monitored process that runs alongside the existing works without interrupting it." />

        {/* CH.04 — Why it matters (region · environment · community) */}
        <BenefitCard start={87}  end={92}  item={B.wave}     tone={BLUE} />
        <BenefitCard start={92}  end={97}  item={B.landfill} tone={GOLD} />
        <BenefitCard start={97}  end={102} item={B.water}    tone={SKY} />
        <BenefitCard start={102} end={107} item={B.check}    tone={BLUE} />
        <BenefitCard start={107} end={112} item={B.bolt}     tone={GOLD} />
        <BenefitCard start={112} end={117} item={B.people}   tone={SKY} />

        {/* CH.05 — Why this can happen (proven, engineered, safe) */}
        <ModelShot start={117} end={124} src="assets/3d/07-3d.png" loc="Proof of Concept" cap="Phase 1 Pilot — Operational" stat="50 kWe exported to NMBM LV grid — live today, not a render" status="COMPLETED" />
        <MapShot start={124} end={128} src="assets/maps/gmaps_site_overview.png" loc="Fishwater Flats WWTW · Gqeberha" cap="The Existing Municipal Site" stat="Where Phases 2 & 3 will be built · Google Maps satellite" status="EXISTING" fx={0.66} fy={0.78} toZoom={1.5} />
        <FlyThroughScene start={128} end={138} />
        <ModelShot start={138} end={144} src="assets/3d/plant_3d_pdf.jpg" seq="full" loc="Interactive 3D Model · Full Plant" cap="3D Preliminary Plant Model" stat="3× high-solids CSTR · mesophilic · ~21-day HRT · target >95% availability" />
        <ModelShot start={144} end={150} src="assets/3d/04-3d.png" seq="chp" loc="CHP + Transformer Block" cap="2 MWe → 5 MWe Embedded Generation" stat="6× CHP modules · embedded into WWTW 22kV ring main" />
        <ModelShot start={150} end={156} src="assets/3d/05-3d.png" seq="holder" loc="Gas Holder Dome + BGU" cap="Enclosed Gas Handling & Upgrading" stat="Gas-handling, storage & WWTW-interface safety engineered in · in development" status="DEVELOPMENT" />
        <QuoteCard start={156} end={166} name="EPC Technology Partner" role="Anaerobic Digestion Technology Provider (to be named on disclosure)"
          setting="Indoor — commissioning / plant-floor setting"
          quote="This is a proven co-digestion platform. What's being done at Fishwater Flats is deploying that proven technology where the environmental need is exceptionally strong." />

        {/* CH.06 — Future state */}
        <ClosingAerial start={166} end={174} />
        <EndCard start={174} end={186} />

        {/* Chapter markers last so they paint above every full-bleed beat */}
        <ChapterTitle num="01" title="The Place and the Problem" start={5} />
        <ChapterTitle num="02" title="One Site, Managed Better" start={40} />
        <ChapterTitle num="03" title="How the System Works" start={49} />
        <ChapterTitle num="04" title="Why It Matters for the Region" start={87} />
        <ChapterTitle num="05" title="Proven, Engineered, Safe" start={117} />
        <ChapterTitle num="06" title="A Cleaner Future for the Bay" start={166} />
      </window.Stage>
    );
  }

  // ── 3-MINUTE INVESTOR CUT ─────────────────────────────────────────────────
  // Condensed edit for investors/funders. Leads with the commercial thesis,
  // frames the five outputs as five revenue streams, foregrounds de-risking
  // (proven pilot, complete design, executed/in-finalisation offtakes) and
  // closes on status coding, indicative timeline and delivery roles (the Ask).
  const INV_SCRIPT = [
    { start: 0,   end: 5,   type: 'SILENT', text: 'Logo hold — ambient music only.' },
    { start: 5,   end: 13,  type: 'VO',     text: '"Fishwater Flats treats most of Gqeberha’s wastewater — turning every waste stream into a revenue stream."' },
    { start: 13,  end: 23,  type: 'SOT',    text: 'Straits Energy Principal SOT — integrated-infrastructure investment thesis. On-screen quote card carries this beat.' },
    { start: 23,  end: 32,  type: 'VO',     text: '"The feedstock is already secured — 155 million litres of wastewater and 74 tonnes of sludge a day, on an established site."' },
    { start: 32,  end: 41,  type: 'VO',     text: '"Built on that existing footprint, this is a de-risked platform — a treatment liability converted into a multi-revenue green infrastructure asset."' },
    { start: 41,  end: 51,  type: 'VO',     text: '"Two waste streams feed it — municipal sludge, plus source-separated food waste, fats, oils and greases brought in for a gate fee."' },
    { start: 51,  end: 61,  type: 'VO',     text: '"One continuous process, five products out — biomethane, renewable power, food-grade CO₂, digestate and recovered water. Five outputs, five revenue lines."' },
    { start: 61,  end: 68,  type: 'VO',     text: '"And it is already proven — a Phase 1 pilot is running today, exporting power to the grid."' },
    { start: 68,  end: 79,  type: 'SOT',    text: 'Straits Energy engineering SOT — co-digestion raises biogas yield, and therefore revenue. On-screen quote card carries this beat.' },
    { start: 79,  end: 87,  type: 'VO',     text: '"Each output is a revenue line — gate fees on incoming waste, grid power, biomethane offtake, food-grade CO₂, digestate products and jobs."' },
    { start: 87,  end: 109, type: 'TEXT',   text: 'Revenue & value cards — the icon cards carry each line; no VO to keep the rhythm.' },
    { start: 109, end: 116, type: 'VO',     text: '"This is a shovel-ready platform, not a concept — the pilot is operational now, exporting fifty kilowatts to the grid."' },
    { start: 116, end: 130, type: 'VO',     text: '"The design is complete and laid out on the existing footprint — every structure placed from the actual engineering drawings."' },
    { start: 130, end: 148, type: 'VO',     text: '"Three high-solids digesters form the core; gas upgrading and a cryogenic unit add a food-grade CO₂ offtake in finalisation, while the receiving zone earns gate fees on more than two hundred tonnes of organics a day."' },
    { start: 148, end: 158, type: 'SOT',    text: 'EPC technology-partner SOT — proven platform, exceptionally strong commercial case. On-screen quote card carries this beat.' },
    { start: 158, end: 164, type: 'VO',     text: '"A dedicated seven-point-seven-kilometre pipeline connects the plant to secured industrial demand nearby."' },
    { start: 164, end: 172, type: 'VO',     text: '"Fishwater Flats Biogas Facility — an integrated, multi-revenue infrastructure investment for Nelson Mandela Bay."' },
    { start: 172, end: 186, type: 'SILENT', text: 'End card carries commercial status, indicative timeline (financial close / COD) and delivery roles — the Ask. Music fades to silence.' },
  ];

  function FWFInvestorCut() {
    const B = Object.fromEntries(BENEFITS.map(b => [b.icon, b]));
    return (
      <window.Stage width={W} height={H} duration={186} background={INK} persistKey="fwf-investor">
        <FootageManagerPortal cut="Investor Cut" />
        <BaseBg />
        <ScriptDrawer script={INV_SCRIPT} />
        <Narrator script={INV_SCRIPT} />
        <SubtitleTrack script={INV_SCRIPT} />
        <TitleCard start={0} end={5} />

        {/* CH.01 — The opportunity */}
        <MapShot start={5} end={13} src="assets/maps/gmaps_metro_wide.png" loc="Aerial Approach · Fishwater Flats WWTW" fx={0.6} fy={0.62} toZoom={1.28} cap="Gqeberha — A Secured-Feedstock Infrastructure Asset" stat="Real satellite view · WWTW outfall + coastline in frame" />
        <OpeningStatement start={5} end={13} problem="Fishwater Flats treats most of Gqeberha’s wastewater — decades of sludge and organic waste that must be managed, at scale, every day." action="Straits Energy is building an integrated biogas facility on the existing site — turning every waste stream into a revenue stream." />
        <QuoteCard start={13} end={23} name="Straits Energy Principal" role="Straits Energy Holdings · Project Developer"
          setting="Indoor — office, warm light"
          quote="This is not a single-product energy project. This is an integrated infrastructure solution — every waste stream creates a revenue stream, and every revenue stream strengthens the investment case." />
        <StatCard start={23} end={26} big="~155 ML/day" small="Wastewater received — a large, secured feedstock base (subject to confirmation)" bg="assets/statbg_water.jpg" />
        <StatCard start={26} end={29} big="~74 t/day" small="Dry sludge solids — base-load digester feed" bg="assets/statbg_solids.jpg" />
        <StatCard start={29} end={32} big="Since 1976" small="Established municipal site — no greenfield land or permitting risk" bg="assets/statbg_site.jpg" />

        {/* CH.02 — The asset */}
        <PlantFootprintOverlay start={32} end={41} />
        <MapShot start={32} end={41} src="assets/maps/gmaps_site_overview.png" loc="Fishwater Flats WWTW · Site Overview" cap="One site — a multi-revenue green infrastructure asset" stat="WWTW boundary · proposed plant footprint · satellite-verified" />

        {/* CH.03 — Five revenue streams */}
        <BlockFlowScene base={41} />
        <CHPScene start={61} end={68} />
        <QuoteCard start={68} end={79} name="Straits Energy — Engineering" role="Transactional Engineering Advisor · Straits Energy Holdings"
          setting="Outdoor — standing at the Phase 1 pilot CHP unit"
          quote="What makes this unique is the co-digestion. We're not just processing municipal sludge — we're pulling in source-separated food waste, FOG and organic residues — and that combination significantly increases the biogas yield." />

        {/* CH.04 — The commercial case (revenue lines) */}
        <BenefitCard start={79}  end={84}  item={B.landfill} tone={GOLD} />
        <BenefitCard start={84}  end={89}  item={B.bolt}     tone={BLUE} />
        <BenefitCard start={89}  end={94}  item={B.pipe}     tone={SKY} />
        <BenefitCard start={94}  end={99}  item={B.co2}      tone={GOLD} />
        <BenefitCard start={99}  end={104} item={B.brick}    tone={BLUE} />
        <BenefitCard start={104} end={109} item={B.people}   tone={SKY} />

        {/* CH.05 — De-risked & deliverable */}
        <ModelShot start={109} end={116} src="assets/3d/07-3d.png" loc="Proof of Concept" cap="Phase 1 Pilot — Operational" stat="50 kWe exported to NMBM LV grid — live today, not a render" status="COMPLETED" />
        <MapShot start={116} end={120} src="assets/maps/gmaps_site_overview.png" loc="Fishwater Flats WWTW · Gqeberha" cap="The Existing Municipal Site" stat="Design complete · where Phases 2 & 3 will be built" status="EXISTING" fx={0.66} fy={0.78} toZoom={1.5} />
        <FlyThroughScene start={120} end={130} />
        <ModelShot start={130} end={136} src="assets/3d/plant_3d_pdf.jpg" seq="full" loc="Interactive 3D Model · Full Plant" cap="3D Preliminary Plant Model" stat="3× Triton digesters · CHP complex · gas holder dome — downloadable 3D model" />
        <ModelShot start={136} end={142} src="assets/3d/05-3d.png" seq="holder" loc="Gas Holder Dome + BGU" cap="Biogas Storage & Upgrading" stat="CO₂ offtake — term sheet, in finalisation · CNG + 7.7 km pipeline (in development)" status="FINALISATION" />
        <ModelShot start={142} end={148} src="assets/3d/09-3d.png" seq="feedstock" loc="Feedstock Receiving Zone" cap="Co-Digestion Intake — Gate-Fee Revenue" stat="Live bottom bins · FOG tank · blending tanks — >200 t/day organics" />
        <QuoteCard start={148} end={158} name="EPC Technology Partner" role="Anaerobic Digestion Technology Provider (to be named on disclosure)"
          setting="Indoor — commissioning / plant-floor setting"
          quote="This is a proven co-digestion platform. What's being done at Fishwater Flats is deploying that proven technology where the environmental need — and the commercial case — are both exceptionally strong." />

        {/* CH.06 — The ask */}
        <MapShot start={158} end={164} src="assets/maps/gmaps_pipeline_corridor_coast.png" loc="Biomethane Pipeline Corridor" cap="7.7 km anchor pipeline route" stat="Dedicated route to secured industrial demand · in development" />
        <ClosingAerial start={164} end={172} />
        <EndCard start={172} end={186} />

        {/* Chapter markers last so they paint above every full-bleed beat */}
        <ChapterTitle num="01" title="The Opportunity" start={5} />
        <ChapterTitle num="02" title="The Asset" start={32} />
        <ChapterTitle num="03" title="Five Revenue Streams" start={41} />
        <ChapterTitle num="04" title="The Commercial Case" start={79} />
        <ChapterTitle num="05" title="De-Risked & Deliverable" start={109} />
        <ChapterTitle num="06" title="The Ask" start={164} />
      </window.Stage>
    );
  }

  // ── 90-SECOND SOCIAL CUT ──────────────────────────────────────────────────
  // Fast, visual-first edit for social feeds (LinkedIn / YouTube 16:9). Hook in
  // the first 3 seconds, rapid stat + impact beats, minimal narration, no
  // talking-head SOT and no chapter cards. Ends on the brand line + CTA.
  const SOCIAL_SCRIPT = [
    { start: 0, end: 3, type: 'SILENT', text: 'Logo snap — punchy stinger, no VO.' },
    { start: 3, end: 9, type: 'VO', text: '"Gqeberha’s biggest wastewater works is under pressure. Straits Energy is turning that waste into clean energy."' },
    { start: 9, end: 14, type: 'VO', text: '"As the city grows, so does the sludge that has to be managed responsibly."' },
    { start: 14, end: 22, type: 'TEXT', text: 'Rapid on-screen facts (subject to confirmation): ~155 ML/day intake · ~74 t/day dry solids. No VO.' },
    { start: 22, end: 28, type: 'VO', text: '"One site turns that liability into green infrastructure — on the existing municipal footprint."' },
    { start: 28, end: 38, type: 'VO', text: '"Two waste streams in, five products out — biomethane, renewable power, food-grade CO\u2082, fertiliser and recovered water."' },
    { start: 38, end: 54, type: 'TEXT', text: 'Impact highlight cards — landfill diversion, grid power, biomethane pipeline, food-grade CO\u2082. Music-driven, no VO.' },
    { start: 54, end: 64, type: 'VO', text: '"The pilot is already running. The design is complete. The land is there."' },
    { start: 64, end: 80, type: 'SILENT', text: '3D model, CO\u2082 vessel and pipeline corridor run on music + on-screen stats. No VO.' },
    { start: 80, end: 85, type: 'VO', text: '"Fishwater Flats Biogas Facility. Powering a sustainable future for Nelson Mandela Bay."' },
    { start: 85, end: 90, type: 'SILENT', text: 'End card — brand line + contact. Music button-out.' },
  ];

  function FWFSocial90() {
    const B = Object.fromEntries(BENEFITS.map(b => [b.icon, b]));
    return (
      <window.Stage width={W} height={H} duration={90} background={INK} persistKey="fwf-social90">
        <FootageManagerPortal cut="Social Cut" />
        <BaseBg />
        <ScriptDrawer script={SOCIAL_SCRIPT} />
        <Narrator script={SOCIAL_SCRIPT} />
        <SubtitleTrack script={SOCIAL_SCRIPT} />
        <TitleCard start={0} end={3} />

        {/* Hook + problem */}
        <MapShot start={3} end={9} src="assets/maps/gmaps_metro_wide.png" loc="Fishwater Flats WWTW · Gqeberha" fx={0.6} fy={0.62} toZoom={1.32} cap="Where the Coast Meets Capacity" stat="Real satellite view · WWTW outfall + coastline" />
        <OpeningStatement start={3} end={9} problem="Gqeberha’s biggest wastewater works is under pressure — and its sludge shows up first on the coast." action="Straits Energy is turning that waste into clean energy — on the site that already exists." />
        <OutfallScene start={9} end={14} />
        <StatCard start={14} end={18} big="~155 ML/day" small="Wastewater received at Fishwater Flats WWTW (subject to confirmation)" bg="assets/statbg_water.jpg" />
        <StatCard start={18} end={22} big="~74 t/day" small="Dry sludge solids to be responsibly managed" bg="assets/statbg_solids.jpg" />

        {/* The idea */}
        <PlantFootprintOverlay start={22} end={28} />
        <MapShot start={22} end={28} src="assets/maps/gmaps_site_overview.png" loc="Fishwater Flats WWTW · Site Overview" cap="One site — a multi-revenue green infrastructure asset" stat="Built on the existing municipal footprint — no new land take" status="EXISTING" fx={0.66} fy={0.78} toZoom={1.5} />
        <ModelShot start={28} end={33} src="assets/3d/plant_3d_pdf.jpg" seq="full" loc="Interactive 3D Model · Full Plant" cap="What's Being Built" stat="3× Triton digesters · CHP complex · gas holder dome" status="DEVELOPMENT" />
        <CHPScene start={33} end={38} />

        {/* Impact highlights (rapid) */}
        <BenefitCard start={38} end={42} item={B.landfill} tone={GOLD} />
        <BenefitCard start={42} end={46} item={B.bolt}     tone={BLUE} />
        <BenefitCard start={46} end={50} item={B.pipe}     tone={SKY} />
        <BenefitCard start={50} end={54} item={B.co2}      tone={GOLD} />

        {/* Proof + build */}
        <ModelShot start={54} end={59} src="assets/3d/07-3d.png" loc="Proof of Concept" cap="Phase 1 Pilot — Operational" stat="50 kWe exported to NMBM LV grid — live today, not a render" status="COMPLETED" />
        <MapShot start={59} end={64} src="assets/maps/gmaps_site_close_orbital.png" loc="Fishwater Flats WWTW — Close Orbital" cap="The land is there. The feedstock is there." stat="Real satellite view · plant footprint + pipelines mapped in" />
        <ModelShot start={64} end={70} src="assets/3d/02-3d.png" seq="digesters" loc="NE Elevation · Triton Digester Row" cap="Three Digesters — The Process Core" stat="3× high-solids CSTR · mesophilic · ~21-day HRT" />
        <CO2Scene start={70} end={75} />
        <MapShot start={75} end={80} src="assets/maps/gmaps_pipeline_corridor_coast.png" loc="Biomethane Pipeline Corridor" cap="7.7 km anchor pipeline route" stat="Dedicated route to nearby industry · in development" />

        {/* Close */}
        <ClosingAerial start={80} end={85} />
        <EndCard start={85} end={90} />
      </window.Stage>
    );
  }

  window.FWFVideo = FWFVideo;
  window.FWFRegulatorCut = FWFRegulatorCut;
  window.FWFInvestorCut = FWFInvestorCut;
  window.FWFSocial90 = FWFSocial90;
})();
