import React, { createContext, useContext } from 'react';
import { MotionConfig } from 'framer-motion';

// ─── Motion Configuration Context ───────────────────────────────────────────

const MotionContext = createContext();

// ─── Shared Animation Variants ──────────────────────────────────────────────

export const springTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0.0, 0.2, 1],
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInLeft = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  show: { 
    opacity: 1, 
    x: 0,
    transition: smoothTransition,
  },
};

export const fadeInRight = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  show: { 
    opacity: 1, 
    x: 0,
    transition: smoothTransition,
  },
};

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: springTransition,
  },
};

export const slideInFromTop = {
  hidden: { 
    opacity: 0, 
    y: -50 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition,
  },
};

export const slideInFromBottom = {
  hidden: { 
    opacity: 0, 
    y: 50 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition,
  },
};

// ─── Motion Provider Component ──────────────────────────────────────────────

export function MotionProvider({ children }) {
  return (
    <MotionConfig
      transition={smoothTransition}
      reducedMotion="user"
    >
      <MotionContext.Provider value={{
        springTransition,
        smoothTransition,
        staggerContainer,
        fadeInUp,
        fadeInLeft,
        fadeInRight,
        scaleIn,
        slideInFromTop,
        slideInFromBottom,
      }}>
        {children}
      </MotionContext.Provider>
    </MotionConfig>
  );
}

// ─── Hook to use Motion Context ─────────────────────────────────────────────

export function useMotion() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within MotionProvider');
  }
  return context;
}

export default MotionContext;
