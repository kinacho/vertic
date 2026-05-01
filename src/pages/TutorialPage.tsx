import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CrosticCircle from '../components/CrosticCircle';
import Bubble from '../components/Bubble';
import AcrosticBox from '../components/AcrosticBox';

// --- Local Helper Components ---
const SideLabel: React.FC<{ name: string; aqui?: boolean; color?: string; }> = ({ name, aqui, color = 'var(--accent-secondary)' }) => (
  <div
    className="animate-fade-in"
    style={{
      position: 'absolute',
      right: 'calc(100% + 18px)',
      top: '-0.2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
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
      fontSize: '1.5rem',
      fontWeight: 800,
      color: 'var(--text-primary)',
      textShadow: `0 0 16px ${color}8c`,
      whiteSpace: 'nowrap',
      marginTop: '2px',
    }}>{name}</span>
  </div>
);

const LETTERS = ['G', 'R', 'A', 'N', 'O'];
const ORIG_WORDS = ['igantes', 'icachones', 'tufaron', 'uevo', 'lor'];
const GR_WORDS: (string | null)[] = ['anaremos', 'iquezas?', null, null, null];
const ANO_WORDS: (string | null)[] = [null, null, 'horrando', 'o,', 'bviamente'];

interface GranoColProps {
  words?: boolean;
  grWords?: boolean;
  anoWords?: boolean;
  albert?: boolean;
  playerName?: string;
  hiddenWords?: boolean;
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
            {showGrPrefix && <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1 }}>¿</span>}
            <span style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: 'var(--accent-primary)',
              lineHeight: 1,
              textShadow: '0 0 20px var(--accent-primary-glow)',
              minWidth: '2.6rem',
            }}>{l}</span>
            {word && <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{word}</span>}
          </div>
        );
      })}
    </div>
  );
};

const GDA_LETTERS = ['G', 'R', 'A', 'N', 'O', 'D', 'E', 'A', 'R', 'R', 'O', 'Z'];
const GDA_WORDS: (string | null)[] = ['anaremos', 'iquezas?', 'horrando', 'o,', 'bviamente', 'iantre.', 'ntonces, ¿el', 'horro de', 'iquezas', 'esulta', 'bsoleto...?', 'asca.'];

interface GdaColProps {
  revealStep: number;
  playerName?: string;
  stepExtraWords?: number;
}

const GranodearrozCol: React.FC<GdaColProps> = ({ revealStep, playerName, stepExtraWords }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
      {GDA_LETTERS.map((l, i) => {
        let showWord = (i <= 4);
        if (i > 4 && revealStep >= (i - 4)) showWord = true;
        
        let wordContent: React.ReactNode = showWord ? GDA_WORDS[i] : null;

        if (showWord && stepExtraWords !== undefined) {
           if (i === 6) {
              wordContent = <>ntonces, ¿<span style={{ color: stepExtraWords >= 28 ? 'var(--accent-secondary)' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>el</span></>;
           }
           if (i === 7) {
              wordContent = <>horro <span style={{ color: stepExtraWords >= 28 ? 'var(--accent-secondary)' : 'inherit', textDecoration: stepExtraWords >= 28 ? 'underline' : 'none' }}>de</span></>;
           }
        }

        const showGrPrefix = (i === 0);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>
            {i === 5 && revealStep >= 0 && <SideLabel name="Albert" />}
            {i === 11 && revealStep >= 7 && <SideLabel name={playerName || 'Player'} color="#3b82f6" />}
            {showGrPrefix && <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1 }}>¿</span>}
            <span style={{
              fontSize: '2.2rem',
              fontWeight: 900,
              color: 'var(--accent-primary)',
              lineHeight: 1,
              textShadow: '0 0 20px var(--accent-primary-glow)',
              minWidth: '1.9rem',
            }}>{l}</span>
            {wordContent && <span style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{wordContent}</span>}
          </div>
        );
      })}
    </div>
  );
};

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
   return (
       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingBottom: '6rem' }}>
          {ESTE_DATA.map((row, i) => {
             const showChar = phase >= 1;
             const showName = phase >= 2 && row.actor;
             const showWord = phase >= 3;
             const showNexo = phase >= 4 && row.nexo;
             const nameStr = row.actor === 'PLAYER' ? playerName : row.actor;
             const nameColor = row.actor === 'PLAYER' ? '#3b82f6' : 'var(--accent-secondary)';

             return (
                 <div key={i} style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>
                    {showName && <SideLabel name={nameStr!} color={nameColor} />}
                    <span style={{ 
                      fontSize: 'clamp(1rem, 4vw, 1.4rem)', 
                      fontWeight: 900, 
                      color: 'var(--accent-primary)', 
                      lineHeight: 1, 
                      textShadow: '0 0 10px var(--accent-primary-glow)', 
                      minWidth: '1.2rem', 
                      textAlign: 'center' 
                    }}>
                       {showChar ? row.char : ''}
                    </span>
                    {showWord && (
                        <span style={{ 
                          fontSize: 'clamp(1rem, 4vw, 1.4rem)', 
                          fontWeight: 700, 
                          color: 'var(--text-primary)', 
                          lineHeight: 1, 
                          display: 'flex', 
                          gap: '0.3rem',
                          flexWrap: 'wrap'
                        }}>
                           <span>{row.pre || ''}{row.word}{row.post || ''}</span>
                           {showNexo && <span style={{ color: 'var(--accent-secondary)' }}>{row.nexo}</span>}
                        </span>
                    )}
                 </div>
             );
          })}
       </div>
   )
}

