import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Globe, 
  User, 
  Terminal,
  Cpu,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import '../../components/animations/FullscreenScrollVelocity/FullscreenScrollVelocity.css';

gsap.registerPlugin(ScrollTrigger);

export default function ServicesScrollVelocity() {
  const containerRef = useRef(null);
  const textWrapperRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const wrapper = textWrapperRef.current;
      if (!wrapper) return;

      const getAmountToScroll = () => wrapper.scrollWidth - window.innerWidth;

      const animatedElements = wrapper.querySelectorAll('.creative-span, .creative-icon');

      animatedElements.forEach(el => {
        gsap.set(el, { opacity: 0 });
      });

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
                if (type === "scale") gsap.to(el, { scale: 1, opacity: 1, color: "#00d2ff", duration: 0.15 });
                else if (type === "drop") gsap.to(el, { y: 0, opacity: 1, color: "#00d2ff", duration: 0.15 });
                else if (type === "slide-in-rtl") gsap.to(el, { x: 0, opacity: 1, color: "#00d2ff", duration: 0.15 });
                else if (type === "slide-in-ltr") gsap.to(el, { x: 0, opacity: 1, color: "#00d2ff", duration: 0.15 });
                else if (type === "icon-float-up") gsap.to(el, { y: -20, x: 0, opacity: 1, rotate: 15, duration: 0.15 });
                else if (type === "icon-float-down") gsap.to(el, { y: 20, x: 0, opacity: 1, rotate: -15, duration: 0.15 });
              } else {
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
      
      const timeoutId = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
      
      return () => clearTimeout(timeoutId);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="nctu-full-experience" dir="ltr" style={{ zIndex: 10, position: 'relative' }}>
      <div ref={textWrapperRef} className="horizontal-content-wrapper">
        
        {/* Hero Intro */}
        <section className="nctu-hero-intro">
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
              <span>Student Services at NCTU</span>
            </div>

            <div className="title-block">
              <h1 className="main-title">
                <span className="text-white">Our</span>
                <span className="text-purple" style={{ color: '#00d2ff' }}>Services</span>
              </h1>
              <p className="typewriter-sub">Empowering Your Future</p>
            </div>

            <p className="hero-desc">
              Based on the academic structure of New Cairo Technological University (NCTU), 
              here are the primary services provided to students — from digital learning platforms 
              to hands-on lab facilities.
            </p>

            <div className="tech-pills">
              <div className="tech-pill">Academic & Digital</div>
              <div className="tech-pill">Career & Training</div>
              <div className="tech-pill">Student Affairs</div>
              <div className="tech-pill">Facilities & Labs</div>
            </div>

            <div className="social-links-row">
              <a href="#" className="s-icon"><Globe size={18} /></a>
              <a href="#" className="s-icon"><User size={18} /></a>
              <a href="#" className="s-icon"><Terminal size={18} /></a>
            </div>
          </motion.div>
        </section>

        {/* Velocity Teaser Sentence */}
        <section className="velocity-text-stream">
          <h2 className="epic-sentence">
            <span className="creative-icon" data-type="icon-float-up" style={{ top: '-15%', left: '10%' }}><Cpu size={50} color="#00d2ff"/></span>
            <span className="creative-icon" data-type="icon-float-down" style={{ bottom: '-15%', left: '35%' }}><Zap size={50} color="#00d2ff"/></span>
            <span className="creative-icon" data-type="icon-float-up" style={{ top: '-20%', left: '60%' }}><Layers size={50} color="#00d2ff"/></span>
            <span className="creative-icon" data-type="icon-float-down" style={{ bottom: '-10%', left: '85%' }}><Sparkles size={50} color="#00d2ff"/></span>

            From <span className="creative-span" data-type="drop">Digital Libraries</span>
            {" "}and <span className="creative-span" data-type="scale">Smart Portals</span>
            {" "}to <span className="creative-span" data-type="slide-in-rtl">Career Coaching</span>
            {" "}and <span className="creative-span" data-type="slide-in-ltr">Field Internships</span>,
            {" "}<span className="creative-span" data-type="scale">NCTU</span>
            {" "}equips every <span className="creative-span" data-type="drop">Future Engineer</span>
            {" "}with <span className="creative-span" data-type="slide-in-rtl">World-Class Facilities</span>
            {" "}for the <span className="creative-span" data-type="scale">Digital Age.</span>
          </h2>
        </section>

      </div>
    </div>
  );
}
