import React, { useState } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitMerge, AlignLeft } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const FreeModesSelect: React.FC = () => {
  const { dispatch } = useGameContext();
  const navigate = useNavigate();
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const handleSelect = (mode: 'free-nexus' | 'free-pure') => {
    dispatch({ type: 'SET_GAME_MODE', payload: mode });
    dispatch({ type: 'SET_SCREEN', payload: 'free-mode-setup' });
    navigate('/free-setup');
  };

  return (
    <div className="screen-container">
      <button 
        className="btn btn-secondary animate-fade-in" 
        style={{ position: 'absolute', top: '2rem', left: '2rem', gap: '0.5rem' }}
        onClick={() => {
          dispatch({ type: 'SET_SCREEN', payload: 'home' });
          navigate('/');
        }}
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <h1 className="logo animate-fade-in delay-1" style={{ fontSize: '3rem', marginBottom: '3rem' }}>Elige un Modo</h1>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Verticálogo con nexos */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '300px' }}>
          <div 
            className="glass-panel animate-fade-in delay-2"
            style={{ 
              padding: '2rem', 
              width: '100%', 
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer', 
              textAlign: 'center', 
              transition: 'all 0.3s' 
            }}
            onMouseEnter={() => setHoveredMode('nexus')}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => handleSelect('free-nexus')}
          >
            <GitMerge size={48} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Verticálogo con nexos</h2>
          </div>
          <div style={{ opacity: hoveredMode === 'nexus' ? 1 : 0, transition: 'opacity 0.3s', marginTop: '1rem', color: 'var(--text-secondary)', textAlign: 'center', minHeight: '3rem' }}>
            Posibilidad de usar nexos entre palabras
          </div>
        </div>

        {/* Verticálogo puro */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '300px' }}>
          <div 
            className="glass-panel animate-fade-in delay-3"
            style={{ 
              padding: '2rem', 
              width: '100%', 
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer', 
              textAlign: 'center', 
              transition: 'all 0.3s' 
            }}
            onMouseEnter={() => setHoveredMode('pure')}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => handleSelect('free-pure')}
          >
            <AlignLeft size={48} style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Verticálogo puro</h2>
          </div>
          <div style={{ opacity: hoveredMode === 'pure' ? 1 : 0, transition: 'opacity 0.3s', marginTop: '1rem', color: 'var(--text-secondary)', textAlign: 'center', minHeight: '3rem' }}>
            Sin nexos: a palabra por letra
          </div>
        </div>

      </div>

      <div className="animate-fade-in delay-4" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/tips')}
          style={{ padding: '0.8rem 3rem', fontSize: '1.2rem', background: 'var(--bg-tertiary)' }}
        >
          Consejos y ejemplos
        </button>
      </div>

      <PageTitle title="Modos Libres" />
    </div>
  );
};

export default FreeModesSelect;
