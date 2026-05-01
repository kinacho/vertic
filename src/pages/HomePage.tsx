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
  const [isTutorialCompleted, setIsTutorialCompleted] = React.useState(false);

  React.useEffect(() => {
    const completed = localStorage.getItem('vertic_tutorial_completed') === 'true';
    setIsTutorialCompleted(completed);
    try {
      const stored = localStorage.getItem('vertic_saved_works');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setHasSavedWorks(true);
        }
      }
    } catch (e) {
      console.error('Error parsing saved works', e);
    }
  }, []);

  const AcrIcon = ({ isHovered }: { isHovered: boolean }) => (
    <div className="acr-icon" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start', 
      lineHeight: 1.1, 
      fontSize: '1.2rem', 
      fontFamily: 'var(--font-mono)', 
      fontWeight: 'bold' 
    }}>
      <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <span style={{ color: 'var(--accent-primary)' }}>A</span>
        {isHovered && <span className="animate-fade-in" style={{ color: 'var(--text-secondary)' }}>lbert</span>}
      </div>
      <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <span style={{ color: 'var(--accent-primary)' }}>C</span>
        {isHovered && <span className="animate-fade-in" style={{ color: 'var(--text-secondary)' }}>rostic</span>}
      </div>
      <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <span style={{ color: 'var(--accent-primary)' }}>R</span>
        {isHovered && <span className="animate-fade-in" style={{ color: 'var(--text-secondary)' }}>esponde</span>}
      </div>
    </div>
  );

  const handleLanguageSelect = (lang: 'es' | 'en') => {
    dispatch({ type: 'SET_LANG', payload: lang });
    dispatch({ type: 'SET_SCREEN', payload: 'home' });
  };

  const handleModeSelect = (modeId: string) => {
    switch (modeId) {
      case 'challenge':
        dispatch({ type: 'SET_SCREEN', payload: 'preview' });
        navigate('/preview');
        break;
      case 'free':
        dispatch({ type: 'SET_SCREEN', payload: 'free-modes-select' });
        navigate('/free-modes');
        break;
      case 'tutorial':
        navigate('/tutorial');
        break;
      case 'song':
        if (isTutorialCompleted) {
          navigate('/song');
        } else {
          alert('Se desbloquea tras terminar el tutorial.');
        }
        break;
      default:
        break;
    }
  };

  if (state.screen === 'language') {
    return (
      <div className="screen-container">
        <h1 className="logo animate-fade-in">VERTIC</h1>
        <p className="subtitle animate-fade-in delay-1">
          {aiData.es.langPrompt} / {aiData.en.langPrompt}
        </p>
        <div className="language-select-container animate-fade-in delay-2">
          <div className="grid-layout" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '500px' }}>
            <div
              className="glass-panel"
              style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center' }}
              onMouseEnter={() => setHoveredLang('es')}
              onMouseLeave={() => setHoveredLang(null)}
              onClick={() => handleLanguageSelect('es')}
            >
              <h2>ESPAÑOL</h2>
            </div>
            <div
              className="glass-panel"
              style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' }}
              onMouseEnter={() => setHoveredLang('en')}
              onMouseLeave={() => setHoveredLang(null)}
            >
              <h2>ENGLISH</h2>
            </div>
          </div>

          <div className="lang-hint animate-fade-in" style={{ 
            height: '2rem', 
            marginTop: '2rem', 
            color: 'var(--accent-secondary)', 
            fontSize: '1.1rem', 
            fontWeight: '500', 
            textAlign: 'center' 
          }}>
            {hoveredLang === 'es' && "Con reglas de ortografía española"}
            {hoveredLang === 'en' && "With English spelling rules"}
          </div>
        </div>
      </div>
    );
  }

  const t = aiData[state.lang];

  return (
    <div className="screen-container">
      <button
        className="btn btn-secondary animate-fade-in"
        style={{ position: 'absolute', top: '2rem', left: '2rem' }}
        onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'language' })}
      >
        <Globe size={18} /> Idioma
      </button>

      <h1 className="logo animate-fade-in delay-1">{t.title}</h1>
      <p className="subtitle animate-fade-in delay-2">{t.subtitle}</p>

      <div className="grid-layout">
        {t.modes.map((mode: any, i: number) => {
          const ModeIcon = mode.id === 'challenge' ? Sparkles : mode.id === 'free' ? Bird : mode.id === 'tutorial' ? BookOpen : Music;
          const isChallenge = mode.id === 'challenge';
          
          return (
            <div
              key={mode.id}
              className={`glass-panel animate-fade-in delay-${(i % 5) + 1}`}
              style={{ 
                padding: '2rem', 
                cursor: 'pointer', 
                border: isChallenge ? '1px solid var(--accent-primary)' : '',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
              onClick={() => handleModeSelect(mode.id)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <div style={{ color: isChallenge ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                {mode.id === 'tutorial' ? (
                  <AcrIcon isHovered={hoveredMode === 'tutorial'} />
                ) : (
                  <ModeIcon size={36} strokeWidth={1.5} />
                )}
              </div>

              <h3 style={{ color: isChallenge ? 'var(--accent-primary)' : '' }}>
                {mode.id === 'tutorial'
                  ? (hoveredMode === 'tutorial' ? 'Tutorial' : mode.h)
                  : mode.h}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', minHeight: '3rem' }}>
                {mode.id === 'tutorial' && hoveredMode !== 'tutorial' ? mode.d :
                  mode.id === 'song' && hoveredMode === 'song' ? '¡Escucha el tema de Vertic!' :
                    mode.id === 'challenge' && hoveredMode === 'challenge' ? '¿Cuál será la temática de hoy?' :
                      mode.d}
              </p>
            </div>
          )
        })}

        {hasSavedWorks && (
          <div
            className="glass-panel animate-fade-in delay-5"
            style={{ 
              padding: '2rem', 
              cursor: 'pointer', 
              border: '1px solid var(--accent-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            onClick={() => navigate('/saved-works')}
          >
            <div style={{ color: 'var(--accent-secondary)' }}>
              <BookOpen size={36} strokeWidth={1.5} />
            </div>

            <h3 style={{ color: 'var(--accent-secondary)' }}>
              Obras aprobadas
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Tu colección de verticálogos guardados.
            </p>
          </div>
        )}
      </div>
      <PageTitle title="Inicio" />
    </div>
  );
};

export default HomePage;

