import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/navComponent/Navbar';
import NCTPresentation from '../../NCT-presentation/NCT-presentation';
import { ImagesArcAnimation, FullscreenScrollVelocity, GsapScrollParallax } from '../../components/animations';
import ModernFooter from '../../components/common/ModernFooter';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [introCompleted, setIntroCompleted] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, [introCompleted]);

  return (
    <>
      <Helmet>
        <title>الرئيسية - نظام NCTU</title>
        <meta name="description" content="الصفحة الرئيسية للنظام الجامعي المتكامل لجامعة القاهرة التكنولوجية الجديدة (NCTU)." />
      </Helmet>
      {/* Presentation */}
      {!introCompleted && <NCTPresentation onComplete={() => setIntroCompleted(true)} />}
      
      {/* Main Content */}
      {introCompleted && (
        <>
          <Navbar />
          <main className="home-page">
            <section className="images-section">
              <ImagesArcAnimation />
            </section>
            
            <section className="scroll-velocity-section">
              <FullscreenScrollVelocity  />
            </section>

            <section className="gsap-parallax-section">
              <GsapScrollParallax />
            </section>
          </main>
          <ModernFooter />
        </>
      )}
    </>
  );
};

export default Home;
