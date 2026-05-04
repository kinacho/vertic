import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameContext } from '../../hooks/useGameContext';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';

const BUBBLE_CHAR_LIMIT = 150;

interface WordEvent {
  character: string;
  color: string;
  word: string;
  isNexo?: boolean;
  baseLetterHint?: string;
  hintColor?: string;
  rowId?: number;
}

const TypewriterBubble: React.FC<{
   words: WordEvent[];
   isActive: boolean;
   color: string;
   position: React.CSSProperties;
   onComplete: () => void;
   onWordExposed?: (words: WordEvent[]) => void;
}> = ({ words, isActive, color, position, onComplete, onWordExposed }) => {
   const [chunkIndex, setChunkIndex] = useState(0);
   const [wordIndex, setWordIndex] = useState(0);

   const chunks = useMemo(() => {
      const result: WordEvent[][] = [];
      let currentChunk: WordEvent[] = [];
      let currentLen = 0;
      for (const w of words) {
         if (currentLen + w.word.length > BUBBLE_CHAR_LIMIT && currentChunk.length > 0) {
            result.push(currentChunk);
            currentChunk = [];
            currentLen = 0;
         }
         currentChunk.push(w);
         currentLen += w.word.length + 1;
      }
      if (currentChunk.length > 0) result.push(currentChunk);
      return result;
   }, [words]);

   const [waitingForClick, setWaitingForClick] = useState(false);

   useEffect(() => {
      if (!isActive) return;
      if (chunkIndex >= chunks.length) {
         onComplete();
         return;
      }
      
      const currentChunk = chunks[chunkIndex];
      if (wordIndex >= currentChunk.length) {
         setWaitingForClick(true);
         return;
      }

      const t2 = setTimeout(() => {
         setWordIndex(prev => prev + 1);
      }, 300);
      return () => clearTimeout(t2);
      
   }, [isActive, chunkIndex, wordIndex, chunks, onComplete]);

   useEffect(() => {
       if (!waitingForClick || !isActive) return;
       const handleGlobalClick = () => {
           setWaitingForClick(false);
           setWordIndex(0);
           setChunkIndex(prev => prev + 1);
       };
       const t = setTimeout(() => {
          window.addEventListener('click', handleGlobalClick);
       }, 50);
       return () => {
          clearTimeout(t);
          window.removeEventListener('click', handleGlobalClick);
       };
   }, [waitingForClick, isActive]);

   const activeWords = chunks[chunkIndex] ? chunks[chunkIndex].slice(0, wordIndex) : [];

   useEffect(() => {
      if (isActive && onWordExposed) onWordExposed(activeWords);
   }, [activeWords.length, isActive]);

   if (!isActive || chunkIndex >= chunks.length) return null;

   return (
      <div className="glass-panel animate-fade-in" style={{
         position: 'absolute', padding: '1.5rem', borderRadius: '1.5rem',
         border: `2px solid ${color}`, background: 'rgba(30,41,59,0.95)',
         boxShadow: `0 0 20px ${color}40`, fontSize: '1.3rem', lineHeight: 1.5,
         color: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '0.3rem',
         transition: 'all 0.3s', ...position
      }}>
         {activeWords.map((w, i) => {
            const isName = w.word.startsWith(w.character + ' -');
            // If it's a nexo, color is black. Otherwise w.color. If inherited from bubble, bubble color is used but we pass explicitly.
            return (
              <span key={i} style={{ color: w.color, fontWeight: isName ? 'bold' : 'normal' }}>
                 {w.word}
              </span>
            );
         })}
         {waitingForClick && (
            <span className="animate-pulse" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', alignSelf: 'flex-end', marginLeft: 'auto' }}>
              (clic para continuar)
            </span>
         )}
      </div>
   );
};

// ─── Media helpers ────────────────────────────────────────────────────────────
const media = (name: string) => `/assets/media/${encodeURIComponent(name)}`;

