import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './SpiralBallPath.css';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const SpiralBallPath = () => {
  const containerRef = useRef(null);
  const ballRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(ballRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      });

      // Ball enters from top hole, travels through snake, exits at bottom hole
      tl.to(ballRef.current, { opacity: 1, duration: 0.1 })
        .to(ballRef.current, {
          motionPath: {
            path: pathRef.current,
            align: pathRef.current,
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
          },
          ease: "none"
        })
        .to(ballRef.current, { opacity: 0, duration: 0.1 });

      // Animate path stroke (snake body appearance)
      gsap.fromTo(pathRef.current, {
        strokeDasharray: 3000,
        strokeDashoffset: 3000
      }, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1.5,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="spiral-container" ref={containerRef}>
      {/* Entry Hole - Ball falls FROM here INTO the tube */}
      <div className="hole entry-hole">
        <div className="hole-inner"></div>
      </div>
      
      <svg className="spiral-svg" viewBox="0 0 100 1200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="snake-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a202c" />
            <stop offset="20%" stopColor="#4a5568" />
            <stop offset="50%" stopColor="#b36eff" />
            <stop offset="80%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>
          
          <filter id="snake-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Snake Body Path - more curvy like a snake */}
        <path 
          ref={pathRef}
          className="snake-path" 
          d="M 50 50 Q 150 200 0 400 T 100 700 T 0 1000 T 50 1150"
          fill="none"
          stroke="url(#snake-gradient)"
          strokeWidth="50"
          strokeLinecap="round"
          filter="url(#snake-glow)"
        />
        
        {/* Snake Head */}
        <g className="snake-head-group">
          <circle cx="50" cy="50" r="40" fill="#b36eff" />
          <circle cx="40" cy="40" r="6" fill="white" />
          <circle cx="60" cy="40" r="6" fill="white" />
          <path d="M 45 65 Q 50 75 55 65" stroke="white" strokeWidth="2" fill="none" />
        </g>
      </svg>
      
      {/* Exit Hole - Ball falls INTO here FROM the tube */}
      <div className="hole exit-hole">
        <div className="hole-inner"></div>
      </div>

      <div className="spiral-ball" ref={ballRef}>
        <div className="ball-inner"></div>
        <div className="ball-glow"></div>
      </div>
    </div>
  );
};

export default SpiralBallPath;
