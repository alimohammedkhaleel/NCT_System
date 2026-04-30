import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import styles from './SpecialtyDashboard.module.css';

export default function SpecialtyDashboard() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearStats, setYearStats] = useState([]);

  useEffect(() => {
    fetchSpecialtyData();
  }, [code]);

  const fetchSpecialtyData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch specialty details
      const specResponse = await api.get('/admin/specialties');
      const specialtyData = specResponse.data.data?.find(s => s.code === code);
      
      if (!specialtyData) {
        setError('التخصص غير موجود');
        setLoading(false);
        return;
      }

      setSpecialty(specialtyData);

      // Fetch academic years for this specialty to get real IDs
      const yearsRes = await api.get(`/admin/academic-years?specialty_id=${specialtyData.id}`);
      const academicYears = yearsRes.data.data || [];

      // Fetch student and course counts per year
      const yearStatsPromises = [1, 2, 3, 4].map(async (yearNum) => {
        try {
          const academicYear = academicYears.find(y => y.year_number === yearNum);

          const [studentsRes, coursesRes] = await Promise.allSettled([
            api.get(`/admin/students?specialty_id=${specialtyData.id}&current_year=${yearNum}`),
            academicYear
              ? api.get(`/admin/courses?specialty_id=${specialtyData.id}&academic_year_id=${academicYear.id}`)
              : Promise.resolve({ data: { data: [], count: 0 } })
          ]);

          // For ICT year 3 & 4, get branch breakdown
          let branchStats = null;
          if (code === 'ICT' && (yearNum === 3 || yearNum === 4)) {
            const [swRes, nwRes] = await Promise.allSettled([
              api.get(`/admin/students?specialty_id=${specialtyData.id}&current_year=${yearNum}&branch=Software`),
              api.get(`/admin/students?specialty_id=${specialtyData.id}&current_year=${yearNum}&branch=Network`)
            ]);
            branchStats = {
              software: swRes.status === 'fulfilled' ? (swRes.value.data.count || swRes.value.data.data?.length || 0) : 0,
              network: nwRes.status === 'fulfilled' ? (nwRes.value.data.count || nwRes.value.data.data?.length || 0) : 0
            };
          }

          return {
            yearNumber: yearNum,
            academicYearId: academicYear?.id || null,
            studentCount: studentsRes.status === 'fulfilled'
              ? (studentsRes.value.data.count || studentsRes.value.data.data?.length || 0)
              : 0,
            courseCount: coursesRes.status === 'fulfilled'
              ? (coursesRes.value.data.count || coursesRes.value.data.data?.length || 0)
              : 0,
            branchStats
          };
        } catch {
          return { yearNumber: yearNum, academicYearId: null, studentCount: 0, courseCount: 0, branchStats: null };
        }
      });

      const stats = await Promise.all(yearStatsPromises);
      setYearStats(stats);
    } catch (err) {
      console.error('Error fetching specialty data:', err);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const yearLabels = {
    1: 'السنة الأولى',
    2: 'السنة الثانية',
    3: 'السنة الثالثة',
    4: 'السنة الرابعة'
  };

  const yearIcons = {
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣'
  };

  const specialtyIcons = {
    'MCT': '🤖',
    'AUT': '🚗',
    'ICT': '💻',
    'PRO': '🦾',
    'OIL': '🛢️',
    'REN': '⚡'
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error || !specialty) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error || 'التخصص غير موجود'}</p>
          <button onClick={() => navigate('/admin')} className={styles.backButton}>
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button onClick={() => navigate('/admin')} className={styles.backBtn}>
          ← العودة
        </button>
        <div className={styles.headerContent}>
          <div className={styles.specialtyIcon}>{specialtyIcons[specialty.code] || '📚'}</div>
          <div>
            <h1 className={styles.pageTitle}>{specialty.arabic_name}</h1>
            <p className={styles.subtitle}>{specialty.name}</p>
          </div>
        </div>
      </div>

      {/* Specialty Info */}
      <div className={styles.infoCard}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>الكود:</span>
          <span className={styles.infoValue}>{specialty.code}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>مدة الدراسة:</span>
          <span className={styles.infoValue}>{specialty.duration_years} سنوات</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>إجمالي الساعات:</span>
          <span className={styles.infoValue}>{specialty.total_credits} ساعة</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>الرسوم السنوية:</span>
          <span className={styles.infoValue}>{specialty.annual_fee?.toLocaleString()} جنيه</span>
        </div>
      </div>

      {/* Years Grid */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>السنوات الدراسية</h2>
        <p className={styles.sectionSubtitle}>اضغط على أي سنة لإدارة المواد والأساتذة والطلاب</p>
      </div>

      <div className={styles.yearsGrid}>
        {yearStats.map((yearStat) => (
          <div
            key={yearStat.yearNumber}
            onClick={() => navigate(`/admin/courses?specialty=${code}&year=${yearStat.yearNumber}`)}
            className={styles.yearCard}
          >
            <div className={styles.yearIcon}>{yearIcons[yearStat.yearNumber]}</div>
            <h3 className={styles.yearTitle}>{yearLabels[yearStat.yearNumber]}</h3>
            
            <div className={styles.yearStats}>
              <div className={styles.yearStat}>
                <span className={styles.yearStatValue}>{yearStat.studentCount}</span>
                <span className={styles.yearStatLabel}>طالب</span>
              </div>
              <div className={styles.yearStat}>
                <span className={styles.yearStatValue}>{yearStat.courseCount}</span>
                <span className={styles.yearStatLabel}>مادة</span>
              </div>
            </div>

            {/* ICT year 3 & 4: show branch breakdown */}
            {specialty.code === 'ICT' && (yearStat.yearNumber === 3 || yearStat.yearNumber === 4) && (
              <div className={styles.tracksInfo}>
                <span className={styles.tracksBadge}>فرعين متاحين</span>
                <div className={styles.tracksList}>
                  <span className={styles.track}>
                    💻 برمجيات: {yearStat.branchStats?.software ?? 0}
                  </span>
                  <span className={styles.track}>
                    🌐 شبكات: {yearStat.branchStats?.network ?? 0}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.yearAction}>عرض المواد ←</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
        <h2 className={styles.sectionTitle}>إجراءات سريعة</h2>
      </div>
      <div className={styles.yearsGrid}>
        <div className={styles.yearCard} onClick={() => navigate(`/admin/students?specialty=${specialty.id}`)}>
          <div className={styles.yearIcon}>🎓</div>
          <h3 className={styles.yearTitle}>طلاب التخصص</h3>
          <div className={styles.yearAction}>عرض الطلاب ←</div>
        </div>
        <div className={styles.yearCard} onClick={() => navigate(`/admin/professors?specialty=${code}`)}>
          <div className={styles.yearIcon}>👨‍🏫</div>
          <h3 className={styles.yearTitle}>دكاترة التخصص</h3>
          <div className={styles.yearAction}>عرض الدكاترة ←</div>
        </div>
        <div className={styles.yearCard} onClick={() => navigate(`/admin/courses?specialty=${code}`)}>
          <div className={styles.yearIcon}>📚</div>
          <h3 className={styles.yearTitle}>كل مواد التخصص</h3>
          <div className={styles.yearAction}>عرض المواد ←</div>
        </div>
        <div className={styles.yearCard} onClick={() => navigate(`/admin/results-publishing?specialty_id=${specialty.id}`)}>
          <div className={styles.yearIcon}>📢</div>
          <h3 className={styles.yearTitle}>نشر النتائج</h3>
          <div className={styles.yearAction}>نشر ←</div>
        </div>
      </div>
    </div>
  );
}
