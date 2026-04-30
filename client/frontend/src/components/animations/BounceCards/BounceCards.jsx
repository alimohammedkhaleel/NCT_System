import { motion } from 'framer-motion';
import './BounceCards.css';

/**
 * BounceCards - بطاقات بتأثير elastic bounce
 * تستخدم للبطاقات التفاعلية مع حركة مرنة
 */
export default function BounceCards({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`bounce-card ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: delay
      }}
      whileHover={{
        scale: 1.05,
        rotate: [0, -1, 1, -1, 0],
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 10
        }
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}
