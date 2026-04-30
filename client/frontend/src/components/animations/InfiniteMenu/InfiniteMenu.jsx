import { motion, useMotionValue, useTransform, animate, useAnimationFrame } from 'framer-motion';
import { useState, useRef } from 'react';
import './InfiniteMenu.css';

/**
 * InfiniteMenu - قائمة كروية ثلاثية الأبعاد تدعم السحب (Drag to Rotate)
 */
export default function InfiniteMenu({ items, onItemClick, className = '' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const isInteracting = useRef(false);
  
  // Motion value for smooth rotation tracking
  const rotationY = useMotionValue(0);

  // Auto-rotation effect
  useAnimationFrame((time, delta) => {
    // Only auto-rotate if the user isn't dragging
    if (!isInteracting.current) {
      // Rotate 360 degrees over 40 seconds = 9 degrees per second
      // delta is in ms, so delta / 1000 is seconds
      rotationY.set(rotationY.get() - (9 * (delta / 1000)));
    }
  });

  const handleDragEnd = (event, info) => {
    isInteracting.current = false;
    // Calculate how far to spin based on drag velocity
    const velocity = info.velocity.x;
    const currentRotation = rotationY.get();
    
    // Snap to nearest 60 degrees (since 360 / 6 items = 60, adjust for exact item count)
    const anglePerItem = 360 / items.length;
    const targetRotation = currentRotation + velocity * 0.1;
    const snappedRotation = Math.round(targetRotation / anglePerItem) * anglePerItem;

    animate(rotationY, snappedRotation, {
      type: "spring",
      stiffness: 50,
      damping: 15,
      mass: 1,
      onComplete: () => {
        // We don't need to do anything here because useAnimationFrame will pick up the new value automatically
      }
    });

    // Update selected index based on snapped rotation
    const steps = Math.round(snappedRotation / anglePerItem);
    // Wrap index around properly handling negative steps
    const newIndex = ((-steps % items.length) + items.length) % items.length;
    setSelectedIndex(newIndex);
  };

  return (
    <div className={`infinite-menu ${className}`} ref={containerRef}>
      <div className="infinite-menu-tilt-wrapper">
        <motion.div
          className="infinite-menu-circle"
          style={{ rotateY: rotationY }}
          onPanStart={() => {
            isInteracting.current = true;
          }}
          onPan={(e, info) => {
            rotationY.set(rotationY.get() + info.delta.x * 0.5);
          }}
          onPanEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
        >
        {items.map((item, index) => {
          const angle = (360 / items.length) * index;
          const isActive = index === selectedIndex;
          
          return (
            <motion.div
              key={index}
              className={`infinite-menu-item ${isActive ? 'active' : ''}`}
              style={{
                transform: `rotateY(${angle}deg) translateZ(350px)`, // Increased distance for 3D rounded shape
              }}
              onClick={() => {
                setSelectedIndex(index);
                onItemClick?.(item, index);
              }}
            >
              <div className="infinite-menu-card">
                {item.image && <img src={item.image} alt={item.label} className="infinite-menu-img" />}
                <div className="infinite-menu-overlay">
                  {item.icon && <div className="infinite-menu-icon">{item.icon}</div>}
                  <div className="infinite-menu-label">{item.label}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
        </motion.div>
      </div>
    </div>
  );
}

