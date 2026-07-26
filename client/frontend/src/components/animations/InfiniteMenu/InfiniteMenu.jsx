import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InfiniteMenu.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * InfiniteMenu - Scroll-triggered vertical list with alternating tilts
 */
export default function InfiniteMenu({ items, onItemClick, className = '' }) {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Check if we are on mobile to simplify animation slightly
    const isMobile = window.innerWidth <= 768;
    
    let ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        // Hand of cards (fan) effect from center
        const centerIndex = Math.floor(items.length / 2);
        const distanceFromCenter = index - centerIndex;
        
        // Calculate fan positions
        const tiltAngle = distanceFromCenter * (isMobile ? 10 : 20); // slightly less tilt on mobile
        const finalX = distanceFromCenter * (isMobile ? 65 : 300); // Tighter spread on mobile to prevent overflow
        const finalY = Math.abs(distanceFromCenter) * (isMobile ? 20 : 50); // Less drop on mobile

        // Initial state before scroll (all stacked in the center)
        gsap.set(card, { 
          opacity: 0, 
          y: isMobile ? 80 : 150, // Don't start too far down on mobile
          x: 0,
          rotationZ: 0,
          transformOrigin: "bottom center",
          zIndex: items.length - Math.abs(distanceFromCenter) // Center card on top
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%", // Start when the container is 80% into the viewport
            end: "bottom top", // End when the container leaves the viewport (slower animation)
            scrub: 2, // Slower, smoother scrub
          }
        });

        tl.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.3, // 30% of the scroll distance is spent fading in and moving to base stacked position
          ease: "power1.out"
        })
        .to(card, {
          y: finalY,
          x: finalX,
          rotationZ: tiltAngle,
          duration: 0.7, // 70% of the scroll distance is spent fanning out
          ease: "power2.out"
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [items]);

  return (
    <div className={`infinite-menu-horizontal ${className}`} ref={containerRef}>
      {items.map((item, index) => (
        <div 
          key={index}
          className="infinite-menu-card-wrapper"
          ref={(el) => cardsRef.current[index] = el}
        >
          <div 
            className="infinite-menu-card"
            onClick={() => onItemClick?.(item, index)}
            style={{ cursor: onItemClick ? 'pointer' : 'default' }}
          >
            <div className="infinite-menu-img-container">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.label} 
                  className="infinite-menu-img" 
                />
              )}
            </div>
            <div className="infinite-menu-overlay">
              <div className="infinite-menu-label">{item.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
