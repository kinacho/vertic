import React from 'react';

interface CrosticCircleProps {
  label?: string;
  size?: number;
  style?: React.CSSProperties;
  fadeIn?: boolean;
  color?: string;
  isImage?: boolean;
  imgSrc?: string;
  className?: string;
}

const CrosticCircle: React.FC<CrosticCircleProps> = ({
  label = 'Albert Crostic',
  size = 120,
  style,
  fadeIn = true,
  color = 'var(--accent-primary)',
  isImage = false,
  imgSrc,
  className = '',
}) => {
  const baseClassName = `${fadeIn ? 'animate-fade-in' : ''} ${className}`.trim();

  if (isImage && imgSrc) {
    return (
      <div
        className={baseClassName}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}40`,
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={imgSrc}
          alt={label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={baseClassName}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(12px)',
        border: `2px solid ${color}`,
        boxShadow: `0 0 32px ${color}80, inset 0 0 20px ${color}14`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: label.length > 9 ? '0.72rem' : '0.95rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        textAlign: 'center',
        padding: '0.5rem',
        lineHeight: 1.3,
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
    >
      {label}
    </div>
  );
};

export default CrosticCircle;
