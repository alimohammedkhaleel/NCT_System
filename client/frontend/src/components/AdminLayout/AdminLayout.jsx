import React from 'react';
import Sidebar from './Sidebar';
import styles from './AdminLayout.module.css';

export const AdminLayout = ({ children, title, actionButton }) => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {actionButton && <div className={styles.actions}>{actionButton}</div>}
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
