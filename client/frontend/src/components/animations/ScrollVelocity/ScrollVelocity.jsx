import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import './ScrollVelocity.css';

// Wrap utility function
const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

/**
 * ScrollVelocity - نص يتحرك أفقياً بناءً على سرعة التمرير
 */
export default function ScrollVelocity({ children, baseVelocity = 100, className = '' }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={`scroll-velocity-wrapper ${className}`}>
      <motion.div className="scroll-velocity-scroller" style={{ x }}>
        <span className="scroll-velocity-text">{children} </span>
        <span className="scroll-velocity-text">{children} </span>
        <span className="scroll-velocity-text">{children} </span>
        <span className="scroll-velocity-text">{children} </span>
      </motion.div>
    </div>
  );
}
