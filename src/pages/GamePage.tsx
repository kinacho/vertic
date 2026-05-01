import React, { useState } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { Board } from '../features/game/Board';
import { AiCommentSidebar } from '../features/ai/AiCommentSidebar';
import { aiData } from '../i18n/locales';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const GamePage: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isChallenge = state.gameMode === 'challenge';

  return (
    <div className="screen-container" style={{ padding: '2rem', background: 'var(--bg-primary)', position: 'relative' }}>
      {!isChallenge && <AiCommentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', marginBottom: '2rem', zIndex: 10 }}>
        <button className="btn btn-secondary" onClick={() => {
          dispatch({ type: 'SET_SCREEN', payload: 'home' });
          navigate('/');
        }}>
           <ArrowLeft size={18} /> Volver al menú
        </button>
        
        {!isChallenge && (
          <button className="btn" onClick={() => setSidebarOpen(true)}>
             <MessageCircle size={18} /> GPT
          </button>
        )}
      </div>

      {!isChallenge ? <Board /> : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '4rem', opacity: 0.3 }}>
             {/* Empty challenge board as requested */}
          </div>
        </div>
      )}
      <PageTitle title={isChallenge ? "Reto Diario" : "Tablero"} />
    </div>
  );
};

export default GamePage;
