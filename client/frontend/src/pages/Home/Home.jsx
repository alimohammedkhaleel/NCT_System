import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/navComponent/Navbar';
import NCTPresentation from '../../NCT-presentation/NCT-presentation';
import { ImagesArcAnimation, FullscreenScrollVelocity, GsapScrollParallax } from '../../components/animations';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [introCompleted, setIntroCompleted] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, [introCompleted]);

  return (
    <>
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
        </>
      )}
    </>
  );
};

export default Home;
