import React, { useRef, useState } from 'react';
import { CharacterState } from '../../types';
import { useGameContext } from '../../hooks/useGameContext';

interface Props {
  char: CharacterState;
}

export const CharacterToken: React.FC<Props> = ({ char }) => {
  const { dispatch } = useGameContext();
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (char.type === 'fixed') return;
    setIsDragging(true);
    e.dataTransfer.setData('charId', char.id.toString());
    // Fallback for visual
    setTimeout(() => {
       if (elementRef.current) elementRef.current.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = () => {
    if (char.type === 'fixed') return;
    setIsDragging(false);
    if (elementRef.current) elementRef.current.style.opacity = '1';
  };

  // Touch logic for mobile natively
  const handleTouchStart = (e: React.TouchEvent) => {
    if (char.type === 'fixed') return;
    longPressTimer.current = setTimeout(() => {
       setIsDragging(true);
       if (elementRef.current) {
          elementRef.current.style.opacity = '0.7';
          elementRef.current.style.transform = 'scale(1.1)';
       }
    }, 300);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (char.type === 'fixed' || !isDragging) return;

    // Found drop target
    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = targetElement?.closest('[data-droppable]');
    
    if (dropZone) {
      const targetIndex = parseInt(dropZone.getAttribute('data-index') || '-1', 10);
      if (targetIndex >= 0) {
        dispatch({ type: 'MOVE_CHAR', payload: { charId: char.id, targetSlotIndex: targetIndex } });
      }
    }

    setIsDragging(false);
    if (elementRef.current) {
       elementRef.current.style.opacity = '1';
       elementRef.current.style.transform = 'scale(1)';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      // e.preventDefault() cannot be called passively, requires global listener or CSS touch-action
    } else {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div
      ref={elementRef}
      draggable={char.type === 'draggable'}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: char.type === 'fixed' ? 'rgba(255,255,255,0.1)' : 'var(--accent-primary)',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'bold',
        cursor: char.type === 'fixed' ? 'not-allowed' : 'grab',
        opacity: char.type === 'fixed' ? 0.7 : 1,
        touchAction: 'none',
        boxShadow: char.type === 'draggable' ? 'var(--shadow-sm)' : 'none',
        transition: 'transform 0.2s',
        userSelect: 'none'
      }}
    >
      {char.letter}
    </div>
  );
};
