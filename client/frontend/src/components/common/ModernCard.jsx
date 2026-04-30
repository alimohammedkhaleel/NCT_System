import React from 'react';
import { motion } from 'framer-motion';
import './ModernCard.css';

/**
 * ModernCard - بطاقة حديثة مع Glassmorphism
 */
const ModernCard = ({
  title,
  description,
  icon,
  actions = [],
  gradient = 'purple',
  image,
  hoverable = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.div
      className={`modern-card gradient-${gradient} ${hoverable ? 'hoverable' : ''} ${className}`}
      whileHover={hoverable ? { scale: 1.05, y: -10 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {/* Image */}
      {image && (
        <div className="card-image">
          {image}
        </div>
      )}

      {/* Icon */}
      {icon && (
        <div className="card-icon">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="card-content">
        {title && <h3 className="card-title">{title}</h3>}
        {description && <p className="card-description">{description}</p>}
        {children}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="card-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className="card-action-btn"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Glow Effect */}
      <div className="card-glow"></div>
    </motion.div>
  );
};

export default ModernCard;
