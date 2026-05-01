import React from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { aiData } from '../i18n/locales';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const ChallengePreview: React.FC<{ lastRowRef: React.RefObject<HTMLDivElement> }> = ({ lastRowRef }) => {
  const ulisesColor = '#3b82f6';
  const polifemoColor = '#f59e0b';
  
  const data = [
    { char: 'E', word: 'studié', actor: 'Ulises', color: ulisesColor, cont: true },
    { char: 'S', word: 'olfeo', nexo: 'y', actor: null, cont: true },
    { char: 'T', word: 'ambién', actor: null, cont: true },
    { char: 'A', word: 'rmonía.', actor: null, cont: true },
    { char: 'F', word: 'rancamente,', actor: null, cont: true },
    { char: 'R', word: 'epetí', actor: null, cont: true },
    { char: 'A', word: 'mbas.', actor: null, cont: true },
    { char: 'S', word: 'i', actor: 'Polifemo', color: polifemoColor, cont: true },
    { char: 'E', word: 'studiaras…', actor: null, cont: true },
    { char: 'U', word: 'lises:', actor: null, cont: true },
    { char: 'S', word: 'olicita', nexo: 'mi', actor: null, cont: true },
    { char: 'A', word: 'yuda.', actor: null, cont: true },
    { char: 'N', word: 'unca!', actor: 'Ulises', color: ulisesColor, pre: '¡', cont: true },
    { char: 'E', word: 'studiaré', actor: null, cont: true },
    { char: 'X', word: 'ilófono.', actor: null, cont: true },
    { char: 'O', word: 'stras…', actor: 'Polifemo', color: polifemoColor, cont: true },
    { char: 'S', word: 'upéralo.', actor: null, cont: true },
  ];

  return (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        {data.map((row, i) => (
          <div key={i} ref={i === 16 ? lastRowRef : null} style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>
            {row.actor && (
              <div style={{ position: 'absolute', right: '100%', marginRight: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', top: '0.2rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: row.color, whiteSpace: 'nowrap' }}>{row.actor}</span>
              </div>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', width: '3.5rem', justifyContent: 'flex-end' }}>
               {row.pre && <span style={{ fontSize: '2.4rem', fontWeight: 700, color: '#334155', lineHeight: 1, marginRight: '0.1rem' }}>{row.pre}</span>}
               <span 
                id={i === 16 ? "last-char-s" : undefined}
                style={{ fontSize: '2.4rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}
               >
                 {row.char}
               </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: row.cont ? '0' : '0.4rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, color: '#334155', lineHeight: 1 }}>{row.word}</span>
              {row.nexo && (
                 <span style={{ fontSize: '1.1rem', color: '#10b981', marginLeft: '0.4rem', marginRight: '0.2rem', fontWeight: 600 }}>{row.nexo}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '2rem', paddingBottom: '1rem' }}>
        <div style={{ maxWidth: '200px', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.4 }}>
           Ejemplo de verticálogo. Consultar el tutorial para ver detalles.
        </div>
        <div style={{ maxWidth: '200px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.4, borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem' }}>
           Extracto de la obra teatral ‘El percusionista silencioso’, escrita por Albert Crostic.
        </div>
      </div>
    </div>
  );
};

const PreviewPage: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const navigate = useNavigate();
  const t = aiData[state.lang];

  const [showSizes, setShowSizes] = React.useState(false);
  const lastRowRef = React.useRef<HTMLDivElement>(null);
  const bracketRef = React.useRef<HTMLSpanElement>(null);
  const [arrowPoints, setArrowPoints] = React.useState<{x1:number, y1:number, x2:number, y2:number} | null>(null);

  React.useEffect(() => {
    const updatePoints = () => {
      const charS = document.getElementById('last-char-s');
      const whiteBox = document.getElementById('preview-white-box');
      if (charS && bracketRef.current && whiteBox) {
        const charRect = charS.getBoundingClientRect();
        const bracketRect = bracketRef.current.getBoundingClientRect();
        const containerRect = whiteBox.getBoundingClientRect();
        
        setArrowPoints({
          x1: charRect.left + (charRect.width / 2) - containerRect.left,
          y1: charRect.bottom - containerRect.top + 5,
          x2: charRect.left + (charRect.width / 2) - containerRect.left,
          y2: bracketRect.top - containerRect.top - 10
        });
      }
    };
    updatePoints();
    const timer = setTimeout(updatePoints, 100); // Small delay to ensure layout
    window.addEventListener('resize', updatePoints);
    return () => {
      window.removeEventListener('resize', updatePoints);
      clearTimeout(timer);
    };
  }, []);

  const handlePlaySize = (size: number) => {
     setShowSizes(false);
     dispatch({ type: 'SETUP_CHALLENGE_MODE', payload: { size } });
     dispatch({ type: 'SET_SCREEN', payload: 'free-mode-board' });
     navigate('/free-board');
  };

  return (
    <div className="screen-container" style={{ padding: '2rem', background: 'var(--bg-primary)' }}>
      <button className="btn btn-secondary animate-fade-in" style={{ position: 'absolute', top: '2rem', left: '2rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> {t.backBtn}
      </button>

      <button 
        className="btn btn-secondary animate-fade-in" 
        style={{ position: 'absolute', bottom: '2rem', right: '2rem', background: 'var(--bg-tertiary)' }} 
        onClick={() => navigate('/tips')}
      >
        Consejos y ejemplos
      </button>

      <div className="glass-panel animate-fade-in" style={{ 
        padding: '2rem', width: '100%', maxWidth: '1050px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', gap: '2rem', overflowY: 'auto', maxHeight: '95vh', position: 'relative' 
      }}>
        <div 
          id="preview-white-box"
          style={{ 
            background: 'rgba(255,255,255,0.8)', padding: '2rem', borderRadius: '1.5rem', 
            border: '1px solid rgba(139,92,246,0.2)', width: '100%', display: 'flex', 
            flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' 
          }}
        >
          <ChallengePreview lastRowRef={lastRowRef} />
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem', position: 'relative', height: '100px' }}>
             <div style={{ 
               fontSize: '0.85rem', fontWeight: 600, color: '#64748b',
               position: 'absolute',
               right: arrowPoints ? (100 - (arrowPoints.x1 / (document.getElementById('preview-white-box')?.clientWidth || 1) * 100) + 2) + '%' : '55%',
               top: '30px',
               whiteSpace: 'nowrap'
             }}>
               Frase verticalizada
             </div>

             <div style={{ 
               fontSize: '1.2rem', fontWeight: 600, 
               position: 'absolute',
               right: arrowPoints ? (100 - (arrowPoints.x1 / (document.getElementById('preview-white-box')?.clientWidth || 1) * 100) + 1) + '%' : '55%',
               top: '55px',
               whiteSpace: 'nowrap'
             }}>
               <span style={{ color: '#64748b' }}>[</span>
               <span style={{ color: '#8b5cf6' }}>Esta frase usa nexos</span>
               <span ref={bracketRef} style={{ color: '#64748b' }}>]</span>
             </div>
          </div>

          {arrowPoints && (
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                </marker>
              </defs>
              <path 
                d={`M ${arrowPoints.x1} ${arrowPoints.y1} L ${arrowPoints.x1} ${arrowPoints.y2}`} 
                stroke="#8b5cf6" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" 
              />
            </svg>
          )}
        </div>

        <button className="btn" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={() => setShowSizes(true)}>
          {t.playBtn}
        </button>

        {showSizes && (
           <div className="animate-fade-in" style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
           }}>
             <div className="glass-panel" style={{ padding: '2rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Elige la dificultad</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                   {[13, 26, 45].map(size => (
                      <button key={size} className="btn btn-primary" onClick={() => handlePlaySize(size)}>
                        {size} letras
                      </button>
                   ))}
                </div>
                <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setShowSizes(false)}>
                   Cancelar
                </button>
             </div>
           </div>
        )}
      </div>
      <PageTitle title="Vista Previa" />
    </div>
  );
};



export default PreviewPage;
