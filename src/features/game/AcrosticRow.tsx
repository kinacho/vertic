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
        gap: 'clamp(0.5rem, 2vw, 1rem)',
        padding: '0.75rem',
        background: isMatched ? 'var(--accent-secondary-glow)' : 'var(--bg-glass)',
        borderRadius: 'var(--radius-md)',
        transition: 'var(--transition-base)',
        border: `1px solid ${isMatched ? 'var(--accent-secondary)' : 'var(--border-glass)'}`,
        flexWrap: 'wrap'
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
          background: row.charSlot ? 'transparent' : 'rgba(255,255,255,0.02)',
          flexShrink: 0
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
          color: 'var(--accent-primary)',
          width: '40px',
          textAlign: 'center',
          cursor: state.suggestionsActive ? 'help' : 'default',
          flexShrink: 0,
          textShadow: '0 0 10px var(--accent-primary-glow)'
        }}
      >
        {row.baseLetter}
      </div>

      {/* Input */}
      <input
        type="text"
        value={row.inputText}
        onChange={handleInputChange}
        placeholder="..."
        style={{
          flex: '1 1 200px',
          background: 'transparent',
          border: 'none',
          borderBottom: '2px solid var(--border-glass)',
          color: 'var(--text-primary)',
          fontSize: '1.2rem',
          padding: '0.5rem',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'var(--transition-base)'
        }}
        onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-primary)'}
        onBlur={(e) => e.target.style.borderBottomColor = 'var(--border-glass)'}
      />

      {state.suggestionsActive && (
        <AiSuggestionBubble
          text={aiData[state.lang].suggestionsSet[row.index % 5]}
          position={bubblePos}
          isVisible={bubbleVisible}
        />
      )}
    </div>
  );
};
