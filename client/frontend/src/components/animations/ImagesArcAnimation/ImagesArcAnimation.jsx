import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import './ImagesArcAnimation.css';

import autotronicsImg from '../../assets/Autotronics.jpg';
import mechatronicImg from '../../assets/Mechatronic.jpg';
import petroleumImg from '../../assets/Petroleum engineering.jpg';
import renewableImg from '../../assets/Renewable energy.jpg';
import saudiImg from '../../assets/saudi-franchise-committee.jpg';

/**
 * ImagesArcAnimation - بطاقات الصور بتأثير القوس مع سقوط متتالي
 * ديسكتوب/تابلت: شكل قوسي (نصف دائرة)
 * موبايل: Carousel أفقي
 */
export default function ImagesArcAnimation() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [showDescent, setShowDescent] = useState(true);
  const [showArcAnimation, setShowArcAnimation] = useState(false);
  
  // كشف الموبايل
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;
  
  // أبعاد متغيرة حسب حجم الشاشة
  const getImageSize = () => {
    if (isMobile) {
      return { width: 260, height: 220 }; // موبايل - عرض أكبر
    } else if (isTablet) {
      return { width: 160, height: 250 };
    } else {
      return { width: 180, height: 280 };
    }
  };
  
  const imageSize = getImageSize();
  const imageWidth = imageSize.width;
  const imageHeight = imageSize.height;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 5 صور
  const images = [
    { id: 0, delay: 0, image: autotronicsImg, title: 'Autotronics' },
    { id: 1, delay: 0.6, image: mechatronicImg, title: 'Mechatronic' },
    { id: 2, delay: 1.2, image: petroleumImg, title: 'Petroleum' },
    { id: 3, delay: 1.8, image: renewableImg, title: 'Renewable Energy' },
    { id: 4, delay: 2.4, image: saudiImg, title: 'Saudi Committee' },
  ];
  
  // نقطة البداية والنزول (للديسكتوب بس)
  const startX = windowWidth / 2 - imageWidth / 2;
  const startY = -imageHeight - 100;
  const endY = windowHeight - imageHeight - 50;

  const lastImageDelay = 4 * 0.6;
  const descentDuration = 1.2;

  // تأثير السقوط (للديسكتوب بس)
  useEffect(() => {
    if (!isMobile) {
      const timer = setTimeout(() => {
        setShowDescent(false);
        setShowArcAnimation(true);
      }, (lastImageDelay + descentDuration + 0.5) * 1000);
      return () => clearTimeout(timer);
    } else {
      // للموبايل: لا نحتاج سقوط، نعرض الكاروسيل مباشرة
      setShowDescent(false);
      setShowArcAnimation(false);
    }
  }, [isMobile]);

  // حساب نقاط القوس (للديسكتوب بس)
  const arcPoints = useMemo(() => {
    if (isMobile) return [];
    
    const points = [];
    const arcStartX = 50;
    const arcEndX = windowWidth - 50 - imageWidth;
    const arcWidth = arcEndX - arcStartX;
    const arcHeight = 350;
    const centerY = windowHeight * 0.45;

    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const x = arcStartX + arcWidth * t;
      const y = centerY - arcHeight * Math.sin(t * Math.PI);
      points.push({ x, y });
    }
    return points;
  }, [windowWidth, windowHeight, imageWidth, isMobile]);

  // ============================================
  // 📱 عرض الموبايل: Carousel أفقي
  // ============================================
  if (isMobile) {
    return (
      <section className="mobile-carousel-section">
        <div className="mobile-carousel-container">
          <div className="mobile-carousel">
            {images.map((img, index) => (
              <motion.div
                key={`mobile-${img.id}`}
                className="mobile-slide"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="mobile-image-wrapper">
                  <img
                    src={img.image}
                    alt={img.title}
                    className="mobile-image"
                    loading="lazy"
                  />
                  <div className="mobile-image-title">
                    <span>{img.title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* مؤشر التمرير */}
          <div className="scroll-indicator">
            <span>← اسحب للمزيد →</span>
          </div>
        </div>
      </section>
    );
  }

  // ============================================
  // 💻 عرض الديسكتوب: القوس
  // ============================================
  return (
    <section className="images-arc-section" dir='ltr'>
      <div className="arc-container" style={{ paddingTop: '200px' }}>
        {/* المرحلة 1: السقوط من فوق لتحت */}
        {showDescent && images.map((img) => (
          <motion.div
            key={`descent-${img.id}`}
            className="image-wrapper descent"
            style={{
              position: 'fixed',
              top: 0,
              left: startX,
              width: imageWidth,
              height: imageHeight,
              zIndex: 40,
            }}
          >
            <motion.img
              src={img.image}
              alt="university"
              className="arc-image"
              loading="lazy"
              style={{
                width: imageWidth,
                height: imageHeight,
                objectFit: 'cover',
                borderRadius: '20px',
              }}
              initial={{
                y: startY,
                opacity: 0,
                scale: 0.3,
              }}
              animate={{
                y: endY,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: descentDuration,
                delay: img.delay,
                ease: 'easeOut',
              }}
            />
          </motion.div>
        ))}

        {/* المرحلة 2: الحركة القوسية */}
        {showArcAnimation && (
          <>
            {images.map((img, index) => (
              <motion.div
                key={`arc-${img.id}`}
                className="image-wrapper arc-animation"
                style={{
                  position: 'absolute',
                  width: imageWidth,
                  height: imageHeight,
                  zIndex: 10 + index,
                }}
              >
                <motion.img
                  src={img.image}
                  alt="university"
                  loading="lazy"
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                    objectFit: 'cover',
                    borderRadius: '20px',
                  }}
                  animate={{
                    x: arcPoints.map(p => p.x),
                    y: arcPoints.map(p => p.y),
                    opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9],
                    scale: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9],
                  }}
                  transition={{
                    duration: 7,
                    delay: index * 1.43,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                    times: [0, 0.08, 0.15, 0.25, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}