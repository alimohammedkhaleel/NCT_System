import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../navComponent/Navbar';
import styles from './AdminLayout.module.css';

const SPECIALTIES = [
  { code: 'ICT', label: 'تكنولوجيا المعلومات', icon: '💻', hasSubTracks: true },
  { code: 'MCT', label: 'الميكاترونكس', icon: '🤖' },
  { code: 'AUT', label: 'الأوتوترونكس', icon: '🚗' },
  { code: 'REN', label: 'الطاقة المتجددة', icon: '⚡' },
  { code: 'OIL', label: 'تكنولوجيا البترول', icon: '🛢️' },
  { code: 'PRO', label: 'الأطراف الصناعية', icon: '🦾' },
];

const GENERAL_ITEMS = [
  { path: '/admin/dashboard', icon: '🏠', label: 'الرئيسية' },
  { path: '/admin/pending-grades', icon: '✅', label: 'الدرجات المعلقة' },
  { path: '/admin/registration-requests', icon: '📋', label: 'طلبات تسجيل الطلاب' },
  { path: '/admin/professor-requests', icon: '👨‍🏫', label: 'طلبات تسجيل الدكاترة' },
  { path: '/admin/grade-settings', icon: '⚙️', label: 'إعدادات الدرجات' },
  { path: '/admin/timetables', icon: '📅', label: 'الجداول' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSpecialty, setExpandedSpecialty] = useState(null);

  const toggleSpecialty = (code) => {
    setExpandedSpecialty(prev => prev === code ? null : code);
  };

  const isActive = (path) => location.pathname + location.search === path || location.pathname === path;

  const goTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className={styles.adminContainer}>
      <Navbar />
      <div className={styles.body}>
        {/* Mobile Toggle */}
        <button 
          className={styles.mobileToggle} 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>لوحة التحكم</h2>
          </div>

          {/* General Items */}
          <nav className={styles.sidebarNav}>
            <div className={styles.navSection}>
              <h3 className={styles.navSectionTitle}>القائمة الرئيسية</h3>
              {GENERAL_ITEMS.map(item => (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Specialties */}
            <div className={styles.navSection}>
              <h3 className={styles.navSectionTitle}>التخصصات</h3>
              {SPECIALTIES.map(spec => (
                <div key={spec.code}>
                  <button
                    onClick={() => goTo(`/admin/specialty/${spec.code}`)}
                    className={`${styles.navItem} ${location.pathname.includes(`/admin/specialty/${spec.code}`) ? styles.navItemActive : ''}`}
                  >
                    <span className={styles.navIcon}>{spec.icon}</span>
                    <span className={styles.navLabel}>{spec.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className={styles.overlay} 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className={styles.mainContent}>
          <div className={styles.pageContent}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
