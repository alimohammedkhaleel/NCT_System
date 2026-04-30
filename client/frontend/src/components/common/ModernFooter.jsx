import React from 'react';
import { motion } from 'framer-motion';
import './ModernFooter.css';

/**
 * ModernFooter - Footer حديث مع Glassmorphism
 */
const ModernFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'الروابط السريعة',
      links: [
        { label: 'الرئيسية', href: '/' },
        { label: 'عن الجامعة', href: '/about' },
        { label: 'البرامج', href: '/about' },
        { label: 'تواصل معنا', href: '/contact' },
      ],
    },
    {
      title: 'الخدمات',
      links: [
        { label: 'لوحة التحكم', href: '/dashboard' },
        { label: 'بوابة الطالب', href: '/student/portal' },
        { label: 'التسجيل', href: '/register' },
      ],
    },
    {
      title: 'التواصل',
      links: [
        { label: 'البريد الإلكتروني', href: 'mailto:info@nct.edu.eg' },
        { label: 'الهاتف', href: 'tel:+201234567890' },
        { label: 'الموقع', href: '/contact' },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer className="modern-footer">
      <div className="footer-background">
        <div className="footer-glow"></div>
      </div>

      <motion.div
        className="footer-content"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Brand Section */}
        <motion.div className="footer-brand" variants={itemVariants}>
          <h3 className="footer-logo">
            <span className="logo-text">NCT</span>
            <span className="logo-subtitle">System</span>
          </h3>
          <p className="footer-description">
            منصة تعليمية متطورة لإدارة العملية التعليمية في الجامعات التكنولوجية.
          </p>
        </motion.div>

        {/* Links Section */}
        {footerLinks.map((section, index) => (
          <motion.div key={index} className="footer-section" variants={itemVariants}>
            <h4 className="section-title">{section.title}</h4>
            <ul className="links-list">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Bottom */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <div className="footer-divider"></div>
        <div className="footer-bottom-content">
          <p className="copyright">
            © {currentYear} جامعة القاهرة الجديدة التكنولوجية. جميع الحقوق محفوظة.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              f
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              𝕏
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              in
            </a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default ModernFooter;
