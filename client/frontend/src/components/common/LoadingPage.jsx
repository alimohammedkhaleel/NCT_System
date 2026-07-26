import { useEffect, useState } from 'react';
import './LoadingPage.css';

const LoadingPage = ({ message = 'جاري التحميل...', timeout = 8000, onTimeout = null }) => {
  const [isTimeout, setIsTimeout] = useState(false);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (!timeout) return;
    const timer = setTimeout(() => {
      setIsTimeout(true);
      if (onTimeout) onTimeout();
    }, timeout);
    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  // Animate dots manually with CSS class cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d + 1) % 3);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-content">
        {/* Spinner */}
        <div className="spinner-container">
          <div className="spinner">
            <div className="spinner-inner"></div>
          </div>
          <div className="spinner-center"></div>
        </div>

        {/* Loading text */}
        <h2 className="loading-text">{message}</h2>

        {/* Timeout message */}
        {isTimeout && (
          <div className="timeout-message">
            <p>التحميل يستغرق وقتاً أطول من المتوقع</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              أعد المحاولة
            </button>
          </div>
        )}

        {/* Loading dots */}
        <div className="loading-dots">
          <div className={`dot ${dots >= 0 ? 'dot-active' : ''}`}></div>
          <div className={`dot ${dots >= 1 ? 'dot-active' : ''}`}></div>
          <div className={`dot ${dots >= 2 ? 'dot-active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
