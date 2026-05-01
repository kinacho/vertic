import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

interface Props {
  text: string;
  isVisible: boolean;
  position: { top: number; left: number };
}

export const AiSuggestionBubble: React.FC<Props> = ({ text, isVisible, position }) => {
  const typedText = useTypewriter(text, 50, isVisible);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--accent-primary)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-lg)',
        borderTopLeftRadius: '0px',
        color: 'var(--text-primary)',
        zIndex: 50,
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '200px',
        pointerEvents: 'none',
        transition: 'opacity 0.2s',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {typedText.length > 0 ? (
        <>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            {typedText.charAt(0)}
          </span>
          {typedText.substring(1)}
        </>
      ) : (
         "..."
      )}
    </div>
  );
};
