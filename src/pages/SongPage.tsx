import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

const SongPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Setup intro timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('playing');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Load and parse SRT
  useEffect(() => {
    fetch('/assets/media/Diacrostics.srt')
      .then(res => res.text())
      .then(text => {
        const parsed = parseSRT(text);
        setSubtitles(parsed);
      })
      .catch(err => console.error('Error loading subtitles:', err));
  }, []);

  // Update current subtitle based on video time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const activeSub = subtitles.find(
      s => currentTime >= s.startTime && currentTime <= s.endTime
    );
    setCurrentText(activeSub ? activeSub.text : '');
  };

  const handleVideoEnded = () => {
    setPhase('ended');
  };

  const handleScreenClick = () => {
    if (phase === 'ended') {
      navigate('/');
    }
  };

  const parseSRT = (data: string): Subtitle[] => {
    const subs: Subtitle[] = [];
    const blocks = data.trim().split(/\n\s*\n/);
    
    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const id = lines[0].trim();
        const timeLine = lines[1].trim();
        const text = lines.slice(2).join('\n').trim();
        
        const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        if (timeMatch) {
          subs.push({
            id,
            startTime: timeToSeconds(timeMatch[1]),
            endTime: timeToSeconds(timeMatch[2]),
            text
          });
        }
      }
    }
    return subs;
  };

  const timeToSeconds = (timeStr: string): number => {
    const [hms, ms] = timeStr.split(',');
    const [h, m, s] = hms.split(':').map(Number);
    return h * 3600 + m * 60 + s + Number(ms) / 1000;
  };

  return (
    <div 
      onClick={handleScreenClick}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        cursor: phase === 'ended' ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      <PageTitle title="Canción" />
      
      {phase === 'intro' && (
        <h2 className="animate-fade-in" style={{ fontSize: '2rem', fontWeight: 300, textAlign: 'center' }}>
          ¡Videoclip próximamente!
        </h2>
      )}

      {phase !== 'intro' && (
        <>
          {/* Video is hidden but plays audio */}
          <video 
            ref={videoRef}
            src="/assets/media/Diacrostics.mp4"
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />

          {/* Subtitles Overlay */}
          <div style={{
            maxWidth: '80%',
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            zIndex: 10,
            transition: 'opacity 0.3s'
          }}>
            {currentText.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          {phase === 'ended' && (
            <div className="animate-fade-in" style={{
              position: 'absolute',
              bottom: '10%',
              fontSize: '1.2rem',
              opacity: 0.7,
              animation: 'pulse 2s infinite'
            }}>
              Haz clic para volver al menú principal
            </div>
          )}
           {/* Return Button */}
           <button
             className="btn btn-secondary"
             style={{
               position: 'fixed',
               bottom: '2rem',
               right: '2rem',
               zIndex: 100,
               background: 'rgba(255,255,255,0.1)',
               border: '1px solid rgba(255,255,255,0.3)',
               color: 'white',
               fontSize: '1rem',
               padding: '0.6rem 1.2rem',
               pointerEvents: 'auto'
             }}
             onClick={(e) => {
               e.stopPropagation();
               if (videoRef.current) {
                 videoRef.current.pause();
                 videoRef.current.src = "";
               }
               navigate('/');
             }}
           >
             Volver al menú
           </button>
        </>
      )}
    </div>
  );
};

export default SongPage;