// --- MAIN TUTORIALPAGE ---
const TutorialPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [locked, setLocked] = useState(false);
  const [crostic14, setCrostic14] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInputValue, setNameInputValue] = useState('');
  const [playerName, setPlayerName] = useState('');
  
  const [step22Message, setStep22Message] = useState(false);
  const [revealGda, setRevealGda] = useState(0);
  const [finalPhase, setFinalPhase] = useState(0);
  
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
       const t = setTimeout(() => setLocked(false), 1000);
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
       }, 800);
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

  const getSceneContent = () => {
    switch (step) {
      case 0: return null;
      case 1: return <Bubble style={{ textAlign: 'center' }}>¡Hola! Soy Albert Crostic…</Bubble>;
      case 2: return <Bubble style={{ textAlign: 'center' }}>Así que quieres saber qué son los verticálogos, ¿eh?</Bubble>;
      case 3: return <Bubble style={{ textAlign: 'center' }}>¡Normal! Si no, ¿cómo vas a saber jugar a esto? Vamos a ir al grano.</Bubble>;
      case 4:
      case 5:
        return (
          <div className="scene-layout">
            <GranoCol />
            <Bubble>
              {step === 4 ? "Aquí tenemos el grano. Concretamente, la palabra grano…" : "… pero puesta de arriba a abajo."}
            </Bubble>
          </div>
        );
      case 6:
      case 7:
        return (
          <div className="scene-layout">
            <GranoCol words />
            {step === 7 && (
              <Bubble style={{ maxWidth: 480 }}>
                Esto se llama acróstico, y poniendo en práctica nuestro vocabulario, podemos ser creativos con cada una de sus letras.
              </Bubble>
            )}
          </div>
        );
      case 8:
        return (
          <div className="scene-layout-centered">
            <Bubble style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '1rem' }}>¿Quieres probar a hacer uno?</Bubble>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <AcrosticBox lines={[{ prefix: '¡', hi: 'S', rest: 'í,' }, { prefix: '',  hi: 'I', rest: 'nsisto!' }]} />
              <AcrosticBox active onClick={e => { e.stopPropagation(); setStep(9); }} lines={[{ prefix: '¡', hi: 'N', rest: 'o!' }, { prefix: '¡', hi: 'O', rest: 'blígame!' }]} />
            </div>
          </div>
        );
      case 9:
        return <Bubble style={{ fontSize: '1.3rem', textAlign: 'center', maxWidth: 460 }}>Estupendo. Pasemos a la siguiente fase.</Bubble>;
      case 10:
        return <Bubble>¿Qué es un verticálogo, dices, mientras clavas en mi pupila tu pupila azul?</Bubble>;
      case 11:
        return (
          <div className="scene-layout-split">
            <Bubble>¿Qué es un verticálogo, dices, mientras clavas en mi pupila tu pupila azul?</Bubble>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
               <CrosticCircle label="Placeholder 2" size={100} color="var(--accent-secondary)" isImage imgSrc="/assets/placeholder2.png" />
               <Bubble style={{ textAlign: 'right', maxWidth: 300 }}>Sí: eso te pregunto.</Bubble>
            </div>
          </div>
        );
      case 12:
        return (
          <div className="scene-layout-centered">
            <Bubble style={{ fontSize: '1.15rem', maxWidth: 520, textAlign: 'center' }}>
              Un verticálogo es… un diálogo, ¡como el que estamos teniendo!
            </Bubble>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <CrosticCircle size={120} isImage imgSrc="/assets/crostic.png" />
              <CrosticCircle label="Placeholder 2" size={120} color="var(--accent-secondary)" isImage imgSrc="/assets/placeholder2.png" />
            </div>
          </div>
        );
      case 13: return <Bubble>Pero… un diálogo hecho mediante un acróstico.</Bubble>;
      case 14:
      case 15:
      case 16:
        return (
          <div className="scene-layout">
            <GranoCol />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {step >= 14 && crostic14 && <Bubble>Si esta vez fuéramos al grano, como antes, ¡nos quedaríamos cortos!</Bubble>}
              {step >= 15 && <Bubble>'Grano' es una palabra muy corta para hacer una conversación con ella.</Bubble>}
              {step >= 16 && <Bubble delay style={{ fontStyle: 'italic' }}>A no ser…</Bubble>}
            </div>
          </div>
        );
      case 17:
      case 18:
      case 19:
        return (
          <div className="scene-layout">
            <GranoCol albert grWords={step >= 18} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {step === 17 && <Bubble>Hmm… Imagina que ponemos aquí a un personaje llamado… Albert. Gran nombre.</Bubble>}
              {step === 18 && <Bubble>Y ahora imagina que, mediante la 'G' y la 'R', nos hace una pregunta: «¿Ganaremos Riquezas?»</Bubble>}
              {step === 19 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Bubble>¡Y entonces contestas tú! Eh… ¿Cómo te llamas?</Bubble>
                  {!showNameInput ? (
                    <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={e => { e.stopPropagation(); setShowNameInput(true); }}>Introducir nombre</button>
                  ) : (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input 
                        ref={inputRef} 
                        maxLength={8} 
                        value={nameInputValue} 
                        onChange={e => setNameInputValue(e.target.value)} 
                        onKeyDown={e => { if (e.key === 'Enter') submitName(); }} 
                        placeholder="Tu nombre…"
                        className="glass-panel" 
                        style={{ padding: '0.65rem 1rem', fontSize: '1rem', color: 'var(--text-primary)', border: '1px solid var(--accent-primary-glow)', borderRadius: '0.75rem', background: 'var(--bg-glass)', outline: 'none', width: '160px' }} 
                      />
                      <button className="btn" onClick={e => { e.stopPropagation(); submitName(); }}>OK</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 20:
      case 21:
        return (
          <div className="scene-layout">
            <GranoCol albert grWords anoWords playerName={playerName} />
            <Bubble>
              {step === 20 
                ? "Y entonces, alguien, es decir, ¡tú!, a quien introducimos en la siguiente letra le contesta en el ANO. Uy, perdón…"
                : "¡Hemos hecho un diálogo! Un breve, pero efectivo diálogo teatral."}
            </Bubble>
          </div>
        );
      case 22:
      case 23:
      case 24:
        return (
          <div className="scene-layout">
             <GranoCol albert playerName={playerName} hiddenWords />
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {step >= 22 && step22Message && <Bubble>'GRANO' es una obra que jamás promocionaría! ¡Es muy corta! ¡Y no usa nexos! Lo cual tampoco está mal, tiene su mérito, pero...</Bubble>}
                {step >= 23 && <Bubble>Espera, ¿no sabes lo que son los nexos?</Bubble>}
                {step >= 24 && <Bubble delay>¡Te lo aclararé! Y así sabrás qué obras son más de mi gusto.</Bubble>}
             </div>
          </div>
        );
      case 25:
        return (
          <div className="scene-layout">
             <GranodearrozCol revealStep={0} />
             <Bubble>Primero de todo, alarguemos 'GRANO' a 'Grano de arroz'. Sigue siendo poco, pero nos servirá para ilustrarte.</Bubble>
          </div>
        );
      case 26: 
        return (
          <div className="scene-layout">
             <GranodearrozCol revealStep={revealGda} playerName={playerName} />
          </div>
        );
      case 27:
      case 28:
      case 29:
      case 30:
        return (
          <div className="scene-layout">
             <GranodearrozCol revealStep={8} playerName={playerName} stepExtraWords={step >= 28 ? 28 : 27} />
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Bubble>Como observarás, he terminado la conversación y he añadido unas palabras extra aquí y allá.</Bubble>
                {step >= 28 && <Bubble delay>Esos son los nexos, y según qué tipo de verticálogo realices te dejaré usarlos o no.</Bubble>}
                {step >= 29 && <Bubble>Diversas posibilidades: nexos, interrogaciones, puntos suspensivos, comas...</Bubble>}
                {step >= 30 && <Bubble delay>¿Serías capaz de usar "electroencefalografista"? Yo pagaría por ver algo así.</Bubble>}
             </div>
          </div>
        );
      case 31:
        return (
           <div className="scene-layout-centered" style={{ height: '100%' }}>
              {!locked && (
                <>
                  <CrosticCircle size={150} isImage imgSrc="/assets/crostic.png" />
                  <Bubble style={{ maxWidth: 480, textAlign: 'center' }}>
                    Con esto acaba el tutorial. Pero hay una última cosa que quiero comunicar antes de empezar este pequeño taller literario:
                  </Bubble>
                </>
              )}
           </div>
        );
      case 32:
      case 33:
        return (
           <div className="scene-layout-scrollable">
               <GranVerticalogoCol phase={finalPhase} playerName={playerName} />
               {finalPhase >= 4 && (
                  <button className="btn animate-fade-in delay-3" style={{ margin: '2rem auto', display: 'block', fontSize: '1.2rem', padding: '1rem 3rem' }} onClick={() => navigate('/')}>
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
      className="screen-container" 
      onClick={next}
      style={{
        cursor: step >= 1 && !locked && step !== 8 ? 'pointer' : 'default',
        padding: 0,
        background: 'var(--bg-primary)',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <button className="btn btn-secondary" style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 300 }} onClick={e => { e.stopPropagation(); navigate('/'); }}>
        <ArrowLeft size={16} /> Exit
      </button>

      <div className="tutorial-content" style={{ 
        width: '100%', 
        maxWidth: '1200px', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        {getSceneContent()}
      </div>

      {step >= 1 && step < 10 && step !== 8 && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '50%', transform: 'translateX(50%)', zIndex: 10 }}>
           <CrosticCircle size={120} isImage imgSrc="/assets/crostic.png" />
        </div>
      )}

      {step >= 1 && step !== 8 && !locked && step < MAX_STEP && (
        <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', pointerEvents: 'none' }}>
          Haz clic para continuar
        </div>
      )}

      <style>{`
        .scene-layout {
          display: flex;
          align-items: center;
          gap: 3rem;
          width: 100%;
          justify-content: center;
        }
        .scene-layout-centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          width: 100%;
          justify-content: center;
        }
        .scene-layout-split {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          width: 100%;
          max-width: 900px;
        }
        .scene-layout-scrollable {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          padding-top: 4rem;
        }
        @media (max-width: 768px) {
          .scene-layout {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
          }
          .scene-layout-split {
            flex-direction: column;
            align-items: center;
            gap: 2rem;
          }
          .scene-layout-scrollable {
            padding-top: 6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TutorialPage;
