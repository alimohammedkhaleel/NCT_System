import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import NCTPresentation from '../NCT-presentation/NCT-presentation';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [introCompleted, setIntroCompleted] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {!introCompleted && <NCTPresentation onComplete={() => setIntroCompleted(true)} />}
      {introCompleted && (
        <>
          <Navbar />
          <main className="home-page">
            <section className="hero-section">
            <div className="hero-copy">
              <span className="hero-badge">New Cairo University of Technology</span>
              <h1>Engineering the Next Generation of Innovators</h1>
              <p>
                NCTU combines advanced applied science with strong industry partnerships to build the workforce Egypt needs.
                Explore our faculties, student portal, and academic services.
              </p>
              <div className="hero-actions">
                {isAuthenticated ? (
                  <button className="primary-btn" onClick={handleDashboard}>Go to Dashboard</button>
                ) : (
                  <button className="primary-btn" onClick={handleLogin}>Login</button>
                )}
                <button className="secondary-btn" onClick={() => navigate('/portal')}>
                  Student Portal
                </button>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <h3>About NCTU</h3>
                <p>
                  NCTU has established the infrastructure needed for technical plans focused on social development.
                  Our mission is to deliver practical, career-ready education for Egypt’s digital economy.
                </p>
                <ul>
                  <li>State-of-the-art campus in New Cairo</li>
                  <li>Innovative labs, industry projects, and internships</li>
                  <li>Modern faculty in engineering, IT, and management</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="info-section">
            <div className="info-card">
              <h2>Our Mission</h2>
              <p>
                To empower students through applied technology education and strong academic support,
                bridging universities with real-world engineering careers.
              </p>
            </div>
            <div className="info-card">
              <h2>Academic Vision</h2>
              <p>
                To become a leading tech university in Egypt known for academic excellence,
                student success, and community engagement.
              </p>
            </div>
            <div className="info-card">
              <h2>Campus Life</h2>
              <p>
                Students benefit from modern classrooms, research labs, student clubs, and academic advising.
              </p>
            </div>
          </section>
        </main>
      </>
      )}
    </>
  );
};

export default Home;
