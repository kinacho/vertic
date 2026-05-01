import React from 'react';

interface AcrosticLine {
  prefix?: string;
  hi: string;
  rest: string;
}

interface AcrosticBoxProps {
  lines: AcrosticLine[];
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  style?: React.CSSProperties;
}

const AcrosticBox: React.FC<AcrosticBoxProps> = ({ lines, onClick, active, style }) => {
  const accentColor = active ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.12)';
  
  return (
    <div
      onClick={onClick}
      className="glass-panel animate-fade-in"
      style={{
        padding: '1.4rem 1.8rem',
        cursor: onClick ? 'pointer' : 'default',
        border: `2px solid ${accentColor}`,
        borderRadius: '1.25rem',
        minWidth: '160px',
        transition: 'var(--transition-base)',
        boxShadow: active ? 'var(--shadow-glow)' : 'none',
        ...style,
      }}
    >
      {lines.map((ln, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1.7 }}>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 900, 
            color: 'var(--accent-primary)', 
            minWidth: '1rem', 
            textAlign: 'right',
            marginRight: '0.2rem'
          }}>
            {ln.prefix ?? ''}
          </span>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 900, 
            color: 'var(--accent-primary)', 
            minWidth: '1.3rem' 
          }}>
            {ln.hi}
          </span>
          <span style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-primary)',
            marginLeft: '0.1rem'
          }}>
            {ln.rest}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AcrosticBox;
