import React from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const stats = [
    { icon: '📚', label: 'Courses', count: '24' },
    { icon: '👨‍🏫', label: 'Professors', count: '18' },
    { icon: '📋', label: 'Pending Grades', count: '47' },
    { icon: '📱', label: 'QR Codes Generated', count: '156' }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statCount}>{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2>Quick Actions</h2>
          <div className={styles.actions}>
            <button className={styles.actionBtn}>
              ➕ Add Course
            </button>
            <button className={styles.actionBtn}>
              ➕ Add Professor
            </button>
            <button className={styles.actionBtn}>
              ✅ Review Grades
            </button>
            <button className={styles.actionBtn}>
              📱 Generate QR Code
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Recent Activity</h2>
          <div className={styles.activityList}>
            <p className={styles.emptyState}>No recent activity yet</p>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
