import React from 'react';
import { motion } from 'framer-motion';
import { RippleButton } from '../animations';
import './HeroSection.css';

/**
 * HeroSection - مكون Hero قابل لإعادة الاستخدام مع Glassmorphism
 */
const HeroSection = ({
  title,
  subtitle,
  description,
  badge,
  actions = [],
  imageContent,
  layout = 'default', // 'default' | 'centered' | 'image-left'
  className = '',
}) => {
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

  const getGridLayout = () => {
    switch (layout) {
      case 'centered':
        return 'grid-centered';
      case 'image-left':
        return 'grid-image-left';
      default:
        return 'grid-default';
    }
  };

  return (
    <section className={`hero-section-component ${getGridLayout()} ${className}`}>
      <div className="hero-background">
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
      </div>

      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Badge */}
        {badge && (
          <motion.span
            className="hero-section-badge"
            variants={itemVariants}
          >
            {badge}
          </motion.span>
        )}

        {/* Title */}
        {title && (
          <motion.h2
            className="hero-section-title"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
        )}

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="hero-section-subtitle"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Description */}
        {description && (
          <motion.p
            className="hero-section-description"
            variants={itemVariants}
          >
            {description}
          </motion.p>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <motion.div
            className="hero-section-actions"
            variants={itemVariants}
          >
            {actions.map((action, index) => (
              <RippleButton
                key={index}
                className={`hero-section-btn ${action.variant || 'primary'}`}
                onClick={action.onClick}
              >
                {action.label}
              </RippleButton>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Image Content */}
      {imageContent && (
        <motion.div
          className="hero-image-content"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {imageContent}
        </motion.div>
      )}
    </section>
  );
};

export default HeroSection;
