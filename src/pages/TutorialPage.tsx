import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/useGameContext';
import PageTitle from '../components/PageTitle';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RowData {
  letter: string;
  word?: string;
  name?: string;
  nameColor?: string;
  nameDistance?: string;
  prefix?: string;
  invisiblePrefix?: boolean;
  highlightGreen?: boolean;
}

// ─── Media helpers ────────────────────────────────────────────────────────────
const media = (name: string) => `/assets/media/${encodeURIComponent(name)}`;

// ─── Character (canvas, blue-bg removal, overlay support) ────────────────────
const Character: React.FC<{
  src: string;
  pos: 'bottom-left' | 'bottom-right' | 'bottom-center';
  fadeIn?: boolean;
  overlay?: React.ReactNode;
}> = ({ src, pos, fadeIn = true, overlay }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const img = new Image();
    const onLoad = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (b - r > 55 && g - r > 45 && r > 80) d[i + 3] = 0;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch { /* CORS: show as-is */ }
    };
    img.onload = onLoad;
    img.src = src;
    if (img.complete) onLoad();
  }, [src]);

  const posStyle: React.CSSProperties =
    pos === 'bottom-left'  ? { bottom: 0, left: 0 } :
    pos === 'bottom-right' ? { bottom: 0, right: 0 } :
    /* bottom-center */      { bottom: 0, left: '50%', transform: 'translateX(-50%)' };

  return (
    <div
      className={fadeIn ? 'animate-fade-in' : undefined}
      style={{
        position: 'fixed',
        zIndex: 50,
        pointerEvents: 'none',
        userSelect: 'none',
        width: dims.w || 'auto',
        height: dims.h || 'auto',
        ...posStyle,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {/* Overlay sits absolutely within the character div — percentages track image dimensions */}
      {dims.w > 0 && overlay && (
        <div style={{ position: 'absolute', inset: 0 }}>{overlay}</div>
      )}
    </div>
  );
};

// ─── Character overlays ───────────────────────────────────────────────────────

/** Animated "..." on the secondary character's triangular-hat forehead area (Image 1 brown zone) */
const EllipsisOverlay: React.FC = () => (
  <div style={{
    position: 'absolute',
    left: '29%',
    top: '24%',
    width: '28%',
    display: 'flex',
    gap: '3px',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        display: 'block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#1e293b',
        animation: `dotBounce 0.9s ${i * 0.3}s ease-in-out infinite`,
      }} />
    ))}
  </div>
);

/** Spinning vortex on Albert's triangular-face forehead area (Image 2 brown circle zone) */
const SpiralOverlay: React.FC = () => (
  <div style={{
    position: 'absolute',
    left: '33%',
    top: '20%',
    width: '24%',
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    background: 'conic-gradient(from 0deg, #8b5cf6 0%, #06b6d4 50%, #8b5cf6 100%)',
    animation: 'spin 1.2s linear infinite',
    opacity: 0.9,
  }} />
);

// ─── Fullscreen image (for reaction + newspaper sequences) ────────────────────
const FullscreenImg: React.FC<{ src: string }> = ({ src }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: 300, background: '#000',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
  </div>
);

// ─── Dialogue boxes ───────────────────────────────────────────────────────────
const DLG_BASE: React.CSSProperties = {
  padding: '1.4rem 2rem',
  maxWidth: '520px',
  fontSize: '1.15rem',
  borderRadius: '1.5rem',
  background: 'rgba(255,255,255,0.98)',
  color: '#1e293b',
  boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
  border: '1px solid #cbd5e1',
  lineHeight: 1.55,
  pointerEvents: 'none' as const,
};

const Dialogue: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; delay?: boolean }> = ({ children, style, delay }) => (
  <div
    className={delay ? 'glass-panel animate-fade-in delay-2' : 'glass-panel animate-fade-in'}
    style={{ position: 'fixed', zIndex: 100, ...DLG_BASE, ...style }}
  >
    {children}
  </div>
);

const DialogueInline: React.FC<{ children: React.ReactNode; delay?: boolean }> = ({ children, delay }) => (
  <div
    className={delay ? 'glass-panel animate-fade-in delay-2' : 'glass-panel animate-fade-in'}
    style={{ ...DLG_BASE }}
  >
    {children}
  </div>
);

const StackedDialogues: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    position: 'fixed', bottom: '15rem', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column', gap: '0.8rem',
    zIndex: 100, pointerEvents: 'none', alignItems: 'center',
  }}>
    {children}
  </div>
);

