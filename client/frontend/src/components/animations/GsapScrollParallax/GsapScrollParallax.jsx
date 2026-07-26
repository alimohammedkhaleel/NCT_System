import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './GsapScrollParallax.css';

gsap.registerPlugin(ScrollTrigger);

const programs = [
  {
    title: "Mechatronics Program",
    description: "This program integrates mechanical engineering with electronics, computer control, and systems design. Students learn how to design and maintain automated systems, industrial robots, and \"smart\" machines. It focuses on practical applications in factories and manufacturing lines to improve efficiency and productivity."
  },
  {
    title: "Autotronics Program",
    description: "Autotronics focuses on the advanced electronic systems found in modern vehicles. It combines automotive mechanics with electronic sensors and computer-controlled systems. Students are trained to diagnose, repair, and develop electric and hybrid vehicles, as well as traditional internal combustion engines using the latest diagnostic tools."
  },
  {
    title: "Information Technology (IT) Program",
    description: "This specialization covers the fundamentals of software development, networking, and cybersecurity. It prepares students to manage complex database systems, develop web and mobile applications, and ensure information security within organizations. The focus is on providing practical technical solutions to real-world digital challenges."
  },
  {
    title: "Renewable Energy Technology",
    description: "With a global shift toward sustainability, this program trains students in the design, installation, and maintenance of renewable energy systems, such as solar panels and wind turbines. It bridges the gap between theoretical physics and the practical engineering required to manage clean energy plants."
  },
  {
    title: "Prosthetics and Orthotics",
    description: "This is a unique medical-technological specialty. It focuses on designing and manufacturing artificial limbs and orthopedic braces. Students combine knowledge of human anatomy with materials science and engineering to create devices that help patients regain mobility and improve their quality of life."
  },
  {
    title: "Petroleum Technology",
    description: "This program focuses on the technical aspects of the oil and gas industry. Students learn about drilling techniques, production operations, and the processing of petroleum products. The curriculum emphasizes safety standards and the use of modern technology in exploring and managing energy resources."
  }
];

const GsapScrollParallax = () => {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Setup parallax effect for the background pills
      const elements = containerRef.current.querySelectorAll('.parallax-pill');
      
      elements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed'));
        const originalHeight = parseFloat(el.getAttribute('data-height'));
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true
          }
        });

        // Move vertically
        tl.to(el, { y: () => -window.innerHeight * 3 * speed, ease: "none" }, 0);
        
        // Morph from circle to pill in the first 20% of scroll
        tl.to(el, { height: originalHeight, ease: "power2.out", duration: 0.2 }, 0);
      });

      const isMobile = window.innerWidth <= 768;

      // 2. Creative Stacking Animation for the text sections
      sectionsRef.current.forEach((section, i) => {
        if (!isMobile) {
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            pin: true,
            pinSpacing: false, // This makes the next section scroll over this one
            id: `section-${i}`
          });
        }

        // Add a fade out / scale down effect when covered by the next section
        if (i < sectionsRef.current.length - 1) {
          gsap.to(section, {
            scale: 0.9,
            opacity: isMobile ? 0.3 : 0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionsRef.current[i + 1],
              start: "top bottom",
              end: "top top",
              scrub: true
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate pill shapes (initial state as circles)
  const pills = Array.from({ length: 40 }).map((_, i) => {
    const speed = (Math.random() * 1.5 + 0.3).toFixed(2); 
    const left = Math.random() * 95; 
    const top = Math.random() * 95; 
    const width = Math.floor(Math.random() * 10) + 8; // 8px to 18px wide
    const targetHeight = width * (Math.floor(Math.random() * 4) + 4); // 4x to 8x height (pill shape)
    const colorType = Math.floor(Math.random() * 4); 

    return { id: `pill-${i}`, speed, left, top, width, targetHeight, colorType };
  });

  return (
    <div className="programs-parallax-container" ref={containerRef}>
      
      {/* Background Floating Pills */}
      <div className="parallax-background">
        {pills.map((item) => (
          <div
            key={item.id}
            className={`parallax-pill color-${item.colorType}`}
            data-speed={item.speed}
            data-height={item.targetHeight}
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              width: `${item.width}px`,
              height: `${item.width}px`, // Initial height = width (circle)
            }}
          />
        ))}
      </div>

      {/* Foreground Content (Programs) */}
      <div className="programs-content-wrapper">
        {programs.map((program, index) => (
          <div 
            className="program-section" 
            key={index} 
            ref={el => sectionsRef.current[index] = el}
          >
            <div className="program-card">
              <h2 className="program-title">{program.title}</h2>
              <p className="program-description">{program.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GsapScrollParallax;