const REACTION_IMGS = [
  'Reacción de Albert 4 AB.jpg', 'Reacción de Albert 4 ABS.jpg', 'Reacción de Albert 4 ABSO.jpg',
  'Reacción de Albert 4 ABSOL.jpg', 'Reacción de Albert 4 ABSOLU.jpg', 'Reacción de Albert 4 ABSOLUT.jpg',
  'Reacción de Albert 4 ABSOLUTA.jpg', 'Reacción de Albert 4 ABSOLUTAM.jpg', 'Reacción de Albert 4 ABSOLUTAME.jpg',
  'Reacción de Albert 4 ABSOLUTAMEN.jpg', 'Reacción de Albert 4 ABSOLUTAMENT.jpg', 'Reacción de Albert 4 ABSOLUTAMENTE.jpg',
  'SReacción de Albert 4 ABSOLUTAMENTE CO.jpg', 'SReacción de Albert 4 ABSOLUTAMENTE COO.jpg', 'SReacción de Albert 4 ABSOLUTAMENTE COOL.jpg',
];

const PERICO_IMGS = [
  'Periódico 1.jpg', 'Periódico 2.jpg', 'Periódico 3.jpg', 'Periódico 4.jpg',
  'Periódico 5.jpg', 'Periódico 6.jpg', 'Periódico 7.jpg', 'Periódico 8.jpg',
];

// --- Cinematic Overlay Animations ---
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
        position: 'fixed', zIndex: 50, pointerEvents: 'none', userSelect: 'none',
        width: dims.w || 'auto', height: dims.h || 'auto', ...posStyle,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {dims.w > 0 && overlay && (
        <div style={{ position: 'absolute', inset: 0 }}>{overlay}</div>
      )}
    </div>
  );
};

const EllipsisOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
   const [dots, setDots] = useState('');
   const [cycles, setCycles] = useState(0);

   useEffect(() => {
      if (cycles >= 4) {
         onComplete();
         return;
      }
      const t = setInterval(() => {
         setDots(prev => {
            if (prev === '...') {
               setCycles(c => c + 1);
               return '';
            }
            return prev + '.';
         });
      }, 250);
      return () => clearInterval(t);
   }, [cycles, onComplete]);

   return (
      <div style={{ 
        position: 'absolute', 
        left: '50%', 
        top: 'calc(40% - 1cm)', 
        transform: 'translateX(-50%)',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        fontSize: '3.3rem', 
        fontWeight: 900, 
        color: '#1e293b' 
      }}>
         {cycles < 4 ? dots : ''}
      </div>
   );
};

const SpiralOverlay: React.FC = () => (
  <div style={{
    position: 'absolute', left: 'calc(50% + 4mm)', top: 'calc(40% - 1.8cm)', transform: 'translateX(-50%)',
    width: '1cm', height: '1cm',
    borderRadius: '50%', background: 'conic-gradient(from 0deg, #8b5cf6 0%, #06b6d4 50%, #8b5cf6 100%)',
    animation: 'spin 1.2s linear infinite', opacity: 0.9,
  }} />
);

const FullscreenImg: React.FC<{ src: string }> = ({ src }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Determine display size preserving aspect ratio
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const winRatio = winW / winH;
      
      let drawW, drawH;
      if (imgRatio > winRatio) {
        drawW = winW;
        drawH = winW / imgRatio;
      } else {
        drawH = winH;
        drawW = winH * imgRatio;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          // Detect "brown" color range
          // Brown is typically R > G > B, with R being relatively high and B low.
          const isBrown = (r > 60 && r < 180 && g > 30 && g < 130 && b < 100 && r > g && g > b);
          if (isBrown) {
            d[i + 3] = 0; // Make transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        console.warn("Canvas error", e);
      }
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 300, background: '#ffffff', // Substitutes transparent with white
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%', 
          objectFit: 'contain',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s'
        }} 
      />
    </div>
  );
};

