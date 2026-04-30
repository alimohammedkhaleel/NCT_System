import { useEffect, useRef } from 'react';
import './ClickSpark.css';

/**
 * ClickSpark Component
 * Creates purple sparks when clicking anywhere on the page
 * Uses pure CSS animations for performance
 */
const ClickSpark = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current) return;

      // Create spark container
      const sparkContainer = document.createElement('div');
      sparkContainer.className = 'click-spark-container';
      sparkContainer.style.left = `${e.clientX}px`;
      sparkContainer.style.top = `${e.clientY}px`;

      // Create multiple sparks (8-12 particles)
      const sparkCount = Math.floor(Math.random() * 5) + 8;
      
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'click-spark';
        
        // Random angle for each spark
        const angle = (Math.PI * 2 * i) / sparkCount;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        spark.style.setProperty('--tx', `${tx}px`);
        spark.style.setProperty('--ty', `${ty}px`);
        spark.style.setProperty('--duration', `${0.6 + Math.random() * 0.4}s`);
        
        sparkContainer.appendChild(spark);
      }

      containerRef.current.appendChild(sparkContainer);

      // Remove after animation
      setTimeout(() => {
        sparkContainer.remove();
      }, 1000);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return <div ref={containerRef} className="click-spark-wrapper" />;
};

export default ClickSpark;
