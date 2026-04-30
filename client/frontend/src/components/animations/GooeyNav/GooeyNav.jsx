import { motion } from 'framer-motion';
import { useState } from 'react';
import './GooeyNav.css';

/**
 * GooeyNav - شريط تنقل بتأثير gooey سائل
 * تأثير سائل عند التنقل بين الروابط
 */
export default function GooeyNav({ items, activeIndex, onItemClick, className = '' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <nav className={`gooey-nav ${className}`}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="gooey-nav-items" style={{ filter: 'url(#gooey)' }}>
        {items.map((item, index) => (
          <motion.button
            key={index}
            className={`gooey-nav-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => onItemClick(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.icon && <span className="gooey-nav-icon">{item.icon}</span>}
            <span className="gooey-nav-label">{item.label}</span>
            
            {(activeIndex === index || hoveredIndex === index) && (
              <motion.div
                className="gooey-nav-blob"
                layoutId="gooey-blob"
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 30
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
