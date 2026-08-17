// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// animations.jsx — timeline engine. Exports (on window): Stage, Sprite,
//   TextSprite, ImageSprite, RectSprite, VideoSprite, PlaybackBar,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <Sprite start={0} end={3}>
//       <TextSprite text="Hello" x={100} y={300} size={72} color="#111" />
//     </Sprite>
//     <Sprite start={2} end={8}>
//       <ImageSprite src="hero.png" x={200} y={120} width={640} height={360} kenBurns />
//     </Sprite>
//   </Stage>
//
// Stage({width,height,duration,background,fps,loop,autoplay}) — auto-scales to
//   viewport; scrubber + play/pause + ←/→ seek + space + 0-reset; persists
//   playhead. The canvas is an <svg><foreignObject>, export-ready: Share →
//   Export → Video (or the PlaybackBar's download button) renders it to .mp4.
//   Stage OWNS the exportable-video contract (the
//   data-om-exportable-video-with-duration-secs attribute + seek listener +
//   font inlining) — NEVER put that attribute on any other element; a second
//   nested "exportable root" makes export and the host timeline bind to the
//   wrong element and silently breaks playback control.
//   Screenshot tools DOM-rerender (not pixel-capture) and unwrap this wrapper
//   so captures should work — but if one comes back black, that's a capture
//   artifact, not a render bug; trust the live preview.
// Sprite({start,end,keepMounted}) — mounts children only while playhead is in
//   [start,end]. Children read {localTime, progress, duration} via useSprite().
// useTime() → seconds; useTimeline() → {time,duration,playing,setTime,setPlaying}.
// TextSprite({text,x,y,size,color,font,weight,align,entryDur,exitDur}) — fades/scales in+out.
// ImageSprite({src,x,y,width,height,fit,radius,kenBurns,placeholder}) — same, with optional ken-burns.
// RectSprite({x,y,width,height,color,radius}) — solid box with entry/exit.
// VideoSprite({src,start,end,speed,style}) — looped <video> clip synced to the
//   timeline; its audio is mixed into the exported video.
// Easing.{linear,easeIn/Out/InOut Quad/Cubic/Quart/Quint/Expo/Back, …}
// interpolate([t0,t1,…],[v0,v1,…],ease?) → (t)=>v  — piecewise tween.
// animate({from,to,start,end,ease}) → (t)=>v  — single tween.
//
// Build scenes by composing Sprites inside Stage. Absolutely-position elements.
//
// In a .dc.html project, put your scene in a sibling my-scene.jsx (reading
// {Stage, Sprite, useTime, Easing, …} from window is safe) and mount BOTH:
//   <x-import component-from-global-scope="MyScene"
//             from="./animations.jsx ./my-scene.jsx"></x-import>
// The two files in from= load in order, so my-scene.jsx can use the globals
// animations.jsx set.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: (t) => t,

  // Quad
  easeInQuad:    (t) => t * t,
  easeOutQuad:   (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic:    (t) => t * t * t,
  easeOutCubic:   (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quart
  easeInQuart:    (t) => t * t * t * t,
  easeOutQuart:   (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

  // Expo
  easeInExpo:  (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine:    (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine:   (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });

const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration)
    ? clamp(localTime / duration, 0, 1)
    : 0;

  const value = { localTime, progress, duration, visible };

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0, y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em',
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let ty = 0;

  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }

  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity',
    }}>
      {text}
    </div>
  );
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0, y = 0,
  width = 400, height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null, // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }

  const content = placeholder ? (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {placeholder.label || 'image'}
    </div>
  ) : (
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
  );

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity',
    }}>
      {content}
    </div>
  );
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0, y = 0,
  width = 100, height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render, // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }

  const overrides = render ? render(spriteCtx) : {};

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides,
    }} />
  );
}


// ── Font inlining ───────────────────────────────────────────────────────────
// Copy every @font-face rule from the page into a <style> inside the svg's
// foreignObject, with font URLs rewritten to data: URLs. Makes the svg
// self-describing so serializing it alone (video export fast path) still
// renders with the right fonts. Sets data-om-fonts-inlined on the svg when
// done so the exporter can wait for it.

function useInlineFontsInto(svgRef) {
  React.useEffect(() => {
    const svg = svgRef.current;
    const host = svg && svg.querySelector('foreignObject > div');
    if (!svg || !host) return;
    let cancelled = false;
    (async () => {
      const rules = [];
      for (const ss of document.styleSheets) {
        let cssRules;
        try { cssRules = ss.cssRules; } catch {
          // Cross-origin sheet without crossorigin attr (e.g. the standard
          // fonts.googleapis.com <link>) — fetch the CSS text directly and
          // regex-extract the @font-face blocks.
          if (ss.href) {
            try {
              const txt = await fetch(ss.href).then(r => { if (!r.ok) throw 0; return r.text(); });
              for (const ff of (txt.match(/@font-face\s*{[^}]*}/g) || []))
                rules.push({ css: ff, base: ss.href });
            } catch {}
          }
          continue;
        }
        if (!cssRules) continue;
        for (const r of cssRules) {
          if (r.type === CSSRule.FONT_FACE_RULE) {
            rules.push({ css: r.cssText, base: ss.href || location.href });
          }
        }
      }
      const toDataURL = (url) => fetch(url)
        .then(r => { if (!r.ok) throw 0; return r.blob(); })
        .then(b => new Promise(res => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result);
          fr.onerror = () => res(url);
          fr.readAsDataURL(b);
        }))
        .catch(() => url);
      const parts = await Promise.all(rules.map(async ({ css, base }) => {
        const re = /url\((['"]?)([^'")]+)\1\)/g;
        let out = css, m;
        while ((m = re.exec(css))) {
          const u = m[2];
          if (u.startsWith('data:')) continue;
          let abs; try { abs = new URL(u, base).href; } catch { continue; }
          out = out.split(m[0]).join(`url("${await toDataURL(abs)}")`);
        }
        return out;
      }));
      if (cancelled || !parts.length) {
        svg.setAttribute('data-om-fonts-inlined', 'true');
        return;
      }
      const style = document.createElement('style');
      style.textContent = parts.join('\n');
      host.insertBefore(style, host.firstChild);
      svg.setAttribute('data-om-fonts-inlined', 'true');
    })();
    return () => { cancelled = true; };
  }, []);
}


