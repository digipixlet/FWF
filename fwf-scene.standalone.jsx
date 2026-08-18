// FWF Biogas Facility — promotional video scene, built on animations.jsx (Stage/Sprite).
// Brand: EnergiDrop (blue / gold-flame / sky / gray) — colors sampled from EnergiDrop_Logo_Whiteback.png.
// Runtime target: 4:00 (240s), matching FWF-BIO-PROMO-VID-STORYBOARD-2026-04.
// No live footage exists yet — DRONE/GROUND/PILOT beats render as clearly-labelled
// placeholder frames; interview beats render as styled sound-bite quote cards.

(function () {
  const { Sprite, TextSprite, ImageSprite, Easing, interpolate, clamp, useSprite, useTime } = window;

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
  function SceneShell({ tag, title, stat, children }) {
    const slotId = 'footage-' + tag.toLowerCase() + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    return (
      <FadeBox x={0} y={0} width={W} height={H}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 90% at 50% 30%, #0d1f2c 0%, ${INK} 70%)` }} />
        <div style={{ position: 'absolute', inset: 0 }}>
          <image-slot id={slotId} shape="rect" fit="cover"
            placeholder={tag + ' — drop real footage still: ' + title}
            style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>
        </div>
        <div style={{ position: 'absolute', inset: 40, border: `2px dashed ${BORDER}`, borderRadius: 14, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 90, top: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 300, color: GOLD, lineHeight: 1 }}>+</div>
          <div style={{ fontFamily: FB, fontSize: 14, color: SKY, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>Drop {tag.toLowerCase()} footage here</div>
        </div>
        <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}`, pointerEvents: 'none' }}>
          {tag} &middot; Animated Placeholder — Footage Pending
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
      <Sprite start={start} end={end}>
        <OutfallSceneInner />
      </Sprite>
    );
  }
  function OutfallSceneInner() {
    const { localTime } = useSprite();
    const dashOffset = -((localTime * 46) % 40);
    const level = 0.42 + 0.06 * Math.sin(localTime * 1.1);
    return (
        <SceneShell tag="GROUND" title="WWTW Outfall / Consolidation Tank" stat="Fishwater Flats WWTW · Gqeberha, Eastern Cape">
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
      <Sprite start={start} end={end}>
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
        <SceneShell tag="LIVE PILOT" title="Phase 1 Pilot CHP Unit — Running Today" stat="Phase 1 Pilot Plant · operational now · exported to NMBM LV grid">
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
      <Sprite start={start} end={end}>
        <CNGSceneInner />
      </Sprite>
    );
  }
  function CNGSceneInner() {
    const { localTime } = useSprite();
    const dashOffset = -((localTime * 60) % 36);
    const fill = Math.min(1, localTime / 4);
    return (
        <SceneShell tag="GROUND" title="CNG Tube Trailer at Loading Bay" stat="Biomethane offtake · CNG virtual pipeline to Perseverance">
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
      <Sprite start={start} end={end}>
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
        <SceneShell tag="GROUND" title="CO₂ Cryogenic Storage Vessel" stat="30 tpd · Cryogenic food-grade CO₂">
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
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(60% 60% at 72% 40%, rgba(0,144,224,0.16) 0%, transparent 70%), ${INK}`,
          }} />
          {/* simulated bokeh backdrop */}
          <div style={{ position: 'absolute', right: 160, top: 160, width: 260, height: 260, borderRadius: '50%', background: 'rgba(251,183,8,0.10)', filter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', right: 380, top: 500, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,144,224,0.14)', filter: 'blur(6px)' }} />

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
      </Sprite>
    );
  }

  // ── Title card ───────────────────────────────────────────────────────────
  function TitleCard({ start, end }) {
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.8} exitDur={0.6}>
          <div style={{ position: 'absolute', inset: 0, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
            <img src={window.__resources.res_Straits_Energy_Holdings_png} style={{ height: 70 }} />
            <div style={{ width: 90, height: 3, background: BLUE }} />
            <img src={window.__resources.res_EnergiDrop_Logo_Transparent_png} style={{ height: 96, filter: 'drop-shadow(0 0 30px rgba(0,144,224,0.25))' }} />
            <div style={{ fontFamily: FH, fontSize: 64, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: TXT_HI, textAlign: 'center' }}>
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

  // ── Stat sequence (Section 1) ───────────────────────────────────────────
  function StatCard({ start, end, big, small }) {
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H}>
          <div style={{ position: 'absolute', inset: 0, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 200px' }}>
            <div style={{ fontFamily: FH, fontWeight: 800, fontSize: 78, color: BLUE, textAlign: 'center', lineHeight: 1.1 }}>{big}</div>
            <div style={{ fontFamily: FB, fontSize: 26, color: TXT_SUB, textAlign: 'center' }}>{small}</div>
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

  function BlockFlowScene({ base }) {
    const t = base; // section start (53)
    return (
      <React.Fragment>
        <Sprite start={t} end={t + 20}>
          <FadeBox x={0} y={40} width={W} height={90} entryDur={0.4} exitDur={0.3} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FH, fontSize: 22, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: BLUE }}>
              Process Block Flow
            </div>
          </FadeBox>
        </Sprite>

        {/* Inputs */}
        <FlowNode start={t + 0} end={t + 20} x={120} y={330} w={330} label="WWTW Sludge" sub="Primary + secondary, ~12–14% TS" />
        <FlowNode start={t + 2} end={t + 20} x={120} y={480} w={330} label="Food Waste / FOG" sub="Organic residues, co-digestion feed" />

        {/* lines to process */}
        <FlowLine start={t + 4} end={t + 20} points="450,395 620,405 780,470" />
        <FlowLine start={t + 4} end={t + 20} points="450,545 620,510 780,470" />

        {/* Process */}
        <FlowNode start={t + 4} end={t + 20} x={790} y={410} w={340} tone={GOLD} label="3× CSTR Mesophilic Co-Digesters" sub="Anaergia design · Phase 2/3" />

        {/* lines to outputs */}
        <FlowLine start={t + 7} end={t + 20} points="1130,460 1300,300 1470,255" />
        <FlowLine start={t + 9.5} end={t + 20} points="1130,470 1300,420 1470,405" />
        <FlowLine start={t + 12} end={t + 20} points="1130,490 1300,540 1470,555" />
        <FlowLine start={t + 14.5} end={t + 20} points="1130,510 1300,660 1470,705" />
        <FlowLine start={t + 17} end={t + 20} points="1130,520 1300,780 1470,855" />

        {/* Outputs */}
        <FlowNode start={t + 7} end={t + 20} x={1480} y={220} w={330} tone={BLUE} label="Biomethane (CNG)" sub="Automotive offtake · Perseverance" />
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
    { icon: 'wave', metric: 'Ocean protection', label: 'IMPACT 01', desc: 'Odour & discharge complaints resolved at source' },
    { icon: 'landfill', metric: '50,000+ t/yr', label: 'IMPACT 02', desc: 'Organic waste diverted from landfill' },
    { icon: 'water', metric: 'Water recovery', label: 'IMPACT 03', desc: 'Treated water reuse for arid Eastern Cape industry' },
    { icon: 'check', metric: 'Zero cost to NMBM', label: 'IMPACT 04', desc: 'Sludge stabilisation at no municipal expense' },
    { icon: 'bolt', metric: '2 → 5 MWe', label: 'IMPACT 05', desc: 'Renewable baseload to the municipal grid' },
    { icon: 'pipe', metric: '7.5 km pipeline', label: 'IMPACT 06', desc: 'Biomethane offtake to Perseverance Industrial' },
    { icon: 'co2', metric: '30 tpd CO₂', label: 'IMPACT 07', desc: 'Cryogenic food-grade carbon dioxide' },
    { icon: 'leaf', metric: 'Organic fertiliser', label: 'IMPACT 08', desc: 'Digestate for Eastern Cape agriculture' },
    { icon: 'brick', metric: 'Kiln feedstock', label: 'IMPACT 09', desc: 'Digestate cake supplied to regional brick kilns' },
    { icon: 'people', metric: '100+ jobs', label: 'IMPACT 10', desc: 'Construction, O&M and supply-chain employment' },
  ];

  function BenefitCard({ start, end, item, tone }) {
    return (
      <Sprite start={start} end={end}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${BLUE_INK} 0%, ${BLUE_DEEP} 140%)` }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.16, transform: 'scale(4.2)' }}>
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
            <div style={{ position: 'absolute', inset: 0, background: BLUE_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: FH, fontSize: 62, fontWeight: 900, color: TXT_HI, textAlign: 'center', letterSpacing: 1 }}>
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

  const SITE_KEYFRAMES = [
    { t: 0, x: 155, y: 120, z: 0.62, label: 'Fishwater Flats WWTW — full footprint', sub: 'Anaergia General Layout · 24-0503-A04-001' },
    { t: 2, x: 83, y: 81, z: 1.55, label: '3× CSTR Mesophilic Digesters', sub: 'Triton Digesters A / B / C · 43.2 m diameter each' },
    { t: 4, x: 196, y: 112, z: 1.5, label: 'CHP & Transformer Area', sub: 'Biogas holder · embedded generation' },
    { t: 6, x: 212, y: 138, z: 1.75, label: 'CO₂ Liquefaction & Gas Treatment', sub: 'Chemical scrubbers · activated carbon · chiller train' },
    { t: 8, x: 150, y: 115, z: 0.5, label: 'Biomethane Pipeline → Perseverance Industrial', sub: '7.5 km offtake route, north-west' },
  ];

  function interpKeyframes(local, key) {
    const times = SITE_KEYFRAMES.map(k => k.t);
    const vals = SITE_KEYFRAMES.map(k => k[key]);
    return interpolate(times, vals, Easing.easeInOutCubic)(local);
  }

  function SiteDiagramScene({ start, end }) {
    return (
      <Sprite start={start} end={end}>
        <SiteDiagramInner />
      </Sprite>
    );
  }

  function SiteDiagramInner() {
    const { localTime, duration } = useSprite();
    const focus = { x: interpKeyframes(localTime, 'x'), y: interpKeyframes(localTime, 'y') };
    const zoom = interpKeyframes(localTime, 'z');

    // active label (nearest keyframe segment)
    let active = SITE_KEYFRAMES[0];
    for (const k of SITE_KEYFRAMES) if (localTime >= k.t) active = k;
    const segT = Math.max(0, Math.min(1, (localTime - active.t) / 1.1));
    const labelOpacity = segT < 1 ? (segT < 0.15 ? segT / 0.15 : 1) : Math.max(0, 1 - (segT - 1) * 3);

    const entryFade = Math.min(1, localTime / 0.6);
    const exitFade = Math.min(1, Math.max(0, (duration - localTime) / 0.6));
    const boxOpacity = Math.min(entryFade, exitFade);

    const kbProgress = Math.max(0, Math.min(1, localTime / duration));
    const kbScale = 1.08 + kbProgress * 0.14;
    const kbX = -2 + kbProgress * -3;
    const kbY = -1 + kbProgress * -2;

    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: boxOpacity, background: INK }}>
        <img src={window.__resources.res_maps_gmaps_flythrough_base_png} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${kbScale}) translate(${kbX}%, ${kbY}%)`, filter: 'brightness(0.55) saturate(0.85)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,11,0.65) 0%, rgba(3,7,11,0.3) 40%, rgba(3,7,11,0.75) 100%)' }} />
        <div style={{ position: 'absolute', left: 60, top: 48, fontFamily: FH, fontSize: 20, fontWeight: 700, letterSpacing: 4, color: BLUE, textTransform: 'uppercase' }}>
          Phase 2/3 Plant Layout &middot; Anaergia Co-Digestion Design
        </div>
        <div style={{ position: 'absolute', left: 60, top: 78, fontFamily: FB, fontSize: 14, color: TXT_DIM }}>
          Satellite base imagery: Google Maps &middot; overlay: CAD-accurate structure positions
        </div>

        {STRUCTURES.map((s, i) => {
          if (s.shape === 'circle') {
            const p = worldToScreen(s.cx, s.cy, focus, zoom);
            const size = s.d * UNIT * zoom;
            return (
              <div key={i} style={{
                position: 'absolute', left: p.left, top: p.top, width: size, height: size,
                transform: 'translate(-50%,-50%)', borderRadius: '50%',
                border: `2px solid ${PHASE_COLOR[s.phase]}`, background: `${PHASE_COLOR[s.phase]}22`,
              }} />
            );
          }
          const p = worldToScreen(s.x, s.y, focus, zoom);
          const size = s.w * UNIT * zoom;
          return (
            <div key={i} style={{
              position: 'absolute', left: p.left, top: p.top, width: size, height: size * 0.7,
              transform: 'translate(-50%,-50%)', borderRadius: 3,
              border: `2px solid ${PHASE_COLOR[s.phase]}`, background: `${PHASE_COLOR[s.phase]}1c`,
            }} />
          );
        })}

        {/* pipeline indicator, appears in final keyframe */}
        <div style={{
          position: 'absolute', left: '8%', top: '30%', width: 3, height: 260, background: `repeating-linear-gradient(180deg, ${GOLD} 0 10px, transparent 10px 20px)`,
          opacity: Math.max(0, Math.min(1, (localTime - 8) / 1)), transform: 'rotate(28deg)',
        }} />

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: labelOpacity }}>
          <div style={{ fontFamily: FH, fontSize: 36, fontWeight: 700, color: TXT_HI }}>{active.label}</div>
          <div style={{ fontFamily: FB, fontSize: 19, color: TXT_SUB, marginTop: 6 }}>{active.sub}</div>
        </div>

        {/* legend */}
        <div style={{ position: 'absolute', right: 60, top: 48, display: 'flex', gap: 18, fontFamily: FB, fontSize: 14, color: TXT_SUB }}>
          {Object.entries(PHASE_COLOR).map(([k, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              {k}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Existing vs. Proposed status badge (top-right) ──────────────────────
  function StatusBadge({ kind }) {
    const isExisting = kind === 'EXISTING';
    const tone = isExisting ? SKY : GOLD;
    return (
      <div style={{ position: 'absolute', right: 60, top: 44, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FH, fontSize: 14, fontWeight: 700, letterSpacing: 2.5, color: tone, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: tone }} />
        {isExisting ? 'Existing on Site' : 'Proposed — To Be Built'}
      </div>
    );
  }

  // ── Real 3D preliminary-model stills (captured from fwf_3d_model_standalone.html) ──
  // Pre-filled with the real 3D-model capture; drag real drone/site footage onto it once
  // available to replace the render with the actual as-built shot (persists via image-slot).
  function ModelShot({ start, end, src, loc, cap, stat, status = 'PROPOSED' }) {
    const slotId = 'model-' + src.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return (
      <Sprite start={start} end={end}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <image-slot id={slotId} src={src} shape="rect" fit="cover"
            placeholder={'Drop real footage to replace: ' + cap}
            style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>
        </div>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.5} exitDur={0.4}>
          <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: SKY, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
            3D Preliminary Design Model &middot; Anaergia EPC
          </div>
          <StatusBadge kind={status} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '26px 70px 34px', background: 'linear-gradient(0deg, rgba(3,7,11,0.92) 30%, transparent 100%)', pointerEvents: 'none' }}>
            <div style={{ fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>{loc}</div>
            <div style={{ fontFamily: FH, fontSize: 30, fontWeight: 700, color: TXT_HI, marginTop: 4 }}>{cap}</div>
            {stat && <div style={{ fontFamily: FB, fontSize: 17, color: TXT_SUB, marginTop: 6 }}>{stat}</div>}
          </div>
        </FadeBox>
      </Sprite>
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
  function MapShot({ start, end, src, loc, cap, stat, status = 'EXISTING' }) {
    return (
      <Sprite start={start} end={end}>
        <ImageSprite src={src} x={0} y={0} width={W} height={H} radius={0} fit="cover" kenBurns kenBurnsScale={1.1} entryDur={0.5} exitDur={0.4} />
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
    return (
      <Sprite start={start} end={end}>
        <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
          <ImageSprite src={src} x={0} y={0} width={W} height={H} radius={0} fit="contain" kenBurns kenBurnsScale={1.05} entryDur={0.5} exitDur={0.4} />
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
      <Sprite start={start} end={end}>
        <ImageSprite src={window.__resources.res_maps_gmaps_flythrough_base_png} x={0} y={0} width={W} height={H} radius={0} fit="cover" kenBurns kenBurnsScale={1.12} entryDur={0.6} exitDur={0.7} />
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.6} exitDur={0.7}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,11,0.15) 0%, rgba(3,7,11,0.35) 55%, rgba(3,7,11,0.85) 100%)' }} />
          <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
            Google Maps &middot; Real Satellite Imagery
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
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.7} exitDur={0.6}>
          <div style={{ position: 'absolute', inset: 0, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <img src={window.__resources.res_Straits_Energy_Holdings_png} style={{ height: 64 }} />
              <div style={{ width: 2, height: 44, background: BORDER }} />
              <img src={window.__resources.res_EnergiDrop_Logo_Transparent_png} style={{ height: 78 }} />
            </div>
            <div style={{ display: 'flex', gap: 70 }}>
              {col('Agreements in Place', ['Sludge Supply & Lease Agreement', 'CO₂ Offtake Termsheet · PPA', 'Biomethane Offtake (Automotive)', 'EPC/O&M Selection In Progress'])}
              {col('Timeline', ['Financial Close — July 2026', 'Commercial Operations — July 2028'])}
              {col('Partners', ['Straits Energy · EnergiDrop', 'Anaergia · Sustain Energy Assets', 'DBSA · GetInvest · NMBM'])}
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
    { start: 0, end: 5, type: 'SILENT', text: 'Logo hold over black — ambient music only, no VO.' },
    { start: 5, end: 15, type: 'SILENT', text: 'No narration — ambient wind/water only. Let the pictures open the film.' },
    { start: 15, end: 23, type: 'VO', text: '"Fishwater Flats treats more than sixty percent of Gqeberha\u2019s wastewater. When the plant runs at the edge of its capacity, this is where it shows first — in the canals, the estuary, and the communities living alongside them."' },
    { start: 23, end: 35, type: 'SOT', text: 'NMBM Official SOT — no VO under it. Target line: "the infrastructure here has been under severe strain." (extended interview beat)' },
    { start: 35, end: 43, type: 'TEXT', text: 'Text-only, no VO: 8.5M tons landfilled/yr · R59bn load-shedding cost · Eastern Cape water scarcity.' },
    { start: 43, end: 49, type: 'VO', text: '"One site. One integrated solution." — spoken softly under the map animation (optional: cut to text-only if the edit runs VO-heavy here).' },
    { start: 49, end: 57, type: 'VO', text: '"The Fishwater Flats Biogas Facility is being built on the existing municipal site — turning a liability into a multi-revenue green infrastructure asset."' },
    { start: 57, end: 77, type: 'VO', text: '"Municipal sludge and food waste go in. Three mesophilic co-digesters break it down. What comes out is biomethane, electricity, food-grade carbon dioxide, clean water, and fertiliser — five revenue streams from one process."' },
    { start: 77, end: 84, type: 'SILENT', text: 'No VO — let the genset run under its own sound. On-screen stat only: Phase 1 Pilot, 50 kWe exported to NMBM LV grid.' },
    { start: 84, end: 98, type: 'SOT', text: 'Darius Boshoff SOT carries this beat alone — co-digestion explainer, no VO under it. (extended interview beat)' },
    { start: 98, end: 146, type: 'TEXT', text: 'No VO by design — music drives, on-screen icon cards carry all ten benefit statements. Do not add narration; it fights the rapid-cut rhythm.' },
    { start: 146, end: 162, type: 'SOT', text: 'Straits Energy Principal SOT closes the section — no VO under or after. (extended interview beat)' },
    { start: 162, end: 170, type: 'VO', text: '"The land is there. The feedstock is there. The partnerships are in place."' },
    { start: 170, end: 185, type: 'VO', text: '(VO continues under aerial + CAD reference inserts, playing into the Phase 2/3 line below.)' },
    { start: 185, end: 225, type: 'VO', text: '"This is what Phase 2 and 3 will look like once construction is complete — three high-solids digesters, a biomethane upgrading train, and a cryogenic CO\u2082 unit, all on the footprint you just saw from the air."' },
    { start: 225, end: 241, type: 'SOT', text: 'Yaniv Scherson SOT — EPC credibility beat, no VO under it. (extended interview beat)' },
    { start: 241, end: 256, type: 'SILENT', text: 'No VO — CNG loading, CO\u2082 vessel and pipeline shots run on ambient sound and on-screen stats only. Deliberate: these are the highest-engagement shots in the Victor Valley reference; narration would undercut them.' },
    { start: 256, end: 267, type: 'VO', text: '"Fishwater Flats Biogas Facility. Powering a sustainable future for Nelson Mandela Bay."' },
    { start: 267, end: 282, type: 'SILENT', text: 'No VO — end card text carries agreements, timeline and contact details. Music fades to silence on the final frame.' },
  ];

  const VO_TYPE_COLOR = { VO: BLUE, SOT: GOLD, TEXT: SKY, SILENT: GRAY };
  const VO_TYPE_LABEL = { VO: 'VOICEOVER', SOT: 'INTERVIEW SOT', TEXT: 'ON-SCREEN TEXT ONLY', SILENT: 'NO NARRATION' };

  function ScriptDrawer() {
    const time = useTime();
    const [open, setOpen] = React.useState(false);
    let current = VO_SCRIPT[0];
    for (const line of VO_SCRIPT) if (time >= line.start) current = line;
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
            {VO_SCRIPT.map((line, i) => {
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

  // ── Full timeline assembly ───────────────────────────────────────────────
  function FWFVideo() {
    return (
      <window.Stage width={W} height={H} duration={282} background={INK} persistKey="fwf-video">
        <BaseBg />
        <ScriptDrawer />
        <TitleCard start={0} end={5} />
        <MapShot start={5} end={15} src={window.__resources.res_maps_gmaps_metro_wide_png} loc="Aerial Approach · Fishwater Flats WWTW" cap="Gqeberha — Where the Coast Meets Capacity" stat="Real satellite view · WWTW outfall + coastline in frame" />
        <OutfallScene start={15} end={23} />
        <QuoteCard start={23} end={35} name="NMBM Official" role="Nelson Mandela Bay Municipality · Water & Sanitation"
          setting="Outdoor — WWTW perimeter, treatment infrastructure behind"
          quote="The infrastructure here has been under severe strain. We were out of compliance, we knew it — and the community was feeling it every day." />
        <StatCard start={35} end={37.7} big="8.5M tons" small="Organic waste landfilled in South Africa annually" />
        <StatCard start={37.7} end={40.3} big="R59 billion" small="Annual cost of load-shedding to the economy" />
        <StatCard start={40.3} end={43} big="Chronic scarcity" small="Water restrictions across the Eastern Cape" />
        <MapShot start={43} end={46} src={window.__resources.res_maps_gmaps_eastern_cape_regional_png} loc="Eastern Cape · Nelson Mandela Bay" cap="Gqeberha — 1.2 million people" stat="Chronic infrastructure strain at the metro's edge" />
        <MapShot start={46} end={49} src={window.__resources.res_maps_gmaps_metro_wide_png} loc="Gqeberha Metro" cap="Fishwater Flats WWTW" stat="Existing municipal site · Google Maps satellite" />

        <PlantFootprintOverlay start={49} end={57} />
        <MapShot start={49} end={57} src={window.__resources.res_maps_gmaps_site_overview_png} loc="Fishwater Flats WWTW · Site Overview" cap="One site — turned into a multi-revenue green infrastructure asset" stat="WWTW boundary · proposed plant footprint · satellite-verified" />
        <BlockFlowScene base={57} />
        <CHPScene start={77} end={84} />
        <QuoteCard start={84} end={98} name="Darius Boshoff" role="Transactional Engineering Advisor · Straits Energy"
          setting="Outdoor — standing at the Phase 1 pilot CHP unit"
          quote="What makes this unique is the co-digestion. We're not just processing municipal sludge — we're pulling in food waste, FOG, organic residues — and that combination significantly increases the biogas yield." />

        <BenefitsSection base={98} />
        <QuoteCard start={146} end={162} name="Straits Energy Principal" role="Straits Energy Holdings · Project Developer"
          setting="Indoor — office, warm light"
          quote="This is not a single-product energy project. This is an integrated infrastructure solution — every waste stream creates a revenue stream, and every revenue stream strengthens the investment case." />

<ModelShot start={162} end={170} src={window.__resources.res_3d_07_3d_png} loc="Proof of Concept" cap="Phase 1 Pilot — Operational" stat="50 kWe exported to NMBM LV grid — live today, not a render" />
        <MapShot start={170} end={177} src={window.__resources.res_maps_gmaps_site_close_orbital_png} loc="Fishwater Flats WWTW — Close Orbital" cap="The land is there. The feedstock is there." stat="Real satellite view · WWTW boundary, plant footprint and pipelines mapped in" />
        <CadReference start={177} end={181} src={window.__resources.res_cad_full_sheet_reference_png} title="General Layout Proposal" sub="Anaergia · Straits SA · Fishwater Flats · 24-0503-A04-001 · Rev 07" />
        <CadReference start={181} end={185} src={window.__resources.res_piping_routing_reference_jpg} title="Piping & Routing Reference" sub="Heating water · biogas above/below ground · same drawing set, same scale" />
        <SiteDiagramScene start={185} end={195} />
        <ModelShot start={195} end={200} src={window.__resources.res_3d_01_3d_png} loc="The Solution · Full Plant Overview" cap="Anaergia Preliminary Plant Design" stat="3× Triton digesters · CHP complex · gas holder dome" />
        <ModelShot start={200} end={205} src={window.__resources.res_3d_02_3d_png} loc="NE Elevation · Triton Digester Row" cap="Three Triton Digesters — The Process Core" stat="Ø32.5m outer / Ø20.5m inner · 13m tall · mesophilic CSTR" />
        <ModelShot start={205} end={210} src={window.__resources.res_3d_04_3d_png} loc="CHP + Transformer Block" cap="2 MWe → 5 MWe Embedded Generation" stat="6× CHP modules · embedded into WWTW 22kV ring main" />
        <ModelShot start={210} end={215} src={window.__resources.res_3d_05_3d_png} loc="Gas Holder Dome + BGU" cap="Biogas Storage & Upgrading" stat="CO₂ offtake termsheet signed · CNG tube trailers + 7.5 km pipeline" />
        <ModelShot start={215} end={220} src={window.__resources.res_3d_06_3d_png} loc="Cryogenic CO₂ Vessel · Close-Up" cap="The Victor Valley Shot" stat="30 tpd · food-grade · cryogenic liquefaction · industrial offtake" />
        <ModelShot start={220} end={225} src={window.__resources.res_3d_09_3d_png} loc="Feedstock Receiving Zone" cap="Co-Digestion Intake" stat="Live bottom bins · FOG tank · blending tanks — gate-fee revenue" />
        <QuoteCard start={225} end={241} name="Yaniv Scherson" role="Chief Operating Officer · Anaergia (EPC Partner)"
          setting="Indoor — same framing as the Victor Valley commissioning video"
          quote="We've built this system. We know how it performs. What Straits Energy and NMBM are doing at Fishwater Flats is taking a proven co-digestion platform and deploying it where the environmental need — and the commercial case — are both exceptionally strong." />
        <CNGScene start={241} end={247} />
        <CO2Scene start={247} end={251} />
        <MapShot start={251} end={256} src={window.__resources.res_maps_gmaps_pipeline_corridor_coast_png} loc="Biomethane Pipeline Corridor" cap="7.5 km to Perseverance Industrial" stat="Real satellite route · past Brighton Beach, along the coast" />
        <ClosingAerial start={256} end={267} />

        {/* SECTION 5 — Call to Action */}
        <EndCard start={267} end={282} />
      </window.Stage>
    );
  }

  window.FWFVideo = FWFVideo;
})();
