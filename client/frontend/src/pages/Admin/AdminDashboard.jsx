import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CoursesPage.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const dashboardCards = [
    {
      title: 'Courses Management',
      icon: '📚',
      description: 'Manage all courses in the system',
      path: '/admin/courses',
      color: '#3498db'
    },
    {
      title: 'Professors',
      icon: '👨‍🏫',
      description: 'Manage professors and assign courses',
      path: '/admin/professors',
      color: '#2ecc71'
    },
    {
      title: 'Grade Settings',
      icon: '⚙️',
      description: 'Configure grading scale and thresholds',
      path: '/admin/grade-settings',
      color: '#f39c12'
    },
    {
      title: 'Pending Grades',
      icon: '✓',
      description: 'Review and approve student grades',
      path: '/admin/pending-grades',
      color: '#e74c3c'
    },
    {
      title: 'QR Code Generator',
      icon: '📱',
      description: 'Generate QR codes for students',
      path: '/admin/qr-code',
      color: '#9b59b6'
    },
    {
      title: 'Timetables',
      icon: '📅',
      description: 'Upload and manage timetables',
      path: '/admin/timetables',
      color: '#1abc9c'
    }
  ];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Welcome back, {user?.full_name}! 👋
        </h1>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Select a feature below to manage your academic system
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {dashboardCards.map((card) => (
          <div
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              background: 'white',
              border: `2px solid ${card.color}`,
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 8px 16px ${card.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: '48px',
              lineHeight: '1',
              color: card.color
            }}>
              {card.icon}
            </div>

            <h3 style={{
              margin: '0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              {card.title}
            </h3>

            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#7f8c8d',
              flex: 1
            }}>
              {card.description}
            </p>

            <div style={{
              paddingTop: '12px',
              borderTop: `1px solid ${card.color}20`,
              color: card.color,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Open Module →
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info Section */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        borderLeft: '4px solid #3498db'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
          📝 Quick Guide
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          color: '#2c3e50',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          <li>Use <strong>Courses</strong> to add, edit, or delete courses</li>
          <li>Manage <strong>Professors</strong> and assign them to courses</li>
          <li>Configure grading values in <strong>Grade Settings</strong></li>
          <li>Review pending grades in <strong>Pending Grades</strong> and approve/reject them</li>
          <li>Generate <strong>QR Codes</strong> for student authentication</li>
          <li>Upload and manage <strong>Timetables</strong> for each specialty</li>
        </ul>
      </div>
    </div>
  );
}
