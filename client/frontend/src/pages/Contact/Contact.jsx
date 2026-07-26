import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/navComponent/Navbar';
import ModernFooter from '../../components/common/ModernFooter';
import { ScrollTube, TypewriterEffect } from '../../components/animations';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>تواصل معنا - نظام NCTU</title>
        <meta name="description" content="تواصل مع جامعة القاهرة التكنولوجية الجديدة (NCTU) لأي استفسارات أو دعم." />
      </Helmet>
      <Navbar />
      <div className="contact-page-modern">
        <div className="contact-layout-wrapper">
          {/* Hero Section */}
          <section className="contact-hero-v2">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <TypewriterEffect text="Let's Connect" />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Whether you're a prospective student, a partner, or just curious about NCTU, 
              we're here to help you navigate your journey.
            </motion.p>
          </section>

          {/* Contact Main Section */}
          <section className="contact-grid-main">
            <div className="contact-flex-container">
              {/* Form Panel (50%) */}
              <motion.div 
                className="contact-form-panel"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    try {
                      await fetch("https://formsubmit.co/ajax/alimohamedkhaleelabd@gmail.com", {
                        method: "POST",
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify(formData)
                      });
                      toast.success('تم إرسال الرسالة بنجاح!');
                      setFormData({ name: '', email: '', message: '' });
                    } catch (error) {
                      toast.error('حدث خطأ أثناء الإرسال');
                    }
                    setIsSubmitting(false);
                  }} 
                  className="modern-form"
                >
                  <div className="input-group-modern">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Your Name</label>
                  </div>

                  <div className="input-group-modern">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label>Email Address</label>
                  </div>

                  <div className="input-group-modern">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder=" "
                      rows="4"
                    ></textarea>
                    <label>How can we help?</label>
                  </div>

                  <motion.button
                    type="submit"
                    className="modern-submit-btn"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </motion.button>
                </form>
              </motion.div>

              {/* Snake Tube Section (50%) */}
              <div className="contact-animation-side">
                <ScrollTube />
                <div className="tube-text-content">
                  <h3 style={{ color: '#0cd2ff', fontSize: '1.5rem', marginBottom: '10px', textShadow: '0 0 10px rgba(12, 210, 255, 0.5)' }}>Join the Innovation</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    At NCTU, we are building the future through advanced technology, 
                    research, and global collaboration. Reach out to explore opportunities!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Info Panel (Below) */}
            <div className="contact-info-panel">
              <motion.div className="info-item" whileHover={{ x: 10 }}>
                <span className="info-icon-glow">📍</span>
                <div>
                  <h3>Campus Location</h3>
                  <p>New Cairo, Cairo Governorate, Egypt</p>
                </div>
              </motion.div>

              <motion.div className="info-item" whileHover={{ x: 10 }}>
                <span className="info-icon-glow">📧</span>
                <div>
                  <h3>Email Support</h3>
                  <p>info@nctu.edu.eg</p>
                </div>
              </motion.div>

              <motion.div className="info-item" whileHover={{ x: 10 }}>
                <span className="info-icon-glow">📞</span>
                <div>
                  <h3>Call Us</h3>
                  <p>+20 2 1234 5678</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Map Section */}
          <section className="contact-map-section">
            <div className="map-glass-card">
              <div className="map-overlay">
                <h2>Visit Our Campus</h2>
                <p>Experience the future of technology in the heart of New Cairo.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ModernFooter />
    </>
  );
};

export default Contact;
