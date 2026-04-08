import React from 'react';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = ({ isLoading = true, fullPage = false }) => {
  if (!isLoading) return null;

  const spinnerClass = fullPage ? styles.fullPage : styles.inline;

  return (
    <div className={spinnerClass}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
