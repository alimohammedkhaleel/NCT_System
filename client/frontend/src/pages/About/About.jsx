import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/navComponent/Navbar';
import ModernFooter from '../../components/common/ModernFooter';
import { InfiniteMenu, PinScrubDebug, TypewriterEffect, Computer3D } from '../../components/animations';
import './About.css';
import '../../components/animations/Computer3D/Computer3D.css';

import imagePng from '../../assets/image.png';
import autotronicsImg from '../../assets/Autotronics.jpg';
import mechatronicImg from '../../assets/Mechatronic.jpg';
import petroleumImg from '../../assets/Petroleum engineering.jpg';
import protocolImg from '../../assets/china-cooperation-protocol.jpg';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef(null);
  const computerRef = useRef(null);

  const menuItems = [
    { label: 'Academic & Digital', icon: '💻', image: imagePng },
    { label: 'Career & Training', icon: '💼', image: autotronicsImg },
    { label: 'Campus Facilities', icon: '🏭', image: mechatronicImg },
    { label: 'Support & Quality', icon: '⭐', image: petroleumImg },
    { label: 'Industrial Protocols', icon: '🤝', image: protocolImg },
  ];

  const services = [
    {
      title: "1. Academic & Digital Services",
      items: [
        "LMS (Learning Management System): A digital platform for accessing course materials, assignments, and communicating with professors.",
        "Digital Library: Provides access to thousands of scientific references and integrated access to the Egyptian Knowledge Bank (EKB).",
        "Student Portal: For managing registrations, grades, and official documents."
      ]
    },
    {
      title: "2. Career & Training Services",
      items: [
        "University Center for Career Development (UCCD): Offers career counseling, CV writing workshops, and interview preparation.",
        "Industrial Partnerships: The university has protocols with major entities (like the Military Production Authority and Elsewedy) to provide students with real-world internships.",
        "Entrepreneurship Unit: Supports students with innovative ideas to turn their technical projects into startups."
      ]
    },
    {
      title: "3. Campus Facilities",
      items: [
        "Advanced Workshops: Specialized buildings equipped with the latest technology for Mechatronics, Autotronics, and Petroleum training.",
        "Digital Transformation Unit: Ensures the campus stays updated with the latest IT infrastructure.",
        "Student Activities & Clubs: Encourages participation in sports, arts, and technology competitions to build a well-rounded personality."
      ]
    },
    {
      title: "4. Support & Quality Units",
      items: [
        "Quality Assurance Center: Ensures the educational process meets international standards.",
        "Equal Opportunities Unit: Focuses on maintaining a safe and inclusive environment for all students.",
        "Student Aid: Provides financial support and scholarships for eligible students."
      ]
    }
  ];

  useEffect(() => {
    // GSAP ScrollTrigger timeline for the 3D Computer
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth scrubbing
        }
      });

      gsap.set(computerRef.current, { scale: 0.8 });

      // 1. Hero -> Educational System (Left side as requested)
      tl.to(computerRef.current, {
        x: "-70vw",
        y: "25vh",
        scale: 0.8, // Shrunk in first section
        ease: "power2.inOut"
      })
        // 2. Educational System -> Infinite Menu (Center/Right)
        .to(computerRef.current, {
          x: "-50vw",
          y: "45vh",
          scale: 0.7,
          ease: "power2.inOut"
        })
        // 3. Infinite Menu -> University Services (Above it)
        .to(computerRef.current, {
          x: "-44vw",
          y: "15vh",
          scale: 0.8,
          ease: "power2.inOut"
        })
        // 4. University Services -> Footer (Center, Natural size)
        .to(computerRef.current, {
          x: "-30vw",
          y: "50vh",
          scale: 0.55,
          ease: "power2.inOut"
        });

      // Animate Footer
      gsap.from(".about-footer .footer-col", {
        scrollTrigger: {
          trigger: ".about-footer",
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Helmet>
        <title>عن الجامعة - NCT جامعة القاهرة الجديدة التكنولوجية</title>
        <meta name="description" content="تعرف على جامعة القاهرة الجديدة التكنولوجية (NCTU) ورؤيتها ورسالتها في تطوير التعليم التكنولوجي التطبيقي في مصر." />
      </Helmet>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <Navbar />
        <div className="about-page">
          {/* Floating 3D Computer Character Controlled by GSAP */}
          <div
            ref={computerRef}
            className="computer-3d-gsap-container"
          >
            <Computer3D />
          </div>

          {/* Hero Section with Typewriter */}
          <section className="about-hero-new">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="about-title-main">
                  <TypewriterEffect text="About NCTU" />
                </h1>
                <p className="about-hero-desc">
                  New Cairo Technological University is a leading public institution established in 2019
                  to revolutionize technical education in Egypt.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Pin, Scrub, Debug Section */}
          <PinScrubDebug />

          {/* Educational System Section */}
          <section className="about-grid-info">
            <div className="info-card-large">
              <div className="info-content">
                <h2>Educational System</h2>
                <p>
                  It follows a 2+2 system. Students can graduate after two years with a Higher Professional Diploma,
                  or continue for two more years to earn a Professional Bachelor’s Degree in Technology.
                </p>
              </div>
              <div className="info-visual">
                <div className="circle-pulse"></div>
              </div>
            </div>

            <div className="info-card-small">
              <h3>Our Approach</h3>
              <p>
                The curriculum is designed with a 60% focus on practical training and 40% on theoretical knowledge,
                ensuring students are "job-ready" upon graduation.
              </p>
            </div>

            <div className="info-card-small vision-card">
              <h3>Vision</h3>
              <p>
                To prepare a generation of technicians and specialists capable of competing in the global market
                and supporting the Fourth Industrial Revolution.
              </p>
            </div>
          </section>

          {/* Infinite Menu Section */}
          <section className="about-menu-section">
            <h2 className="section-title">Explore Our Services</h2>
            <div className="infinite-menu-wrapper">
              <InfiniteMenu items={menuItems} />
            </div>
          </section>

          {/* Detailed Services Section */}
          <section className="about-services-detailed">
            <div className="container">
              <h2 className="services-main-title">University Services</h2>
              <div className="services-accordion">
                {services.map((service, index) => (
                  <motion.div
                    className="service-detail-item"
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3>{service.title}</h3>
                    <ul>
                      {service.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Full Modern Footer */}
          <ModernFooter />
        </div>
      </div>
    </>
  );
};

export default About;
