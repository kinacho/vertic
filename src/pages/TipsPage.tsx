import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

const Character: React.FC<{
  src: string;
  pos: 'bottom-left' | 'bottom-right' | 'bottom-center';
}> = ({ src, pos }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    const img = new Image();
    const onLoad = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (b - r > 55 && g - r > 45 && r > 80) d[i + 3] = 0;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch { }
    };
    img.onload = onLoad;
    img.src = src;
    if (img.complete) onLoad();
  }, [src]);

  const posStyle: React.CSSProperties =
    pos === 'bottom-left'  ? { bottom: 0, left: 0 } :
    pos === 'bottom-right' ? { bottom: 0, right: 0 } :
                             { bottom: 0, left: '50%', transform: 'translateX(-50%)' };

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        zIndex: 50,
        pointerEvents: 'none',
        userSelect: 'none',
        width: dims.w || 'auto',
        height: dims.h || 'auto',
        ...posStyle,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

const Dialogue: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    className="glass-panel animate-fade-in"
    style={{
      position: 'fixed',
      zIndex: 100,
      padding: '1.4rem 2rem',
      maxWidth: '400px',
      fontSize: '1.15rem',
      borderRadius: '1.5rem',
      background: 'rgba(255,255,255,0.98)',
      color: '#1e293b',
      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
      border: '1px solid #cbd5e1',
      lineHeight: 1.55,
      pointerEvents: 'none',
      ...style
    }}
  >
    {children}
  </div>
);

interface RowData {
  letter: string;
  word?: string;
  name?: string;
  nameColor?: string;
  nameDistance?: string;
  prefix?: string;
  invisiblePrefix?: boolean;
  highlightGreen?: boolean;
  style?: React.CSSProperties;
}

const AcrosticRow: React.FC<RowData> = ({
  letter, word, name, nameColor = '#1e293b', nameDistance = '2.5cm',
  prefix, invisiblePrefix = false, highlightGreen = false, style,
}) => {
  const wordParts = word ? word.split(' ') : [];
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '2.2rem', position: 'relative', ...style }}>
      {name && (
        <span style={{
          position: 'absolute',
          right: `calc(100% + ${nameDistance})`,
          fontSize: '0.9rem', fontWeight: 800, color: nameColor, whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
      )}
      {/* Prefix absolutely positioned — never displaces the letter */}
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', right: '100%',
            opacity: invisiblePrefix ? 0 : 1,
            fontSize: '1.6rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1, whiteSpace: 'nowrap',
          }}>
            {prefix}
          </span>
        )}
        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}>
          {letter}
        </span>
      </div>
      {wordParts.length > 0 && (
        <span style={{ marginLeft: '0.4rem', fontSize: '1.6rem', fontWeight: 700, color: '#334155', lineHeight: 1, display: 'flex', gap: '0.4rem' }}>
          {wordParts.map((w, idx) => {
            const clean = w.replace(/[¿?.!,…]/g, '').toLowerCase();
            const isNexo = clean === 'el' || clean === 'de';
            return (
              <span key={idx} style={{
                textDecoration: highlightGreen && isNexo ? 'underline' : 'none',
                textDecorationColor: '#10b981', textDecorationThickness: '3px',
              }}>
                {w}
              </span>
            );
          })}
        </span>
      )}
    </div>
  );
};

const TipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeExample, setActiveExample] = useState<'A' | 'B' | 'C' | null>(null);
  const [showScrollMsg, setShowScrollMsg] = useState(false);
  const [exampleScrollPercent, setExampleScrollPercent] = useState(0);

  const toggleExample = (ex: 'A' | 'B' | 'C') => {
    if (activeExample === ex) {
      setActiveExample(null);
      setShowScrollMsg(false);
      setExampleScrollPercent(0);
    } else {
      setActiveExample(ex);
      setExampleScrollPercent(0);
      setShowScrollMsg(true);
      setTimeout(() => setShowScrollMsg(false), 3000);
    }
  };

  const acrosticPhrases = {
    A: ["ESTE", "JUEGO", "ANTES", "SE", "LLAMABA", "DE", "OTRA", "MANERA"],
    B: ["NUNCA", "ENTENDERÉ", "EL", "NÚMERO", "CERO"],
    C: ["SERÍA", "NOVEDOSA", "UNA", "CONVERSACIÓN", "SOBRE", "ANDRÉS", "Y", "LAS", "NUTRIAS"]
  };

  const dataA: RowData[] = [
    { letter: 'E', word: 'STOY', name: 'Andrés', nameColor: '#3b82f6' },
    { letter: 'S', word: 'OLVENTE,' },
    { letter: 'T', word: 'ENGO' },
    { letter: 'E', word: 'N' },
    { letter: 'J', word: 'AQUE a' },
    { letter: 'U', word: 'N' },
    { letter: 'E', word: 'MPRESARIO y' },
    { letter: 'G', word: 'ANÉ' },
    { letter: 'O', word: 'CHO' },
    { letter: 'A', word: 'PARTAMENTOS.' },
    { letter: 'N', word: 'EGOCIANDO?', prefix: '¿', name: 'Paul', nameColor: '#f59e0b' },
    { letter: 'T', word: 'ENGO', name: 'Andrés', nameColor: '#3b82f6' },
    { letter: 'E', word: 'SA' },
    { letter: 'S', word: 'ABIDURÍA.' },
    { letter: 'S', word: 'Í:', name: 'Paul', nameColor: '#f59e0b' },
    { letter: 'E', word: 'RES un' },
    { letter: 'L', word: 'EÓN de' },
    { letter: 'L', word: 'EONES,' },
    { letter: 'A', word: 'NDRÉS.' },
    { letter: 'M', word: 'UESTRAS tus' },
    { letter: 'A', word: 'RGUCIAS,' },
    { letter: 'B', word: 'USCAS' },
    { letter: 'A', word: 'MENAZAS,' },
    { letter: 'D', word: 'EMUESTRAS tu' },
    { letter: 'E', word: 'FICIENCIA…' },
    { letter: 'O', word: 'H,', name: 'Andrés', nameColor: '#3b82f6' },
    { letter: 'T', word: 'ANTAS', prefix: '¿' },
    { letter: 'R', word: 'ESPONSABILIDADES me' },
    { letter: 'A', word: 'CHACAS?' },
    { letter: 'M', word: 'UCHAS,', name: 'Paul', nameColor: '#f59e0b' },
    { letter: 'A', word: 'NDRÉS. Y' },
    { letter: 'N', word: 'UNCA' },
    { letter: 'E', word: 'STARÁS' },
    { letter: 'R', word: 'EALMENTE' },
    { letter: 'A', word: 'GOBIADO.' }
  ];

  const dataB: RowData[] = [
    { letter: 'N', word: 'ÉSTOR,', name: 'Marco', nameColor: '#3b82f6' },
    { letter: 'U', word: 'NA', prefix: '¿' },
    { letter: 'N', word: 'UTRIA' },
    { letter: 'C', word: 'ON' },
    { letter: 'A', word: 'NEMIA' },
    { letter: 'E', word: 'S' },
    { letter: 'N', word: 'UTRITIVA?' },
    { letter: 'T', word: 'ENGO', name: 'Polo', nameColor: '#f59e0b' },
    { letter: 'E', word: 'NTENDIDO que' },
    { letter: 'N', word: 'UTRIATIVA.' },
    { letter: 'D', word: 'EMONIOS,', name: 'Marco', nameColor: '#3b82f6' },
    { letter: 'E', word: 'S de' },
    { letter: 'R', word: 'ISA' },
    { letter: 'E', word: 'SO.' },
    { letter: 'E', word: 'STÁS', prefix: '¿', name: 'Polo', nameColor: '#f59e0b' },
    { letter: 'L', word: 'OCO? Una' },
    { letter: 'N', word: 'UTRIA' },
    { letter: 'U', word: 'TILIZARÍA' },
    { letter: 'M', word: 'EDICAMENTOS' },
    { letter: 'E', word: 'N' },
    { letter: 'R', word: 'EGLA.' },
    { letter: 'O', word: 'H,', name: 'Marco', nameColor: '#3b82f6' },
    { letter: 'C', word: 'IERTO.' },
    { letter: 'E', word: 'STOY' },
    { letter: 'R', word: 'EPLETO de' },
    { letter: 'O', word: 'LVIDOS.' }
  ];

  const dataC: RowData[] = [
    { letter: 'S', word: 'EPTIEMBRE', name: 'Narrador', nameColor: '#8b5cf6' },
    { letter: 'E', word: 'MPEZÓ' },
    { letter: 'R', word: 'ECIENTEMENTE. El' },
    { letter: 'I', word: 'NDOMABLE' },
    { letter: 'A', word: 'NDRÉS se' },
    { letter: 'N', word: 'UTRIÓ de' },
    { letter: 'O', word: 'CHO' },
    { letter: 'V', word: 'EGETALES' },
    { letter: 'E', word: 'N EL' },
    { letter: 'D', word: 'ESAYUNO.' },
    { letter: 'O', word: 'CHO!', prefix: '¡' },
    { letter: 'S', word: 'EPTIEMBRE,', name: 'Andrés', nameColor: '#3b82f6' },
    { letter: 'A', word: 'HH…' },
    { letter: 'U', word: 'NA' },
    { letter: 'N', word: 'UEVA' },
    { letter: 'A', word: 'MENAZA se' },
    { letter: 'C', word: 'IERNE en' },
    { letter: 'O', word: 'CTUBRE.' },
    { letter: 'N', word: 'UTRIAS?', prefix: '¿', name: 'Paul', nameColor: '#f59e0b' },
    { letter: 'V', word: 'ERDADERAMENTE.', name: 'Andrés', nameColor: '#3b82f6' },
    { letter: 'E', word: 'SOS' },
    { letter: 'R', word: 'ABIOSOS' },
    { letter: 'S', word: 'ERES DEL' },
    { letter: 'A', word: 'VERNO me' },
    { letter: 'C', word: 'ABREAN.' },
    { letter: 'I', word: 'NGERIRÉ' },
    { letter: 'O', word: 'CHO' },
    { letter: 'N', word: 'ABOS.' },
    { letter: 'S', word: 'IEMPRE', name: 'Paul', nameColor: '#f59e0b' },
    { letter: 'O', word: 'CHO…' },
    { letter: 'B', word: 'ASTANTES me' },
    { letter: 'R', word: 'ESULTAN.' },
    { letter: 'E', word: 'S UN', name: 'Andrés', nameColor: '#3b82f6' },
    { letter: 'A', word: 'GOBIO' },
    { letter: 'N', word: 'ECESARIO: me' },
    { letter: 'D', word: 'OTAN de' },
    { letter: 'R', word: 'ENOVADA' },
    { letter: 'E', word: 'NERGÍA.' },
    { letter: 'S', word: 'alto', prefix: '¡' },
    { letter: 'Y', word: ' me' },
    { letter: 'L', word: 'ÍO a' },
    { letter: 'A', word: 'TACAR y' },
    { letter: 'S', word: 'OMETER a' },
    { letter: 'N', word: 'UTRIAS' },
    { letter: 'U', word: 'NA' },
    { letter: 'T', word: 'RAS…!' },
    { letter: 'R', word: 'ELÁJATE.', name: 'Paul', nameColor: '#f59e0b' },
    { letter: 'I', word: 'NSTINTIVAMENTE,', name: 'Narrador', nameColor: '#8b5cf6' },
    { letter: 'A', word: 'NDRÉS se' },
    { letter: 'S', word: 'ENTÓ.' }
  ];

  return (
    <div className="screen-container" style={{ padding: '2rem', background: '#ffffff' }}>
      <div className="glass-panel animate-fade-in" style={{ 
        padding: '3rem', 
        width: '100%', 
        maxWidth: '800px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem', 
        position: 'relative' 
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#eab308', 
          textAlign: 'center', 
          margin: 0,
          textDecoration: 'underline'
        }}>
          Consejos y ejemplos
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          <div style={{ position: 'relative' }}>
            <p>
              <strong>1.</strong> Este es un juego de construcción y deconstrucción constante, especialmente si no te satisface la conversación que está surgiendo palabra a palabra. Si vas por la vía de la improvisación, ten esto especialmente presente.
            </p>
          </div>
          
          <p>
            <strong>2.</strong> La frase escrita y posteriormente verticalizada determinará de lo que se puede hablar y de lo que no. De forma preventiva, te aconsejo que ciertas letras se repitan a lo largo de la frase. Así dispones de tres formas de planificación:
          </p>
          <div style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              <strong>A</strong> - Usar esas letras concretas que se repiten y utilizarlas para nombrar a los personajes que enuncian las frases. Es decir, si se repite la letra P y un personaje participante es Pedro, otro personaje que no sea él puede usar la P para dirigirse a él por su nombre, o mencionarlo.{' '}
              <span onClick={() => toggleExample('A')} style={{color:'#10b981', cursor:'pointer', fontWeight: 'bold'}}>[{activeExample === 'A' ? 'Esconder' : 'Ejemplo'}]</span>
            </p>
            <p>
              <strong>B</strong> - Igual que el caso A, pero con nombres concretos de lo que sea: objetos, conceptos, etc. Si la frase verticalizada utiliza varias veces la letra N, es una buena oportunidad para que el diálogo trate sobre nutrias.{' '}
              <span onClick={() => toggleExample('B')} style={{color:'#10b981', cursor:'pointer', fontWeight: 'bold'}}>[{activeExample === 'B' ? 'Esconder' : 'Ejemplo'}]</span>
            </p>
            <p>
              <strong>C</strong> - Una combinación de ambas posibilidades, tanto objetos como personajes.{' '}
              <span onClick={() => toggleExample('C')} style={{color:'#10b981', cursor:'pointer', fontWeight: 'bold'}}>[{activeExample === 'C' ? 'Esconder' : 'Ejemplo'}]</span>
            </p>
          </div>

          <p>
            <strong>3.</strong> Es aconsejable no utilizar letras de menor utilización, como la X, la W o la K, por ejemplo. Úsalas solo si tienes un plan para ellas.
          </p>

          <p>
            <strong>4.</strong> Aparte de personajes dialogando entre sí, puedes añadir la figura del Narrador.
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ alignSelf: 'center', marginTop: '2rem', padding: '0.8rem 3rem' }}
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
      <PageTitle title="Consejos y ejemplos" />

      {activeExample && (
        <>
          <div className="animate-fade-in" style={{
            position: 'fixed',
            left: '1rem',
            top: '2rem',
            bottom: '2rem',
            width: '450px',
            overflowY: 'auto',
            overflowX: 'visible', // Changed to visible so names don't cut
            padding: '2rem 1rem 2rem 7rem', // Increased left padding
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '1.5rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            border: '1px solid #cbd5e1',
            zIndex: 100
          }}
          onScroll={(e) => {
            const t = e.currentTarget;
            if (t.scrollHeight > t.clientHeight) {
              setExampleScrollPercent(Math.min(1, Math.max(0, t.scrollTop / (t.scrollHeight - t.clientHeight))));
            }
          }}
          >
            <div style={{
              color: '#8b5cf6',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              opacity: showScrollMsg ? 1 : 0,
              transition: 'opacity 1s',
              marginBottom: '1rem',
              pointerEvents: 'none',
              marginLeft: '-3rem'
            }}>
              Haz scroll hacia abajo para ver la conversación
            </div>
            
            {(activeExample === 'A' ? dataA : activeExample === 'B' ? dataB : dataC).map((r, i) => (
              <AcrosticRow key={i} {...r} nameDistance="1.0cm" />
            ))}
            
            <div style={{ marginTop: '2rem', textAlign: 'right', fontStyle: 'italic', fontSize: '0.9rem', color: '#64748b' }}>
              Extracto de la obra teatral ‘El problema de las tres nutrias’, de Albert Crostic.
            </div>
          </div>

          {/* Scrolling text on the right side */}
          <div style={{
            position: 'fixed', top: '50%', right: '2rem', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-start',
            pointerEvents: 'none', zIndex: 90, width: '250px'
          }}>
            {acrosticPhrases[activeExample].slice(0, Math.min(acrosticPhrases[activeExample].length, Math.floor(exampleScrollPercent * (acrosticPhrases[activeExample].length + 0.01)))).map((w, idx) => (
              <span key={idx} className="animate-fade-in" style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                {w}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Albert Crostic character and dialogue */}
      {!activeExample && (
        <>
          <Character src="/assets/crostic.png" pos="bottom-right" />
          <Dialogue style={{ bottom: '15rem', right: '5rem' }}>
            Consejo número 5: haz verticálogos con amigos.
          </Dialogue>
        </>
      )}
    </div>
  );
};

export default TipsPage;
