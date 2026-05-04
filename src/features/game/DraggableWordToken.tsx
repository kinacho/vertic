import React, { useState } from 'react';
import { FreeModeWordToken } from '../../types';
import { useGameContext } from '../../hooks/useGameContext';
import { X } from 'lucide-react';

interface Props {
  token: FreeModeWordToken;
}

export const DraggableWordToken: React.FC<Props> = ({ token }) => {
  const { dispatch } = useGameContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(token.text);

  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('tokenId', token.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRename = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== token.text) {
      dispatch({ type: 'UPDATE_CHARACTER', payload: { oldName: token.text, newName: trimmed } });
    } else {
      setEditText(token.text);
    }
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'DELETE_FREE_TOKEN', payload: { tokenId: token.id } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') {
      setEditText(token.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onClick={() => {
        const isChallengePrefilled = token.isPrefilled && useGameContext().state.gameMode === 'challenge';
        if (!isEditing && !isChallengePrefilled) {
          setIsEditing(true);
        }
      }}
      style={{
        padding: '0.2rem 0.5rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: token.color,
        color: '#fff',
        fontWeight: 'bold',
        cursor: isEditing ? 'text' : 'grab',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '80px',
        maxWidth: '150px',
        gap: '4px',
        border: isEditing ? '2px solid #fff' : 'none',
        transition: 'all 0.2s ease'
      }}
      title={isEditing ? 'Intro para guardar, Esc para cancelar' : 'Clic para editar, arrastrar para mover'}
    >
      {isEditing ? (
        <input 
          autoFocus
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontWeight: 'bold',
            outline: 'none',
            width: '100%',
            textAlign: 'center'
          }}
        />
      ) : (
        <>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {token.text}
          </span>
          {(!token.isPrefilled || useGameContext().state.gameMode !== 'challenge') && (
            <button 
            onClick={handleDelete}
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              padding: 0
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,0,0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
          >
            <X size={12} />
          </button>
          )}
        </>
      )}
    </div>
  );
};
