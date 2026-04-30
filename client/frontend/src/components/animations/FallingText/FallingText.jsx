import { motion } from 'framer-motion';
import './FallingText.css';

/**
 * FallingText - كلمات تتساقط بفيزياء واقعية
 * كل حرف يسقط بشكل مستقل مع تأثير الجاذبية
 */
export default function FallingText({ text, className = '' }) {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={`falling-text-container ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          className="falling-text-word"
          variants={child}
          key={index}
        >
          {word}
          {index < words.length - 1 && ' '}
        </motion.span>
      ))}
    </motion.div>
  );
}
