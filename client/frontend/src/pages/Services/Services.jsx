import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Monitor, BookOpen, Globe2, Database,
  Briefcase, Factory, Lightbulb,
  ClipboardList, HeartPulse, Wallet,
  FlaskConical, Trophy, ShieldCheck
} from 'lucide-react';
import Navbar from '../../components/navComponent/Navbar';
import ServicesScrollVelocity from './ServicesScrollVelocity';
import ModernFooter from '../../components/common/ModernFooter';
import './Services.css';

gsap.registerPlugin(ScrollTrigger);

/* ─── Service Data ─── */
const sections = [
  {
    tag: "Academic & Digital",
    title: "Academic & Digital Services",
    accent: "accent-purple",
    SectionIcon: Monitor,
    cards: [
      { 
        Icon: Monitor, 
        title: "Student Learning Management System (LMS)", 
        desc: "A digital platform for accessing lectures, course materials, and communicating with professors." 
      },
      { 
        Icon: Globe2, 
        title: "Student Portal", 
        desc: "An online gateway for course registration, checking semester results, and viewing academic schedules." 
      },
      { 
        Icon: BookOpen, 
        title: "Digital Library", 
        desc: "Access to a wide range of technical references, e-books, and research papers, including resources for ICT, Mechatronics, and Autotronics." 
      },
      { 
        Icon: Database, 
        title: "Egyptian Knowledge Bank (EKB) Access", 
        desc: "Full institutional access to global scientific databases and journals." 
      },
    ]
  },
  {
    tag: "Career & Growth",
    title: "Career Development & Training",
    accent: "accent-blue",
    SectionIcon: Briefcase,
    cards: [
      { 
        Icon: Briefcase, 
        title: "University Center for Career Development (UCCD)", 
        desc: "Offers workshops for CV writing, interview skills, and career counseling to bridge the gap between graduation and employment." 
      },
      { 
        Icon: Factory, 
        title: "Field Training Programs", 
        desc: "Partnerships with major industrial companies and factories in the Fifth Settlement and surrounding industrial zones for hands-on internships." 
      },
      { 
        Icon: Lightbulb, 
        title: "Innovation & Entrepreneurship Hub", 
        desc: "Support for students working on tech startups or graduation projects in fields like Renewable Energy and Petroleum Technology." 
      },
    ]
  },
  {
    tag: "Student Support",
    title: "Student Affairs & Administrative Support",
    accent: "accent-emerald",
    SectionIcon: ClipboardList,
    cards: [
      { 
        Icon: ClipboardList, 
        title: "Office of Student Affairs", 
        desc: "Handles enrollment documents, student IDs, and official transcripts." 
      },
      { 
        Icon: HeartPulse, 
        title: "Medical Services", 
        desc: "On-campus clinics providing primary healthcare and emergency medical assistance for all students." 
      },
      { 
        Icon: Wallet, 
        title: "Student Welfare Fund", 
        desc: "Financial aid and social support services for eligible students." 
      },
    ]
  },
  {
    tag: "Labs & Facilities",
    title: "Campus Facilities & Technical Labs",
    accent: "accent-amber",
    SectionIcon: FlaskConical,
    cards: [
      { 
        Icon: FlaskConical, 
        title: "Specialized Technical Labs", 
        desc: "Advanced workshops for Autotronics, Mechatronics, and Prosthetics, as well as high-performance computer labs for programming and Cybersecurity training." 
      },
      { 
        Icon: Trophy, 
        title: "Student Activities & Clubs", 
        desc: "Facilities for sports, arts, and scientific competitions (e.g., Robotics and Coding clubs)." 
      },
      { 
        Icon: ShieldCheck, 
        title: "Quality Assurance & Assessment Center", 
        desc: "Ensures the high standard of technical education and handles the evaluation of academic programs." 
      },
    ]
  },
];

/* ─── Single Service Section ─── */
const ServiceSection = ({ data, index }) => {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768;

      // Section inner: scale from 0 → 1, fade in
      gsap.fromTo(innerRef.current, 
        { scale: isMobile ? 0.8 : 0, opacity: 0, transformOrigin: "center center" },
        {
          scale: 1,
          opacity: 1,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: isMobile ? "top 95%" : "top 85%",
            end: isMobile ? "top 60%" : "top 25%",
            scrub: 1,
          }
        }
      );

      // Cards stagger reveal
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card, 
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top ${60 - i * 5}%`,
              end: `top ${20 - i * 5}%`,
              scrub: 1,
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const { tag, title, accent, SectionIcon, cards } = data;

  return (
    <>
      {index > 0 && <div className="section-divider" />}
      <section ref={sectionRef} className={`service-section ${accent}`}>
        <div ref={innerRef} className="section-inner">
          
          {/* Header */}
          <div className="section-header">
            <div className="section-icon-orb">
              <SectionIcon size={32} />
            </div>
            <div className="section-title-group">
              <span className="section-tag">{tag}</span>
              <h2 className="section-title">{title}</h2>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="service-cards-grid">
            {cards.map((card, i) => (
              <div 
                key={i} 
                className="service-card"
                ref={el => cardsRef.current[i] = el}
              >
                <div className="card-icon-wrapper">
                  <card.Icon size={24} />
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

/* ─── Main Page ─── */
const Services = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  return (
    <>
      <Navbar />
      <main className="services-page">
        
        {/* Hero: Scroll Velocity Intro */}
        <section className="scroll-velocity-section">
          <ServicesScrollVelocity />
        </section>

        {/* Immersive Service Sections */}
        <div className="services-immersive-sections">
          {sections.map((data, i) => (
            <ServiceSection key={i} data={data} index={i} />
          ))}
        </div>

      </main>
      <ModernFooter />
    </>
  );
};

export default Services;
