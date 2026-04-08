import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './LoadingPage.css';

const LoadingPage = ({ message = 'جاري التحميل...', timeout = 5000, onTimeout = null }) => {
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    if (!timeout) return;

    const timer = setTimeout(() => {
      setIsTimeout(true);
      if (onTimeout) onTimeout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  return (
    <motion.div
      className="loading-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        {/* Animated spinner */}
        <div className="spinner-container">
          <motion.div
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <div className="spinner-inner"></div>
          </motion.div>

          {/* Center dot */}
          <motion.div
            className="spinner-center"
            animate={{
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          ></motion.div>
        </div>

        {/* Loading text */}
        <motion.h2
          className="loading-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {message}
        </motion.h2>

        {/* Timeout message */}
        {isTimeout && (
          <motion.div
            className="timeout-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p>التحميل يستغرق وقتاً أطول من المتوقع</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              أعد المحاولة
            </button>
          </motion.div>
        )}

        {/* Loading dots */}
        <div className="loading-dots">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="dot"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>

      {/* Background gradient */}
      <motion.div
        className="loading-bg-gradient"
        animate={{
          background: [
            'linear-gradient(135deg, #00ADB5 0%, #4DA8FF 100%)',
            'linear-gradient(135deg, #4DA8FF 0%, #00ADB5 100%)',
            'linear-gradient(135deg, #00ADB5 0%, #4DA8FF 100%)'
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
};

export default LoadingPage;