export const ResultScriptView: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const navigate = useNavigate();
  const [showDelay, setShowDelay] = useState(true);
  
  // Cinematic Logic
  const [cinematicPhase, setCinematicPhase] = useState(0); 
  const [reactionIdx, setReactionIdx] = useState(0);
  const [pericoIdx, setPericoIdx] = useState(0);
  const [showFinalePrompt, setShowFinalePrompt] = useState(false);
  const [hasSeenReactionBefore, setHasSeenReactionBefore] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('vertic_reaction_seen');
    if (seen === 'true') setHasSeenReactionBefore(true);
  }, []);

  useEffect(() => {
    if (cinematicPhase === 5) {
      localStorage.setItem('vertic_reaction_seen', 'true');
    }
  }, [cinematicPhase]);

  const sequence = useMemo(() => {
     let currentSpeaker = '';
     let currentColor = '';
     const seq: { character: string; color: string; words: WordEvent[] }[] = [];
     
     state.freeRows.forEach((row) => {
        if (row.leftToken && row.leftToken.text !== currentSpeaker) {
           currentSpeaker = row.leftToken.text;
           currentColor = row.leftToken.color;
           seq.push({ character: currentSpeaker, color: currentColor, words: [] });
           seq[seq.length - 1].words.push({ character: currentSpeaker, color: currentColor, word: `${currentSpeaker} -` });
        }
        if (seq.length === 0) return;
        const curList = seq[seq.length - 1].words;
        
        // Push pre punctuation
        if (row.prePunctuation) curList.push({ character: currentSpeaker, color: currentColor, word: row.prePunctuation, baseLetterHint: row.baseLetter, hintColor: currentColor, rowId: row.index });
        
        // Push acrostic word
        const acrosticWord = (row.baseLetter + (row.isVocalStandalone ? '' : row.mainInput)).trim();
        if (acrosticWord) curList.push({ character: currentSpeaker, color: currentColor, word: acrosticWord, baseLetterHint: row.baseLetter, hintColor: currentColor, rowId: row.index });
        
        // Push post punctuation
        if (row.postPunctuation) curList.push({ character: currentSpeaker, color: currentColor, word: row.postPunctuation, baseLetterHint: row.baseLetter, hintColor: currentColor, rowId: row.index });
        
        // Push nexo
        if (row.nexo) curList.push({ character: currentSpeaker, color: '#000000', word: row.nexo, isNexo: true, baseLetterHint: row.baseLetter, hintColor: currentColor, rowId: row.index });
        
     });
     return seq;
  }, [state.freeRows]);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [exposedWords, setExposedWords] = useState<WordEvent[]>([]);

  // We accumulate the revealed letters based on the active block
  const revealedLetters = useMemo(() => {
     const letters = new Map<number, {letter: string, color: string}>();

     for (let i = 0; i < currentBlockIndex; i++) {
        if (!sequence[i]) continue;
        sequence[i].words.forEach(w => {
           if (w.baseLetterHint && w.rowId !== undefined) {
              letters.set(w.rowId, { letter: w.baseLetterHint, color: w.hintColor! });
           }
        });
     }

     if (sequence[currentBlockIndex]) {
        exposedWords.forEach(w => {
           if (w.baseLetterHint && w.rowId !== undefined) {
              letters.set(w.rowId, { letter: w.baseLetterHint, color: w.hintColor! });
           }
        });
     }

     return Array.from(letters.entries()).sort((a,b) => a[0] - b[0]).map(x => x[1]);
  }, [currentBlockIndex, sequence, exposedWords]);

  useEffect(() => {
     const t = setTimeout(() => setShowDelay(false), 1500);
     return () => clearTimeout(t);
  }, []);

  useEffect(() => {
      if (sequence.length === 0 && !showDelay) {
         if (!isFinished) setIsFinished(true);
      } else if (currentBlockIndex >= sequence.length && sequence.length > 0) {
         if (!isFinished) setIsFinished(true);
      }
  }, [currentBlockIndex, sequence.length, isFinished, showDelay]);

  // Transition Logic
  useEffect(() => {
     if (cinematicPhase === 1) {
        const t = setTimeout(() => setCinematicPhase(2), 2000);
        return () => clearTimeout(t);
     }
     if (cinematicPhase === 3) {
        const t = setTimeout(() => setCinematicPhase(4), 2000);
        return () => clearTimeout(t);
     }
     if (cinematicPhase === 4) {
        const t = setTimeout(() => setCinematicPhase(5), 2000);
        return () => clearTimeout(t);
     }
     if (cinematicPhase === 5) {
        let idx = 0;
        const iv = setInterval(() => {
           idx++;
           if (idx >= REACTION_IMGS.length) {
              clearInterval(iv);
              setCinematicPhase(6); // wait for click
           } else {
              setReactionIdx(idx);
           }
        }, 500);
        return () => clearInterval(iv);
     }
     if (cinematicPhase === 7) {
        let idx = 0;
        const iv = setInterval(() => {
           idx++;
           if (idx >= PERICO_IMGS.length) {
              clearInterval(iv);
              setCinematicPhase(8); // wait for click for finale prompt
           } else {
              setPericoIdx(idx);
           }
        }, 166);
        return () => clearInterval(iv);
     }
  }, [cinematicPhase]);

  const numChars = Object.keys(state.characterColors).length;
  let bgImage = '/assets/fondo_1_personaje.jpg';
  if (numChars === 2) bgImage = '/assets/fondo_2_personajes.jpg';
  if (numChars >= 3) bgImage = '/assets/fondo_3_personajes.jpg';

  const orderedCharKeys = useMemo(() => {
     const keys = new Set<string>();
     state.freeRows.forEach(row => {
        if (row.leftToken) keys.add(row.leftToken.text);
     });
     return Array.from(keys);
  }, [state.freeRows]);

  const getPositionForChar = (charName: string) => {
     const idx = orderedCharKeys.indexOf(charName);
     if (idx === 0) return { top: '5%', left: '5%', width: '45%', minHeight: '150px' };
     if (idx === 1) return { bottom: '5%', right: '5%', width: '45%', minHeight: '150px' };
     return { bottom: '5%', left: '5%', width: '45%', minHeight: '150px' };
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0,
      backgroundColor: '#ffffff', zIndex: 50, overflow: 'hidden'
    }} onClick={() => {
       if (isFinished && cinematicPhase === 0) setCinematicPhase(1);
       else if (cinematicPhase === 6) setCinematicPhase(7);
       else if (cinematicPhase === 8 && !showFinalePrompt) setShowFinalePrompt(true);
    }}>
       {/* Background layer */}
       <div style={{
           width: '100%', height: '100%',
           backgroundImage: `url(${bgImage})`,
           backgroundSize: 'contain',
           backgroundRepeat: 'no-repeat',
           backgroundPosition: 'center 30%',
           filter: cinematicPhase >= 1 ? 'grayscale(1) contrast(1.5) brightness(1.1)' : 'none',
           mixBlendMode: cinematicPhase >= 1 ? 'multiply' : 'normal',
           transition: 'all 0.5s'
       }} />

       {/* Cinematic Overlays */}
       {(cinematicPhase >= 1 && cinematicPhase <= 4) && (
          <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 40 }} />
       )}
       {cinematicPhase === 1 && <FullscreenImg src="/assets/final_res_1.jpg" />}
       {cinematicPhase === 2 && (
          <>
             <FullscreenImg src="/assets/final_res_2.jpg" />
             <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 350, pointerEvents: 'none' }}>
                <EllipsisOverlay onComplete={() => setCinematicPhase(3)} />
             </div>
          </>
       )}
       {cinematicPhase === 3 && <FullscreenImg src="/assets/final_res_3.jpg" />}
       {cinematicPhase === 4 && (
          <>
             <FullscreenImg src="/assets/final_res_4.jpg" />
             <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 350, pointerEvents: 'none' }}>
                <SpiralOverlay />
             </div>
          </>
       )}
       {(cinematicPhase === 5 || cinematicPhase === 6) && <FullscreenImg src={media(REACTION_IMGS[reactionIdx])} />}
        {cinematicPhase === 5 && hasSeenReactionBefore && (
          <button
            className="btn btn-secondary"
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
              color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', pointerEvents: 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPericoIdx(PERICO_IMGS.length - 1);
              setCinematicPhase(8);
            }}
          >
            Saltar reacción
          </button>
        )}
       {(cinematicPhase === 7 || cinematicPhase === 8) && (
          <>
             <FullscreenImg src={media(PERICO_IMGS[pericoIdx])} />
             {pericoIdx === 7 && state.verticalTitle && (
                <div style={{
                   position: 'fixed',
                   zIndex: 350,
                   top: '15%',
                   left: '10%',
                   width: '80%',
                   height: '10%',
                   background: '#ffffff',
                   color: 'black',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '6vw',
                   fontWeight: 900,
                   textTransform: 'uppercase',
                   fontFamily: '"Times New Roman", Times, serif'
                }}>
                   {state.verticalTitle}
                </div>
             )}
          </>
       )}

       {/* Sidebar for Acrostic Base Letters */}
       {cinematicPhase === 0 && revealedLetters.length > 0 && (() => {
          const over16 = revealedLetters.length > 16;
          return (
          <div style={{
             position: 'fixed',
             right: '5%',
             top: '50%',
             transform: 'translateY(-50%)',
             display: 'grid',
             gridTemplateRows: over16 ? 'repeat(10, auto)' : 'none',
             gridAutoFlow: over16 ? 'column' : 'row',
             gap: '0.4rem',
             zIndex: 60,
             alignItems: 'center'
          }}>
             {revealedLetters.map((item, idx) => (
                <div key={idx} className="animate-fade-in" style={{
                   color: item.color,
                   fontSize: over16 ? '1.2rem' : '2rem',
                   fontWeight: 900,
                   textShadow: '0 2px 5px rgba(0,0,0,0.5)',
                   background: 'rgba(255,255,255,0.8)',
                   padding: over16 ? '0 0.4rem' : '0 0.5rem',
                   borderRadius: '0.5rem',
                   border: `2px solid ${item.color}`,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   height: over16 ? '2rem' : 'auto'
                }}>
                   {item.letter.toUpperCase()}
                </div>
             ))}
          </div>
          );
       })()}

       {/* Bubbles */}
       {cinematicPhase === 0 && !showDelay && sequence.map((block, idx) => (
          <TypewriterBubble
             key={idx} words={block.words}
             isActive={idx === currentBlockIndex}
             color={block.color}
             position={getPositionForChar(block.character)}
             onComplete={() => setCurrentBlockIndex(prev => prev + 1)}
             onWordExposed={(words) => setExposedWords(words)}
          />
       ))}

       {/* Prompt */}
       {isFinished && cinematicPhase === 0 && (
          <div className="animate-pulse" style={{ position: 'absolute', bottom: '2rem', right: '2rem', color: '#1e293b' }}>(Clic para ver el final)</div>
       )}

       {/* Final Msg */}
       {showFinalePrompt && !state.readOnlyMode && (
           <div className="animate-fade-in delay-2" style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.95)', padding: '2rem 3rem', borderRadius: '1.5rem', border: '1px solid #cbd5e1', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', zIndex: 400 }}>
             <p style={{ color: '#1e293b', textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>¿Guardar verticálogo?</p>
             <button className="btn btn-primary" onClick={(e) => {
                 e.stopPropagation();
                 const stored = localStorage.getItem('vertic_saved_works');
                 const works = stored ? JSON.parse(stored) : [];
                 works.push({
                     id: Date.now().toString(),
                     title: state.verticalTitle,
                     mode: state.gameMode,
                     timestamp: Date.now(),
                     freeRows: state.freeRows,
                     characterColors: state.characterColors,
                     freePhrase: state.freePhrase
                 });
                 localStorage.setItem('vertic_saved_works', JSON.stringify(works));
                 alert('Guardado con éxito.');
             }}>Guardar</button>
           </div>
       )}
       {showFinalePrompt && (
           <div className="animate-fade-in delay-1" style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.95)', padding: '2rem 3rem', borderRadius: '1.5rem', border: '1px solid #cbd5e1', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', zIndex: 400 }}>
              <p style={{ color: '#1e293b', textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>¿Quieres hacer otro verticálogo?</p>
               <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                  {!state.readOnlyMode && (
                     <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); navigate('/free-setup'); }}>Sí</button>
                  )}
                  <button className="btn btn-secondary" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none' }} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SET_SCREEN', payload: 'home' }); navigate('/'); }}>Volver al menú principal</button>
               </div>
           </div>
       )}
       <PageTitle title="Resultado" />
    </div>
  );
};
