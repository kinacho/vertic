import React from 'react';

interface BubbleProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: boolean;
  className?: string;
}

const Bubble: React.FC<BubbleProps> = ({ children, style, delay, className = '' }) => (
  <div
    className={`glass-panel animate-fade-in ${delay ? 'delay-2' : ''} ${className}`.trim()}
    style={{
      padding: '1.2rem 1.6rem',
      maxWidth: '450px',
      fontSize: '1.05rem',
      lineHeight: 1.6,
      border: '1px solid var(--accent-primary-glow)',
      borderRadius: '1.25rem',
      position: 'relative',
      ...style,
    }}
  >
    {children}
    {/* Subtle tail could be added here if needed */}
  </div>
);

export default Bubble;
