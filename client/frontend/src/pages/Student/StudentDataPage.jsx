import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './StudentDataPage.module.css';

const StudentDataPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    fetchStudentData();
  }, [user, navigate]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/student/data', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setStudentData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      'paid': { text: 'مدفوع', className: styles.badgePaid },
      'unpaid': { text: 'غير مدفوع', className: styles.badgeUnpaid },
      'partial': { text: 'مدفوع جزئياً', className: styles.badgePartial }
    };
    return statusMap[status] || { text: status, className: styles.badgeDefault };
  };

  const getResultStatusBadge = (status) => {
    const statusMap = {
      'published': { text: 'ظهرت النتيجة', className: styles.badgePublished },
      'not_published': { text: 'لم تظهر النتيجة', className: styles.badgeNotPublished }
    };
    return statusMap[status] || { text: status, className: styles.badgeDefault };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>بياناتي</h1>
          <p className={styles.subtitle}>عرض حالة المصروفات والنتائج</p>
        </div>

        {studentData && (
          <div className={styles.cardsGrid}>
            {/* Payment Status Card */}
            <div className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>💳</div>
                <h2 className={styles.cardTitle}>حالة المصروفات</h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.statusRow}>
                  <span className={styles.label}>الحالة:</span>
                  <span className={getPaymentStatusBadge(studentData.payment_status).className}>
                    {getPaymentStatusBadge(studentData.payment_status).text}
                  </span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.amountRow}>
                  <span className={styles.label}>إجمالي المصروفات:</span>
                  <span className={styles.amount}>{formatCurrency(studentData.total_invoiced)}</span>
                </div>

                <div className={styles.amountRow}>
                  <span className={styles.label}>المبلغ المدفوع:</span>
                  <span className={`${styles.amount} ${styles.paid}`}>
                    {formatCurrency(studentData.total_paid)}
                  </span>
                </div>

                <div className={styles.amountRow}>
                  <span className={styles.label}>المبلغ المستحق:</span>
                  <span className={`${styles.amount} ${styles.due}`}>
                    {formatCurrency(studentData.total_due)}
                  </span>
                </div>
              </div>
            </div>

            {/* Result Status Card */}
            <div className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>📊</div>
                <h2 className={styles.cardTitle}>حالة النتائج</h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.statusRow}>
                  <span className={styles.label}>الحالة:</span>
                  <span className={getResultStatusBadge(studentData.result_status).className}>
                    {getResultStatusBadge(studentData.result_status).text}
                  </span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.amountRow}>
                  <span className={styles.label}>عدد الدرجات المنشورة:</span>
                  <span className={styles.count}>{studentData.grades_count || 0}</span>
                </div>

                {studentData.result_status === 'published' && (
                  <button
                    className={styles.viewGradesBtn}
                    onClick={() => navigate('/student/portal')}
                  >
                    عرض النتائج
                  </button>
                )}
              </div>
            </div>

            {/* Last Update Card */}
            <div className={`${styles.dataCard} ${styles.fullWidth}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>🕒</div>
                <h2 className={styles.cardTitle}>آخر تحديث</h2>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.lastUpdate}>
                  {formatDate(studentData.last_updated)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDataPage;