function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children,
}) {
  // Props arrive as strings when Stage is mounted via <x-import> (DC
  // projects) — coerce so style={{width}} gets a number React can px-ify.
  width = +width || 1280; height = +height || 720;
  duration = +duration || 10; fps = +fps || 60;
  if (typeof loop === 'string') loop = loop !== 'false';
  if (typeof autoplay === 'string') autoplay = autoplay !== 'false';

  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);

  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try { localStorage.setItem(persistKey + ':t', String(time)); } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(
        el.clientWidth / width,
        (el.clientHeight - barH) / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;
          else { next = duration; setPlaying(false); }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  // Video-export protocol: the exporter dispatches this event per frame;
  // pause + sync the playhead so the capture sees exactly that timestamp.
  // Sync-seek capability: a seek marked detail.sync === true commits via
  // ReactDOM.flushSync, so the stage DOM reflects the frame the moment
  // dispatchEvent returns — the exporter keys off the data-om-sync-seek
  // advertisement to drop its two-display-refresh settle (that wait only
  // exists to let React's async commit land; serialization needs the
  // committed DOM, not the paint). Feature-detected: without
  // ReactDOM.flushSync the engine never advertises and every seek takes
  // the async path. Unmarked seeks (scrubs, the host play bar) stay async.
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const canSyncSeek =
      typeof ReactDOM !== 'undefined' &&
      typeof ReactDOM.flushSync === 'function';
    const onSeek = (e) => {
      const apply = () => {
        setPlaying(false);
        setTime(clamp(e.detail.time, 0, duration));
      };
      // Safe here: a native DOM listener runs outside React's lifecycle,
      // and dispatchEvent is synchronous, so the commit lands in the same
      // JS task — the engine's rAF loop can't interleave before serialize.
      if (canSyncSeek && e.detail && e.detail.sync === true) {
        ReactDOM.flushSync(apply);
      } else {
        apply();
      }
    };
    el.addEventListener('data-om-seek-to-time-frame', onSeek);
    if (canSyncSeek) el.setAttribute('data-om-sync-seek', 'true');
    return () => {
      el.removeEventListener('data-om-seek-to-time-frame', onSeek);
      el.removeAttribute('data-om-sync-seek');
    };
  }, [duration]);

  // Inline @font-face rules into the svg's foreignObject so the svg is
  // self-describing — serializing it alone (for video export) then renders
  // with the right fonts. Sets data-om-fonts-inlined once done.
  useInlineFontsInto(canvasRef);

  const displayTime = hoverTime != null ? hoverTime : time;

  const ctxValue = React.useMemo(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  );

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Canvas area — vertically centered in remaining space */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <svg
          ref={canvasRef}
          width={width} height={height}
          data-om-exportable-video-with-duration-secs={duration}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            display: 'block',
          }}
        >
          <foreignObject x="0" y="0" width="100%" height="100%">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                width, height,
                background,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <TimelineContext.Provider value={ctxValue}>
                {children}
              </TimelineContext.Provider>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Playback bar — stacked below canvas, never overlapping */}
      <PlaybackBar
        time={displayTime}
        actualTime={time}
        duration={duration}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        onReset={() => { setTime(0); }}
        onSeek={(t) => setTime(t)}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };

  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };

  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total * 100) % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';

  return (
    <div data-omelette-chrome style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',

      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="8" y="2" width="3" height="10" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
          </svg>
        )}
      </IconButton>

      {/* Current time: fixed width so it doesn't thrash */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'right',
        color: '#f6f4ef',
      }}>
        {fmt(time)}
      </div>

      {/* Scrub track */}
      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 22,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, right: 0, height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: 0, width: `${pct}%`, height: 4,
          background: 'oklch(72% 0.12 250)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: `${pct}%`, top: '50%',
          width: 12, height: 12,
          marginLeft: -6, marginTop: -6,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Duration: fixed width */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'left',
        color: 'rgba(246,244,239,0.55)',
      }}>
        {fmt(duration)}
      </div>

      {typeof VideoEncoder !== 'undefined' && (
        <IconButton
          title="Export video"
          onClick={() => window.parent.postMessage({ type: 'omelette:request-video-export' }, '*')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v7m0 0L4 6m3 3l3-3M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconButton>
      )}
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: '#f6f4ef',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  );
}


// ── VideoSprite ─────────────────────────────────────────────────────────────
// Renders a <video> that loops within [start,end] of its source at `speed`,
// kept in sync with the Stage's playhead. Carries the
// data-om-exportable-video-play-* attrs so video export can mix its audio.
//
//   <VideoSprite src="clip.mp4" start={2} end={5} speed={1}
//     style={{ width: 640, height: 360 }} />

function VideoSprite({ src, start = 0, end, speed = 1, style, ...rest }) {
  start = +start || 0; speed = +speed || 1;
  if (end != null) end = +end || undefined;
  const t = useTime();
  const ref = React.useRef(null);
  const span = Math.max(0.001, ((end ?? start + 1) - start));
  React.useEffect(() => {
    const v = ref.current;
    if (!v || v.readyState < 1) return;
    const target = start + ((t * speed) % span);
    if (Math.abs(v.currentTime - target) > 0.05) v.currentTime = target;
  }, [t, start, span, speed]);
  return (
    <video
      ref={ref}
      src={src}
      muted playsInline preload="auto"
      data-om-exportable-video-play-start={start}
      data-om-exportable-video-play-end={end ?? start + span}
      data-om-exportable-video-play-speed={speed}
      style={{ display: 'block', objectFit: 'cover', ...style }}
      {...rest}
    />
  );
}


Object.assign(window, {
  Easing, interpolate, animate, clamp,
  TimelineContext, useTime, useTimeline,
  Sprite, SpriteContext, useSprite,
  TextSprite, ImageSprite, RectSprite, VideoSprite,
  Stage, PlaybackBar,
});



// ─── fwf-scene.jsx (merged for standalone export) ───

// FWF Biogas Facility — promotional video scene, built on animations.jsx (Stage/Sprite).
// Brand: EnergiDrop (blue / gold-flame / sky / gray) — colors sampled from EnergiDrop_Logo_Whiteback.png.
// Runtime target: 4:00 (240s), matching FWF-BIO-PROMO-VID-STORYBOARD-2026-04.
// No live footage exists yet — DRONE/GROUND/PILOT beats render as clearly-labelled
// placeholder frames; interview beats render as styled sound-bite quote cards.

