import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (text: string, speed: number = 50, isVisible: boolean) => {
  const [displayText, setDisplayText] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setDisplayText('');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    let i = 0;
    const typeNext = () => {
      if (i <= text.length) {
        setDisplayText(text.substring(0, i));
        i++;
        timeoutRef.current = setTimeout(typeNext, speed);
      }
    };

    setDisplayText('');
    timeoutRef.current = setTimeout(typeNext, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speed, isVisible]);

  return displayText;
};
