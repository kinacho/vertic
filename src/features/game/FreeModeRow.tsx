import React, { useState, useEffect, useRef } from 'react';
import { FreeModeRowData } from '../../types';
import { useGameContext } from '../../hooks/useGameContext';
import { DraggableWordToken } from './DraggableWordToken';

interface Props {
  row: FreeModeRowData;
}

const nexosList = ["el", "la", "los", "las", "un", "una", "a", "e", "y", "o", "u", "con", "sin", "mi", "mis", "tu", "tus", "su", "sus", "de", "del", "al", "en", "que", "por", "se", "te", "me", "lo", "mas", "nos", "ni"];

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Fallback dictionary for suggestion mocks
const dict: Record<string, string[]> = {
  'A': ['Avanza', 'Actuó', 'Aunque', 'Ayer', 'Amadeo'],
  'B': ['Barco', 'Blanco', 'Brillante', 'Buenas'],
  'C': ['Cielo', 'Claro', 'Corriendo', 'Comer'],
  'D': ['Día', 'Donde', 'Dijo', 'Desde'],
  'E': ['Evitando', 'Elefante', 'Es', 'Estúpidos', 'El'],
  'F': ['Fuego', 'Feroz', 'Fuerte', 'Filo'],
  'G': ['Ganó', 'Gato', 'Girasol', 'Genial', 'Grandioso'],
  'H': ['Hace', 'Hoy', 'Hombre', 'Hablar'],
  'I': ['Ignorando', 'Incluso', 'Imagina'],
  'J': ['Juego', 'Jugar', 'Junto'],
  'L': ['Luz', 'Lindo', 'Lejos'],
  'M': ['Más', 'Mesa', 'Mentira', 'Mundo'],
  'N': ['No', 'Nunca', 'Noche', 'Nube'],
  'O': ['Olvida', 'Océano', 'Otro', 'Osos'],
  'P': ['Pablo', 'Para', 'Pero', 'Pedro', 'Pájaro'],
  'Q': ['Que', 'Quién', 'Querer'],
  'R': ['Recientemente', 'Retirarse', 'Recién', 'Rápido', 'Redomados'],
  'S': ['Sol', 'Salta', 'Silencio', 'Secreto'],
  'T': ['Todo', 'Tiempo', 'Tarde', 'Tu'],
  'U': ['Úrsula', 'Un', 'Urano', 'Unos'],
  'V': ['Volar', 'Veo', 'Viento', 'Verdad'],
  'Y': ['Y', 'Ya'],
  'Z': ['Zorro', 'Zapato']
};