(function () {
  const { Sprite, TextSprite, ImageSprite, Easing, interpolate, clamp, useSprite, useTime } = window;
  // Resource indirection: bundled standalone exports inject window.__resources; falls back to project paths.
  const RES_CACHE = {};
  const R = (id, fb) => RES_CACHE[id] || (window.__resources && window.__resources[id]) || fb;
  // Preload every image to a data: URL once, so the per-frame SVG serialization
  // during video export needs no fetching/inlining (prevents decode failures and timeouts).
  const RES_IDS = [
    ['res_Straits_Energy_Holdings_png', 'assets/Straits_Energy_Holdings.png'],
    ['res_EnergiDrop_Logo_Transparent_png', 'assets/EnergiDrop_Logo_Transparent.png'],
    ['res_3d_01_3d_png', 'assets/3d_01_3d.png'],
    ['res_3d_02_3d_png', 'assets/3d_02_3d.png'],
    ['res_3d_04_3d_png', 'assets/3d_04_3d.png'],
    ['res_3d_05_3d_png', 'assets/3d_05_3d.png'],
    ['res_3d_06_3d_png', 'assets/3d_06_3d.png'],
    ['res_3d_07_3d_png', 'assets/3d_07_3d.png'],
    ['res_3d_09_3d_png', 'assets/3d_09_3d.png'],
    ['res_piping_routing_reference_jpg', 'assets/piping_routing_reference.jpg'],
    ['res_maps_gmaps_eastern_cape_regional_png', 'assets/maps_gmaps_eastern_cape_regional.png'],
    ['res_maps_gmaps_metro_wide_png', 'assets/maps_gmaps_metro_wide.png'],
    ['res_maps_gmaps_site_overview_png', 'assets/maps_gmaps_site_overview.png'],
    ['res_maps_gmaps_flythrough_base_png', 'assets/maps_gmaps_flythrough_base.png'],
    ['res_maps_gmaps_pipeline_corridor_coast_png', 'assets/maps_gmaps_pipeline_corridor_coast.png'],
    ['res_maps_gmaps_site_close_orbital_png', 'assets/maps_gmaps_site_close_orbital.png'],
    ['res_cad_full_sheet_reference_png', 'assets/cad_full_sheet_reference.png'],
    ['res_stock_outfall', 'assets/stock_outfall.jpg'],
    ['res_stock_chp', 'assets/stock_chp.jpg'],
    ['res_stock_cng', 'assets/stock_cng.jpg'],
    ['res_stock_co2', 'assets/stock_co2.jpg'],
  ];
  let RES_READY = null;
  function preloadResources() {
    if (RES_READY) return RES_READY;
    const tileUrls = (window.ESRI_TILE_PRELOAD || []);
    const TILE_DATA_CACHE = window.__esriTileCache || (window.__esriTileCache = {});
    const tileLoads = tileUrls.map(url =>
      fetch(url, { mode: 'cors' })
        .then(r => r.ok ? r.blob() : null)
        .then(b => b ? new Promise(res => {
          const fr = new FileReader();
          fr.onload = () => { TILE_DATA_CACHE[url] = fr.result; res(); };
          fr.onerror = () => res();
          fr.readAsDataURL(b);
        }) : null)
        .catch(() => {})
    );
    RES_READY = Promise.all([
      ...RES_IDS.map(([id, fb]) => {
        const url = (window.__resources && window.__resources[id]) || fb;
        return fetch(url)
          .then((r) => { if (!r.ok) throw 0; return r.blob(); })
          .then((b) => new Promise((res) => {
            const fr = new FileReader();
            fr.onload = () => { RES_CACHE[id] = fr.result; res(); };
            fr.onerror = () => res();
            fr.readAsDataURL(b);
          }))
          .catch(() => {});
      }),
      ...tileLoads,
    ]);
    return RES_READY;
  }

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
  function SceneShell({ tag, title, slotLabel, stat, children }) {
    const slotId = 'footage-' + tag.toLowerCase() + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    return (
      <FadeBox x={0} y={0} width={W} height={H}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <video-slot id={slotId} label={slotLabel || title} style={{ width: '100%', height: '100%' }}></video-slot>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,9,14,0.38)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}`, pointerEvents: 'none' }}>
          {tag}
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
        <SceneShell tag="GROUND" title="WWTW Outfall / Consolidation Tank" slotLabel="IMG_2290.MOV · WWTW Outfall &amp; Consolidation Tank" stat="Fishwater Flats WWTW · Gqeberha, Eastern Cape">
          <GreenChip text="Existing Operations" />
          <CalloutLines items={[
            { x1: 560, y1: 430, x2: 360, y2: 310, label: 'WWTW outfall', right: false, delay: 0.4 },
            { x1: 900, y1: 380, x2: 1100, y2: 260, label: 'Consolidation tank', right: true, delay: 0.9 },
            { x1: 1020, y1: 540, x2: 1220, y2: 450, label: 'Phase 1 pilot CHP', right: true, delay: 1.4 },
          ]} localTime={localTime} />
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
        <SceneShell tag="LIVE PILOT" title="Phase 1 Pilot CHP Unit — Running Today" slotLabel="IMG_2295.MOV · Phase 1 CHP Pilot Unit" stat="Phase 1 Pilot Plant · operational now · exported to NMBM LV grid">
          <GreenChip text="Phase 1 Pilot · Live Today" />
          <CalloutLines items={[
            { x1: 560, y1: 400, x2: 360, y2: 290, label: 'CHP genset · 50 kWe', right: false, delay: 0.3 },
            { x1: 900, y1: 360, x2: 1100, y2: 250, label: 'Exported to NMBM grid', right: true, delay: 0.8 },
          ]} localTime={localTime} />
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
        <SceneShell tag="GROUND" title="CNG Tube Trailer at Loading Bay" slotLabel="IMG_2304.MOV · CNG Tube Trailer Loading Bay" stat="Biomethane offtake · CNG virtual pipeline to Perseverance">
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
        <SceneShell tag="GROUND" title="CO₂ Cryogenic Storage Vessel" slotLabel="IMG_2302.MOV · CO₂ Cryogenic Storage Vessel" stat="30 tpd · Cryogenic food-grade CO₂">
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
    const slotId = 'interview-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(60% 60% at 72% 40%, rgba(0,144,224,0.16) 0%, transparent 70%), ${INK}`,
          }} />
          <div style={{ position: 'absolute', inset: 0 }}>
            <video-slot id={slotId} label={'INTERVIEW · ' + name + ' · ' + role} style={{ width: '100%', height: '100%' }}></video-slot>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(4,9,14,0.9) 0%, rgba(4,9,14,0.6) 55%, rgba(4,9,14,0.3) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 40, border: `2px dashed ${GOLD}`, borderRadius: 14, opacity: 0.65, pointerEvents: 'none' }} />

          <div style={{ position: 'absolute', left: 0, right: 0, top: 88, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: GOLD, borderRadius: 6, padding: '12px 34px' }}>
              <MicGlyph size={42} color={INK} />
              <div style={{ fontFamily: FH, fontSize: 46, fontWeight: 800, letterSpacing: 5, textTransform: 'uppercase', color: INK }}>
                Interview video slots in here
              </div>
            </div>
            <div style={{ fontFamily: FB, fontSize: 19, color: SKY, background: PANEL_BG, padding: '6px 16px', borderRadius: 4 }}>
              Two setups per subject: indoor seated + outdoor at equipment — drop a frame-grab of the cut onto this screen
            </div>
          </div>

          <div style={{ position: 'absolute', left: 130, top: 330, width: 1250, pointerEvents: 'none' }}>
            <div style={{ fontFamily: FH, fontSize: 20, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>
              Target sound bite
            </div>
            <div style={{ fontFamily: FB, fontStyle: 'italic', fontWeight: 400, fontSize: 34, lineHeight: 1.45, color: TXT_HI }}>
              &ldquo;{quote}&rdquo;
            </div>
          </div>

          <div style={{ position: 'absolute', left: 130, bottom: 110, borderLeft: `4px solid ${BLUE}`, paddingLeft: 20, pointerEvents: 'none' }}>
            <div style={{ fontFamily: FH, fontSize: 42, fontWeight: 700, color: TXT_HI }}>{name}</div>
            <div style={{ fontFamily: FB, fontSize: 21, color: TXT_SUB, marginTop: 2 }}>{role}</div>
            {setting && <div style={{ fontFamily: FB, fontSize: 17, color: SKY, marginTop: 8, fontStyle: 'italic' }}>Setup: {setting}</div>}
          </div>
        </FadeBox>
      </Sprite>
    );
  }

  // ── Earth Studio Flyover helpers ─────────────────────────────────────────

  // Interpolate Earth Studio keyframe data at time t (seconds into ES clip)
  function lerpKF(t) {
    const kfs = window.EARTH_STUDIO_KF;
    if (!kfs || !kfs.length) return { lat: -33.879, lng: 25.622, alt: 5000, heading: 0 };
    if (t <= kfs[0].t) return kfs[0];
    if (t >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1];
    for (let i = 0; i < kfs.length - 1; i++) {
      if (kfs[i].t <= t && kfs[i + 1].t >= t) {
        const a = kfs[i], b = kfs[i + 1];
        const f = (t - a.t) / Math.max(b.t - a.t, 0.001);
        return {
          lat:     a.lat     + (b.lat     - a.lat)     * f,
          lng:     a.lng     + (b.lng     - a.lng)     * f,
          alt:     a.alt     + (b.alt     - a.alt)     * f,
          tilt:    a.tilt    + (b.tilt    - a.tilt)    * f,
          heading: a.heading + (b.heading - a.heading) * f,
        };
      }
    }
    return kfs[kfs.length - 1];
  }

  // Altitude (m) → tile zoom level
  function altToZoom(alt, lat) {
    const cos = Math.cos((lat || -33.88) * Math.PI / 180);
    return Math.max(2, Math.min(18, Math.log2(300562500 * cos / Math.max(alt, 1))));
  }

  // ESRI World Imagery tile src — returns cached data: URL if preloaded, else live URL
  function esriUrl(z, x, y) {
    const url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + z + '/' + y + '/' + x;
    const cache = window.__esriTileCache;
    return (cache && cache[url]) || url;
  }

  // Satellite tile map – CSS-positioned img grid driven by lat/lng/zoom/heading
  function EarthTileMap({ lat, lng, zoom, heading }) {
    const z  = Math.max(2, Math.min(18, Math.floor(zoom)));
    const sc = Math.pow(2, zoom - z); // fractional zoom via CSS scale
    const n  = Math.pow(2, z);
    const latRad = lat * Math.PI / 180;
    const exactX = (lng + 180) / 360 * n;
    const exactY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
    const tileX  = Math.floor(exactX);
    const tileY  = Math.floor(exactY);
    const fracX  = exactX - tileX;
    const fracY  = exactY - tileY;
    const TS = 256, GRID = 9, mid = 4; // 9×9 grid, centre at index 4
    const tiles = [];
    for (let dy = 0; dy < GRID; dy++) {
      for (let dx = 0; dx < GRID; dx++) {
        const tx = ((tileX + dx - mid) % n + n) % n;
        const ty = tileY + dy - mid;
        if (ty < 0 || ty >= n) continue;
        tiles.push({
          key: z + '_' + tx + '_' + ty,
          src: esriUrl(z, tx, ty),
          left: W / 2 + (dx - mid - fracX) * TS,
          top:  H / 2 + (dy - mid - fracY) * TS,
        });
      }
    }
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#010308' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, width: W, height: H,
          transformOrigin: (W / 2) + 'px ' + (H / 2) + 'px',
          transform: 'rotate(' + (-heading) + 'deg) scale(' + sc + ')',
        }}>
          {tiles.map(t => (
            <img key={t.key} src={t.src} crossOrigin="anonymous"
              style={{ position: 'absolute', left: t.left, top: t.top, width: TS, height: TS, display: 'block' }} />
          ))}
        </div>
      </div>
    );
  }

  // Inner beat (needs Sprite context from parent) – driven by Earth Studio keyframes
  function EarthFlyoverBeat({ videoOffset, label, sublabel, children }) {
    const { localTime } = useSprite();
    const kf   = lerpKF(videoOffset + localTime);
    const zoom = altToZoom(kf.alt, kf.lat);
    const altFactor = Math.max(0, Math.min(1, Math.log2(Math.max(kf.alt, 1)) / Math.log2(57000000)));
    return (
      <FadeBox x={0} y={0} width={W} height={H} entryDur={0.8} exitDur={0.6}>
        <EarthTileMap lat={kf.lat} lng={kf.lng} zoom={zoom} heading={kf.heading} />
        {altFactor > 0.55 && (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 130% 45% at 50% 0%, rgba(80,140,255,' + ((altFactor - 0.55) * 0.5).toFixed(2) + ') 0%, transparent 65%)', pointerEvents: 'none' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: '1px solid ' + BORDER, pointerEvents: 'none' }}>
          Google Earth Studio · Animated Satellite Flyover
        </div>
        <div style={{ position: 'absolute', left: 60, top: 100, fontFamily: FH, fontSize: 13, fontWeight: 500, letterSpacing: 2, color: TXT_SUB, background: PANEL_BG, padding: '4px 10px', borderRadius: 4, pointerEvents: 'none' }}>
          {kf.alt < 1000 ? Math.round(kf.alt) + ' m' : kf.alt < 1000000 ? (kf.alt / 1000).toFixed(1) + ' km' : (kf.alt / 1000000).toFixed(0) + ' Mm'} · {kf.lat.toFixed(4) + '° S · ' + kf.lng.toFixed(4) + '° E'}
        </div>
        {label && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none' }}>
            <div style={{ fontFamily: FH, fontSize: 48, fontWeight: 900, letterSpacing: 2, color: '#fff', textTransform: 'uppercase', textShadow: '0 2px 24px rgba(0,0,0,0.85)', textAlign: 'center' }}>{label}</div>
            {sublabel && <div style={{ fontFamily: FB, fontSize: 22, color: SKY, background: 'rgba(5,10,15,0.65)', padding: '6px 18px', borderRadius: 4 }}>{sublabel}</div>}
          </div>
        )}
        {children}
      </FadeBox>
    );
  }

  // Outer wrapper – creates the Sprite and delegates to EarthFlyoverBeat
  function EarthFlyover({ start, end, videoOffset, label, sublabel }) {
    return (
      <Sprite start={start} end={end}>
        <EarthFlyoverBeat videoOffset={videoOffset} label={label} sublabel={sublabel} />
      </Sprite>
    );
  }

  // ── THREE.js plant model + Earth-Studio camera flythrough ──────────────
  const MODEL_LAT = -33.8791, MODEL_LNG = 25.6211; // verified from ES site-level frame centre
  const M_PER_DEG_LNG = 111320 * Math.cos(MODEL_LAT * Math.PI / 180);

  function esToThreePos(kf) {
    return {
      x:  (kf.lng - MODEL_LNG) * M_PER_DEG_LNG,
      y:  kf.alt,
      z: -(kf.lat - MODEL_LAT) * 111320,
    };
  }
  // Returns { dir, up } — both needed when ES tilt passes ±90° (camera loops)
  function esLookDir(heading, tilt) {
    const h = (heading || 0) * Math.PI / 180;
    const t = (tilt    || -18) * Math.PI / 180;
    // standard spherical to Cartesian (ES: tilt 90°=nadir, 0°=horizon, -90°=zenith)
    const dir = {
      x:  Math.sin(h) * Math.cos(t),
      y:  Math.sin(t),
      z: -Math.cos(h) * Math.cos(t),
    };
    // camera UP vector: tilt in (90°,270°) means camera has gone past nadir → flip up
    const tNorm = ((t * 180/Math.PI % 360) + 360) % 360; // 0-360
    const flipped = tNorm > 90 && tNorm < 270;
    const up = { x: 0, y: flipped ? -1 : 1, z: 0 };
    return { dir, up };
  }

  let _plantCache = null;
  function buildPlant(T) {
    if (_plantCache) return _plantCache;
    const std = (col, rough, metal, extra) =>
      new T.MeshStandardMaterial(Object.assign({ color: col, roughness: rough, metalness: metal }, extra || {}));
    const M = {
      pad: std('#c2b88a',0.95,0), grass: std('#5a7a4a',1,0), road: std('#6a6254',0.95,0),
      shell: std('#3d8a44',0.72,0.08), band: std('#2d6835',0.6,0.12),
      membrane: std('#dedad0',0.38,0.04), roof: std('#ccc6b0',0.6,0.08),
      steel: std('#8a9aaa',0.45,0.35), dome: std('#b8c8d8',0.28,0.32),
      dark: std('#2b323a',0.6,0.35), grate: std('#5a6470',0.7,0.4),
      accent: std('#2b60b0',0.5,0.2), gold: std('#FBB708',0.4,0.1,{ emissive:'#FBB708', emissiveIntensity:0.5 }),
      glass: std('#7fb8e0',0.15,0.1,{ transparent:true, opacity:0.55 }),
      cryo: std('#e0ddd0',0.35,0.15), water: std('#4a8a60',0.2,0.1,{ transparent:true, opacity:0.85 }),
    };
    const plant = new T.Group(); plant.name = 'FWF_Plant';
    const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
      const m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
      m.position.set(x, y, z);
      if (rx||ry||rz) m.rotation.set(rx||0, ry||0, rz||0);
      (parent||plant).add(m); return m;
    };
    // Ground
    add(new T.PlaneGeometry(600,400), M.grass, 0,0,0, -Math.PI/2,0,0);
    add(new T.BoxGeometry(224,0.8,142), M.pad, 0,0.4,0);
    // 3 digesters
    const dR=21.6, dH=22;
    [-52,0,52].forEach(x => {
      add(new T.CylinderGeometry(dR,dR,dH,48), M.shell, x,dH/2,-22);
      [0.32,0.66].forEach(f => add(new T.CylinderGeometry(dR+0.25,dR+0.25,1.1,48), M.band, x,dH*f,-22));
      add(new T.SphereGeometry(dR,48,24,0,Math.PI*2,0,Math.PI*0.42), M.membrane, x,dH,-22);
      add(new T.CylinderGeometry(2,2.4,3.5,16), M.dark, x,dH+dR*0.42+1,-22);
      add(new T.BoxGeometry(3.4,1.6,3.4), M.accent, x,dH+dR*0.42+3,-22);
    });
    // Digestate tanks
    [[-30,40],[-6,40]].forEach(p => {
      add(new T.CylinderGeometry(9,9,8,32), M.shell, p[0],4,p[1]);
      add(new T.CylinderGeometry(8.6,8.6,0.4,32), M.water, p[0],7.9,p[1]);
    });
    // Gas holder dome
    add(new T.SphereGeometry(20,48,24,0,Math.PI*2,0,Math.PI*0.5), M.dome, -90,1,24);
    add(new T.CylinderGeometry(20.4,20.4,2,48), M.roof, -90,1,24);
    // CHP hall
    add(new T.BoxGeometry(50,12,24), M.steel, 62,6,18);
    add(new T.BoxGeometry(50,1.4,24), M.accent, 62,12.7,18);
    for(let i=0;i<6;i++) add(new T.CylinderGeometry(1.1,1.25,20,16), M.dark, 45+i*6.4,10,26);
    // Feedstock reception
    add(new T.BoxGeometry(26,9,14), M.steel, 28,4.5,48);
    [-14,-6,2].forEach(x => {
      add(new T.CylinderGeometry(4,4,11,24), M.shell, x,5.5,40);
      add(new T.SphereGeometry(4,20,10,0,Math.PI*2,0,Math.PI/2), M.roof, x,11,40);
    });
    // BGU platform
    add(new T.BoxGeometry(30,1,16), M.grate, 96,12,-6);
    [0,7.5,15,22.5].forEach(dx => {
      add(new T.CylinderGeometry(2.7,2.7,16,24), M.steel, 84+dx,8.5,-6);
      add(new T.SphereGeometry(2.7,20,10,0,Math.PI*2,0,Math.PI/2), M.band, 84+dx,16.5,-6);
    });
    // Cryo CO₂
    add(new T.CylinderGeometry(4,4,20,28), M.cryo, 100,6,34, 0,0,Math.PI/2);
    add(new T.SphereGeometry(4,24,12), M.cryo, 110,6,34);
    add(new T.SphereGeometry(4,24,12), M.cryo, 90,6,34);
    // Flare
    add(new T.CylinderGeometry(1.1,1.6,32,16), M.dark, 104,16,-36);
    add(new T.ConeGeometry(2.3,7,16), M.gold, 104,34,-36);
    // Control building
    add(new T.BoxGeometry(22,8,13), M.steel, -60,4,52);
    add(new T.BoxGeometry(20,4.5,0.4), M.glass, -60,4.5,45.6);
    add(new T.BoxGeometry(22,0.7,13), M.accent, -60,8.3,52);
    _plantCache = plant;
    return plant;
  }

  // THREE context keyed by videoOffset — no hooks needed
  const _threeCtxMap = {};
  function getThreeCtx(key) {
    if (_threeCtxMap[key]) return _threeCtxMap[key];
    if (!window.THREE) return null;
    const T = window.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    try { renderer.outputColorSpace = T.SRGBColorSpace; } catch(e) {}
    const scene = new T.Scene();
    scene.background = new T.Color('#030913');
    scene.fog = new T.FogExp2('#03060a', 0.0004);
    const camera = new T.PerspectiveCamera(54, W/H, 0.5, 80000);
    scene.add(new T.AmbientLight(0xddeeff, 0.65));
    const sun = new T.DirectionalLight(0xfff8e8, 1.5);
    sun.position.set(300, 500, 200); sun.castShadow = true; scene.add(sun);
    scene.add(new T.HemisphereLight(0x88aacc, 0x3d5c2a, 0.45));
    scene.add(buildPlant(T));
    _threeCtxMap[key] = { renderer, scene, camera, canvas };
    return _threeCtxMap[key];
  }

  function ThreeFlyoverBeat({ videoOffset, label, sublabel }) {
    const { localTime } = useSprite();
    const ctx = getThreeCtx(videoOffset);
    let dataUrl = '';
    if (ctx && window.EARTH_STUDIO_KF) {
      const kf  = lerpKF(videoOffset + Math.max(0, localTime));
      const pos = esToThreePos(kf);
      const { dir, up } = esLookDir(kf.heading, kf.tilt);
      const FAR = 600;
      ctx.camera.up.set(up.x, up.y, up.z);
      ctx.camera.position.set(pos.x, pos.y, pos.z);
      ctx.camera.lookAt(pos.x + dir.x * FAR, pos.y + dir.y * FAR, pos.z + dir.z * FAR);
      ctx.renderer.render(ctx.scene, ctx.camera);
      dataUrl = ctx.canvas.toDataURL();
    }
    return (
      <FadeBox x={0} y={0} width={W} height={H} entryDur={0.8} exitDur={0.6}>
        {dataUrl
          ? <img src={dataUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#030913', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontSize: 22, color: TXT_DIM, letterSpacing: 3 }}>Loading 3D…</div>
        }
        <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: '1px solid ' + BORDER, pointerEvents: 'none' }}>
          3D Model · Earth Studio Camera Path
        </div>
        {label && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ display: 'inline-block', background: 'rgba(5,10,15,0.78)', padding: '14px 36px', borderRadius: 6 }}>
              <div style={{ fontFamily: FH, fontSize: 48, fontWeight: 900, letterSpacing: 2, color: '#fff', textTransform: 'uppercase' }}>{label}</div>
              {sublabel && <div style={{ fontFamily: FB, fontSize: 20, color: SKY, marginTop: 8 }}>{sublabel}</div>}
            </div>
          </div>
        )}
      </FadeBox>
    );
  }

  function ThreeFlyover({ start, end, videoOffset, label, sublabel }) {
    return (
      <Sprite start={start} end={end}>
        <ThreeFlyoverBeat videoOffset={videoOffset} label={label} sublabel={sublabel} />
      </Sprite>
    );
  }

  // ── ExistingToProposed: real site photo → animated 3D build sequence ────
  const PHASE_COMPONENTS = [
    { key: 'digesters',  label: 'Anaerobic Digesters ×3',   spec: '3× Triton CSTR · Ø32.5m · 22m tall · mesophilic',   color: '#0090E0', t: 4,  dur: 1.5,
      match: n => /^digester_[ABC]/.test(n) },
    { key: 'holder',     label: 'Gas Holder Dome',           spec: 'Double-membrane · 40m diameter · raw biogas buffer', color: '#E0A21A', t: 7,  dur: 1.5,
      match: n => /^gas_holder/.test(n) },
    { key: 'chp',        label: 'CHP Hall · 5 MWe',          spec: '6× gensets · embedded into NMBM 22kV ring',         color: '#0090E0', t: 10, dur: 1.5,
      match: n => /^chp|^transformer/.test(n) },
    { key: 'bgu',        label: 'Biogas Upgrading (BGU)',     spec: 'Membrane separation · biomethane to 200 bar CNG',   color: '#8Fb84f', t: 13, dur: 1.5,
      match: n => /^bgu/.test(n) },
    { key: 'co2',        label: 'Cryogenic CO₂ · 30 tpd',    spec: 'Food-grade liquefaction · cold box + vessel',       color: '#c94f3d', t: 16, dur: 1.5,
      match: n => /^co2/.test(n) },
    { key: 'reception',  label: 'Feedstock Reception',        spec: '155 ML/day sludge · 200 t/day organics · gate fee', color: '#FBB708', t: 19, dur: 1.5,
      match: n => /^reception|^blending|^live_bottom|^fog/.test(n) },
  ];

  // Build the plant but with all proposed groups initially invisible + at scale 0
  let _phaseCtx = null;
  function getPhaseCtx() {
    if (_phaseCtx) return _phaseCtx;
    if (!window.THREE) return null;
    const T = window.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    try { renderer.outputColorSpace = T.SRGBColorSpace; } catch(e) {}

    const scene = new T.Scene();
    scene.background = new T.Color('#050e18');
    scene.fog = new T.FogExp2('#03060a', 0.0003);

    // Lighting
    scene.add(new T.AmbientLight(0xddeeff, 0.55));
    const sun = new T.DirectionalLight(0xfff8e8, 1.6);
    sun.position.set(200, 400, 150); sun.castShadow = true; scene.add(sun);
    const fill = new T.DirectionalLight(0x8899cc, 0.35);
    fill.position.set(-200, 100, -100); scene.add(fill);
    scene.add(new T.HemisphereLight(0x88aacc, 0x3d5c2a, 0.4));

    // Camera — wide isometric-ish angle looking at site centre
    const camera = new T.PerspectiveCamera(46, W/H, 0.5, 6000);
    camera.position.set(220, 180, 240);
    camera.lookAt(0, 10, 0);

    // Build plant but split into groups by phase component
    const plant = buildPlant(T);

    // Organise existing permanent elements (ground, roads, fence, pipes, control) — always visible
    const permanent = new Set(['landscape_apron','site_pad','road_spine','road_cross','perimeter_fence','control_building','control_glazing','control_roof','flare_stack','flare_ring_1','flare_ring_2','flare_ring_3','flare_flame']);
    // Phase 1 pilot — small existing CHP unit (represents operational Phase 1)
    const phase1 = new Set(); // will be flagged during reveal

    // Group meshes by PHASE_COMPONENTS + always-visible base
    const groups = {}; // key → [mesh]
    PHASE_COMPONENTS.forEach(pc => { groups[pc.key] = []; });

    plant.traverse(obj => {
      if (!obj.isMesh) return;
      const n = obj.name;
      let assigned = false;
      for (const pc of PHASE_COMPONENTS) {
        if (pc.match(n)) { groups[pc.key].push(obj); assigned = true; break; }
      }
      // Hide proposed components initially (show only permanent + roads)
      if (assigned && !permanent.has(n)) {
        obj.visible = false;
        obj.scale.y = 0.001;
      }
    });

    // Pipe network — hide initially (revealed with associated system)
    plant.traverse(obj => {
      if (!obj.isMesh) return;
      const n = obj.name;
      if (/^pipe_|^gas_riser|^gas_header|^gas_to|^holder_to|^bgu_manifold|^bgu_to|^feed_|^digestate_out|^rack_post|^relief_to/.test(n)) {
        obj.visible = false;
      }
    });

    scene.add(plant);
    _phaseCtx = { renderer, scene, camera, plant, groups, canvas, T };
    return _phaseCtx;
  }

  function ExistingToProposedBeat({ localTimeProp }) {
    const { localTime } = useSprite();
    const t = localTimeProp !== undefined ? localTimeProp : localTime;
    const ctx = getPhaseCtx();
    let dataUrl = '';

    if (ctx) {
      const { renderer, scene, camera, plant, groups, T } = ctx;

      // Cross-fade from existing to model at t=2s
      const modelAlpha = Math.max(0, Math.min(1, (t - 1.5) / 1.5));

      // Reveal each component group
      PHASE_COMPONENTS.forEach(pc => {
        const meshes = groups[pc.key] || [];
        if (t >= pc.t) {
          const revealT = Math.min(1, (t - pc.t) / pc.dur);
          const ease = revealT < 0.5 ? 4*revealT*revealT*revealT : 1 - Math.pow(-2*revealT+2,3)/2;
          meshes.forEach(m => {
            m.visible = true;
            m.scale.set(ease, ease, ease);
          });
        }
      });

      // Show pipe network after all components revealed (t>22)
      if (t > 21) {
        plant.traverse(obj => {
          if (!obj.isMesh) return;
          const n = obj.name;
          if (/^pipe_|^gas_riser|^gas_header|^gas_to|^holder_to|^bgu_manifold|^bgu_to|^feed_|^digestate_out|^rack_post|^relief_to/.test(n)) {
            const pt = Math.min(1, (t - 21) / 2);
            obj.visible = true;
            if (obj.material) obj.material.opacity = pt;
          }
        });
      }

      // Gentle camera orbit
      const angle = t * 0.018;
      camera.position.set(
        Math.sin(angle) * 260 + 30,
        160 + Math.sin(t * 0.04) * 20,
        Math.cos(angle) * 260
      );
      camera.lookAt(0, 12, 0);

      // Scene opacity via background blend
      scene.background = new T.Color(
        modelAlpha < 0.5 ? '#050e18' : '#030913'
      );

      renderer.render(scene, camera);
      try { dataUrl = ctx.canvas.toDataURL(); } catch(e) {}
    }

    // Determine active phase label
    let activePhase = null;
    for (let i = PHASE_COMPONENTS.length - 1; i >= 0; i--) {
      if (t >= PHASE_COMPONENTS[i].t) { activePhase = PHASE_COMPONENTS[i]; break; }
    }
    const crossFadeAlpha = Math.max(0, Math.min(1, (t - 1.5) / 1.5));

    return (
      <FadeBox x={0} y={0} width={W} height={H} entryDur={0.8} exitDur={0.6}>
        {/* Existing site footage — fades out as 3D fades in */}
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - crossFadeAlpha }}>
          <video-slot id="existing-site-aerial" label="Existing Site — Drop real aerial footage here" style={{ width: '100%', height: '100%' }}></video-slot>
        </div>
        {/* 3D build scene */}
        {dataUrl && (
          <img src={dataUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: crossFadeAlpha }} />
        )}
        {/* Chip: EXISTING → PROPOSED */}
        <div style={{ position: 'absolute', left: 60, top: 44, display: 'flex', gap: 0, fontFamily: FH, fontSize: 17, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', pointerEvents: 'none' }}>
          <div style={{ background: crossFadeAlpha < 0.5 ? BLUE : PANEL_BG, color: crossFadeAlpha < 0.5 ? INK : TXT_DIM, padding: '8px 18px', borderRadius: '4px 0 0 4px', border: '1px solid ' + BORDER, transition: 'background 0.5s' }}>
            Existing Site
          </div>
          <div style={{ background: PANEL_BG, color: TXT_DIM, padding: '8px 6px', border: '1px solid ' + BORDER, borderLeft: 'none' }}>→</div>
          <div style={{ background: crossFadeAlpha > 0.5 ? GOLD : PANEL_BG, color: crossFadeAlpha > 0.5 ? INK : TXT_DIM, padding: '8px 18px', borderRadius: '0 4px 4px 0', border: '1px solid ' + BORDER, borderLeft: 'none', transition: 'background 0.5s' }}>
            Proposed Phase 2/3
          </div>
        </div>
        {/* Active component callout */}
        {activePhase && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(5,10,15,0.82)', border: '1px solid ' + activePhase.color, borderRadius: 6, padding: '14px 30px', maxWidth: 860, textAlign: 'center' }}>
              <div style={{ fontFamily: FH, fontSize: 32, fontWeight: 800, color: activePhase.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{activePhase.label}</div>
              <div style={{ fontFamily: FB, fontSize: 18, color: TXT_SUB }}>{activePhase.spec}</div>
            </div>
          </div>
        )}
        {/* Phase progress dots */}
        <div style={{ position: 'absolute', left: 60, bottom: 52, display: 'flex', gap: 10, pointerEvents: 'none' }}>
          {PHASE_COMPONENTS.map((pc, i) => (
            <div key={pc.key} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: t >= pc.t ? pc.color : 'rgba(255,255,255,0.2)',
              border: '1.5px solid ' + (t >= pc.t ? pc.color : 'rgba(255,255,255,0.3)'),
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </FadeBox>
    );
  }

  function ExistingToProposedScene({ start, end }) {
    return (
      <Sprite start={start} end={end}>
        <ExistingToProposedBeat />
      </Sprite>
    );
  }

  // ── EnviTec annotation primitives ────────────────────────────────────────

  // Green filled section chip (top-left, like "Flexible feeding technology")
  function GreenChip({ text }) {
    return (
      <div style={{ position: 'absolute', left: 60, top: 44, background: '#1a6b32', color: '#fff', fontFamily: FH, fontSize: 26, fontWeight: 700, padding: '10px 22px', borderRadius: 4, letterSpacing: 0.5, pointerEvents: 'none', zIndex: 10 }}>
        {text}
      </div>
    );
  }

  // Animated white callout lines with dot anchor (EnviTec style)
  function CalloutLines({ items, localTime }) {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 8 }} viewBox={'0 0 ' + W + ' ' + H}>
        {items.map((it, i) => {
          const t = Easing.easeOutCubic(clamp(((localTime || 0) - (it.delay || 0)) / 0.6, 0, 1));
          const lx = it.x1 + (it.x2 - it.x1) * t;
          const ly = it.y1 + (it.y2 - it.y1) * t;
          return (
            <g key={i} opacity={t}>
              <circle cx={it.x1} cy={it.y1} r={5} fill="white" />
              <line x1={it.x1} y1={it.y1} x2={lx} y2={ly} stroke="white" strokeWidth={1.5} />
              {t > 0.88 && (
                <text
                  x={it.x2 + (it.right ? 12 : -12)}
                  y={it.y2 + 7}
                  textAnchor={it.right ? 'start' : 'end'}
                  fontFamily="Barlow Condensed"
                  fontSize={28}
                  fontWeight={400}
                  fill="white"
                >{it.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  // Animated dashed flow arrow (EnviTec substrate/biogas flows)
  function DashArrow({ x1, y1, x2, y2, label, color, delay, localTime }) {
    const t = Easing.easeOutCubic(clamp(((localTime || 0) - (delay || 0)) / 1.0, 0, 1));
    const ex = x1 + (x2 - x1) * t;
    const ey = y1 + (y2 - y1) * t;
    const col = color || 'white';
    const mid = { x: (x1 + x2) / 2, y: Math.min(y1, y2) - 22 };
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 8 }} viewBox={'0 0 ' + W + ' ' + H}>
        <defs>
          <marker id={'arr' + label.replace(/s/g,'')} markerWidth={10} markerHeight={7} refX={9} refY={3.5} orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={col} opacity={0.9} />
          </marker>
        </defs>
        <line x1={x1} y1={y1} x2={ex} y2={ey}
          stroke={col} strokeWidth={2} strokeDasharray="14 8" opacity={0.85}
          markerEnd={t > 0.9 ? 'url(#arr' + label.replace(/s/g,'') + ')' : undefined} />
        {t > 0.55 && (
          <text x={mid.x} y={mid.y} textAnchor="middle" fontFamily="Barlow Condensed" fontSize={26} fontWeight={600} fill={col} opacity={t}>
            {label}
          </text>
        )}
      </svg>
    );
  }

  // Full annotated scene: video-slot + chip + callouts + flow arrows
  function EnviTecScene({ start, end, slotId, slotLabel, chip, callouts, arrows }) {
    const { localTime } = useSprite();
    return (
      <FadeBox x={0} y={0} width={W} height={H} entryDur={0.6} exitDur={0.5}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <video-slot id={slotId} label={slotLabel} style={{ width: '100%', height: '100%' }}></video-slot>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,9,14,0.28)', pointerEvents: 'none' }} />
        {chip && <GreenChip text={chip} />}
        {callouts && <CalloutLines items={callouts} localTime={localTime} />}
        {arrows && arrows.map((a, i) => (
          <DashArrow key={i} {...a} localTime={localTime} />
        ))}
      </FadeBox>
    );
  }

  function EnviTecSceneSprite({ start, end, slotId, slotLabel, chip, callouts, arrows }) {
    return (
      <Sprite start={start} end={end}>
        <EnviTecScene start={start} end={end} slotId={slotId} slotLabel={slotLabel} chip={chip} callouts={callouts} arrows={arrows} />
      </Sprite>
    );
  }

  // ── Title card ───────────────────────────────────────────────────────────
  function TitleCard({ start, end }) {
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.8} exitDur={0.6}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <video-slot id="title-opening-flyover" label="IMG_2284.MOV · Opening Drone Flyover" style={{ width: '100%', height: '100%' }}></video-slot>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,9,14,0.55) 0%, rgba(4,9,14,0.72) 100%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
            <img src={R('res_Straits_Energy_Holdings_png', 'assets/Straits_Energy_Holdings.png')} style={{ height: 130 }} />
            <div style={{ width: 90, height: 3, background: BLUE }} />
            <img src={R('res_EnergiDrop_Logo_Transparent_png', 'assets/EnergiDrop_Logo_Transparent.png')} style={{ height: 170, filter: 'drop-shadow(0 0 30px rgba(0,144,224,0.25))' }} />
            <div style={{ fontFamily: FH, fontSize: 64, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: TXT_HI, textAlign: 'center', textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}>
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
    { icon: 'pipe', metric: '7.69 km pipeline', label: 'IMPACT 06', desc: 'Biomethane offtake to Perseverance Industrial' },
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
    { t: 8, x: 150, y: 115, z: 0.5, label: 'Biomethane Pipeline → Perseverance Industrial', sub: '7.69 km offtake route, north-west' },
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
        <img src={R('res_maps_gmaps_flythrough_base_png', 'assets/maps_gmaps_flythrough_base.png')} style={{
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
  function ModelShot({ start, end, src, loc, cap, stat, status = 'PROPOSED', dir = 1 }) {
    const slotId = 'model-' + src.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return (
      <Sprite start={start} end={end}>
        <DroneMove dir={dir} amt={0.55}>
          <image-slot id={slotId} src={src} shape="rect" fit="cover"
            placeholder={'Drop real footage to replace: ' + cap}
            style={{ width: '100%', height: '100%', display: 'block' }}></image-slot>
        </DroneMove>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.5} exitDur={0.4}>
          <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: SKY, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
            3D Preliminary Design Model &middot; Anaergia EPC
          </div>
          <StatusBadge kind={status} />
          <div style={{ position: 'absolute', left: '50%', top: 44, transform: 'translateX(-50%)', fontFamily: FH, fontSize: 19, fontWeight: 800, letterSpacing: 3, color: INK, background: GOLD, padding: '9px 22px', borderRadius: 4, textTransform: 'uppercase', pointerEvents: 'none' }}>
            Real drone footage slots in here
          </div>
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

  // ── Drone-style camera move — slow flyover push/pan for stills ────────────
  function DroneMove({ dir = 1, amt = 1, children }) {
    const { localTime, duration } = useSprite();
    const t = Easing.easeInOutSine(clamp(localTime / duration, 0, 1));
    const scale = 1.12 + 0.22 * amt * (1 - t);
    const tx = dir * amt * 3.2 * (1 - 2 * t);
    const ty = amt * 1.4 * (2 * t - 1);
    const rot = dir * amt * 0.5 * (1 - 2 * t);
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${scale}) translate(${tx}%, ${ty}%) rotate(${rot}deg)` }}>
          {children}
        </div>
      </div>
    );
  }

  // ── Footage slots: drag your MOV/MP4 from Finder onto each slot ──────────
  // video-slot.js is a custom element — persists via IndexedDB, no server needed.
  // Each slot id is stable: the dropped file survives page reload.

  // ── Real Google Maps satellite capture (site + region) ──────────────────
  function MapShot({ start, end, src, loc, cap, stat, status = 'EXISTING', dir = 1 }) {
    return (
      <Sprite start={start} end={end}>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.5} exitDur={0.4}>
          <DroneMove dir={dir}>
            <img src={src} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          </DroneMove>
        </FadeBox>
        <FadeBox x={0} y={0} width={W} height={H} entryDur={0.4} exitDur={0.35}>
          <div style={{ position: 'absolute', left: 60, top: 44, fontFamily: FH, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', background: PANEL_BG, padding: '6px 14px', borderRadius: 4, border: `1px solid ${BORDER}` }}>
            Google Maps &middot; Animated Satellite Flyover
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
        <video-slot id="closing-aerial" label="Closing Aerial Flyover · Fishwater Flats" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}></video-slot>
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
              <img src={R('res_Straits_Energy_Holdings_png', 'assets/Straits_Energy_Holdings.png')} style={{ height: 104 }} />
              <div style={{ width: 2, height: 70, background: BORDER }} />
              <img src={R('res_EnergiDrop_Logo_Transparent_png', 'assets/EnergiDrop_Logo_Transparent.png')} style={{ height: 126 }} />
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
    { start: 57, end: 62, type: 'VO', text: '"Here is how it works. Every day, sewage sludge from the treatment works and food waste from the city are received, blended, and fed into the plant."' },
    { start: 62, end: 67, type: 'VO', text: '"Inside three sealed digester tanks, naturally occurring microbes break that material down — releasing biogas, a renewable gas that is roughly two-thirds methane."' },
    { start: 67, end: 72, type: 'VO', text: '"The biogas is cleaned and put to work three ways: upgraded to biomethane vehicle fuel, burned in gas engines for electricity and heat, and refined into food-grade carbon dioxide."' },
    { start: 72, end: 77, type: 'VO', text: '"What remains becomes organic fertiliser, and the water recovered from the process is treated for reuse. Nothing goes to waste — five products from one plant."' },
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

  // ── On-screen VO subtitles (voiceover lines only) ──────────────────────────
  function Subtitles() {
    const time = useTime();
    let cur = null;
    for (const l of VO_SCRIPT) if (time >= l.start && time < l.end && l.type === 'VO') cur = l;
    if (!cur) return null;
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 128, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 40 }}>
        <div style={{ maxWidth: 1300, background: 'rgba(5,10,15,0.78)', border: `1px solid ${HAIR}`, borderRadius: 8, padding: '10px 24px', fontFamily: FB, fontStyle: 'italic', fontSize: 23, lineHeight: 1.4, color: SKY, textAlign: 'center' }}>
          <span style={{ fontFamily: FH, fontStyle: 'normal', fontWeight: 700, fontSize: 15, letterSpacing: 2, color: GOLD, marginRight: 12 }}>VO</span>
          {cur.text}
        </div>
      </div>
    );
  }

  // ── Full timeline assembly ───────────────────────────────────────────────
  function FWFVideo() {
    const [ready, setReady] = React.useState(false);
    React.useEffect(() => {
      let on = true;
      preloadResources().then(() => { if (on) setReady(true); });
      return () => { on = false; };
    }, []);
    if (!ready) {
      return (
        <div style={{ position: 'absolute', inset: 0, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontSize: 22, letterSpacing: 4, color: TXT_SUB, textTransform: 'uppercase' }}>
          Loading media…
        </div>
      );
    }
    return (
      <window.Stage width={W} height={H} duration={308} background={INK} persistKey="fwf-video">
        <BaseBg />
        <ScriptDrawer />
        <Subtitles />
        <TitleCard start={0} end={5} />
        <EarthFlyover start={5} end={15} videoOffset={0} label="Eastern Cape · South Africa" sublabel="Approaching Gqeberha — 1.2 million people" />
        <OutfallScene start={15} end={23} />
        <QuoteCard start={23} end={35} name="NMBM Official" role="Nelson Mandela Bay Municipality · Water & Sanitation"
          setting="Outdoor — WWTW perimeter, treatment infrastructure behind"
          quote="The infrastructure here has been under severe strain. We were out of compliance, we knew it — and the community was feeling it every day." />
        <StatCard start={35} end={37.7} big="8.5M tons" small="Organic waste landfilled in South Africa annually" />
        <StatCard start={37.7} end={40.3} big="R59 billion" small="Annual cost of load-shedding to the economy" />
        <StatCard start={40.3} end={43} big="Chronic scarcity" small="Water restrictions across the Eastern Cape" />
        <EarthFlyover start={43} end={46} videoOffset={8} label="Nelson Mandela Bay" sublabel="Eastern Cape · South Africa" />
        <EarthFlyover start={46} end={49} videoOffset={11} label="Gqeberha Metro" sublabel="Fishwater Flats WWTW · target site" />

        <EarthFlyover start={49} end={57} videoOffset={14} label="Fishwater Flats WWTW" sublabel="33°52′S · 25°37′E · 36 ha site" />
        {/* EnviTec-style process walkthrough — 4 annotated scenes */}

        <EnviTecSceneSprite start={57} end={62}
          slotId="envitec-feedstock"
          slotLabel="Feedstock Reception · tanker offloading / WWTW sludge intake"
          chip="Feedstock Reception"
          callouts={[
            { x1: 520, y1: 380, x2: 320, y2: 270, label: 'Sewage sludge', right: false, delay: 0.3 },
            { x1: 780, y1: 340, x2: 980, y2: 230, label: 'Liquid organics / FOG', right: true, delay: 0.7 },
            { x1: 960, y1: 480, x2: 1180, y2: 400, label: 'Co-substrate', right: true, delay: 1.1 },
          ]}
          arrows={[
            { x1: 760, y1: 560, x2: 760, y2: 700, label: 'To blending tanks', color: '#0090E0', delay: 1.5 },
          ]}
        />

        <EnviTecSceneSprite start={62} end={67}
          slotId="envitec-digesters-topdown"
          slotLabel="Digesters aerial top-down · IMG_2292 recommended"
          chip="Mesophilic Co-digestion"
          callouts={[
            { x1: 400, y1: 350, x2: 280, y2: 230, label: 'Digester A', right: false, delay: 0.3 },
            { x1: 760, y1: 310, x2: 760, y2: 190, label: 'Digester B', right: true, delay: 0.7 },
            { x1: 1120, y1: 350, x2: 1250, y2: 230, label: 'Digester C', right: true, delay: 1.1 },
          ]}
          arrows={[
            { x1: 380, y1: 540, x2: 1140, y2: 540, label: 'Substrate', color: '#0090E0', delay: 1.5 },
            { x1: 760, y1: 340, x2: 760, y2: 200, label: 'Biogas', color: '#E0A21A', delay: 2.0 },
          ]}
        />

        <EnviTecSceneSprite start={67} end={72}
          slotId="envitec-bgu"
          slotLabel="Biogas upgrading system · compressors / vessels"
          chip="Biogas Upgrading"
          callouts={[
            { x1: 600, y1: 400, x2: 400, y2: 290, label: 'Biogas cleaning', right: false, delay: 0.3 },
            { x1: 960, y1: 440, x2: 1160, y2: 340, label: 'CNG · 200 bar', right: true, delay: 0.8 },
          ]}
          arrows={[
            { x1: 200, y1: 500, x2: 1720, y2: 500, label: 'Biomethane', color: '#8Fb84f', delay: 1.4 },
          ]}
        />

        <EnviTecSceneSprite start={72} end={77}
          slotId="envitec-offtake"
          slotLabel="Offtake products · CNG loading / substation / cryo vessel"
          chip="Five Revenue Streams"
          callouts={[
            { x1: 440, y1: 400, x2: 300, y2: 280, label: 'CNG fuel', right: false, delay: 0.3 },
            { x1: 680, y1: 380, x2: 680, y2: 240, label: 'Electricity · 5 MWe', right: true, delay: 0.7 },
            { x1: 960, y1: 400, x2: 1120, y2: 280, label: 'Food-grade CO₂', right: true, delay: 1.1 },
            { x1: 1200, y1: 440, x2: 1380, y2: 320, label: 'Organic fertiliser', right: true, delay: 1.5 },
          ]}
        />
        <CHPScene start={77} end={84} />
        <QuoteCard start={84} end={98} name="Darius Boshoff" role="Transactional Engineering Advisor · Straits Energy"
          setting="Outdoor — standing at the Phase 1 pilot CHP unit"
          quote="What makes this unique is the co-digestion. We're not just processing municipal sludge — we're pulling in food waste, FOG, organic residues — and that combination significantly increases the biogas yield." />

        <BenefitsSection base={98} />
        <QuoteCard start={146} end={162} name="Straits Energy Principal" role="Straits Energy Holdings · Project Developer"
          setting="Indoor — office, warm light"
          quote="This is not a single-product energy project. This is an integrated infrastructure solution — every waste stream creates a revenue stream, and every revenue stream strengthens the investment case." />

<ModelShot start={162} end={170} src={R('res_3d_07_3d_png', 'assets/3d_07_3d.png')} loc="Proof of Concept" cap="Phase 1 Pilot — Operational" stat="50 kWe exported to NMBM LV grid — live today, not a render" />
        <EarthFlyover start={170} end={177} videoOffset={35} label="The land is there" sublabel="The feedstock is there · the partnerships are in place" />
        <CadReference start={177} end={181} src={R('res_cad_full_sheet_reference_png', 'assets/cad_full_sheet_reference.png')} title="General Layout Proposal" sub="Anaergia · Straits SA · Fishwater Flats · 24-0503-A04-001 · Rev 07" />
        <CadReference start={181} end={185} src={R('res_piping_routing_reference_jpg', 'assets/piping_routing_reference.jpg')} title="Piping & Routing Reference" sub="Heating water · biogas above/below ground · same drawing set, same scale" />
        {/* ── Existing → Proposed animated build (25s) ── */}
        <ExistingToProposedScene start={185} end={210} />
        {/* ── Earth Studio 3D flythrough (after build reveal) ── */}
        <ThreeFlyover start={210} end={218} videoOffset={15} label="Fishwater Flats Biogas Facility" sublabel="Proposed Phase 2/3 full plant — 3D model" />
        <ThreeFlyover start={218} end={225} videoOffset={22} label="Anaerobic Digesters ×3" sublabel="Triton CSTR · Ø32.5m · mesophilic co-digestion" />
        <ThreeFlyover start={225} end={232} videoOffset={28} label="CHP Hall + Gas Upgrading" sublabel="5 MWe embedded generation · biomethane offtake" />
        <ThreeFlyover start={232} end={238} videoOffset={33} label="Cryogenic CO₂ Unit" sublabel="30 tpd · food-grade liquefaction" />
        <ThreeFlyover start={238} end={244} videoOffset={37} label="Gas Holder Dome" sublabel="Double-membrane storage · biogas buffer" />
        <ModelShot start={244} end={248} src="assets/fwf_render_front.png" loc="Full Plant · SE Isometric" cap="Fishwater Flats Biogas Facility — Full Build" stat="3× Triton digesters · CHP hall · gas holder dome · BGU · cryo CO₂" />
        <ModelShot dir={-1} start={248} end={252} src="assets/fwf_render_top.png" loc="Site Layout — Top Isometric" cap="Full Site Development Plan" stat="Phase 1 pilot + Phase 2/3 full plant · digestate maturation zone" />
        <QuoteCard start={252} end={268} name="Yaniv Scherson" role="Chief Operating Officer · Anaergia (EPC Partner)"
          setting="Indoor — same framing as the Victor Valley commissioning video"
          quote="We've built this system. We know how it performs. What Straits Energy and NMBM are doing at Fishwater Flats is taking a proven co-digestion platform and deploying it where the environmental need — and the commercial case — are both exceptionally strong." />
        <CNGScene start={268} end={274} />
        <CO2Scene start={274} end={278} />
        <EarthFlyover start={278} end={283} videoOffset={38} label="7.69 km Biomethane Corridor" sublabel="Fishwater Flats → Perseverance Industrial" />
        <ThreeFlyover start={283} end={293} videoOffset={40} label="Fishwater Flats Biogas Facility" sublabel="Powering a sustainable future for Nelson Mandela Bay" />

        {/* SECTION 5 — Call to Action */}
        <EndCard start={293} end={308} />
      </window.Stage>
    );
  }

  window.FWFVideo = FWFVideo;
})();
