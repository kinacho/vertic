import React, { useEffect, useRef } from 'react';
import { useGameContext } from '../../hooks/useGameContext';
import { aiData } from '../../i18n/locales';
import { X, MessageSquareQuote } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCommentSidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useGameContext();
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of comments
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [state.comments]);

  // Simulate AI injecting comments periodically
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const allMockComments = aiData[state.lang].mockComments;
    let unusedComments = [...allMockComments].sort(() => 0.5 - Math.random());
    
    if (state.screen === 'game' || state.screen === 'free-mode-board') {
       interval = setInterval(() => {
         if (unusedComments.length === 0) return;
         const text = unusedComments.pop()!;
         dispatch({ 
             type: 'ADD_COMMENT', 
             payload: { id: Date.now().toString(), text, timestamp: Date.now() } 
         });
       }, 8000);
    }
    return () => clearInterval(interval);
  }, [state.screen, state.lang, dispatch]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-350px',
        width: '300px',
        height: '100vh',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-glass)',
        transition: 'right 0.3s ease',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareQuote size={18} style={{ color: 'var(--accent-secondary)' }} /> IA Comentarios
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
          <X size={24} />
        </button>
      </div>

      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {state.comments.map(c => (
          <div key={c.id} className="animate-fade-in" style={{
             background: 'var(--bg-primary)',
             padding: '1rem',
             borderRadius: 'var(--radius-md)',
             borderLeft: '3px solid var(--accent-secondary)'
          }}>
            {c.text}
          </div>
        ))}
      </div>
    </div>
  );
};
