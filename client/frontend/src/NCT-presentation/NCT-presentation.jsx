import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './NCT-presentetion.css';

const NCTPresentation = ({ onComplete }) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const onCompleteRef = useRef(onComplete);

  const containerRef  = useRef(null);
  const lineRef       = useRef(null);
  const logoRef       = useRef(null);

  // Keep onComplete ref updated without triggering re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const t = setTimeout(() => setAnimationStarted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animationStarted) return;

    gsap.set([lineRef.current, logoRef.current], { willChange: 'transform, opacity' });

    // ── Initial states ──────────────────────────────────────────────────────
    gsap.set(logoRef.current, { y: -60, opacity: 0 });
    gsap.set(lineRef.current, { x: '-200%', opacity: 0 });
    
    // Ensure container starts fully visible
    gsap.set(containerRef.current, { clipPath: 'circle(150% at 50% 100%)' });

    const tl = gsap.timeline();

    // 1. NCT enters from top — ONE smooth move
    tl.to(logoRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out'
    })

    // 2. Decorative line enters from left
    .to(lineRef.current, {
      x: '0%',
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.15')

    // 3. Pause — let user see the logo
    .to({}, { duration: 0.5 })

    // 4. Line sweeps up then disappears downward
    .to(lineRef.current, {
      y: -220,
      duration: 0.45,
      ease: 'power2.out'
    })
    .to(lineRef.current, {
      y: 240,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in'
    })

    // 5. NCT logo fades out
    .to(logoRef.current, {
      opacity: 0,
      scale: 0.85,
      duration: 0.35,
      ease: 'power2.in'
    }, '-=0.5')

    // 6. Semi-circle arc wipe: clipPath shrinks to bottom center
    // This creates an arc from top to bottom
    .to(containerRef.current, {
      clipPath: 'circle(0% at 50% 100%)',
      duration: 0.85,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(containerRef.current, { display: 'none' });
        if (onCompleteRef.current) onCompleteRef.current();
      }
    });

    return () => tl.kill();
  }, [animationStarted]); // Removed onComplete from dependencies to prevent double triggering

  return (
    <div className="nct-presentation-wrapper" ref={containerRef}>
      {/* Solid background — slightly different from page black */}
      <div className="nct-bg-solid" />

      {/* Main content */}
      <div className="nct-main-content">
        <div className="nct-title-section">
          <div className="nct-logo" ref={logoRef}>
            <span className="nct-logo-text">NCT</span>
          </div>
          <div className="nct-line-container">
            <div className="nct-decorative-line" ref={lineRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NCTPresentation;