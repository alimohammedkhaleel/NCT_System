import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/courses', label: 'Courses', icon: '📚' },
    { path: '/admin/professors', label: 'Professors', icon: '👨‍🏫' },
    { path: '/admin/grade-settings', label: 'Grade Settings', icon: '⚙️' },
    { path: '/admin/pending-grades', label: 'Pending Grades', icon: '📋' },
    { path: '/admin/qr-code', label: 'QR Codes', icon: '📱' },
    { path: '/admin/timetables', label: 'Timetables', icon: '📅' }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>NCT Admin</h1>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <button 
          className={styles.logoutBtn}
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
