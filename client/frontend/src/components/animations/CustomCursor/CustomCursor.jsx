import { useEffect, useState, useRef } from 'react';
import './CustomCursor.css';

/**
 * CustomCursor - مؤشر فأرة مخصص مع تأثيرات زجاجية
 * 🔮 Custom glowing cursor that follows mouse movement
 */
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(true);
  const cursorRef = useRef(null);
  const trailRef = useRef(null);
  const pointsRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      // Create trail effect
      const point = {
        x: e.clientX,
        y: e.clientY,
        life: 1,
      };
      pointsRef.current.push(point);

      // Keep only last 20 points
      if (pointsRef.current.length > 20) {
        pointsRef.current.shift();
      }
    };

    const handleMouseEnter = () => {
      setIsMoving(true);
    };

    const handleMouseLeave = () => {
      setIsMoving(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Animation loop for fade effect
  useEffect(() => {
    const animationInterval = setInterval(() => {
      pointsRef.current = pointsRef.current.map(point => ({
        ...point,
        life: point.life - 0.1,
      })).filter(point => point.life > 0);
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <>
      {/* Main Cursor */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isMoving ? 'active' : ''}`}
        style={{
          transform: `translate(calc(${mousePosition.x}px - 50%), calc(${mousePosition.y}px - 50%))`,
        }}
      >
        <div className="cursor-dot"></div>
        <div className="cursor-ring"></div>
      </div>

      {/* Cursor Trail */}
      <div ref={trailRef} className="cursor-trail">
        {pointsRef.current.map((point, index) => (
          <div
            key={index}
            className="trail-particle"
            style={{
              left: point.x,
              top: point.y,
              opacity: point.life * 0.5,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default CustomCursor;
