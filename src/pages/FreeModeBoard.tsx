import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { FreeModeRow } from '../features/game/FreeModeRow';
import { ArrowLeft, Lightbulb, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

const FreeModeBoard: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const navigate = useNavigate();
  const [showTooltipInfo, setShowTooltipInfo] = useState(false);
  const [showCorrectionMenu, setShowCorrectionMenu] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showChallengeFinale, setShowChallengeFinale] = useState(false);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [showNexosList, setShowNexosList] = useState(false);
  const nexosTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [boardScrollPercent, setBoardScrollPercent] = useState(0);

  // Track page-level scroll for the acrostic phrase reveal
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setBoardScrollPercent(scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNexosMouseEnter = () => {
     if (nexosTimeoutRef.current) clearTimeout(nexosTimeoutRef.current);
     setShowNexosList(true);
  };

  const handleNexosMouseLeave = () => {
     nexosTimeoutRef.current = setTimeout(() => {
        setShowNexosList(false);
     }, 1000);
  };

  const handleFinish = () => {
    if (state.gameMode === 'challenge') {
       setShowChallengeFinale(true);
    } else {
       setTempTitle('');
       setShowTitlePrompt(true);
    }
  };

  const handleConfirmTitle = () => {
      dispatch({ type: 'SET_VERTICAL_TITLE', payload: tempTitle.trim() });
      if (state.gameMode === 'challenge') {
          const stored = localStorage.getItem('vertic_saved_works');
          const works = stored ? JSON.parse(stored) : [];
          works.push({
              id: Date.now().toString(),
              title: tempTitle.trim() || 'Desafío del Día',
              mode: state.gameMode,
              timestamp: Date.now(),
              freeRows: state.freeRows,
              characterColors: state.characterColors,
              freePhrase: state.freePhrase
          });
          localStorage.setItem('vertic_saved_works', JSON.stringify(works));
          dispatch({ type: 'SET_SCREEN', payload: 'home' });
          navigate('/saved-works');
      } else {
          dispatch({ type: 'SET_SCREEN', payload: 'free-mode-result' });
          navigate('/free-result');
      }
  };

  const nexosList = ["el", "la", "los", "las", "un", "una", "a", "e", "y", "o", "u", "con", "sin", "mi", "mis", "tu", "tus", "su", "sus", "de", "del", "al", "en", "que", "por", "se", "te", "me", "lo", "mas", "nos", "ni"];

  let openQuest = 0;
  let closedQuest = 0;
  let openExcl = 0;
  let closedExcl = 0;

  state.freeRows.forEach(row => {
     const fullStr = row.prePunctuation + row.mainInput + row.postPunctuation + row.nexo;
     openQuest += (fullStr.match(/¿/g) || []).length;
     closedQuest += (fullStr.match(/\?/g) || []).length;
     openExcl += (fullStr.match(/¡/g) || []).length;
     closedExcl += (fullStr.match(/\!/g) || []).length;
  });

  const punctuationBalanced = (openQuest === closedQuest) && (openExcl === closedExcl);

  const isFinished = state.freeRows.length > 0 && 
    Object.keys(state.characterColors).length > 0 && 
    state.freeRows[0]?.leftToken !== null &&
    punctuationBalanced &&
    state.freeRows.every(row => {
      const isVocal = ['A', 'E', 'O', 'U'].includes(row.baseLetter.toUpperCase());
      const mainValid = row.mainInput.trim().length > 0 || row.isVocalStandalone || (isVocal && row.mainInput.trim().length === 0);
      const isAutoVocalNexo = row.isVocalStandalone && row.nexo === row.baseLetter.toUpperCase();
      const strippedNexo = row.nexo.replace(/^[¿¡]/, '').replace(/\.\.\./g, '').replace(/…/g, '').trim().toLowerCase();
      const nexoValid = state.gameMode !== 'free-nexus' || row.nexo === '' || (strippedNexo === '' && (row.nexo.includes('...') || row.nexo.includes('…'))) || nexosList.includes(strippedNexo) || (isVocal && strippedNexo === row.baseLetter.toLowerCase()) || isAutoVocalNexo;
      return mainValid && nexoValid;
    });

  return (
    <div className="screen-container" style={{ padding: '2rem' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '900px', marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          style={{ gap: '0.5rem' }}
          onClick={() => {
             if (state.readOnlyMode) {
                navigate('/saved-works');
             } else if (state.gameMode === 'challenge') {
                dispatch({ type: 'SET_SCREEN', payload: 'preview' });
                navigate('/preview');
             } else {
                dispatch({ type: 'SET_SCREEN', payload: 'free-mode-setup' });
                navigate('/free-setup');
             }
          }}
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>

          {!state.readOnlyMode && isFinished && (
             <button 
                onClick={handleFinish}
                className="btn animate-fade-in" 
                style={{ 
                   background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                   fontWeight: 'bold', 
                   fontSize: '1.2rem', 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '0.5rem',
                   cursor: 'pointer'
                }}
             >
                <Check size={24} /> ¡Terminado! <ChevronRight size={18} />
             </button>
          )}
        </div>
      </div>

      <h2 style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {state.gameMode === 'challenge' ? 'Desafío del día' : (state.gameMode === 'free-nexus' ? 'Verticálogo con nexos' : 'Verticálogo puro')}
      </h2>

      <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '1200px', alignItems: 'flex-start' }}>

        {/* LEFT: Acrostic phrase — challenge and free modes */}
        {state.freePhrase && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-start', pointerEvents: 'none', width: '180px', flexShrink: 0, position: 'sticky', top: '2rem' }}>
            {(() => {
              const words = state.freePhrase.split(' ');
              const isLong = state.freePhrase.replace(/\s+/g, '').length >= 17;
              const wordsToShow = isLong
                ? Math.min(words.length, Math.floor((boardScrollPercent * 1.05) * (words.length + 0.01)))
                : words.length;
              return words.slice(0, wordsToShow).map((w, idx) => (
                <span key={idx} className="animate-fade-in" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                  {w}
                </span>
              ));
            })()}
          </div>
        )}

        {/* Board Area */}
        <div 
           style={{ 
             flex: 1, 
             width: '100%', 
             maxWidth: '900px', 
             display: 'flex',
             flexDirection: 'column',
             gap: '0.5rem',
             position: 'relative'
           }}
        >
           {state.readOnlyMode && (
             <div style={{
               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
               zIndex: 10, background: 'transparent'
             }} />
           )}
           {state.freeRows.map(row => (
              <FreeModeRow key={row.index} row={row} />
           ))}
        </div>

        {/* RIGHT: thematic words panel for challenge only */}
        {state.gameMode === 'challenge' && !state.readOnlyMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '250px', position: 'sticky', top: '2rem', flexShrink: 0 }}>
             <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                   ¡Trata de usar estas palabras temáticas!
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {state.thematicWords.map(tw => {
                      if (tw.usedInRow !== null) return null;
                      return (
                         <div 
                            key={tw.id}
                            draggable="true"
                            onDragStart={(e) => {
                               e.dataTransfer.setData('thematicWordId', tw.id.toString());
                            }}
                            style={{
                               padding: '0.8rem',
                               background: 'rgba(139, 92, 246, 0.1)',
                               border: '1px solid rgba(139, 92, 246, 0.3)',
                               borderRadius: '8px',
                               textAlign: 'center',
                               fontWeight: 'bold',
                               color: 'var(--text-primary)',
                               cursor: 'grab'
                            }}
                         >
                            {tw.word}
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
        )}
      </div>
      
      {showTitlePrompt && !state.readOnlyMode && (
         <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
         }}>
            <div className="glass-panel animate-fade-in" style={{
               background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '1rem',
               display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '400px',
               textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
               <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>¿Cómo se llama tu verticálogo?</h3>
               <input 
                 autoFocus
                 type="text" 
                 value={tempTitle}
                 onChange={(e) => setTempTitle(e.target.value.substring(0, state.gameMode === 'challenge' ? 16 : 25))}
                 placeholder="Ej. Mi gran obra" 
                 style={{
                    padding: '1rem', fontSize: '1.2rem', borderRadius: '0.5rem',
                    border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)', outline: 'none', textAlign: 'center'
                 }}
               />
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '-1rem' }}>
                 {tempTitle.length}/{state.gameMode === 'challenge' ? 16 : 25}
               </div>
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => setShowTitlePrompt(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleConfirmTitle}>Ver resultado</button>
               </div>
            </div>
         </div>
      )}

      {showChallengeFinale && !state.readOnlyMode && (
         <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
         }}>
             <div className="glass-panel animate-fade-in" style={{ background: 'var(--bg-primary)', padding: '2rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', borderRadius: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>¡Enhorabuena! ¿Quieres compartir tu creación?</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                   <button className="btn btn-primary" onClick={() => alert("Función de compartir en desarrollo.")}>
                     Sí
                   </button>
                   <button className="btn btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => {
                        setTempTitle('');
                        setShowTitlePrompt(true);
                        setShowChallengeFinale(false);
                   }}>
                     La guardaré
                   </button>
                </div>
             </div>
         </div>
      )}

      {/* Lista de nexos button — fixed position */}
      {(state.gameMode === 'challenge' || state.gameMode === 'free-nexus') && !state.readOnlyMode && (
        <div
          onMouseEnter={handleNexosMouseEnter}
          onMouseLeave={handleNexosMouseLeave}
          style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 9998 }}
        >
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
          >
            Lista de nexos
          </button>
        </div>
      )}

      {/* Corregir nombre button — fixed position */}
      {!state.readOnlyMode && state.gameMode !== 'challenge' && Object.keys(state.characterColors).length > 0 && (
        <div style={{ position: 'fixed', top: state.gameMode === 'free-nexus' ? '5rem' : '2rem', right: '2rem', zIndex: 9998 }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)' }}
            onClick={() => setShowCorrectionMenu(!showCorrectionMenu)}
          >
            Corregir nombre
          </button>
        </div>
      )}

      {/* Nexos panel — rendered at root level so position:fixed works */}
      {showNexosList && (state.gameMode === 'challenge' || state.gameMode === 'free-nexus') && !state.readOnlyMode && (
        <div
          className="glass-panel animate-fade-in"
          onMouseEnter={handleNexosMouseEnter}
          onMouseLeave={handleNexosMouseLeave}
          style={{
            position: 'fixed', top: '6rem', right: '2rem',
            padding: '1.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
            borderRadius: '12px', zIndex: 9999, width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {nexosList.map(n => (
              <span
                key={n}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('nexoText', n)}
                style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'grab' }}
              >
                {n}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
            Puedes incluir los símbolos '¿' y '¡' antes de escribir un nexo: “¿Me…”, “¿La...”, ¿Nos…”, etc. Se permiten los puntos suspensivos “...” al final. Pueden además empezar por mayúscula si hay rigor ortográfico.
          </div>
          <div style={{ background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.9rem', alignSelf: 'flex-end', fontWeight: 'bold' }}>
            Clica un nexo y arrastra hacia su cuadro
          </div>
        </div>
      )}

      {/* Correction menu — rendered at root level so position:fixed works */}
      {showCorrectionMenu && !state.readOnlyMode && state.gameMode !== 'challenge' && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'fixed', top: '6rem', right: '2rem',
            padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
            borderRadius: '8px', zIndex: 9999, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Personajes actuales:</div>
          {Object.keys(state.characterColors).map(name => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              {editingName === name ? (
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    style={{ flex: 1, padding: '0.2rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-primary)', color: 'white', borderRadius: '4px' }}
                  />
                  <button onClick={() => {
                    dispatch({ type: 'UPDATE_CHARACTER', payload: { oldName: name, newName: renameValue } });
                    setEditingName(null);
                  }} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 0.4rem' }}>✓</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: state.characterColors[name], fontWeight: 'bold' }}>{name}</span>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => { setEditingName(name); setRenameValue(name); }} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>Editar</button>
                    <button onClick={() => {
                      dispatch({ type: 'DELETE_CHARACTER', payload: { name } });
                    }} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>Borrar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setShowCorrectionMenu(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '0.8rem', marginTop: '0.5rem', cursor: 'pointer' }}>Cerrar</button>
        </div>
      )}

      <PageTitle title={state.readOnlyMode ? "Obra guardada" : (state.gameMode === 'challenge' ? "Reto Diario" : "Modo Libre")} />
    </div>
  );
};

export default FreeModeBoard;
