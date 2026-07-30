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
        <title>جامعة القاهرة الجديدة التكنولوجية | مستقبلك يبدأ هنا</title>
        <meta name="description" content="اكتشف تخصصات وكليات جامعة القاهرة الجديدة التكنولوجية. تعرف على شروط القبول، المصاريف، وتنسيق العام الجديد لبدء رحلتك نحو التميز المهني وسوق العمل." />
      </Helmet>
      {/* Presentation */}
      {!introCompleted && <NCTPresentation onComplete={() => setIntroCompleted(true)} />}
      
      {/* Main Content */}
      {introCompleted && (
        <>
          <Navbar />
          <main className="home-page">
            {/* SEO Hidden Headings */}
            <div className="sr-only">
              <h1>جامعة القاهرة الجديدة التكنولوجية: طريقك نحو الابتكار والريادة</h1>
              <h2>كليات وتخصصات الجامعة التكنولوجية بالقاهرة الجديدة</h2>
              <h2>دليلك الشامل: شروط القبول واختبار القدرات</h2>
              <h3>ما هي مصاريف جامعة القاهرة الجديدة التكنولوجية؟</h3>
              <h3>لماذا تختار التعليم التكنولوجي في مصر؟</h3>
            </div>
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