export const FreeModeRow: React.FC<Props> = ({ row }) => {
  const { state, dispatch } = useGameContext();
  const [leftText, setLeftText] = useState('');
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  // Rule 1: LL/L disambiguation dialog
  const [llDialog, setLlDialog] = useState<{ pending: string } | null>(null);
  const llDialogRef = useRef<HTMLDivElement>(null);

  const usedColors = Object.values(state.characterColors);
  const allColors = ['#3b82f6', '#ef4444', '#10b981', '#eab308', '#ec4899', '#8b5cf6'];
  const availableColors = allColors.filter(c => !usedColors.includes(c));
  const suggestionColorMale = availableColors.length > 0 ? availableColors[0] : '#60a5fa';
  const suggestionColorFemale = availableColors.length > 1 ? availableColors[1] : (availableColors.length > 0 ? availableColors[0] : '#f472b6');

  // Determine current character color for this row
  const getCurrentCharacterColor = () => {
    // Search upwards for the last assigned character
    for (let i = row.index; i >= 0; i--) {
      const currentRow = state.freeRows[i];
      if (currentRow.leftToken) {
        return currentRow.leftToken.color;
      }
      // If we encounter a point in a previous row's postPunctuation, the speech ends
      if (i < row.index && currentRow.postPunctuation.includes('.')) {
        break;
      }
    }
    return 'gray';
  };

  const charColor = getCurrentCharacterColor();
  const isVocal = ['A', 'E', 'O', 'U'].includes(row.baseLetter.toUpperCase());

  const handleLeftSubmit = () => {
    const val = leftText.trim();
    if (val.length > 0) {
      dispatch({ type: 'ADD_FREE_WORD_TOKEN', payload: { text: val.slice(0, 8), slotIndex: row.index }});
      setLeftText('');
    }
  };

  const handleLeftKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLeftSubmit();
      setShowNameSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string, color?: string) => {
    dispatch({ type: 'ADD_FREE_WORD_TOKEN', payload: { text: name, color, slotIndex: row.index }});
    setShowNameSuggestions(false);
    setLeftText('');
  };

  const handleBaseClick = () => {
    if (isVocal) {
      // Focus a hidden input or just handle it via global key listener?
      // Let's use a simple toggle if focused or just on click for demo
    }
  };

  const handleBaseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isVocal) {
      const isCurrentlyStandalone = row.isVocalStandalone;
      const willBeStandalone = !isCurrentlyStandalone;

      dispatch({ type: 'SET_VOCAL_STANDALONE', payload: { rowIndex: row.index, isStandalone: willBeStandalone }});

      if (willBeStandalone) {
        // "se escribirán automáticamente dos de esas mismas letras pero invisibles"
        const inv = row.baseLetter.toLowerCase() + row.baseLetter.toLowerCase();
        dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, nexo: row.baseLetter.toUpperCase(), mainInput: '...' + inv }});
      } else {
        dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, nexo: '', mainInput: '' }});
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tokenId = parseInt(e.dataTransfer.getData('tokenId'), 10);
    if (!isNaN(tokenId) && !row.leftToken) {
       dispatch({ type: 'MOVE_FREE_WORD_TOKEN', payload: { tokenId, targetSlotIndex: row.index }});
    }
  };

  // ADVANCED PUNCTUATION LOGIC
  const handleMainInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     let val = e.target.value.toLowerCase();
     let pre = row.prePunctuation;
     let post = row.postPunctuation;

     const preMatch = val.match(/^[¿¡]+/);
     if (preMatch) {
        let matched = preMatch[0];
        if (matched.length > 2) matched = matched.slice(0, 2);
        if (matched === '¿¿' || matched === '¡¡') matched = matched[0];
        if (pre.length === 0 || matched.length >= pre.length) pre = matched;
        val = val.substring(preMatch[0].length);
     }

     const postMatch = val.match(/[\?\!]+$/);
     if (postMatch) {
        let matched = postMatch[0];
        if (matched.length > 2) matched = matched.slice(0, 2);
        if (matched === '??' || matched === '!!') matched = matched[0];
        
        // PAIRING LOGIC
        if (pre.includes('¿') && matched.includes('!')) matched = matched.replace('!', '?');
        if (pre.includes('¡') && matched.includes('?')) matched = matched.replace('?', '!');
        
        post = matched;
        val = val.substring(0, val.length - postMatch[0].length);
     }

     val = val.replace(/[^a-zñáéíóúü\s\,\;\.\:]/gi, "");

     // Rule: "No se pueden escribir dos ',' seguidas ni dos ';' seguidos."
     val = val.replace(/\,\,+/g, ",");
     val = val.replace(/\;\;+/g, ";");
     val = val.replace(/\:\:+/g, ":");

     // Rule: "Si se teclea '.' hasta tres veces, aparecerán puntos suspensivos."
     // Use a temporary replacement for ellipsis to avoid conflict with individual dots
     if (val.includes('...')) {
        val = val.replace(/\.{3,}/g, "...");
     }
     
     // Rule: "No se pueden escribir estos signos ortográficos unos seguidos de otros."
     // Exception: "..." which is handled by dots logic. We also spare ".." to allow reaching "...".
     val = val.replace(/([\,\;\.\:])([\,\;\.\:]+)/g, (match, p1) => {
        if (p1 === '.' && (match === '..' || match === '...')) return match; 
        return p1;
     });

     // Rules for symbols after ellipsis "..."
     if (val.includes('...')) {
        const [before, ...afterParts] = val.split('...');
        const after = afterParts.join("");
        // Remove prohibited symbols after ellipsis. 
        // Note: ? and ! are handled by postPunctuation logic typically, but we ensure val stays clean.
        val = before + '...' + after.replace(/[\,\;\.\:]/g, "");
     }
     
     // Special override: if ellipsis is present, only allow ? or ! in postPunctuation
     if (val.includes('...') && post && !['?', '!', ''].includes(post)) {
        post = '';
     }
     
     dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, mainInput: val, prePunctuation: pre, postPunctuation: post }});
  };

  const handleMainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    
    if (e.key === ' ') {
      e.preventDefault();
      // Rule 1: check LL ambiguity before moving focus
      if (checkLlAmbiguity(row.mainInput)) return;
      // focus nexo if applicable
      if (state.gameMode === 'free-nexus' || state.gameMode === 'challenge') {
        const nexoInput = document.getElementById(`nexo-${row.index}`);
        if (nexoInput) {
          nexoInput.focus();
          return;
        }
      }
      
      // Otherwise next row
      document.getElementById(`main-${row.index + 1}`)?.focus();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      // Rule 1: check LL ambiguity before moving focus
      if (checkLlAmbiguity(row.mainInput)) return;
      let finalVal = row.mainInput;
      if (finalVal.toLowerCase().startsWith(row.baseLetter.toLowerCase())) {
        finalVal = finalVal.slice(1);
      }
      dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, mainInput: finalVal }});
      document.getElementById(`main-${row.index + 1}`)?.focus();
      return;
    }

    if (e.key === 'Backspace') {
       if (target.selectionStart === 1 && target.value.length === 1 && (row.prePunctuation === '¿' || row.prePunctuation === '¡')) {
          dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, prePunctuation: '' }});
       }
       if (target.selectionStart === 0 && target.selectionEnd === 0) {
          if (row.prePunctuation) {
             dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, prePunctuation: '' }});
             return;
          }
          if (row.index > 0 || (target.id.startsWith('nexo-'))) {
             e.preventDefault();
             if (target.id.startsWith('nexo-')) {
                const main = document.getElementById(`main-${row.index}`) as HTMLInputElement;
                if (main) {
                   main.focus();
                   setTimeout(() => { main.selectionStart = main.value.length; main.selectionEnd = main.value.length; }, 0);
                }
             } else {
                // Focus previous row's nexo or main
                if (state.gameMode === 'free-nexus' || state.gameMode === 'challenge') {
                   const prevNexo = document.getElementById(`nexo-${row.index - 1}`) as HTMLInputElement;
                   if (prevNexo) {
                      prevNexo.focus();
                      setTimeout(() => { prevNexo.selectionStart = prevNexo.value.length; prevNexo.selectionEnd = prevNexo.value.length; }, 0);
                   }
                } else {
                   const prevMain = document.getElementById(`main-${row.index - 1}`) as HTMLInputElement;
                   if (prevMain) {
                      prevMain.focus();
                      setTimeout(() => { prevMain.selectionStart = prevMain.value.length; prevMain.selectionEnd = prevMain.value.length; }, 0);
                   }
                }
             }
          }
       } else {
          // Normal behavior but handle postPunctuation deletion if at the end
          if (target.selectionStart === row.mainInput.length && row.postPunctuation) {
             e.preventDefault(); 
             const newPost = row.postPunctuation.slice(0, -1);
             dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, postPunctuation: newPost }});
          }
       }
    }
  };

  // Rule 1: check LL ambiguity and show dialog if needed.
  // Returns true if dialog was shown (caller should stop normal processing).
  const checkLlAmbiguity = (val: string): boolean => {
    if (llDialog) return true;
    if (row.baseLetter.toUpperCase() !== 'L') return false;
    const lower = val.trim().toLowerCase();
    // Only trigger if starts with exactly one 'l'
    if (lower.startsWith('l') && !lower.startsWith('ll')) {
      setLlDialog({ pending: val });
      return true;
    }
    return false;
  };

  const handleMainBlur = () => {
    if (row.isPrefilled) return;
    let finalVal = row.mainInput;
    // Rule 1: check LL before stripping the leading base-letter
    if (checkLlAmbiguity(finalVal)) return;
    if (finalVal.toLowerCase().startsWith(row.baseLetter.toLowerCase())) {
      finalVal = finalVal.slice(1);
      dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, mainInput: finalVal }});
    }
  };

  const handlePrefilledClick = () => {
     if (state.readOnlyMode || !row.isPrefilled) return;
     
     let isValid = false;
     for (let i = row.index; i >= 0; i--) {
        const r = state.freeRows[i];
        if (r.prePunctuation && (r.prePunctuation.includes('¿') || r.prePunctuation.includes('¡'))) {
            isValid = true;
            break;
        }
        if (i < row.index && r.postPunctuation && r.postPunctuation.includes('.')) break;
        if (i < row.index && r.leftToken) break;
     }

     if (isValid) {
        let nextPunct = '';
        if (!row.postPunctuation) nextPunct = '?';
        else if (row.postPunctuation === '?') nextPunct = '!';
        else if (row.postPunctuation === '!') nextPunct = '';
        
        dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, postPunctuation: nextPunct }});
     }
  };

  // Rule 5: strip orthographic signs from nexo if base word is valid
  const cleanNexoSigns = (val: string): string => {
    const stripped = val.replace(/^[¿¡]/, '').replace(/\.\.\./g, '').replace(/…/g, '').trim().toLowerCase();
    const baseIsValid = nexosList.includes(stripped) || (isVocal && stripped === row.baseLetter.toLowerCase());
    if (baseIsValid) {
      // Remove any trailing orthographic signs after the core nexo text
      return val.replace(/[,;.:\u2026]+$/, '').replace(/\.\.\.$/, '');
    }
    return val;
  };

  const handleNexoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
       const target = e.target as HTMLInputElement;
       if (target.selectionStart === 0 && target.selectionEnd === 0) {
          e.preventDefault();
          const main = document.getElementById(`main-${row.index}`) as HTMLInputElement;
          if (main) {
             main.focus();
             setTimeout(() => { main.selectionStart = main.value.length; main.selectionEnd = main.value.length; }, 0);
          }
       }
    }
    if (e.key === ' ') {
      e.preventDefault();
      // Rule 5: clean signs before moving
      const cleaned = cleanNexoSigns(row.nexo);
      if (cleaned !== row.nexo) {
        dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, nexo: cleaned }});
      }
      document.getElementById(`main-${row.index + 1}`)?.focus();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // Rule 5: clean signs before moving
      const cleaned = cleanNexoSigns(row.nexo);
      if (cleaned !== row.nexo) {
        dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, nexo: cleaned }});
      }
      document.getElementById(`main-${row.index + 1}`)?.focus();
    }
  };

  const handleNexoBlur = () => {
    // Rule 5: clean orthographic signs when nexo field loses focus
    const cleaned = cleanNexoSigns(row.nexo);
    if (cleaned !== row.nexo) {
      dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, nexo: cleaned }});
    }
  };

  const handleNexoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     let val = e.target.value.replace(/[^a-zñáéíóúü\s\,\;\.\:¿¡]/gi, "");

     // Rule: "No se pueden escribir dos ',' seguidas ni dos ';' seguidos."
     val = val.replace(/\,\,+/g, ",");
     val = val.replace(/\;\;+/g, ";");
     val = val.replace(/\:\:+/g, ":");

     // Rule: "No se pueden escribir estos signos ortográficos unos seguidos de otros." (consecutive different ones)
     val = val.replace(/([\,\;\.\:])([\,\;\.\:]+)/g, (match, p1) => {
        if (p1 === '.' && (match === '..' || match === '...')) return match; 
        return p1;
     });

     // Proactive cleaning for Rule 5: if it matches a nexo + punctuation, strip punctuation
     const stripped = val.replace(/^[¿¡]/, '').replace(/\.\.\./g, '').replace(/…/g, '').trim().toLowerCase();
     const hasPunctuation = /[,;.:]/.test(val);
     if (hasPunctuation) {
       const core = val.replace(/[,;.:]/g, '');
       const coreStripped = core.replace(/^[¿¡]/, '').trim().toLowerCase();
       if (nexosList.includes(coreStripped) || (isVocal && coreStripped === row.baseLetter.toLowerCase())) {
         val = core;
       }
     }

     // Allow ellipsis but once present, no more characters allowed after it.
     if (val.includes('...')) {
        const [before] = val.split('...');
        val = before + '...';
     }

     dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, nexo: val }});
  };

  const strippedNexo = row.nexo.replace(/^[¿¡]/, '').replace(/\.\.\./g, '').replace(/…/g, '').trim().toLowerCase();
  const nexoValid = row.nexo === '' || (strippedNexo === '' && (row.nexo.includes('...') || row.nexo.includes('…'))) || nexosList.includes(strippedNexo) || (isVocal && strippedNexo === row.baseLetter.toLowerCase());

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '0.8rem', 
        padding: '0.5rem',
        minHeight: '60px'
      }}
    >
      {/* LEFT SLOT */}
       <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            width: '120px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: row.leftToken ? 'transparent' : 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            position: 'relative'
          }}
       >
          {row.leftToken ? (
             <DraggableWordToken token={row.leftToken} />
          ) : (
             <>
               {Object.keys(state.characterColors).length >= 3 ? (
                 <div
                   onClick={() => {
                     setShowNameSuggestions(true);
                     dispatch({ type: 'REFRESH_SUGGESTIONS' });
                   }}
                   onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                   tabIndex={0}
                   style={{
                     width: '100%', cursor: 'pointer', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', outline: 'none'
                   }}
                 >Elegir Personaje</div>
               ) : (
                 <input
                   type="text"
                   value={leftText}
                   readOnly={state.readOnlyMode}
                   tabIndex={state.readOnlyMode ? -1 : 0}
                   onChange={e => setLeftText(e.target.value)}
                   onFocus={() => {
                     setShowNameSuggestions(true);
                     dispatch({ type: 'REFRESH_SUGGESTIONS' });
                   }}
                   onBlur={(e) => {
                     // Auto-submit on blur as requested: "queda establecido ... al hacer click en cualquier otro lugar"
                     if (leftText.trim().length > 0) {
                         handleLeftSubmit();
                     }
                     setTimeout(() => setShowNameSuggestions(false), 200);
                   }}
                   onKeyDown={handleLeftKeyDown}
                   maxLength={8}
                   placeholder="personaje"
                   style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      outline: 'none'
                   }}
                 />
               )}
               {showNameSuggestions && (
                 <div style={{
                   position: 'absolute',
                   top: '100%',
                   left: 0,
                   right: 0,
                   background: 'var(--bg-tertiary)',
                   borderRadius: '8px',
                   zIndex: 50,
                   boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                   overflow: 'hidden',
                   marginTop: '4px',
                   border: '1px solid var(--border-glass)'
                 }}>
                   {/* Previously used names */}
                   {Object.keys(state.characterColors).map(name => (
                     <div 
                        key={name} 
                        onClick={() => handleSuggestionClick(name)}
                        style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: state.characterColors[name] }}
                     >
                       {name}
                     </div>
                   ))}
                   {/* Random suggestions (Only show if under limit) */}
                   {Object.keys(state.characterColors).length < 3 && (
                     <>
                       <div 
                          onClick={() => handleSuggestionClick(state.suggestedNames.male, suggestionColorMale)}
                          style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: suggestionColorMale }}
                       >
                         {state.suggestedNames.male}
                       </div>
                       <div 
                          onClick={() => handleSuggestionClick(state.suggestedNames.female, suggestionColorFemale)}
                          style={{ padding: '8px', cursor: 'pointer', fontSize: '0.8rem', color: suggestionColorFemale }}
                       >
                         {state.suggestedNames.female}
                       </div>
                     </>
                   )}
                 </div>
               )}
             </>
          )}
       </div>

      {/* CENTER SLOT */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
         <span 
            onClick={() => dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, prePunctuation: '' }})}
            style={{ position: 'absolute', right: '100%', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer' }}
         >
            {row.prePunctuation}
         </span>
         
         <div 
            onClick={handleBaseClick}
            onKeyDown={handleBaseKeyDown}
            tabIndex={isVocal ? 0 : -1}
            style={{
              width: '40px',
              height: '40px',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: row.isVocalStandalone ? charColor : 'var(--accent-secondary)',
              cursor: isVocal ? 'pointer' : 'default',
              border: row.isVocalStandalone ? `2px solid ${charColor}` : 'none',
              outline: 'none'
            }}
          >
            {row.baseLetter}
          </div>
      </div>

      {/* RIGHT SLOT */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: '1px solid var(--border-glass)',
        width: '200px', // Fixed width to prevent shifting
        position: 'relative'
      }}>
        <input
           id={`main-${row.index}`}
           type="text"
           value={row.isVocalStandalone ? '...' : row.mainInput}
           readOnly={row.isVocalStandalone || state.readOnlyMode}
           tabIndex={state.readOnlyMode ? -1 : 0}
           onChange={handleMainInputChange}
           onKeyDown={handleMainKeyDown}
           onBlur={handleMainBlur}
           onClick={handlePrefilledClick}
           onDragOver={(e) => {
              if (e.dataTransfer.types.includes('thematicwordid')) {
                 e.preventDefault();
              }
           }}
           onDrop={(e) => {
              const thematicWordId = e.dataTransfer.getData('thematicWordId');
              if (thematicWordId) {
                 e.preventDefault();
                 dispatch({ type: 'USE_THEMATIC_WORD', payload: { wordId: parseInt(thematicWordId, 10), rowIndex: row.index } });
              }
           }}
           placeholder="..."
           maxLength={17}
           style={{
             width: '100%',
             background: 'transparent',
             border: 'none',
             color: charColor,
             fontSize: '1.2rem',
             padding: '0.5rem 0',
             outline: 'none',
             fontFamily: 'inherit',
             transition: 'color 0.3s ease',
             cursor: row.isPrefilled ? 'pointer' : 'text'
           }}
        />
        {row.postPunctuation && (
           <span 
             onClick={() => dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, postPunctuation: '' }})}
             style={{ 
               position: 'absolute', 
               left: '100%', 
               paddingLeft: '0.2rem', // Reduced padding to move it left relative to nexo box
               color: 'var(--accent-primary)', 
               fontWeight: 'bold', 
               fontSize: '1.2rem',
               whiteSpace: 'nowrap',
               cursor: 'pointer'
             }}
           >
              {row.postPunctuation}
           </span>
        )}
      </div>

      {/* FAR RIGHT SLOT */}
      {(state.gameMode === 'free-nexus' || state.gameMode === 'challenge') && (
        <input 
          id={`nexo-${row.index}`}
          type="text"
          value={row.nexo}
          readOnly={state.readOnlyMode}
          tabIndex={state.readOnlyMode ? -1 : 0}
          onChange={handleNexoChange}
          onKeyDown={handleNexoKeyDown}
          onBlur={handleNexoBlur}
          onDragOver={handleDragOver}
          onDrop={(e) => {
             e.preventDefault();
             const nexoText = e.dataTransfer.getData('nexoText');
             if (nexoText) {
                dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, nexo: nexoText }});
             } else {
                handleDrop(e);
             }
          }}
          placeholder="nexo"
          style={{
            width: '60px',
            background: 'rgba(0,0,0,0.2)',
            border: nexoValid ? '1px solid var(--border-glass)' : '1px solid var(--error, red)',
            color: (row.isVocalStandalone && row.nexo === row.baseLetter.toUpperCase()) ? charColor : 'var(--text-secondary)',
            fontWeight: (row.isVocalStandalone && row.nexo === row.baseLetter.toUpperCase()) ? 'bold' : 'normal',
            fontSize: '0.9rem',
            padding: '0.3rem',
            borderRadius: '4px',
            outline: 'none',
            textAlign: 'center',
            transition: 'all 0.3s'
          }}
          title={nexoValid ? '' : 'Nexo no válido'}
        />
      )}

      {/* Rule 1: LL/L disambiguation dialog */}
      {llDialog && (
        <div
          ref={llDialogRef}
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              background: 'var(--bg-primary)',
              padding: '2rem 2.5rem',
              borderRadius: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              alignItems: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              minWidth: '280px'
            }}
          >
            <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 600 }}>
              ¿Palabra con LL o L?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-primary"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  // LL chosen: keep the 'l' that was typed. 
                  // In FreeModeRow, the input box should contain the second 'l' to make it 'LL'.
                  setLlDialog(null);
                }}
              >
                LL
              </button>
              <button
                className="btn btn-secondary"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  // L chosen: remove the 'l' that was typed.
                  let finalVal = llDialog.pending;
                  if (finalVal.toLowerCase().startsWith('l')) {
                    finalVal = finalVal.slice(1);
                  }
                  dispatch({ type: 'UPDATE_FREE_INPUT', payload: { rowIndex: row.index, mainInput: finalVal }});
                  setLlDialog(null);
                }}
              >
                L
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
