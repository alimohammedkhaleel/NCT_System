import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import './AdvancedAnimations.css';

/**
 * ParallaxSection - تأثير Parallax عند التمرير
 * 🌌 Parallax scrolling effect for sections
 */
export const ParallaxSection = ({ children, offset = 100, className = '' }) => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`parallax-section ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * RippleButton - زر مع تأثير موجة عند النقر
 * 🌊 Ripple effect button
 */
export const RippleButton = ({ children, onClick, className = '', ...props }) => {
  const containerRef = useRef(null);

  const handleClick = (e) => {
    const container = containerRef.current;
    if (!container) return;

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    container.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);

    onClick?.(e);
  };

  return (
    <button
      ref={containerRef}
      onClick={handleClick}
      className={`ripple-button ${className}`}
      {...props}
    >
      <span className="ripple-button-content">{children}</span>
    </button>
  );
};

/**
 * HorizontalScrollContainer - حاوية تمرير أفقي مع أنيميشن
 * ↔️ Horizontal scroll with animation
 */
export const HorizontalScrollContainer = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  const { scrollX } = useScroll({ container: containerRef });
  const x = useTransform(scrollX, [0, 500], [0, -50]);

  return (
    <div
      ref={containerRef}
      className={`horizontal-scroll-container ${className}`}
    >
      <motion.div style={{ x }} className="horizontal-scroll-content">
        {children}
      </motion.div>
    </div>
  );
};

/**
 * SlideInText - نص ينزلق عند الدخول للعرض
 */
export const SlideInText = ({ text = '', direction = 'left', delay = 0 }) => {
  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -100 : 100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {text}
    </motion.div>
  );
};

/**
 * FloatingElement - عنصر يطفو ويتحرك بناءً على الماوس
 */
export const FloatingElement = ({ children, className = '' }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = (e.clientX - centerX) * 0.1;
    const distY = (e.clientY - centerY) * 0.1;

    ref.current.style.transform = `translate(${distX}px, ${distY}px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={`floating-element ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

/**
 * ScrollVelocityText - نص يتحرك بسرعة بناءً على سرعة التمرير
 */
export const ScrollVelocityText = ({ text = '', className = '' }) => {
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <motion.div
      style={{ x }}
      className={`scroll-velocity-text ${className}`}
    >
      {text}
    </motion.div>
  );
};

/**
 * PulseGlowElement - عنصر بتأثير توهج نابض
 */
export const PulseGlowElement = ({ children, color = '#b36eff', className = '' }) => {
  return (
    <motion.div
      className={`pulse-glow-element ${className}`}
      animate={{
        boxShadow: [
          `0 0 20px ${color}`,
          `0 0 40px ${color}`,
          `0 0 20px ${color}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
      style={{
        color,
        borderColor: color,
      }}
    >
      {children}
    </motion.div>
  );
};

export default {
  ParallaxSection,
  RippleButton,
  HorizontalScrollContainer,
  SlideInText,
  FloatingElement,
  ScrollVelocityText,
  PulseGlowElement,
};
