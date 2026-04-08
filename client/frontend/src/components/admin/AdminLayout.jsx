import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../common/Navbar';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={styles.adminContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
