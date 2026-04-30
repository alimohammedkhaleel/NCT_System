import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/navComponent/Navbar';
import { InfiniteMenu, PinScrubDebug, TypewriterEffect, Computer3D } from '../../components/animations';
import './About.css';
import '../../components/animations/Computer3D/Computer3D.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef(null);
  const computerRef = useRef(null);

  const menuItems = [
    { label: 'Academic & Digital', icon: '💻', image: '/src/assets/image.png' },
    { label: 'Career & Training', icon: '💼', image: '/src/assets/autotronics.jpg' },
    { label: 'Campus Facilities', icon: '🏭', image: '/src/assets/Mechatronic.jpg' },
    { label: 'Support & Quality', icon: '⭐', image: '/src/assets/Petroleum engineering.jpg' },
    { label: 'Industrial Protocols', icon: '🤝', image: '/src/assets/china-cooperation-protocol.jpg' },
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
          x: "-30vw", // Center horizontally
          y: "20vh",  // Adjusted height for smaller scale
          scale: 0.7,
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

        {/* Full Footer */}
        <footer className="about-footer">
          <div className="container footer-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '40px', padding: '80px 0 40px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '100px' }}>

            <div className="footer-col" style={{ flex: '1', minWidth: '250px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#a855f7' }}>NCTU</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>New Cairo Technological University - Leading the future of technical education in Egypt.</p>
            </div>

            {/* Empty Space for 3D Computer EXACTLY IN THE MIDDLE */}
            <div className="footer-col computer-space" style={{ flex: '1.5', minWidth: '350px', display: 'flex', justifyContent: 'center' }}>
            </div>

            <div className="footer-col" style={{ flex: '1', minWidth: '250px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Quick Links</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><a href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = '#a855f7'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Home</a></li>
                  <li><a href="/about" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = '#a855f7'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>About Us</a></li>
                  <li><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = '#a855f7'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Services</a></li>
                  <li><a href="/contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = '#a855f7'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Contact Us</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255,255,255,0.6)' }}>
                  <li>Email: info@nctu.edu.eg</li>
                  <li>Phone: +20 123 456 7890</li>
                  <li>Address: New Cairo, Egypt</li>
                </ul>
              </div>
            </div>

          </div>
          <div className="footer-bottom" style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
            <p>&copy; {new Date().getFullYear()} NCTU. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default About;
