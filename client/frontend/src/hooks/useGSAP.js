import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGSAP = () => {
  const gsapRef = useRef(gsap);

  useEffect(() => {
    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return gsapRef.current;
};

// Hook for stagger animations
export const useStaggerAnimation = (elements, options = {}) => {
  const {
    from = { opacity: 0, y: 50 },
    to = { opacity: 1, y: 0 },
    duration = 0.8,
    stagger = 0.1,
    ease = "power2.out",
    trigger
  } = options;

  useEffect(() => {
    if (!elements || elements.length === 0) return;

    const tl = gsap.timeline();

    if (trigger) {
      ScrollTrigger.create({
        trigger,
        start: "top 80%",
        onEnter: () => {
          tl.fromTo(elements, from, {
            ...to,
            duration,
            stagger,
            ease
          });
        }
      });
    } else {
      tl.fromTo(elements, from, {
        ...to,
        duration,
        stagger,
        ease
      });
    }

    return () => {
      tl.kill();
    };
  }, [elements, from, to, duration, stagger, ease, trigger]);
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (element, options = {}) => {
  const {
    from = { opacity: 0, x: -100 },
    to = { opacity: 1, x: 0 },
    start = "top 80%",
    end = "bottom 20%",
    scrub = false,
    pin = false
  } = options;

  useEffect(() => {
    if (!element) return;

    const animation = gsap.fromTo(element, from, {
      ...to,
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub,
        pin
      }
    });

    return () => {
      animation.kill();
    };
  }, [element, from, to, start, end, scrub, pin]);
};

// Hook for hover animations
export const useHoverAnimation = (element, options = {}) => {
  const {
    scale = 1.05,
    duration = 0.3,
    ease = "power2.out"
  } = options;

  useEffect(() => {
    if (!element) return;

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale,
        duration,
        ease
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration,
        ease
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [element, scale, duration, ease]);
};