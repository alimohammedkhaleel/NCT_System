import { motion } from 'framer-motion';
import { useState } from 'react';
import './TrueFocus.css';

/**
 * TrueFocus - إطار متحرك حول النص
 * يتبع النص بتأثير smooth مع توهج بنفسجي
 */
export default function TrueFocus({ children, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`true-focus-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="true-focus-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
      />
      <div className="true-focus-content">
        {children}
      </div>
    </motion.div>
  );
}
