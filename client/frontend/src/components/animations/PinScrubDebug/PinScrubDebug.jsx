import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PinScrubDebug.css';

gsap.registerPlugin(ScrollTrigger);

const PinScrubDebug = () => {
  const sectionRef = useRef(null);
  const shapeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a timeline for the pin, scrub, debug effect
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      tl.to(shapeRef.current, {
        rotation: 360 * 2,
        y: 350,
        scale: 0.8,
        ease: "none"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="pin-scrub-debug-section" ref={sectionRef}>
      <div className="psd-container">
        <div className="psd-text-content">
          <h2 className="psd-title">Explore NCTU</h2>
          <p className="psd-description">
            Discover how New Cairo Technological University empowers students 
            with cutting-edge technical education, hands-on training, and 
            industry partnerships — preparing the next generation of engineers.
          </p>
        </div>
        <div className="psd-visual-content">
          <div className="psd-shape" ref={shapeRef}>
            <div className="petal petal-1"></div>
            <div className="petal petal-2"></div>
            <div className="petal petal-3"></div>
            <div className="petal petal-4"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PinScrubDebug;
