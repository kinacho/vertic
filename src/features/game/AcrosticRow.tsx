import React, { useRef, useState } from 'react';
import { AcrosticRowData } from '../../types';
import { CharacterToken } from './CharacterToken';
import { useGameContext } from '../../hooks/useGameContext';
import { AiSuggestionBubble } from '../ai/AiSuggestionBubble';
import { aiData } from '../../i18n/locales';

interface Props {
  row: AcrosticRowData;
}

export const AcrosticRow: React.FC<Props> = ({ row }) => {
  const { state, dispatch } = useGameContext();
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const [llDialog, setLlDialog] = useState<{ pending: string } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Must prevent default to allow drop
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (row.charSlot !== null) return; // Slot occupied

    const charId = parseInt(e.dataTransfer.getData('charId'), 10);
    if (!isNaN(charId)) {
      dispatch({ type: 'MOVE_CHAR', payload: { charId, targetSlotIndex: row.index } });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_INPUT', payload: { rowIndex: row.index, text: e.target.value } });
  };
  
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
      if (checkLlAmbiguity(row.inputText)) {
        e.preventDefault();
      }
    }
  };

  const handleBlur = () => {
    checkLlAmbiguity(row.inputText);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!state.suggestionsActive) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const suggestionsSet = aiData[state.lang].suggestionsSet;
    const suggestionText = suggestionsSet[row.index % suggestionsSet.length];

    // Position slightly right of the element
    setBubblePos({ top: rect.top, left: rect.right + 10 });
    setBubbleVisible(true);
  };

  const handleMouseLeave = () => {
    if (state.suggestionsActive) setBubbleVisible(false);
  };

  const isMatched = row.inputText.trim().endsWith('.') || row.inputText.trim().endsWith('!');

  return (
    <div
      ref={rowRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.5rem',
        background: isMatched ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        transition: 'background 0.3s'
      }}
    >
      {/* Drop Slot */}
      <div
        data-droppable="true"
        data-index={row.index}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: '50px',
          height: '50px',
          border: row.charSlot ? 'none' : '2px dashed var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: row.charSlot ? 'transparent' : 'rgba(255,255,255,0.02)'
        }}
      >
        {row.charSlot && <CharacterToken char={row.charSlot} />}
      </div>

      {/* Base Letter */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--accent-secondary)',
          width: '30px',
          textAlign: 'center',
          cursor: state.suggestionsActive ? 'help' : 'default'
        }}
      >
        {row.baseLetter}
      </div>

      {/* Input */}
      <input
        type="text"
        value={row.inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="..."
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--border-glass)',
          color: 'var(--text-primary)',
          fontSize: '1.2rem',
          padding: '0.5rem',
          outline: 'none',
          fontFamily: 'inherit'
        }}
      />

      {state.suggestionsActive && (
        <AiSuggestionBubble
          text={aiData[state.lang].suggestionsSet[row.index % 5]}
          position={bubblePos}
          isVisible={bubbleVisible}
        />
      )}

      {/* Rule 1: LL/L disambiguation dialog */}
      {llDialog && (
        <div
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
                  setLlDialog(null);
                }}
              >
                LL
              </button>
              <button
                className="btn btn-secondary"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  let finalVal = llDialog.pending;
                  if (finalVal.toLowerCase().startsWith('l')) {
                    finalVal = finalVal.slice(1);
                  }
                  dispatch({ type: 'UPDATE_INPUT', payload: { rowIndex: row.index, text: finalVal } });
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
