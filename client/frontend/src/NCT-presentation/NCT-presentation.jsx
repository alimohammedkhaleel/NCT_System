import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './NCT-presentetion.css';

const NCTPresentation = ({ onComplete }) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Refs للعناصر
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const logoRef = useRef(null);
  
  // Refs لنصفي الخلفية
  const splitLeftRef = useRef(null);
  const splitRightRef = useRef(null);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!animationStarted) return;

    // تحسين الأداء
    gsap.set([lineRef.current, logoRef.current], {
      willChange: 'transform, opacity'
    });

    // إخفاء العناصر في البداية
    gsap.set(logoRef.current, {
      y: -50,
      opacity: 0
    });

    gsap.set(lineRef.current, {
      x: '-200%',
      y: 0,
      opacity: 0
    });

    // إنشاء Timeline رئيسي
    const tl = gsap.timeline();

    // 1. ظهور NCT من الأعلى
    tl.to(logoRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.6)'
    })

    // 2. ظهور الخط من اليسار
    .to(lineRef.current, {
      x: '0%',
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2')

    // 3. الخط يتحرك للأعلى
    .to(lineRef.current, {
      y: -200,
      duration: 0.5,
      ease: 'power2.out'
    })

    // 4. الخط يتحرك للأسفل ويختفي
    .to(lineRef.current, {
      y: 200,
      duration: 0.9,
      ease: 'power2.in',
      opacity: 0
    })

    // 5. إخفاء NCT في نفس وقت اختفاء الخط
    .to(logoRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.9,
      ease: 'back.in(1)'
    }, '-=0.9')

    // 6. النصف الأيسر يختفي من الشمال لليمين
    .to(splitLeftRef.current, {
      x: '-100%',
      duration: 1,
      ease: 'power3.inOut'
    })

    // 7. النصف الأيمن يختفي من اليمين للشمال
    .to(splitRightRef.current, {
      x: '100%',
      duration: 1,
      ease: 'power3.inOut'
    }, '-=1')

    // 8. تحريك الحاوية للخارج
    .to(containerRef.current, {
      y: '100%',
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: onComplete
    }, '-=0.5');

    return () => {
      tl.kill();
    };
  }, [animationStarted, onComplete]);

  return (
    <div className="nct-presentation-wrapper" ref={containerRef}>
      {/* خلفية موحدة باللون EEEEEE */}
      <div className="nct-bg-solid"></div>
      
      {/* نصفي الخلفية المنقسمة - لون 222831 */}
      <div className="nct-split-left" ref={splitLeftRef}></div>
      <div className="nct-split-right" ref={splitRightRef}></div>
      
      {/* المحتوى الرئيسي في المنتصف */}
      <div className="nct-main-content">
        <div className="nct-title-section">
          {/* NCT فقط */}
          <div className="nct-logo" ref={logoRef}>
            <span className="nct-logo-text">NCT</span>
          </div>
          
          {/* الخط الزخرفي */}
          <div className="nct-line-container">
            <div className="nct-decorative-line" ref={lineRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NCTPresentation;