import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BotpressChat.css';

const BotpressChat = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scriptLoadedRef = useRef(false);
  const initTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initBotpress = () => {
      // Check if Botpress is already loaded
      if (window?.botpressWebChat) {
        if (isMounted) {
          setIsLoaded(true);
          setIsInitializing(false);
        }
        return;
      }

      // Load Botpress script
      const script = document.createElement('script');
      script.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
      script.async = true;
      script.type = 'text/javascript';

      script.onload = () => {
        // Set timeout to ensure SDK is initialized
        initTimeoutRef.current = setTimeout(() => {
          try {
            if (window?.botpressWebChat && typeof window.botpressWebChat === 'object') {
              // Configure Botpress with proper settings
              if (typeof window.botpressWebChat.configure === 'function') {
                window.botpressWebChat.configure({
                  botId: import.meta.env.VITE_BOTPRESS_BOT_ID || 'your-bot-id',
                  hostUrl: import.meta.env.VITE_BOTPRESS_HOST_URL || 'https://cdn.botpress.cloud/webchat/v1',
                  messagingUrl: import.meta.env.VITE_BOTPRESS_MESSAGING_URL || 'https://messaging.botpress.cloud',
                  botName: 'NCTU Assistant',
                  botAvatarUrl: '/nctu-logo.png',
                  composerPlaceholder: 'اسأل عن درجاتك أو المواد...',
                  showPoweredBy: false
                });
              }

              if (isMounted) {
                setIsLoaded(true);
                setError(null);
              }
            } else {
              throw new Error('Botpress SDK did not initialize properly');
            }
          } catch (err) {
            console.error('Botpress initialization error:', err);
            if (isMounted) {
              setError('Failed to load chat');
            }
          } finally {
            if (isMounted) {
              setIsInitializing(false);
            }
          }
        }, 1000);
      };

      script.onerror = () => {
        console.error('Failed to load Botpress script');
        if (isMounted) {
          setError('Failed to load chat');
          setIsInitializing(false);
        }
      };

      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    };

    // Only initialize once
    if (!scriptLoadedRef.current) {
      initBotpress();
    } else if (window?.botpressWebChat) {
      setIsLoaded(true);
      setIsInitializing(false);
    }

    return () => {
      isMounted = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  const handleShowChat = () => {
    try {
      // Safe check using optional chaining
      if (window?.botpressWebChat?.sendEvent && typeof window.botpressWebChat.sendEvent === 'function') {
        window.botpressWebChat.sendEvent({ type: 'show' });
        setIsVisible(true);
      } else if (window?.botpressWebChat?.show && typeof window.botpressWebChat.show === 'function') {
        // Fallback to show method if sendEvent doesn't exist
        window.botpressWebChat.show();
        setIsVisible(true);
      } else {
        console.error('Botpress show method is not available');
        setError('Chat service is not ready');
      }
    } catch (err) {
      console.error('Error showing chat:', err);
      setError('Error opening chat');
    }
  };

  const handleHideChat = () => {
    try {
      if (window?.botpressWebChat?.sendEvent && typeof window.botpressWebChat.sendEvent === 'function') {
        window.botpressWebChat.sendEvent({ type: 'hide' });
        setIsVisible(false);
      } else if (window?.botpressWebChat?.hide && typeof window.botpressWebChat.hide === 'function') {
        window.botpressWebChat.hide();
        setIsVisible(false);
      }
    } catch (err) {
      console.error('Error hiding chat:', err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsInitializing(true);
    scriptLoadedRef.current = false;
    
    // Remove old script
    const oldScript = document.querySelector('script[src*="botpress"]');
    if (oldScript) {
      oldScript.remove();
    }
    
    // Reset window object
    if (window?.botpressWebChat) {
      window.botpressWebChat = undefined;
    }

    // Reinitialize
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
    script.async = true;

    script.onload = () => {
      initTimeoutRef.current = setTimeout(() => {
        if (window?.botpressWebChat) {
          setIsLoaded(true);
          setError(null);
        } else {
          setError('Failed to reinitialize chat');
        }
        setIsInitializing(false);
      }, 1000);
    };

    script.onerror = () => {
      setError('Failed to load chat script');
      setIsInitializing(false);
    };

    document.head.appendChild(script);
  };

  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          className="chat-error-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button
            onClick={handleRetry}
            className="error-retry-btn"
          >
            حاول مرة أخرى
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            className="chat-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="chat-spinner" />
            <span>جاري تحميل الدعم الفني...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoaded && !isInitializing && (
        <motion.div
          className="botpress-chat-button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={isVisible ? handleHideChat : handleShowChat}
            className={`chat-toggle-btn ${isVisible ? 'active' : ''}`}
            title={isVisible ? 'إغلاق الدعم الفني' : 'فتح الدعم الفني'}
            aria-label="Botpress Chat Toggle"
          >
            <svg
              className="chat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="chat-label">دعم فني</span>
          </button>
        </motion.div>
      )}
    </>
  );
};

export default BotpressChat;