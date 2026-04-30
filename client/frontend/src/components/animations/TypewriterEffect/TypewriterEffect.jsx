import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './TypewriterEffect.css';

/**
 * TypewriterEffect - تأثير الكتابة + Spring + Stagger
 * 📝 Animated text that types out with spring effect
 */
export const TypewriterEffect = ({ text = '', speed = 20, stagger = 0.02 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <motion.div className="typewriter-container">
      <motion.span className="typewriter-text">
        {displayedText}
        <motion.span
          className="typewriter-cursor"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      </motion.span>
    </motion.div>
  );
};

/**
 * StaggerAnimation - أنيميشن متسلسل للعناصر
 * ✨ Staggered animation for multiple elements
 */
export const StaggerContainer = ({ children, staggerDelay = 0.1 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerItem - عنصر متسلسل
 */
export const StaggerItem = ({ children, className = '' }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

/**
 * SpringText - نص مع تأثير Spring
 */
export const SpringText = ({ text = '', color = '#b36eff' }) => {
  return (
    <motion.div
      className="spring-text"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
      style={{ color }}
    >
      {text}
    </motion.div>
  );
};

export default TypewriterEffect;
