import React from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ResultScriptView } from '../features/game/ResultScriptView';
import PageTitle from '../components/PageTitle';

const FreeModeResult: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const navigate = useNavigate();

  return (
    <div className="screen-container" style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
             dispatch({ type: 'SET_SCREEN', payload: 'free-mode-board' });
             navigate('/free-board');
          }}
        >
          <ArrowLeft size={18} /> Volver al tablero
        </button>
      </div>

      <ResultScriptView />
      <PageTitle title="Resultado" />
    </div>
  );
};

export default FreeModeResult;
