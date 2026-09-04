import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor({ theme }) {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const onMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target.closest('button, a, input, select, textarea, [data-cursor], .cursor-interactive');
      if (target) {
        setIsHovered(true);
        const customText = target.getAttribute('data-cursor');
        setCursorText(customText || '');
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isDark = theme === 'dark';

  return (
    <>
      {/* Precision Core Dot */}
      <motion.div
        className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
          isDark ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-black shadow-[0_0_8px_#000000]'
        }`}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isClicking ? 0.6 : isHovered ? 0.3 : 1,
        }}
        transition={{ type: 'spring', stiffness: 1200, damping: 50, mass: 0.1 }}
      />

      {/* Magnetic Outer Ring */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 backdrop-blur-[1px] transition-colors duration-200 border ${
          isDark
            ? isHovered
              ? 'bg-white/10 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
              : 'border-zinc-700/40 bg-zinc-900/10'
            : isHovered
            ? 'bg-black/10 border-black/40 shadow-[0_0_20px_rgba(0,0,0,0.1)]'
            : 'border-zinc-300/40 bg-zinc-200/20'
        }`}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          width: isHovered ? (cursorText ? 76 : 48) : 28,
          height: isHovered ? (cursorText ? 76 : 48) : 28,
          scale: isClicking ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-[9px] font-mono font-bold tracking-wider uppercase ${
              isDark ? 'text-white' : 'text-black'
            }`}
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
