import os

with open("src/pages/TutorialPage.tsx", "w", encoding="utf-8") as f:
    f.write("""import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// ─── CrosticCircle (Updated to use img tag) ───────────────────────────────────
const CrosticCircle: React.FC<{
  label?: string; size?: number; style?: React.CSSProperties;
  fadeIn?: boolean; color?: string; isImage?: boolean; imgSrc?: string;
}> = ({ label = 'Albert Crostic', size = 120, style, fadeIn = true, color = '#8b5cf6', isImage = false, imgSrc }) => {
  if (isImage && imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={label}
        className={fadeIn ? 'animate-fade-in' : undefined}
        style={{
          width: size, height: size, objectFit: 'contain',
          flexShrink: 0, userSelect: 'none', ...style
        }}
        draggable={false}
      />
    );
  }
  return (
    <div
      className={fadeIn ? 'animate-fade-in' : undefined}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(30,41,59,0.95)', backdropFilter: 'blur(12px)',
        border: `2px solid ${color}`, boxShadow: `0 0 32px ${color}80, inset 0 0 20px ${color}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: label.length > 9 ? '0.72rem' : '0.95rem',
        fontWeight: 700, color: '#f8fafc', textAlign: 'center',
        padding: '0.5rem', lineHeight: 1.3, flexShrink: 0, userSelect: 'none', ...style,
      }}
    >{label}</div>
  );
};

// ─── Bubble ───────────────────────────────────────────────────────────────────
const Bubble: React.FC<{
  children: React.ReactNode; style?: React.CSSProperties; delay?: boolean;
}> = ({ children, style, delay }) => (
  <div
    className={delay ? 'glass-panel animate-fade-in delay-3' : 'glass-panel animate-fade-in'}
    style={{
      padding: '1.2rem 1.6rem', maxWidth: '430px', fontSize: '1.05rem',
      lineHeight: 1.65, border: '1px solid rgba(139,92,246,0.35)',
      borderRadius: '1.25rem', ...style,
    }}
  >{children}</div>
);

const SideLabel: React.FC<{ name: string; aqui?: boolean; color?: string; }> = ({ name, aqui, color = '#10b981' }) => (
  <div
    className="animate-fade-in"
    style={{
      position: 'absolute', right: 'calc(100% + 18px)', top: '-0.2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}
  >
    {aqui && (
      <>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color, letterSpacing: '3px', whiteSpace: 'nowrap' }}>AQUÍ</span>
        <svg width="20" height="32" viewBox="0 0 20 32" fill="none" style={{ display: 'block' }}>
          <line x1="10" y1="0" x2="10" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="3,18 10,28 17,18" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </>
    )}
    <span style={{
      fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc',
      textShadow: `0 0 16px ${color}8c`, whiteSpace: 'nowrap', marginTop: '2px',
    }}>{name}</span>
  </div>
);

// ─── GRANO column ─────────────────────────────────────────────────────────────
const LETTERS = ['G', 'R', 'A', 'N', 'O'];
const ORIG_WORDS = ['igantes', 'icachones', 'tufaron', 'uevo', 'lor'];
const GR_WORDS: (string | null)[] = ['anaremos', 'iquezas?', null, null, null];
const ANO_WORDS: (string | null)[] = [null, null, 'horrando', 'o,', 'bviamente'];

interface GranoColProps {
  words?: boolean; grWords?: boolean; anoWords?: boolean;
  albert?: boolean; playerName?: string; hiddenWords?: boolean;
}

const GranoCol: React.FC<GranoColProps> = ({ words, grWords, anoWords, albert, playerName, hiddenWords }) => {
  const getWord = (i: number): string | null => {
    if (hiddenWords) return null;
    if (words) return ORIG_WORDS[i];
    if (grWords && GR_WORDS[i]) return GR_WORDS[i];
    if (anoWords && ANO_WORDS[i]) return ANO_WORDS[i];
    return null;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      {LETTERS.map((l, i) => {
        const word = getWord(i);
        const showGrPrefix = grWords && !hiddenWords && i === 0;
        return (
          <div key={l} style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>
            {albert && i === 0 && <SideLabel name="Albert" aqui />}
            {playerName && i === 2 && <SideLabel name={playerName} color="#3b82f6" />}
            {showGrPrefix && <span style={{ fontSize: '3rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}>¿</span>}
            <span style={{
              fontSize: '3rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1,
              textShadow: '0 0 20px rgba(139,92,246,0.6)', minWidth: '2.6rem',
            }}>{l}</span>
            {word && <span style={{ fontSize: '3rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>{word}</span>}
          </div>
        );
      })}
    </div>
  );
};

// ─── GRANODEARROZ column ──────────────────────────────────────────────────────
const GDA_LETTERS = ['G', 'R', 'A', 'N', 'O', 'D', 'E', 'A', 'R', 'R', 'O', 'Z'];
const GDA_WORDS: (string | null)[] = ['anaremos', 'iquezas?', 'horrando', 'o,', 'bviamente', 'iantre.', 'ntonces, ¿el', 'horro de', 'iquezas', 'esulta', 'bsoleto...?', 'asca.'];

interface GdaColProps {
  revealStep: number; // 0: just GRANODEARROZ, 1: D, 2: E, etc. (max 8 for Z)
  playerName?: string;
  stepExtraWords?: number; // 28: highlights
}

const GranodearrozCol: React.FC<GdaColProps> = ({ revealStep, playerName, stepExtraWords }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '-3rem' }}>
      {GDA_LETTERS.map((l, i) => {
        // Words for index 0..4 are shown immediately
        let showWord = (i <= 4);
        if (i > 4 && revealStep >= (i - 4)) showWord = true; // D=idx 5 -> revealStep 1
        
        let wordContent: React.ReactNode = showWord ? GDA_WORDS[i] : null;

        // Custom highlight logic for nexos
        if (showWord && stepExtraWords !== undefined) {
           if (i === 6) { // 'ntonces, ¿el'
              wordContent = <>ntonces, ¿<span style={{ color: stepExtraWords >= 28 ? '#10b981' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>el</span></>;
           }
           if (i === 7) { // 'horro de'
              wordContent = <>horro <span style={{ color: stepExtraWords >= 28 ? '#10b981' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>de</span></>;
           }
        }

        const showGrPrefix = (i === 0);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>
            {i === 5 && revealStep >= 0 && <SideLabel name="Albert" />}
            {i === 11 && revealStep >= 7 && <SideLabel name={playerName || 'Player'} color="#3b82f6" />}
            {showGrPrefix && <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}>¿</span>}
            <span style={{
              fontSize: '2.2rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1,
              textShadow: '0 0 20px rgba(139,92,246,0.6)', minWidth: '1.9rem',
            }}>{l}</span>
            {wordContent && <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>{wordContent}</span>}
          </div>
        );
      })}
    </div>
  );
};

// ─── GRAN VERTICALOGO FINAL ───────────────────────────────────────────────────
const ESTE_DATA = [
  { char: 'E', word: 'scucha', post: '', nexo: 'con', actor: 'Albert', id: 0 },
  { char: 'S', word: 'abiduría:', post: '', nexo: '', id: 1 },
  { char: 'T', word: 'ienes', post: '', nexo: '', id: 2 },
  { char: 'E', word: 'stas', post: '', nexo: '', id: 3 },
  { char: 'P', word: 'alabras,', post: '', nexo: '', id: 4 },
  { char: 'E', word: 'n', post: '', nexo: 'las', id: 5 },
  { char: 'Q', word: 'ue', post: '', nexo: '', id: 6 },
  { char: 'U', word: 'sted', post: '', nexo: '', id: 7 },
  { char: 'E', word: 'xpresará', post: '', nexo: '', id: 8 },
  { char: 'Ñ', word: 'oñerías', post: '', nexo: '', id: 9 },
  { char: 'O', word: 'bjetivamente', post: '', nexo: '', id: 10 },
  { char: 'J', word: 'ocosas.', post: '', nexo: '', id: 11 },
  { char: 'U', word: 'hh...', pre: '', post: ' ¿', nexo: '', actor: 'PLAYER', id: 12 }, 
  { char: 'E', word: 'xpresarme?', post: '', nexo: '', id: 13 },
  { char: 'G', word: 'racias,', post: '', nexo: '', id: 14 },
  { char: 'O', word: 'h,', post: '', nexo: '', id: 15 },
  { char: 'A', word: 'cróstico.', post: '', nexo: '', id: 16 },
  { char: 'B', word: 'uscaré', post: '', nexo: '', id: 17 },
  { char: 'R', word: 'esolver', post: '', nexo: '', id: 18 },
  { char: 'A', word: 'crósticos', post: '', nexo: '', id: 19 },
  { char: 'Z', word: 'igzagueantes', post: '', nexo: '', id: 20 },
  { char: 'A', word: 'nte', post: '', nexo: '', id: 21 },
  { char: 'L', word: 'a', post: '', nexo: '', id: 22 },
  { char: 'A', word: 'dversidad.', post: '', nexo: '', id: 23 },
  { char: 'I', word: 'nteresante', post: '', nexo: '', actor: 'Albert', id: 24 },
  { char: 'M', word: 'aquinaria', post: '', nexo: 'de', id: 25 },
  { char: 'P', word: 'alabras,', pre: '', post: ' ¿', nexo: '', id: 26 },
  { char: 'E', word: 'h?', post: '', nexo: '', id: 27 },
  { char: 'R', word: 'esulta', post: '', nexo: '', actor: 'PLAYER', id: 28 },
  { char: 'F', word: 'ascinante', post: '', nexo: '', id: 29 },
  { char: 'E', word: 'xpresarme', post: '', nexo: '', id: 30 },
  { char: 'C', word: 'on', post: '', nexo: '', id: 31 },
  { char: 'C', word: 'ada', post: '', nexo: '', id: 32 },
  { char: 'I', word: 'nsignificante', post: '', nexo: '', id: 33 },
  { char: 'O', word: 'rden', post: '', nexo: '', id: 34 },
  { char: 'N', word: 'ominal.', post: '', nexo: '', id: 35 },
];

const GranVerticalogoCol: React.FC<{ phase: number; playerName: string }> = ({ phase, playerName }) => {
   // phase 0: nothing, phase 1: letters, phase 2: +names, phase 3: +words, phase 4: +nexos
   return (
       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingBottom: '6rem' }}>
          {ESTE_DATA.map((row, i) => {
             const showChar = phase >= 1;
             const showName = phase >= 2 && row.actor;
             const showWord = phase >= 3;
             const showNexo = phase >= 4 && row.nexo;
             const nameStr = row.actor === 'PLAYER' ? playerName : row.actor;
             const nameColor = row.actor === 'PLAYER' ? '#3b82f6' : '#10b981';

             return (
                 <div key={i} style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>
                    {showName && <SideLabel name={nameStr!} color={nameColor} />}
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1, textShadow: '0 0 10px rgba(139,92,246,0.6)', minWidth: '1.2rem', textAlign: 'center' }}>
                       {showChar ? row.char : ''}
                    </span>
                    {showWord && (
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1, display: 'flex', gap: '0.3rem' }}>
                           <span>{row.pre || ''}{row.word}{row.post || ''}</span>
                           {showNexo && <span style={{ color: '#10b981' }}>{row.nexo}</span>}
                        </span>
                    )}
                 </div>
             );
          })}
       </div>
   )
}

// ─── AcrosticBox (SI / NO) ────────────────────────────────────────────────────
const AcrosticBox: React.FC<{
  lines: { prefix?: string; hi: string; rest: string }[];
  onClick?: (e: React.MouseEvent) => void; active?: boolean;
}> = ({ lines, onClick, active }) => {
  const accent = active ? '#8b5cf6' : 'rgba(255,255,255,0.12)';
  return (
    <div
      onClick={onClick} className="glass-panel animate-fade-in"
      style={{
        padding: '1.4rem 1.8rem', cursor: onClick ? 'pointer' : 'default',
        border: `2px solid ${accent}`, borderRadius: '1.25rem', minWidth: '150px',
        transition: 'transform 0.25s, box-shadow 0.25s',
        boxShadow: active ? '0 0 20px rgba(139,92,246,0.25)' : 'none',
      }}
      onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(139,92,246,0.45)'; } }}
      onMouseLeave={e => { if (onClick) { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = active ? '0 0 20px rgba(139,92,246,0.25)' : 'none'; } }}
    >
      {lines.map((ln, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1.7 }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8b5cf6', minWidth: '1rem', textAlign: 'right' }}>{ln.prefix ?? ''}</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8b5cf6', minWidth: '1.3rem' }}>{ln.hi}</span>
          <span style={{ fontSize: '1rem', color: '#f8fafc' }}>{ln.rest}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN TUTORIALPAGE ────────────────────────────────────────────────────────
const CENTER_LEFT = 'calc(50% - 154px)';
function getCrosticPos(step: number): { left: string; bottom: string } | null {
  if (step <= 3)  return { left: 'calc(50% - 60px)', bottom: '2rem' };
  if (step <= 5)  return { left: 'calc(50% - 20px)', bottom: '2rem' };
  if (step <= 7)  return { left: 'calc(50% + 20px)', bottom: '2rem' };
  if (step === 8) return { left: 'calc(50% - 60px)', bottom: '2rem' };
  if (step === 9) return { left: 'calc(50% - 60px)', bottom: '2rem' };
  if (step <= 11) return { left: '2rem', bottom: '2rem' };
  if (step === 12) return null;
  if (step >= 32) return null; // Final part: hidden or custom
  return { left: CENTER_LEFT, bottom: '2rem' };
}

const TutorialPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [locked, setLocked] = useState(false);
  const [crostic14, setCrostic14] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInputValue, setNameInputValue] = useState('');
  const [playerName, setPlayerName] = useState('');
  
  const [step22Message, setStep22Message] = useState(false);
  const [revealGda, setRevealGda] = useState(0); // For step 26
  const [finalPhase, setFinalPhase] = useState(0); // 1, 2, 3, 4 for the grand verticálogo
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 0) { const t = setTimeout(() => setStep(1), 1500); return () => clearTimeout(t); }
  }, [step]);

  useEffect(() => {
    if (step === 14) {
      setLocked(true); setCrostic14(false);
      const t = setTimeout(() => { setLocked(false); setCrostic14(true); }, 1000);
      return () => clearTimeout(t);
    } else { setCrostic14(false); }
    
    if (step === 22) {
      setLocked(true); setStep22Message(false);
      const t = setTimeout(() => { setLocked(false); setStep22Message(true); }, 1000);
      return () => clearTimeout(t);
    } else { setStep22Message(false); }

    if (step === 26) {
       setLocked(true);
       setRevealGda(0);
       let cur = 0;
       const t = setInterval(() => {
          cur += 1;
          setRevealGda(cur);
          if (cur >= 8) {
             clearInterval(t);
             setLocked(false);
          }
       }, 1000);
       return () => clearInterval(t);
    }
    
    if (step === 32) {
       setLocked(true);
       const t = setTimeout(() => setLocked(false), 1000); // Wait 1s empty screen
       return () => clearTimeout(t);
    }

    if (step === 33) {
       setFinalPhase(0);
       setLocked(true);
       let p = 0;
       const tmr = setInterval(() => {
          p++;
          setFinalPhase(p);
          if (p >= 4) { clearInterval(tmr); setLocked(false); }
       }, 800); // fast appearance
       return () => clearInterval(tmr);
    }
  }, [step]);

  useEffect(() => { if (showNameInput && inputRef.current) inputRef.current.focus(); }, [showNameInput]);

  const MAX_STEP = 33;

  const next = () => {
    if (step === 0 || locked || step === 8 || (step === 19 && showNameInput)) return;
    if (step >= MAX_STEP) return;
    setStep(p => p + 1);
  };

  const submitName = () => {
    const name = nameInputValue.trim().slice(0, 8);
    if (!name) return;
    setPlayerName(name); setShowNameInput(false); setStep(20);
  };

  const pos = getCrosticPos(step);
  const showFixedCrostic = pos !== null && step !== 12 && (step !== 14 || crostic14) && (step !== 22 || step22Message) && step < 32;

  const bubbleCenterBottom = (txt: string) => (
    <div style={{ position: 'fixed', bottom: '9.5rem', left: 'calc(50% - 215px)', width: '430px' }}>
      <Bubble style={{ textAlign: 'center' }}>{txt}</Bubble>
    </div>
  );

  const bubbleBesideCenterLeft = (txt: string, delay?: boolean) => (
    <div style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)` }}>
      <Bubble delay={delay} style={{ textAlign: 'left', maxWidth: 420 }}>{txt}</Bubble>
    </div>
  );

  const scene = () => {
    switch (step) {
      case 0: return null;
      case 1: return bubbleCenterBottom('¡Hola! Soy Albert Crostic…');
      case 2: return bubbleCenterBottom('Así que quieres saber qué son los verticálogos, ¿eh?');
      case 3: return bubbleCenterBottom('¡Normal! Si no, ¿cómo vas a saber jugar a esto? Vamos a ir al grano.');
      case 4:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '6rem', height: '100vh', gap: '3rem' }}>
            <GranoCol />
            <Bubble>Aquí tenemos el grano. Concretamente, la palabra <em>grano</em>…</Bubble>
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '6rem', height: '100vh', gap: '3rem' }}>
            <GranoCol />
            <Bubble>… pero puesta de arriba a abajo.</Bubble>
          </div>
        );
      case 6:
        return <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '6rem', height: '100vh', gap: '3rem' }}><GranoCol words /></div>;
      case 7:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '6rem', height: '100vh', gap: '3rem' }}>
            <GranoCol words />
            <Bubble style={{ maxWidth: 480, textAlign: 'left', marginBottom: '10rem' }}>
              Esto se llama acróstico, y poniendo en práctica nuestro vocabulario, podemos ser creativos con cada una de sus letras.
            </Bubble>
          </div>
        );
      case 8:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '2rem' }}>
            <Bubble style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '1rem' }}>¿Quieres probar a hacer uno?</Bubble>
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
              <AcrosticBox lines={[{ prefix: '¡', hi: 'S', rest: 'í,' }, { prefix: '',  hi: 'I', rest: 'nsisto!' }]} />
              <AcrosticBox active onClick={e => { e.stopPropagation(); setStep(9); }} lines={[{ prefix: '¡', hi: 'N', rest: 'o!' }, { prefix: '¡', hi: 'O', rest: 'blígame!' }]} />
            </div>
          </div>
        );
      case 9:
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Bubble style={{ fontSize: '1.3rem', textAlign: 'center', maxWidth: 460 }}>Estupendo. Pasemos a la siguiente fase.</Bubble>
          </div>
        );
      case 10:
        return (
          <div style={{ position: 'fixed', bottom: '9.5rem', left: '9rem', maxWidth: '420px' }}>
            <Bubble>¿Qué es un verticálogo, dices, mientras clavas en mi pupila tu pupila azul?</Bubble>
          </div>
        );
      case 11:
        return (
          <>
            <div style={{ position: 'fixed', bottom: '9.5rem', left: '9rem', maxWidth: '380px' }}>
              <Bubble>¿Qué es un verticálogo, dices, mientras clavas en mi pupila tu pupila azul?</Bubble>
            </div>
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
               <CrosticCircle label="Placeholder 2" size={120} color="#10b981" isImage imgSrc="/assets/placeholder2.png" />
            </div>
            <div style={{ position: 'fixed', bottom: '9.5rem', right: '9rem' }}>
              <Bubble style={{ textAlign: 'right', maxWidth: 300 }}>Sí: eso te pregunto.</Bubble>
            </div>
          </>
        );
      case 12:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '2.5rem' }}>
            <Bubble style={{ fontSize: '1.15rem', maxWidth: 520, textAlign: 'center' }}>
              Un verticálogo es… un diálogo, ¡como el que estamos teniendo!
            </Bubble>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
              <CrosticCircle size={130} isImage imgSrc="/assets/crostic.png" />
              <CrosticCircle label="Placeholder 2" size={130} color="#10b981" isImage imgSrc="/assets/placeholder2.png" />
            </div>
          </div>
        );
      case 13: return bubbleBesideCenterLeft('Pero… un diálogo hecho mediante un acróstico.');
      case 14:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '6rem', height: '100vh', gap: '3rem' }}>
            <GranoCol />
            {crostic14 && <Bubble delay style={{ textAlign: 'left' }}>Si esta vez fuéramos al grano, como antes, ¡nos quedaríamos cortos!</Bubble>}
          </div>
        );
      case 15:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '6rem', height: '100vh', gap: '3rem' }}>
            <GranoCol />{bubbleBesideCenterLeft("'Grano' es una palabra muy corta para hacer una conversación con ella.")}
          </div>
        );
      case 16:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '6rem', height: '100vh', gap: '3rem' }}>
            <GranoCol />
            <div style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Bubble style={{ textAlign: 'left', maxWidth: 420 }}>'Grano' es una palabra muy corta para hacer una conversación con ella.</Bubble>
              <Bubble delay style={{ textAlign: 'left', fontStyle: 'italic' }}>A no ser…</Bubble>
            </div>
          </div>
        );
      case 17:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
            <GranoCol albert />{bubbleBesideCenterLeft('Hmm… Imagina que ponemos aquí a un personaje llamado… Albert. Gran nombre.', true)}
          </div>
        );
      case 18:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
            <GranoCol albert grWords />{bubbleBesideCenterLeft('Y ahora imagina que, mediante la \\'G\\' y la \\'R\\', nos hace una pregunta: «¿Ganaremos Riquezas?»')}
          </div>
        );
      case 19:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
            <GranoCol albert grWords />
            <div style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Bubble style={{ textAlign: 'left', maxWidth: 420 }}>¡Y entonces contestas tú! Eh… ¿Cómo te llamas?</Bubble>
              {!showNameInput ? (
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }} onClick={e => { e.stopPropagation(); setShowNameInput(true); }}>Introducir nombre</button>
              ) : (
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input ref={inputRef} maxLength={8} value={nameInputValue} onChange={e => setNameInputValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitName(); }} placeholder="Tu nombre…"
                    className="glass-panel" style={{ padding: '0.65rem 1rem', fontSize: '1rem', color: '#f8fafc', border: '1px solid rgba(139,92,246,0.5)', borderRadius: '0.75rem', background: 'rgba(30,41,59,0.8)', outline: 'none', width: '160px' }} />
                  <button className="btn btn-primary" onClick={e => { e.stopPropagation(); submitName(); }}>OK</button>
                </div>
              )}
            </div>
          </div>
        );
      case 20:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
            <GranoCol albert grWords anoWords playerName={playerName} />{bubbleBesideCenterLeft('Y entonces, alguien, es decir, ¡tú!, a quien introducimos en la siguiente letra le contesta en el ANO. Uy, perdón…')}
          </div>
        );
      case 21:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
            <GranoCol albert grWords anoWords playerName={playerName} />
            <Bubble style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)`, textAlign: 'left', maxWidth: 440 }}>¡Hemos hecho un diálogo! Un breve, pero efectivo diálogo teatral.</Bubble>
          </div>
        );

      // --- BRAND NEW STEPS ---
      case 22: // Desaparecen palabras + Mensaje tras 1s
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranoCol albert playerName={playerName} hiddenWords />
             {step22Message && bubbleBesideCenterLeft("'GRANO' es una obra que jamás promocionaría! ¡Es muy corta! ¡Y no usa nexos! Lo cual tampoco está mal, tiene su mérito, pero...", true)}
          </div>
        );
      case 23:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranoCol albert playerName={playerName} hiddenWords />
             {bubbleBesideCenterLeft("Espera, ¿no sabes lo que son los nexos?")}
          </div>
        );
      case 24:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranoCol albert playerName={playerName} hiddenWords />
             <div style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Bubble style={{ textAlign: 'left', maxWidth: 420 }}>Espera, ¿no sabes lo que son los nexos?</Bubble>
                 <Bubble delay style={{ textAlign: 'left', maxWidth: 420 }}>¡Te lo aclararé! Y así sabrás qué obras son más de mi gusto.</Bubble>
             </div>
          </div>
        );
      case 25:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranodearrozCol revealStep={0} />
             {bubbleBesideCenterLeft("Primero de todo, alarguemos 'GRANO' a 'Grano de arroz'. Sigue siendo poco, pero nos servirá para ilustrarte.")}
          </div>
        );
      case 26: 
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranodearrozCol revealStep={revealGda} playerName={playerName} />
          </div>
        );
      case 27:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranodearrozCol revealStep={8} playerName={playerName} stepExtraWords={27} />
             {bubbleBesideCenterLeft("Como observarás, he terminado la conversación y he añadido unas palabras extra aquí (subrayada en verde) y aquí (subrayada en verde)")}
          </div>
        );
      case 28:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranodearrozCol revealStep={8} playerName={playerName} stepExtraWords={28} />
             <div style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Bubble style={{ textAlign: 'left', maxWidth: 420 }}>Como observarás, he terminado la conversación y he añadido unas palabras extra aquí (subrayada en verde) y aquí (subrayada en verde)</Bubble>
                <Bubble delay style={{ textAlign: 'left', maxWidth: 420 }}>Esos son los nexos, y según qué tipo de verticálogo realices te dejaré usarlos o no.</Bubble>
             </div>
          </div>
        );
      case 29:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranodearrozCol revealStep={8} playerName={playerName} stepExtraWords={28} />
             <div style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Bubble style={{ textAlign: 'left', maxWidth: 450 }}>Podrás comprobar por tu cuenta qué es posible para ti hacer en esta actividad. Nexos, nexos que empiezan con interrogación como ese de ahí, puntos suspensivos, comas... diversas posibilidades.</Bubble>
             </div>
          </div>
        );
      case 30:
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10rem', height: '100vh', gap: '3rem' }}>
             <GranodearrozCol revealStep={8} playerName={playerName} stepExtraWords={28} />
             <div style={{ position: 'fixed', bottom: '9.5rem', left: `calc(${CENTER_LEFT} + 140px)`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Bubble style={{ textAlign: 'left', maxWidth: 480 }}>Sin embargo, el límite de lo que puedes hacer lo marca el límite de tu vocabulario. ¿Serías capaz de hacer un verticálogo en el que salga la palabra "electroencefalografista"? Yo pagaría por ver algo así.</Bubble>
             </div>
          </div>
        );
      case 31:
        // empty screen initially, then 1s later crostic appears
        return (
           <div style={{ display: 'flex', alignItems: 'flex-end', padding: '6rem', height: '100vh' }}>
              {!locked && (
                 <>
                   <div style={{ position: 'absolute', bottom: '2rem', right: '2rem' }}>
                      <CrosticCircle size={150} isImage imgSrc="/assets/crostic.png" />
                   </div>
                   <div style={{ position: 'absolute', bottom: '13rem', right: '2rem' }}>
                      <Bubble delay style={{ maxWidth: 480, textAlign: 'right' }}>Con esto acaba el tutorial. Pero hay una última cosa que quiero comunicar antes de empezar este pequeño taller literario:</Bubble>
                   </div>
                 </>
              )}
           </div>
        );
      case 32:
      case 33:
        return (
           <div style={{ display: 'flex', alignItems: 'flex-start', padding: '4rem', minHeight: '100vh', flexDirection: 'column' }}>
               <GranVerticalogoCol phase={finalPhase} playerName={playerName} />
               {finalPhase >= 4 && (
                  <button className="btn btn-primary animate-fade-in delay-3" style={{ marginTop: '2rem', alignSelf: 'center', fontSize: '1.2rem', padding: '1rem 3rem' }} onClick={() => navigate('/')}>
                      Volver al menú
                  </button>
               )}
           </div>
        );

      default: return null;
    }
  };

  return (
    <div
      className="screen-container" onClick={next}
      style={{
        cursor: step >= 1 && !locked && step !== 8 ? 'pointer' : 'default',
        overflow: step >= 32 ? 'auto' : 'hidden', padding: 0,
        alignItems: 'stretch', justifyContent: 'flex-start',
      }}
    >
      <button className="btn btn-secondary" style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 300 }} onClick={e => { e.stopPropagation(); navigate('/'); }}>
        <ArrowLeft size={16} />&nbsp;Exit
      </button>

      {scene()}

      {showFixedCrostic && pos && (
         <div style={{ position: 'fixed', left: pos.left, bottom: pos.bottom, zIndex: 100, transition: 'left 0.7s cubic-bezier(0.34,1.56,0.64,1)', }}>
             <CrosticCircle size={120} fadeIn isImage imgSrc="/assets/crostic.png" />
         </div>
      )}

      {step >= 1 && step !== 8 && !locked && step < MAX_STEP && (
        <div style={{ position: 'fixed', bottom: '0.75rem', right: '1rem', color: 'rgba(148,163,184,0.45)', fontSize: '0.78rem', pointerEvents: 'none', userSelect: 'none' }}>Haz clic para continuar</div>
      )}
    </div>
  );
};

export default TutorialPage;
""")
