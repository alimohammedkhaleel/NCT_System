import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navComponent/Navbar';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import styles from './ProfessorDashboard.module.css';

const ProfessorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    professor: {
      full_name: '',
      professor_code: '',
      role: 'professor'
    },
    stats: {
      total_courses: 0,
      total_students: 0,
      pending_grades: 0,
      approved_grades: 0
    },
    courses: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/grades/professor/dashboard');

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data.message || 'فشل في تحميل البيانات');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleCourseClick = (courseId) => {
    navigate(`/professor/grades?course_id=${courseId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h3>حدث خطأ</h3>
        <p>{error}</p>
        <button onClick={handleRetry} className={styles.retryButton}>
          <i className="fas fa-redo"></i> إعادة المحاولة
        </button>
      </div>
    );
  }

  const { professor, stats, courses } = dashboardData;

  return (
    <>
      <Navbar />
      <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            <i className="fas fa-user-tie"></i>
          </div>
          <div className={styles.profileText}>
            <h1>{professor.full_name}</h1>
            <p className={styles.professorCode}>{professor.professor_code}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#0A2472' }}>
            <i className="fas fa-book"></i>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.total_courses}</h3>
            <p>إجمالي المواد</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#1E3A8A' }}>
            <i className="fas fa-users"></i>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.total_students}</h3>
            <p>إجمالي الطلاب</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#F59E0B' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.pending_grades}</h3>
            <p>الدرجات المعلقة</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#10B981' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.approved_grades}</h3>
            <p>الدرجات المعتمدة</p>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className={styles.coursesSection}>
        <div className={styles.sectionHeader}>
          <h2>المواد المسندة</h2>
        </div>

        {courses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-book-open"></i>
            </div>
            <h3>لا توجد مواد مسندة</h3>
            <p>لم يتم تعيين أي مواد لك حالياً</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.coursesTable}>
              <thead>
                <tr>
                  <th>كود المادة</th>
                  <th>اسم المادة</th>
                  <th>التخصص</th>
                  <th>السنة</th>
                  <th>الفصل</th>
                  <th>الطلاب المسجلين</th>
                  <th>الدرجات المقدمة</th>
                  <th>الدرجات المعلقة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className={styles.courseCode}>{course.course_code}</td>
                    <td className={styles.courseName}>
                      <div className={styles.courseNameWrapper}>
                        <span className={styles.arabicName}>{course.arabic_name}</span>
                        {course.course_name !== course.arabic_name && (
                          <span className={styles.englishName}>{course.course_name}</span>
                        )}
                      </div>
                    </td>
                    <td>{course.specialty_name}</td>
                    <td className={styles.year}>السنة {course.year}</td>
                    <td>{course.semester}</td>
                    <td className={styles.centered}>{course.enrolled_students}</td>
                    <td className={styles.centered}>{course.submitted_grades}</td>
                    <td className={styles.centered}>
                      <span className={course.pending_grades > 0 ? styles.pendingBadge : ''}>
                        {course.pending_grades}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className={styles.actionButton}
                        title="إدارة الدرجات"
                      >
                        <i className="fas fa-edit"></i> إدارة الدرجات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ProfessorDashboard;
