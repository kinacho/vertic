import React from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { aiData } from '../i18n/locales';
import { useNavigate } from 'react-router-dom';
import { Globe, Sparkles, Bird, BookOpen, Music } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const HomePage: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const navigate = useNavigate();
  const [hoveredLang, setHoveredLang] = React.useState<string | null>(null);
  const [hoveredMode, setHoveredMode] = React.useState<string | null>(null);
  const [hasSavedWorks, setHasSavedWorks] = React.useState(false);

  React.useEffect(() => {
     try {
         const stored = localStorage.getItem('vertic_saved_works');
         if (stored) {
             const parsed = JSON.parse(stored);
             if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                 setHasSavedWorks(true);
             }
         }
     } catch (e) {}
  }, []);

  const AcrIcon = ({ isHovered }: { isHovered: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1, fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
       <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}><span style={{ color: '#8b5cf6' }}>A</span>{isHovered && <span className="animate-fade-in" style={{ color: 'var(--text-secondary)' }}>lbert</span>}</div>
       <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}><span style={{ color: '#8b5cf6' }}>C</span>{isHovered && <span className="animate-fade-in" style={{ color: 'var(--text-secondary)' }}>rostic</span>}</div>
       <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}><span style={{ color: '#8b5cf6' }}>R</span>{isHovered && <span className="animate-fade-in" style={{ color: 'var(--text-secondary)' }}>esponde</span>}</div>
    </div>
  );

  const handleLanguageSelect = (lang: 'es' | 'en') => {
    dispatch({ type: 'SET_LANG', payload: lang });
    if (!state.tutorialCompleted) {
      navigate('/tutorial');
    } else {
      dispatch({ type: 'SET_SCREEN', payload: 'home' });
    }
  };

  const handleModeSelect = (modeId: string) => {
    if (modeId === 'challenge') {
      const dailyDone = state.dailyChallengeLastDone && new Date(state.dailyChallengeLastDone).toDateString() === new Date().toDateString();
      if (!state.tutorialCompleted) {
        alert('El modo Desafío del Día no será operativo hasta que no se pase antes por el Tutorial.');
      } else if (dailyDone) {
        alert('Mañana habrá un nuevo desafío.');
      } else {
        dispatch({ type: 'SET_SCREEN', payload: 'preview' });
        navigate('/preview');
      }
    } else if (modeId === 'free') {
      dispatch({ type: 'SET_SCREEN', payload: 'free-modes-select' });
      navigate('/free-modes');
    } else if (modeId === 'tutorial') {
      navigate('/tutorial');
    } else if (modeId === 'song') {
      if (state.tutorialCompleted) {
        navigate('/song');
      } else {
        alert('Se desbloquea tras terminar el tutorial.');
      }
    }
  };

  if (state.screen === 'language') {
    return (
      <div className="screen-container">
        <h1 className="logo animate-fade-in">VERTIC</h1>
        <p className="subtitle animate-fade-in delay-1">{aiData.es.langPrompt} / {aiData.en.langPrompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div 
               className="glass-panel animate-fade-in delay-2" 
               style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center', minWidth: '150px' }} 
               onMouseEnter={() => setHoveredLang('es')}
               onMouseLeave={() => setHoveredLang(null)}
               onClick={() => handleLanguageSelect('es')}
            >
              <h2>ESPAÑOL</h2>
            </div>
            <div 
               className="glass-panel animate-fade-in delay-3" 
               style={{ padding: '2rem', textAlign: 'center', minWidth: '150px', opacity: 0.5, cursor: 'not-allowed' }} 
               onMouseEnter={() => setHoveredLang('en')}
               onMouseLeave={() => setHoveredLang(null)}
               onClick={() => alert("No disponible/Not available")}
            >
               <h2>ENGLISH</h2>
            </div>
          </div>
          
          <div style={{ height: '2rem', marginTop: '1rem', color: 'var(--accent-secondary)', fontSize: '1.1rem', fontWeight: '500', transition: 'all 0.3s' }}>
            {hoveredLang === 'es' && "Con reglas de ortografía española"}
            {hoveredLang === 'en' && "With English spelling rules"}
          </div>
        </div>
        <p className="animate-fade-in" style={{ position: 'fixed', bottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '80%', opacity: 0.7 }}>
          Versión de prueba. VERTIC no funciona debidamente en dispositivos móviles: sólo en ordenador. Disculpen las molestias.
        </p>
      </div>
    );
  }

  const t = aiData[state.lang];

  return (
    <div className="screen-container">
      <button 
        className="btn btn-secondary animate-fade-in" 
        style={{ position: 'absolute', top: '2rem', left: '2rem', gap: '0.5rem' }}
        onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'language' })}
      >
        <Globe size={18} /> Idioma / Lang
      </button>

      <h1 className="logo animate-fade-in delay-1">{t.title}</h1>
      <p className="subtitle animate-fade-in delay-2">{t.subtitle}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '3rem', maxWidth: '800px', width: '100%' }}>
        {t.modes.map((mode: any, i: number) => {
          const ModeIcon = mode.id === 'challenge' ? Sparkles : mode.id === 'free' ? Bird : mode.id === 'tutorial' ? BookOpen : Music;
          return (
          <div 
            key={mode.id} 
            className={`glass-panel animate-fade-in delay-${(i % 3) + 1}`}
            style={{ padding: '1.5rem', cursor: 'pointer', border: mode.id === 'challenge' ? '1px solid var(--accent-primary)' : '' }}
            onClick={() => handleModeSelect(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            {mode.id === 'tutorial' ? (
                <div style={{ marginBottom: '1rem', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                     <AcrIcon isHovered={hoveredMode === 'tutorial'} />
                </div>
            ) : (
                <div style={{ marginBottom: '1rem', color: mode.id === 'challenge' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                   <ModeIcon size={36} strokeWidth={1.5} />
                </div>
            )}
            
            <h3 style={{ marginBottom: '0.5rem', color: mode.id === 'challenge' ? 'var(--accent-primary)' : '' }}>
                {mode.id === 'tutorial' 
                   ? (hoveredMode === 'tutorial' ? 'Tutorial' : '') 
                   : mode.h}
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '1.2rem', transition: 'all 0.3s' }}>
                {mode.id === 'tutorial' && hoveredMode !== 'tutorial' ? '' : 
                 mode.id === 'song' && hoveredMode === 'song' ? '¡Escucha el tema de Vertic!' : 
                 mode.id === 'challenge' && hoveredMode === 'challenge' ? (
                   (state.dailyChallengeLastDone && new Date(state.dailyChallengeLastDone).toDateString() === new Date().toDateString())
                   ? 'Mañana habrá un nuevo desafío'
                   : '¿Cuál será la temática de hoy?'
                 ) : 
                 mode.d}
            </p>
          </div>
        )})}

        {/* Conditionally rendered Saved Works button */}
        {hasSavedWorks && (
            <div 
              className={`glass-panel animate-fade-in delay-5`}
              style={{ padding: '1.5rem', cursor: 'pointer', border: '1px solid #10b981' }}
              onClick={() => navigate('/saved-works')}
              onMouseEnter={() => setHoveredMode('saved')}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <div style={{ marginBottom: '1rem', color: '#10b981' }}>
                 <BookOpen size={36} strokeWidth={1.5} />
              </div>
              
              <h3 style={{ marginBottom: '0.5rem', color: '#10b981' }}>
                  Obras aprobadas por Albert Crostic
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Tu colección de verticálogos
              </p>
            </div>
        )}
      </div>
      <p className="animate-fade-in" style={{ marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '80%', opacity: 0.7 }}>
          Versión de prueba. VERTIC no funciona debidamente en dispositivos móviles: sólo en ordenador. Disculpen las molestias.
      </p>
      <PageTitle title="Inicio" />
    </div>
  );
};

export default HomePage;
