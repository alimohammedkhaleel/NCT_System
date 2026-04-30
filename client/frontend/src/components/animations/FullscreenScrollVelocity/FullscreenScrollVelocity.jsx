import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Cpu, 
  Code2, 
  GraduationCap, 
  User, 
  Globe, 
  Layout,
  Terminal,
  Activity,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import './FullscreenScrollVelocity.css';

gsap.registerPlugin(ScrollTrigger);

export default function FullscreenScrollVelocity() {
  const containerRef = useRef(null);
  const textWrapperRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const wrapper = textWrapperRef.current;
      if (!wrapper) return;

      // حساب العرض الكلي للمحتوى ديناميكياً
      const getAmountToScroll = () => wrapper.scrollWidth - window.innerWidth;

      const animatedElements = wrapper.querySelectorAll('.creative-span, .creative-icon');

      // تهيئة العناصر لتكون مخفية تماماً في البداية (Scale 0, Opacity 0)
      animatedElements.forEach(el => {
        gsap.set(el, { opacity: 0 });
      });

      // حركة التمرير الأفقي الشاملة
      gsap.to(wrapper, {
        x: () => -getAmountToScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1, 
          start: "top top",
          end: () => `+=${getAmountToScroll()}`, 
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            animatedElements.forEach(el => {
              const type = el.dataset.type;
              const rect = el.getBoundingClientRect();
              const center = rect.left + (rect.width / 2);
              const viewportCenter = window.innerWidth / 2;
              
              let dist = (center - viewportCenter) / (window.innerWidth / 2);
              let p = 1 - Math.abs(dist);
              p = Math.max(0, Math.min(1, p));

              if (p > 0.4) {
                const focus = (p - 0.4) / 0.6;
                // ظهور الكلمات والأيقونات (تتجسد من العدم)
                if (type === "scale") gsap.to(el, { scale: 1, opacity: 1, color: "#a855f7", duration: 0.15 });
                else if (type === "drop") gsap.to(el, { y: 0, opacity: 1, color: "#3b82f6", duration: 0.15 });
                else if (type === "slide-in-rtl") gsap.to(el, { x: 0, opacity: 1, color: "#10b981", duration: 0.15 });
                else if (type === "slide-in-ltr") gsap.to(el, { x: 0, opacity: 1, color: "#f59e0b", duration: 0.15 });
                else if (type === "icon-float-up") gsap.to(el, { y: -20, x: 0, opacity: 1, rotate: 15, duration: 0.15 });
                else if (type === "icon-float-down") gsap.to(el, { y: 20, x: 0, opacity: 1, rotate: -15, duration: 0.15 });
              } else {
                // إخفاء الكلمات والأيقونات قبل أو بعد المركز
                if (type === "scale") gsap.to(el, { scale: 0, opacity: 0, duration: 0.2 });
                else if (type === "drop") gsap.to(el, { y: -60, opacity: 0, duration: 0.2 });
                else if (type === "slide-in-rtl") gsap.to(el, { x: 100, opacity: 0, duration: 0.2 });
                else if (type === "slide-in-ltr") gsap.to(el, { x: -100, opacity: 0, duration: 0.2 });
                else if (type === "icon-float-up") gsap.to(el, { y: 0, x: -100, opacity: 0, rotate: 0, duration: 0.2 });
                else if (type === "icon-float-down") gsap.to(el, { y: 0, x: 100, opacity: 0, rotate: 0, duration: 0.2 });
              }
            });
          }
        }
      });
      
      // Force refresh after a short delay to ensure fonts and layout are fully calculated
      const timeoutId = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
      
      return () => clearTimeout(timeoutId);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="nctu-full-experience" dir="ltr">
      <div ref={textWrapperRef} className="horizontal-content-wrapper">
        
        {/* 1. السكشن الترحيبي */}
        <section className="nctu-hero-intro">
          
          {/* الأشكال الجمالية العائمة (3D Floating Shapes) */}
          <div className="hero-shapes">
            <div className="shape-dome"></div>
            <div className="shape-flower"></div>
            <div className="shape-ring"></div>
            <div className="shape-hourglass"></div>
            <div className="shape-diamond"></div>
          </div>

          <motion.div 
            className="hero-wrapper"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <div className="ready-badge">
              <Rocket size={16} className="rocket-icon" />
              <span>Ready to Innovate</span>
            </div>

            <div className="title-block">
              <h1 className="main-title">
                <span className="text-white">New Cairo</span>
                <span className="text-purple">Technological University</span>
              </h1>
              <p className="typewriter-sub">IT & Engineering Excellence</p>
            </div>

            <p className="hero-desc">
              Passionate about creating a new era of technology with advanced laboratories 
              and innovative solutions in Mechatronics and Information Technology.
            </p>

            <div className="tech-pills">
              {["ICT", "Renewable energy", "Mechatronics", "Autotronics"].map((tech) => (
                <div key={tech} className="tech-pill">{tech}</div>
              ))}
            </div>

            <div className="social-links-row">
              <a href="#" className="s-icon"><Globe size={18} /></a>
              <a href="#" className="s-icon"><User size={18} /></a>
              <a href="#" className="s-icon"><Terminal size={18} /></a>
            </div>
          </motion.div>
        </section>

        {/* 2. الجملة الطويلة ذات الكلمات المتحركة والأيقونات العائمة */}
        <section className="velocity-text-stream">
          <h2 className="epic-sentence">
            {/* الأيقونات العائمة فوق وتحت الجملة */}
            <span className="creative-icon" data-type="icon-float-up" style={{ top: '-15%', left: '10%' }}><Cpu size={50} color="#a855f7"/></span>
            <span className="creative-icon" data-type="icon-float-down" style={{ bottom: '-15%', left: '35%' }}><Zap size={50} color="#3b82f6"/></span>
            <span className="creative-icon" data-type="icon-float-up" style={{ top: '-20%', left: '60%' }}><Layers size={50} color="#10b981"/></span>
            <span className="creative-icon" data-type="icon-float-down" style={{ bottom: '-10%', left: '85%' }}><Sparkles size={50} color="#f59e0b"/></span>

            Whether you are mastering <span className="creative-span" data-type="drop">Mechanical Systems</span> 
            {" "}in our <span className="creative-span" data-type="scale">Mechatronics Labs</span> 
            {" "}or developing <span className="creative-span" data-type="slide-in-rtl">Software Solutions</span> 
            {" "}in the <span className="creative-span" data-type="slide-in-ltr">IT Department</span>, 
            {" "}<span className="creative-span" data-type="scale">New Cairo Technological University</span> 
            {" "}is where <span className="creative-span" data-type="drop">Future Technology Leaders</span> 
            {" "}are made through <span className="creative-span" data-type="slide-in-rtl">Intensive Practical Training</span> 
            {" "}to ensure every student is ready for the <span className="creative-span" data-type="scale">Digital Revolution.</span>
          </h2>
        </section>

      </div>
    </div>
  );
}