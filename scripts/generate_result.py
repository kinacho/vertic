import os

with open("src/features/game/ResultScriptView.tsx", "w", encoding="utf-8") as f:
    f.write("""import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../../hooks/useGameContext';
import { useNavigate } from 'react-router-dom';

const BUBBLE_CHAR_LIMIT = 150; // Approximated characters per bubble chunk

interface WordEvent {
  character: string;
  color: string;
  word: string;
}

const TypewriterBubble: React.FC<{
   words: WordEvent[];
   isActive: boolean;
   color: string;
   position: React.CSSProperties;
   onComplete: () => void;
}> = ({ words, isActive, color, position, onComplete }) => {
   const [chunkIndex, setChunkIndex] = useState(0);
   const [wordIndex, setWordIndex] = useState(0);

   // Chunk the words into BUBBLE_CHAR_LIMIT sizes
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
         currentLen += w.word.length + 1; // +1 for space
      }
      if (currentChunk.length > 0) result.push(currentChunk);
      return result;
   }, [words]);

   useEffect(() => {
      if (!isActive) return;
      if (chunkIndex >= chunks.length) {
         onComplete();
         return;
      }
      
      const currentChunk = chunks[chunkIndex];
      if (wordIndex >= currentChunk.length) {
         // Pause before clearing bubble
         const t = setTimeout(() => {
            setWordIndex(0);
            setChunkIndex(prev => prev + 1);
         }, 800);
         return () => clearTimeout(t);
      }

      const t2 = setTimeout(() => {
         setWordIndex(prev => prev + 1);
      }, 300); // 300ms per word represents reading speed
      return () => clearTimeout(t2);
      
   }, [isActive, chunkIndex, wordIndex, chunks, onComplete]);

   if (!isActive || chunkIndex >= chunks.length) return null;

   const activeWords = chunks[chunkIndex].slice(0, wordIndex);

   return (
      <div className="glass-panel animate-fade-in" style={{
         position: 'absolute',
         padding: '1.5rem',
         borderRadius: '1.5rem',
         border: `2px solid ${color}`,
         background: 'rgba(30,41,59,0.95)',
         boxShadow: `0 0 20px ${color}40`,
         fontSize: '1.3rem',
         lineHeight: 1.5,
         color: '#f8fafc',
         display: 'flex',
         flexWrap: 'wrap',
         gap: '0.3rem',
         transition: 'all 0.3s',
         ...position
      }}>
         {activeWords.map((w, i) => {
            const isName = w.word.startsWith(w.character + ' -');
            return (
              <span key={i} style={{ color: isName ? w.color : 'inherit', fontWeight: isName ? 'bold' : 'normal' }}>
                 {w.word}
              </span>
            );
         })}
      </div>
   );
};

export const ResultScriptView: React.FC = () => {
  const { state } = useGameContext();
  const navigate = useNavigate();
  const [showDelay, setShowDelay] = useState(true);
  
  // Create word sequence grouped by speaker blocks
  const sequence = useMemo(() => {
     let currentSpeaker = '';
     let currentColor = '';
     const seq: { character: string; color: string; words: WordEvent[] }[] = [];
     
     state.freeRows.forEach((row) => {
        if (row.leftToken && row.leftToken.text !== currentSpeaker) {
           currentSpeaker = row.leftToken.text;
           currentColor = row.leftToken.color;
           seq.push({ character: currentSpeaker, color: currentColor, words: [] });
           // Start with Character Name
           seq[seq.length - 1].words.push({ character: currentSpeaker, color: currentColor, word: `${currentSpeaker} -` });
        }
        
        if (seq.length === 0) return; // Wait for first speaker

        const curList = seq[seq.length - 1].words;
        const lineStr = (row.prePunctuation + row.baseLetter + (row.isVocalStandalone ? '' : row.mainInput) + row.postPunctuation + (row.nexo ? ' ' + row.nexo : '')).trim();
        
        // Split line into words
        const words = lineStr.split(' ').filter(w => w.trim().length > 0);
        words.forEach(w => {
           curList.push({ character: currentSpeaker, color: currentColor, word: w });
        });
     });
     return seq;
  }, [state.freeRows]);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  useEffect(() => {
     const t = setTimeout(() => setShowDelay(false), 2000); // Wait 2s before showing bubbles
     return () => clearTimeout(t);
  }, []);

  const numChars = Object.keys(state.characterColors).length;
  let bgImage = '/assets/fondo_1_personaje.png';
  if (numChars === 2) bgImage = '/assets/fondo_2_personajes.png';
  if (numChars >= 3) bgImage = '/assets/fondo_3_personajes.png';

  const charKeys = Object.keys(state.characterColors);
  
  // Positions mapped to characters by index of appearance
  const getPositionForChar = (charName: string) => {
     const idx = charKeys.indexOf(charName);
     if (idx === 0) {
        // Top Middle (occupies top half)
        return { top: '5%', left: '50%', transform: 'translateX(-50%)', width: '45%', minHeight: '150px' };
     } else if (idx === 1) {
        // Bottom Right
        return { bottom: '5%', right: '5%', width: '45%', minHeight: '150px' };
     } else {
        // Bottom Left
        return { bottom: '5%', left: '5%', width: '45%', minHeight: '150px' };
     }
  };

  const isFinished = currentBlockIndex >= sequence.length;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      overflow: 'hidden',
      backgroundColor: '#fcd34d', // matched yellow
      zIndex: 50
    }}>
       {/* Dark overlay for contrast if needed, but the prompt says images have the black figures */}
       
       {!showDelay && sequence.map((block, idx) => (
          <TypewriterBubble
             key={idx}
             words={block.words}
             isActive={idx === currentBlockIndex}
             color={block.color}
             position={getPositionForChar(block.character)}
             onComplete={() => setCurrentBlockIndex(prev => prev + 1)}
          />
       ))}

       {isFinished && !showDelay && (
          <div className="animate-fade-in delay-3" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '1rem' }}>
             <h2 style={{ color: 'white', textAlign: 'center' }}>¡Representación Terminada!</h2>
             <button className="btn btn-primary" onClick={() => {
                // Navigate and possibly reset context based on requirements
                navigate('/free-modes'); 
             }}>Volver al menú Libre</button>
          </div>
       )}
    </div>
  );
};
""")