const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="glass-panel animate-fade-in" style={{
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    padding: '2rem 2.8rem', maxWidth: '540px', fontSize: '1.3rem',
    borderRadius: '1.5rem', background: 'rgba(255,255,255,0.98)', color: '#1e293b',
    boxShadow: '0 12px 40px rgba(0,0,0,0.14)', border: '1px solid #cbd5e1',
    zIndex: 120, lineHeight: 1.55, textAlign: 'center', pointerEvents: 'none',
  }}>
    {children}
  </div>
);

// ─── Acrostic Row ─────────────────────────────────────────────────────────────
const AcrosticRow: React.FC<RowData & { style?: React.CSSProperties }> = ({
  letter, word, name, nameColor = '#1e293b', nameDistance = '3.5cm',
  prefix, invisiblePrefix = false, highlightGreen = false, style,
}) => {
  const wordParts = word ? word.split(' ') : [];
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '3.8rem', position: 'relative', ...style }}>
      {name && (
        <span style={{
          position: 'absolute',
          right: `calc(100% + ${nameDistance})`,
          fontSize: '1.6rem', fontWeight: 800, color: nameColor, whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
      )}
      {/* Prefix absolutely positioned — never displaces the letter */}
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', right: '100%',
            opacity: invisiblePrefix ? 0 : 1,
            fontSize: '3.2rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1, whiteSpace: 'nowrap',
          }}>
            {prefix}
          </span>
        )}
        <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}>
          {letter}
        </span>
      </div>
      {wordParts.length > 0 && (
        <span style={{ marginLeft: '0.6rem', fontSize: '3.2rem', fontWeight: 700, color: '#334155', lineHeight: 1, display: 'flex', gap: '0.6rem' }}>
          {wordParts.map((w, idx) => {
            const clean = w.replace(/[¿?.!,…]/g, '').toLowerCase();
            const isNexo = clean === 'el' || clean === 'de';
            return (
              <span key={idx} style={{
                textDecoration: highlightGreen && isNexo ? 'underline' : 'none',
                textDecorationColor: '#10b981', textDecorationThickness: '4px',
              }}>
                {w}
              </span>
            );
          })}
        </span>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useGameContext();
  const [step, setStep]             = useState(0);
  const [locked, setLocked]         = useState(false);
  const [dearrozCount, setDearrozCount] = useState(0);
  const [wordsCount, setWordsCount]     = useState(0);
  const [granoInteractive, setGranoInteractive] = useState(['', '', '', '', '']); // G, R, A, N, O
  const [isInteractiveGrano, setIsInteractiveGrano] = useState(false);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showClickHint, setShowClickHint] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('vertic_tutorial_completed') === 'true') {
      setHasCompletedBefore(true);
    }
  }, []);

  useEffect(() => {
    if (step === 0) {
      setLocked(true);
      const t = setTimeout(() => { setStep(1); setLocked(false); }, 500);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      setShowClickHint(true);
      const t = setTimeout(() => setShowClickHint(false), 2500);
      return () => clearTimeout(t);
    }
    if (step === 23) {
      setLocked(true);
      const t = setTimeout(() => { setStep(24); setLocked(false); }, 500);
      return () => clearTimeout(t);
    }
    if (step === 30) {
      setLocked(true); setDearrozCount(0);
      let c = 0;
      const iv = setInterval(() => {
        c++; setDearrozCount(c);
        if (c >= 7) { clearInterval(iv); setStep(31); setLocked(false); }
      }, 750);
      return () => clearInterval(iv);
    }
    if (step === 32) {
      setLocked(true); setWordsCount(0);
      let c = 0;
      const iv = setInterval(() => {
        c++; setWordsCount(c);
        if (c >= 7) { clearInterval(iv); setLocked(false); }
      }, 667);
      return () => clearInterval(iv);
    }
    if (step === 37) {
      const t = setTimeout(() => setStep(38), 1000);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step >= 37) {
      const handleScroll = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;
        if (scrollHeight > clientHeight) {
           setScrollPercent(Math.min(1, Math.max(0, scrollTop / (scrollHeight - clientHeight))));
        } else {
           setScrollPercent(1);
        }
      };
      window.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [step]);

  const next = () => {
    if (locked) return;
    if (step === 7) return;                      // blocked — YES/NO buttons
    if (step >= 38) return;                      // finale scroll + end sequence: use buttons
    if (step === 12) {
      setStep(14);
      return;
    }
    setStep(s => s + 1);
  };

  // ── GRANO rows ───────────────────────────────────────────────────────────────
  const granoRows: RowData[] = [
    { letter: 'G', prefix: '¿', invisiblePrefix: step < 19,
      word: step >= 19 ? 'anaremos' : undefined,
      name: step >= 18 ? 'Albert' : undefined, nameColor: '#1e293b' },
    { letter: 'R', word: step >= 19 ? 'iquezas?' : undefined },
    { letter: 'A', word: step >= 20 ? 'horrando' : undefined,
      name: step >= 20 ? 'Yo' : undefined, nameColor: '#10b981' },
    { letter: 'N', word: step >= 20 ? 'o,' : undefined },
    { letter: 'O', word: step >= 20 ? 'bviamente.' : undefined },
  ];

  // ── DEARROZ extension rows ────────────────────────────────────────────────────
  const dearrozRows: RowData[] = [
    { letter: 'D', word: wordsCount >= 1 ? 'iantre.'      : undefined, name: step >= 32 ? 'Albert' : undefined, nameColor: '#1e293b' },
    { letter: 'E', word: wordsCount >= 2 ? 'ntonces, ¿el' : undefined, highlightGreen: step >= 33 },
    { letter: 'A', word: wordsCount >= 3 ? 'horro de'     : undefined, highlightGreen: step >= 33 },
    { letter: 'R', word: wordsCount >= 4 ? 'iquezas'      : undefined },
    { letter: 'R', word: wordsCount >= 5 ? 'esulta'       : undefined },
    { letter: 'O', word: wordsCount >= 6 ? 'bsoleto…?'    : undefined },
    { letter: 'Z', word: wordsCount >= 7 ? 'asca.'        : undefined, name: step >= 32 ? 'Yo' : undefined, nameColor: '#10b981' },
  ];

  // ── Finale ────────────────────────────────────────────────────────────────────
  // E(0)S(1)T(2)E(3)P(4)E(5)Q(6)U(7)E(8)Ñ(9)O(10)J(11)U(12)E(13)G(14)O(15)
  // A(16)B(17)R(18)A(19)Z(20)A(21)L(22)A(23)I(24)M(25)P(26)E(27)R(28)F(29)
  // E(30)C(31)C(32)I(33)O(34)N(35)
  const FINALE             = 'ESTEPEQUEÑOJUEGOABRAZALAIMPERFECCION';
  const ALBERT_IDX         = new Set([0, 24]);
  const YO_IDX             = new Set([12, 28]);
  const QUEST_IDX          = new Set([13, 27]);
  const QUEST_INVISIBLE_IDX = 13;

  const FINALE_WORDS: (string | undefined)[] = [
    'scuche con',    'abiduría:',     'iene',        'stas',        'alabras,',
    'n las',         'ue',            'sted',          'xpresará',   'oñerías',
    'bjetivamente',  'ocosas.',       'hh...',         'xpresarme?', 'racias,',
    'h,',            'cróstico.',     'uscaré',        'esolver',    'crósticos',
    'igzagueantes',  'nte',           'a',             'dversidad.', 'nteresante',
    'aquinaria de',  'alabras,',      'h?',            'esulta',     'ascinante',
    'xpresarme',     'on',            'ada',           'nsignificante', 'rden', 'ominal.',
  ];

  const finaleSentence = ["Este", "pequeño", "juego", "abraza", "la", "imperfección"];
  const wordsToShow = Math.min(6, Math.floor(scrollPercent * 6.01));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      onMouseDown={next}
      onScroll={(e) => {
        if (step >= 37) {
          const t = e.currentTarget;
          if (t.scrollHeight > t.clientHeight) {
            setScrollPercent(Math.min(1, Math.max(0, t.scrollTop / (t.scrollHeight - t.clientHeight))));
          }
        }
      }}
      style={{
        width: '100vw',
        minHeight: '100vh',
        height: (step >= 37 && step <= 38) ? 'auto' : '100vh',
        overflowY: (step >= 37 && step <= 38) ? 'auto' : 'hidden',
        background: '#ffffff',
        cursor: locked ? 'wait' : 'pointer',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <PageTitle title="Tutorial" />

      <div style={{ position: 'fixed', top: '2rem', left: '2rem', zIndex: 1000, display: 'flex', gap: '1rem' }}>
        {hasCompletedBefore && (
          <button
            className="btn btn-secondary animate-fade-in"
            style={{
              pointerEvents: 'auto',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/');
            }}
          >
            Volver al menú
          </button>
        )}
      </div>

      {/* ── Characters ──────────────────────────────────────────────────────── */}
      {showClickHint && (
        <div 
          className="animate-fade-out" 
          style={{
            position: 'fixed',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            padding: '0.8rem 2rem',
            borderRadius: '2rem',
            pointerEvents: 'none',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            border: '1px solid var(--accent-primary)'
          }}
        >
          Haz click para avanzar
        </div>
      )}

      {step >= 1 && step <= 7 &&
        <Character src="/assets/crostic.png" pos="bottom-center" fadeIn={step === 1} />}

      {step === 9 && <Character src="/assets/crostic.png" pos="bottom-left" />}

      {(step === 10 || step === 11) && <>
        <Character src="/assets/crostic.png" pos="bottom-left" fadeIn={false} />
        <Character
          src="/assets/placeholder2.png"
          pos="bottom-right"
          overlay={undefined}
        />
      </>}

      {step >= 12 && step <= 36 &&
        <Character src="/assets/crostic.png" pos="bottom-center" fadeIn={step === 12} />}

      {/* ── Scene content ────────────────────────────────────────────────────── */}

      {/* Steps 4-5: bare GRANO */}
      {(step === 4 || step === 5) && (
        <div style={{ position: 'fixed', top: '8vh', left: '15cm', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {['G','R','A','N','O'].map(l => <AcrosticRow key={l} letter={l} />)}
        </div>
      )}

      {/* Steps 6-7: GRANO with words */}
      {(step === 6 || step === 7) && !isInteractiveGrano && (
        <div style={{ position: 'fixed', top: '8vh', left: '15cm', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <AcrosticRow letter="G" word="igantes" />
          <AcrosticRow letter="R" word="icachones" />
          <AcrosticRow letter="A" word="tufaron" />
          <AcrosticRow letter="N" word="uevo" />
          <AcrosticRow letter="O" word="lor" />
        </div>
      )}

      {/* Interactive GRANO */}
      {isInteractiveGrano && (
        <div style={{ position: 'fixed', top: '8vh', left: '15cm', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 100 }}>
          {['G','R','A','N','O'].map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#8b5cf6', width: '40px' }}>{l}</span>
              <input 
                type="text" 
                maxLength={15}
                value={granoInteractive[i]}
                onChange={e => {
                  const newWords = [...granoInteractive];
                  newWords[i] = e.target.value;
                  setGranoInteractive(newWords);
                }}
                placeholder="..."
                style={{
                  fontSize: '2rem',
                  padding: '0.5rem',
                  border: 'none',
                  borderBottom: '2px solid #cbd5e1',
                  outline: 'none',
                  color: '#334155',
                  width: '300px'
                }}
              />
            </div>
          ))}
          {(() => {
            const isComplete = granoInteractive.every((w, idx) => idx === 2 || w.trim().length > 0);
            if (isComplete) {
              return (
                <button 
                  className="btn btn-primary animate-fade-in"
                  style={{ marginTop: '2rem', pointerEvents: 'auto' }}
                  onMouseDown={e => {
                    e.stopPropagation();
                    setIsInteractiveGrano(false);
                    setStep(8);
                  }}
                >
                  Terminado
                </button>
              );
            }
            return null;
          })()}
        </div>
      )}

      {step === 8  && <InfoBox>Muy bien, continuemos.</InfoBox>}
      {step === 11 && <InfoBox>Un verticálogo es un diálogo, ¡como el que estamos teniendo!</InfoBox>}

      {/* Step 13: both phrases fully verticalized */}
      {step === 13 && (() => {
        const p1  = 'QUEESUNVERTICALOGODICESMIENTRASCLAVASENMIPUPILATUPUPILAAZUL';
        const p2  = 'ESOTEESTOYPREGUNTANDO';
        const mid = Math.ceil(p1.length / 2);
        const col1 = p1.slice(0, mid), col2 = p1.slice(mid);
        const ls: React.CSSProperties = { fontSize: '0.95rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1.08 };
        const ls2: React.CSSProperties = { fontSize: '0.95rem', fontWeight: 900, color: '#10b981', lineHeight: 1.08 };
        return (
          <div className="animate-fade-in" style={{ position: 'fixed', top: '3vh', left: '3rem', right: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '1.8rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {col1.split('').map((c, i) => <span key={i} style={ls}>{c}</span>)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {col2.split('').map((c, i) => <span key={i} style={ls}>{c}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {p2.split('').map((c, i) => <span key={i} style={ls2}>{c}</span>)}
            </div>
          </div>
        );
      })()}

      {/* Steps 14-36: GRANO + DEARROZ */}
      {step >= 14 && step <= 36 && (
        <div style={{ position: 'fixed', top: '8vh', left: '15cm', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {granoRows.map((r, i) => <AcrosticRow key={i} {...r} />)}
          {step >= 30 && dearrozRows.map((r, i) => (
            <AcrosticRow key={`d${i}`} {...r}
              style={{ opacity: dearrozCount > i ? 1 : 0, transition: 'opacity 0.3s' }}
            />
          ))}
        </div>
      )}

      {/* Steps 37-38: FINALE scroll */}
      {step >= 37 && step <= 38 && (
        <div style={{ paddingTop: '10vh', paddingBottom: '10vh', paddingLeft: '25cm', display: 'flex', flexDirection: 'column', gap: '0.3rem', minHeight: '100vh' }}>
          {FINALE.split('').map((c, i) => (
            <AcrosticRow
              key={i}
              letter={c}
              word={FINALE_WORDS[i]}
              prefix={QUEST_IDX.has(i) ? '¿' : undefined}
              invisiblePrefix={i === QUEST_INVISIBLE_IDX && step === 37}
              name={step >= 38 ? (ALBERT_IDX.has(i) ? 'Albert' : YO_IDX.has(i) ? 'Yo' : undefined) : undefined}
              nameColor={ALBERT_IDX.has(i) ? '#1e293b' : '#10b981'}
              nameDistance="1.5cm"
            />
          ))}
          
          {/* Scroll-generated sentence on the right */}
          <div style={{
            position: 'fixed', top: '50%', right: '15%', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start',
            pointerEvents: 'none'
          }}>
            {finaleSentence.slice(0, wordsToShow).map((w, idx) => (
              <span key={idx} className="animate-fade-in" style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                {w}
              </span>
            ))}
          </div>

          {/* "Continuar" — explicit button so the user can scroll freely before continuing */}
          {step === 38 && (
            <button
              className="btn btn-primary animate-fade-in"
              style={{ alignSelf: 'flex-start', margin: '4rem 0', pointerEvents: 'auto' }}
              onMouseDown={e => { 
                e.stopPropagation(); 
                localStorage.setItem('vertic_tutorial_completed', 'true');
                dispatch({ type: 'COMPLETE_TUTORIAL' });
                navigate('/'); 
              }}
            >
              Volver al menú de inicio
            </button>
          )}
        </div>
      )}

      {/* ── Dialogue layer ───────────────────────────────────────────────────── */}
      {!isInteractiveGrano && (
        <SceneController step={step} onChoice={setStep} setIsInteractiveGrano={setIsInteractiveGrano} />
      )}
    </div>
  );
};

// ─── Scene Controller ─────────────────────────────────────────────────────────
const SceneController: React.FC<{ step: number; onChoice: (s: number) => void; setIsInteractiveGrano: (b: boolean) => void }> = ({ step, onChoice, setIsInteractiveGrano }) => {
  const C: React.CSSProperties = { bottom: '15rem', left: '50%', transform: 'translateX(-50%)' };
  const L: React.CSSProperties = { bottom: '15rem', left: '5rem',  transform: 'none' };
  const R: React.CSSProperties = { bottom: '15rem', right: '5rem', transform: 'none' };

  switch (step) {
    case 1:  return <Dialogue style={C}>¡Hola! Soy Albert Crostic.</Dialogue>;
    case 2:  return <Dialogue style={C}>Así que quieres saber qué son los verticálogos, ¿eh?</Dialogue>;
    case 3:  return <Dialogue style={C}>¡Normal! Si no, ¿cómo vas a saber cómo jugar? Vamos a ir al grano.</Dialogue>;
    case 4:  return <Dialogue style={C}>Aquí tenemos el grano. Concretamente, la palabra grano…</Dialogue>;
    case 5:  return <Dialogue style={C}>… pero puesta de arriba abajo.</Dialogue>;
    case 6:  return <Dialogue style={C}>Esto se llama acróstico. Poniendo en práctica nuestro vocabulario podemos ser creativos con cada una de sus letras.</Dialogue>;

    case 7:
      return (
        <div style={{ position: 'fixed', bottom: '22rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 200 }}>
          <DialogueInline>¿Quieres hacer uno?</DialogueInline>
          <div style={{ display: 'flex', gap: '2rem', pointerEvents: 'auto' }}>
            <button className="btn btn-primary" onMouseDown={e => { e.stopPropagation(); onChoice(7); setIsInteractiveGrano(true); }}>SÍ</button>
            <button className="btn btn-primary" onMouseDown={e => { e.stopPropagation(); onChoice(8); }}>NO</button>
          </div>
        </div>
      );

    case 9:  return <Dialogue style={L}>¿Qué es un verticálogo, dices, mientras clavas en mi pupila tu pupila azul?</Dialogue>;
    case 10: return <Dialogue style={R}>Eso te estoy preguntando.</Dialogue>;
    case 12: return <Dialogue style={C}>Pero… un diálogo hecho mediante un acróstico.</Dialogue>;
    case 15: return <Dialogue style={C}>Si esta vez fuéramos al grano, como antes, ¡nos quedaríamos cortos!</Dialogue>;
    case 16: return <Dialogue style={C}>GRANO es una palabra muy corta para hacer una conversación con ella.</Dialogue>;

    case 17:
      return (
        <StackedDialogues>
          <DialogueInline>GRANO es una palabra muy corta para hacer una conversación con ella.</DialogueInline>
          <DialogueInline delay>A no ser…</DialogueInline>
        </StackedDialogues>
      );

    case 18: return <Dialogue style={C}>Hmm… imagina que ponemos aquí, al principio, a un personaje llamado… Albert. Gran nombre.</Dialogue>;
    case 19: return <Dialogue style={C}>Y ahora imagina que mediante la G y la R nos hace una pregunta: «¿Ganaremos riquezas?»</Dialogue>;
    case 20: return <Dialogue style={C}>¡Y entonces sales tú, y le contestas en el ANO!</Dialogue>;

    case 21:
      return (
        <StackedDialogues>
          <DialogueInline>¡Y entonces sales tú, y le contestas en el ANO!</DialogueInline>
          <DialogueInline delay>Ay, perdón.</DialogueInline>
        </StackedDialogues>
      );

    case 22: return <Dialogue style={C}>¡Hemos hecho un diálogo! Un breve pero efectivo diálogo teatral.</Dialogue>;
    case 23: return <Dialogue style={C}>…</Dialogue>;

    case 24:
      return (
        <StackedDialogues>
          <DialogueInline>…</DialogueInline>
          <DialogueInline delay>Va siendo hora de que hable un poco de mí: Yo, Albert Crostic, soy un promotor de obras de teatro.</DialogueInline>
        </StackedDialogues>
      );

    case 25: return <Dialogue style={C}>Y pienso que…</Dialogue>;
    case 26: return <Dialogue style={C}>... ¡Pienso que GRANO es un guión que nunca promocionaría! ¡Es muy corto! Y no usa nexos.</Dialogue>;

    case 27:
      return (
        <StackedDialogues>
          <DialogueInline>... ¡Pienso que GRANO es un guión que nunca promocionaría! ¡Es muy corto! Y no usa nexos.</DialogueInline>
          <DialogueInline delay>Lo cual tampoco está mal, tiene su mérito, pero…</DialogueInline>
        </StackedDialogues>
      );

    case 28: return <Dialogue style={C}>Espera, ¿no sabes lo que son los nexos?</Dialogue>;
    case 29: return <Dialogue style={C}>¡Te lo aclararé! Y te enseño un ejemplo más de mi gusto.</Dialogue>;
    case 31: return <Dialogue style={C}>Primero de todo, alarguemos de GRANO a GRANO DE ARROZ. Sigue siendo poco pero nos servirá para ilustrarte.</Dialogue>;
    case 33: return <Dialogue style={C}>Como observarás, he incluido un par de palabras extra en un par de sitios. Esos son los nexos, y no vale cualquiera: descubrirás cuáles puedes poner y cuáles no.</Dialogue>;
    case 34: return <Dialogue style={C}>Podrás comprobar por tu cuenta qué es posible para ti hacer en esta actividad. Nexos, nexos que empiezan con interrogación como ese de ahí, puntos suspensivos, comas… Diversas posibilidades.</Dialogue>;
    case 35: return <Dialogue style={C}>Sin embargo, el límite de lo que puedes hacer lo marca el límite de tu vocabulario. ¿Serías capaz de hacer un verticálogo en el que salga la palabra «electroencefalografista»? No solo te lo estrenaría, sino que pagaría por ver algo así.</Dialogue>;
    case 36: return <Dialogue style={C}>Con esto acaba el tutorial. Pero hay una última cosa que quiero comunicar antes de empezar este taller literario. Mi regalo de despedida:</Dialogue>;
    default: return null;
  }
};

export default TutorialPage;
