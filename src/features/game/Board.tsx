import React from 'react';
import { useGameContext } from '../../hooks/useGameContext';
import { AcrosticRow } from './AcrosticRow';
import { CharacterToken } from './CharacterToken';

export const Board: React.FC = () => {
  const { state, dispatch } = useGameContext();

  const handleDragOverPool = (e: React.DragEvent) => e.preventDefault();
  const handleDropPool = (e: React.DragEvent) => {
    e.preventDefault();
    const charId = parseInt(e.dataTransfer.getData('charId'), 10);
    if (!isNaN(charId)) {
        dispatch({ type: 'MOVE_CHAR', payload: { charId, targetSlotIndex: null } });
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2rem', 
      padding: '1rem', 
      maxWidth: '800px', 
      margin: '0 auto', 
      width: '100%' 
    }}>
      {/* Draggable Pool */}
      <div 
         data-droppable="true"
         data-index="-1"
         onDragOver={handleDragOverPool}
         onDrop={handleDropPool}
         className="glass-panel" 
         style={{ 
           padding: '1.2rem', 
           display: 'flex', 
           gap: '0.75rem', 
           minHeight: '80px', 
           alignItems: 'center',
           flexWrap: 'wrap',
           justifyContent: 'center'
         }}
      >
        <div style={{ 
          color: 'var(--text-secondary)', 
          width: '100%', 
          textAlign: 'center', 
          fontSize: '0.85rem',
          marginBottom: '0.5rem',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Caracteres Libres
        </div>
        {state.draggablePool.map(char => (
          <CharacterToken key={char.id} char={char} />
        ))}
      </div>

      {/* Rows Container */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        width: '100%'
      }}>
        {state.rows.map(row => (
          <AcrosticRow key={row.index} row={row} />
        ))}
      </div>
    </div>

  );
};
