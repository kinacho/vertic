import React, { useState } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const FreeModeSetup: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  
  const MAX_CHARS = 50;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Prevent double spaces
    if (/  /.test(val)) return;
    if (/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]*$/.test(val)) {
      if (val.length <= MAX_CHARS) {
         setInputValue(val);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length === 0) return;
    
    dispatch({ type: 'SET_FREE_PHRASE', payload: inputValue.trim() });
    dispatch({ type: 'SET_SCREEN', payload: 'free-mode-board' });
    navigate('/free-board');
  };

  return (
    <div className="screen-container">
      <button 
        className="btn btn-secondary" 
        style={{ position: 'absolute', top: '2rem', left: '2rem', gap: '0.5rem' }}
        onClick={() => {
           dispatch({ type: 'SET_SCREEN', payload: 'free-modes-select' });
           navigate('/free-modes');
        }}
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>
           {state.gameMode === 'free-nexus' ? 'Verticálogo con nexos' : 'Verticálogo puro'}
        </h2>
        
        <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
          Introduce una frase para comenzar (máx {MAX_CHARS} caracteres)
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Escribe tu frase aquí..."
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              padding: '1rem',
              outline: 'none',
              borderRadius: '8px',
              fontFamily: 'inherit',
              textAlign: 'center'
            }}
            autoFocus
          />
          <div style={{ alignSelf: 'flex-end', fontSize: '0.9rem', color: inputValue.length === MAX_CHARS ? 'var(--warning)' : 'var(--text-secondary)' }}>
            {inputValue.length} / {MAX_CHARS}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', maxWidth: '80%' }}>
            La frase introducida solo permite el uso de letras. Aconsejable separar las palabras con espacios.
          </p>

          <button type="submit" className="btn" disabled={inputValue.trim().length === 0} style={{ width: '100%', marginTop: '1rem' }}>
            Aceptar
          </button>
        </form>
      </div>
      <PageTitle title="Modo Libre" />
    </div>
  );
};

export default FreeModeSetup;
