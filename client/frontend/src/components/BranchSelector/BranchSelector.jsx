import React from 'react';
import styles from './BranchSelector.module.css';

/**
 * BranchSelector Component
 * Reusable component for selecting ICT branch (Software/Network)
 * Used in registration form and branch selection modal
 *
 * @param {string|null} value - Current selected branch ('Software' | 'Network' | null)
 * @param {function} onChange - Callback when branch is selected
 * @param {boolean} required - Whether branch selection is required
 * @param {boolean} disabled - Whether the selector is disabled
 * @param {string} error - Error message to display
 */
const BranchSelector = ({ value, onChange, required = false, disabled = false, error }) => {
  return (
    <div className={styles.branchSelector}>
      <label className={styles.label}>
        <span className={styles.labelAr}>الفرع</span>
        <span className={styles.labelEn}>Branch</span>
        {required && <span className={styles.required} aria-label="required">*</span>}
      </label>

      <div className={styles.options} role="group" aria-label="Branch selection">
        {/* Software Branch Option */}
        <button
          type="button"
          className={`${styles.option} ${value === 'Software' ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
          onClick={() => !disabled && onChange('Software')}
          disabled={disabled}
          aria-pressed={value === 'Software'}
          aria-label="Software branch - البرمجيات"
        >
          <span className={styles.optionIcon}>💻</span>
          <div className={styles.optionText}>
            <span className={styles.optionAr}>البرمجيات</span>
            <span className={styles.optionEn}>Software</span>
          </div>
          {value === 'Software' && (
            <span className={styles.checkmark} aria-hidden="true">✓</span>
          )}
        </button>

        {/* Network Branch Option */}
        <button
          type="button"
          className={`${styles.option} ${value === 'Network' ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
          onClick={() => !disabled && onChange('Network')}
          disabled={disabled}
          aria-pressed={value === 'Network'}
          aria-label="Network branch - الشبكات"
        >
          <span className={styles.optionIcon}>🌐</span>
          <div className={styles.optionText}>
            <span className={styles.optionAr}>الشبكات</span>
            <span className={styles.optionEn}>Network</span>
          </div>
          {value === 'Network' && (
            <span className={styles.checkmark} aria-hidden="true">✓</span>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <span className={styles.error} role="alert" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
};

export default BranchSelector;
