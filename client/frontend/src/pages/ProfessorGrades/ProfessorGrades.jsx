import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { ClickSpark } from '../../components/animations';
import toast from 'react-hot-toast';
import './ProfessorGrades.css';

gsap.registerPlugin(ScrollTrigger);

const ProfessorGrades = () => {
  const { user } = useAuth();

  // Specialty selection
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [semesters, setSemesters] = useState([]);

  // Courses
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Students / grades
  const [grades, setGrades] = useState([]); // array of grade objects from API
  const [courseConfig, setCourseConfig] = useState(null); // course configuration from API

  // Search & filter
  const [searchCode, setSearchCode] = useState('');
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  // Loading / error states
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [errorSpecialties, setErrorSpecialties] = useState(null);
  const [errorCourses, setErrorCourses] = useState(null);
  const [errorGrades, setErrorGrades] = useState(null);
  const [savingId, setSavingId] = useState(null); // student id being saved
  const [submitting, setSubmitting] = useState(false);

  const tableRef = useRef(null);

  // ── 1. Fetch specialties and semesters on mount ────────────────────────────
  const fetchSpecialties = async () => {
    setLoadingSpecialties(true);
    setErrorSpecialties(null);
    try {
      const res = await api.get('/specialties');
      setSpecialties(res.data.data || []);
    } catch (err) {
      setErrorSpecialties('فشل في تحميل التخصصات');
      console.error('fetchSpecialties error:', err);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/semesters?all=true');
      const allSemesters = res.data.data || [
        { id: 1, semester_name: 'الفصل الدراسي الأول', arabic_name: 'الفصل الدراسي الأول' },
        { id: 2, semester_name: 'الفصل الدراسي الثاني', arabic_name: 'الفصل الدراسي الثاني' }
      ];
      
      const uniqueNames = new Set();
      const uniqueSemesters = [];
      allSemesters.forEach(sem => {
        const name = sem.arabic_name || sem.semester_name;
        if (!uniqueNames.has(name)) {
          uniqueNames.add(name);
          uniqueSemesters.push(sem);
        }
      });
      setSemesters(uniqueSemesters);
    } catch (err) {
      console.error('fetchSemesters error:', err);
      setSemesters([
        { id: 1, semester_name: 'الفصل الدراسي الأول', arabic_name: 'الفصل الدراسي الأول' },
        { id: 2, semester_name: 'الفصل الدراسي الثاني', arabic_name: 'الفصل الدراسي الثاني' }
      ]);
    }
  };

  useEffect(() => {
    if (user?.role === 'professor' || user?.role === 'admin') {
      fetchSpecialties();
      fetchSemesters();
    }
  }, [user]);

  // ── 2. Fetch courses when specialty selected ───────────────────────────────
  const fetchCourses = async (specialtyId, yearNumber, semesterName) => {
    setLoadingCourses(true);
    setErrorCourses(null);
    setCourses([]);
    setSelectedCourse(null);
    setGrades([]);
    try {
      const params = { specialty_id: specialtyId };
      if (yearNumber) params.year_number = yearNumber;
      if (semesterName) params.semester_name = semesterName;
      const res = await api.get('/grades/professor/courses', { params });
      const data = res.data.data || [];
      setCourses(data);

      // GSAP animation for course cards
      setTimeout(() => {
        gsap.fromTo(
          '.course-card',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      }, 100);
    } catch (err) {
      setErrorCourses('فشل في تحميل المواد');
      console.error('fetchCourses error:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSpecialtyChange = (e) => {
    const val = e.target.value;
    setSelectedSpecialty(val);
    setSelectedYear('');
    setCourses([]);
    setSelectedCourse(null);
    setGrades([]);
  };

  // ── 3. Fetch students+grades when course selected ──────────────────────────
  const fetchGrades = async (courseId) => {
    setLoadingGrades(true);
    setErrorGrades(null);
    setGrades([]);
    setCourseConfig(null);
    try {
      // Use the new endpoint that fetches students by specialty/year/semester
      const res = await api.get('/grades/professor/students-by-course', {
        params: { course_id: courseId },
      });
      const data = res.data.data || [];
      const config = res.data.course_config || null;
      const courseInfo = res.data.course_info || null;
      
      // Store course config
      setCourseConfig(config);
      
      // Normalise: each item may have nested Student info
      const normalised = data.map((g) => ({
        ...g,
        // local editable fields (initialise from existing grade or empty)
        _assignment1_grade: g.grade?.assignment1_grade || '',
        _assignment2_grade: g.grade?.assignment2_grade || '',
        _final_exam_score: g.grade?.final_exam_score != null ? g.grade.final_exam_score : '',
      }));
      setGrades(normalised);

      // GSAP animation for table rows
      setTimeout(() => {
        if (tableRef.current) {
          gsap.fromTo(
            tableRef.current.querySelectorAll('tr'),
            { x: -30, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: { trigger: tableRef.current, start: 'top 80%' },
            }
          );
        }
      }, 200);
    } catch (err) {
      setErrorGrades('فشل في تحميل درجات الطلاب');
      console.error('fetchGrades error:', err);
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSearchCode('');
    setShowFailedOnly(false);
    fetchGrades(course.course_id || course.id);
  };

  // ── 4. Handle local grade field changes ───────────────────────────────────
  const handleGradeChange = (studentId, field, value) => {
    setGrades((prev) =>
      prev.map((g) => (g.student_id === studentId ? { ...g, [field]: value } : g))
    );
  };

  // ── 5. Calculate live preview for a student ───────────────────────────────
  const calculateLivePreview = (grade) => {
    if (!courseConfig) return null;

    const ass1Grade = grade._assignment1_grade;
    const ass2Grade = grade._assignment2_grade;
    const finalScore = parseFloat(grade._final_exam_score) || 0;

    // Convert P/M/D to numeric scores
    const gradeMap = {
      'P': courseConfig.p_value,
      'M': courseConfig.m_value,
      'D': courseConfig.d_value
    };

    const ass1Score = gradeMap[ass1Grade] || 0;
    const ass2Score = gradeMap[ass2Grade] || 0;

    // Calculate total
    const totalScore = ass1Score + ass2Score + finalScore;
    const maxTotal = courseConfig.ass1_max + courseConfig.ass2_max + courseConfig.final_max;
    const totalPercentage = maxTotal > 0 ? (totalScore / maxTotal) * 100 : 0;

    // Determine grade - راسب لائحة إذا لم يتجاوز 60% في الامتحان النهائي
    const finalExamPct = courseConfig.final_max > 0 ? (finalScore / courseConfig.final_max) * 100 : 0;
    const failedFinalExam = finalExamPct < 60 && (ass1Grade || ass2Grade || finalScore > 0); // راسب لائحة إذا دخل أي درجة ولم يتجاوز 60% في النهائي

    let finalResult = '';
    let letterGrade = '';
    if (failedFinalExam) {
      finalResult = 'Fail (لائحة)';
      letterGrade = 'F';
    } else if (totalPercentage >= 85) {
      finalResult = 'Distinction';
      letterGrade = 'A';
    } else if (totalPercentage >= 70) {
      finalResult = 'Merit';
      letterGrade = 'B';
    } else if (totalPercentage >= 50) {
      finalResult = 'Pass';
      letterGrade = 'C';
    } else if (totalPercentage >= 30) {
      finalResult = 'Refer';
      letterGrade = 'D';
    } else {
      finalResult = 'Fail';
      letterGrade = 'F';
    }

    return {
      totalScore: totalScore.toFixed(2),
      totalPercentage: totalPercentage.toFixed(2),
      finalResult,
      letterGrade
    };
  };

  // ── 6. Filtered grades list (must be after calculateLivePreview) ──────────
  const filteredGrades = grades.filter((grade) => {
    const code = (grade.student_code || '').toLowerCase();
    const name = (grade.full_name || '').toLowerCase();
    const search = searchCode.toLowerCase();
    const matchesSearch = !search || code.includes(search) || name.includes(search);

    let matchesFailed = true;
    if (showFailedOnly) {
      const preview = calculateLivePreview(grade);
      if (preview && (grade._assignment1_grade || grade._assignment2_grade || grade._final_exam_score !== '')) {
        matchesFailed = preview.finalResult === 'Fail' || preview.finalResult === 'Refer' || preview.finalResult === 'Fail (لائحة)';
      } else if (grade.grade) {
        const savedTotal = parseFloat(grade.grade.total_percentage || 0);
        const savedFinalScore = parseFloat(grade.grade.final_exam_score || 0);
        const finalMax = courseConfig?.final_max || 150;
        const savedFinalPct = finalMax > 0 ? (savedFinalScore / finalMax) * 100 : 0;
        matchesFailed = savedFinalPct < 60 || savedTotal < 50;
      } else {
        matchesFailed = true;
      }
    }

    return matchesSearch && matchesFailed;
  });

  // ── 7. Save grade per student ──────────────────────────────────────────────
  const handleSaveGrade = async (grade) => {
    // Validate final_exam_score against course config
    if (courseConfig && grade._final_exam_score !== '') {
      const finalScore = parseFloat(grade._final_exam_score);
      if (finalScore < 0 || finalScore > courseConfig.final_max) {
        toast.error(`الدرجة النهائية يجب أن تكون بين 0 و ${courseConfig.final_max}`);
        return;
      }
    }

    setSavingId(grade.student_id);
    try {
      const payload = {
        student_id: grade.student_id,
        course_id: selectedCourse.course_id || selectedCourse.id,
        academic_year_id: selectedCourse.academic_year_id,
        semester_id: selectedCourse.semester_id,
        assignment1_grade: grade._assignment1_grade,
        assignment2_grade: grade._assignment2_grade,
        final_exam_score: grade._final_exam_score !== '' ? Number(grade._final_exam_score) : null,
      };

      const res = await api.post('/grades', payload);
      const saved = res.data.data;

      // Update local state with saved grade
      setGrades((prev) =>
        prev.map((g) =>
          g.student_id === grade.student_id
            ? {
                ...g,
                grade: saved,
                _assignment1_grade: saved.assignment1_grade || '',
                _assignment2_grade: saved.assignment2_grade || '',
                _final_exam_score: saved.final_exam_score != null ? saved.final_exam_score : '',
              }
            : g
        )
      );

      toast.success('تم حفظ الدرجة بنجاح');

      // GSAP success flash
      gsap.to(`.grade-row-${grade.student_id}`, {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        duration: 0.4,
        yoyo: true,
        repeat: 1,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في حفظ الدرجة');
      console.error('handleSaveGrade error:', err);
    } finally {
      setSavingId(null);
    }
  };

  // ── 7. Submit all draft grades for approval ────────────────────────────────
  const handleSubmitGrades = async () => {
    const draftGrades = grades.filter((g) => g.grade?.status === 'draft' && g.grade?.id);
    if (draftGrades.length === 0) {
      toast('لا توجد درجات بحالة مسودة للإرسال', { icon: 'ℹ️' });
      return;
    }

    setSubmitting(true);
    try {
      await Promise.all(
        draftGrades.map((g) => api.post(`/grades/${g.grade.id}/submit-for-approval`))
      );

      setGrades((prev) =>
        prev.map((g) =>
          g.grade?.status === 'draft' ? { ...g, grade: { ...g.grade, status: 'submitted' } } : g
        )
      );

      toast.success('تم إرسال الدرجات للمراجعة بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في إرسال الدرجات');
      console.error('handleSubmitGrades error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusLabel = (status) => {
    const map = {
      draft: 'مسودة',
      submitted: 'بانتظار المراجعة',
      approved: 'معتمدة',
      rejected: 'مرفوضة',
    };
    return map[status] || status || '—';
  };

  const getStatusClass = (status) => {
    const map = {
      draft: 'status-draft',
      submitted: 'status-submitted',
      approved: 'status-approved',
      rejected: 'status-rejected',
    };
    return map[status] || '';
  };

  // ── Access guard ───────────────────────────────────────────────────────────
  if (user?.role !== 'professor' && user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>غير مصرح لك بالوصول إلى هذه الصفحة</h2>
        <p>هذه الصفحة مخصصة للأساتذة والمسؤولين فقط</p>
      </div>
    );
  }

  return (
    <>
      <ClickSpark />
      <motion.div
        className="professor-grades"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="page-header">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            إدارة الدرجات
          </motion.h1>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            إضافة وتعديل درجات الطلاب في المواد المخصصة لك
          </motion.p>
        </div>

        {/* Specialty Dropdown */}
        <motion.div
          className="filters-section"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="filter-group">
            <label>التخصص:</label>
            {loadingSpecialties ? (
              <div className="inline-spinner" />
            ) : errorSpecialties ? (
              <div className="inline-error">
                <span>{errorSpecialties}</span>
                <button className="retry-btn" onClick={fetchSpecialties}>
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <select value={selectedSpecialty} onChange={handleSpecialtyChange}>
                <option value="">— اختر التخصص —</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.arabic_name || s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedSpecialty && (
            <div className="filter-group">
              <label>السنة الدراسية:</label>
              <select value={selectedYear} onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSemester('');
                setCourses([]);
                setSelectedCourse(null);
                setGrades([]);
              }}>
                <option value="">— اختر السنة —</option>
                <option value="1">السنة الأولى</option>
                <option value="2">السنة الثانية</option>
                <option value="3">السنة الثالثة</option>
                <option value="4">السنة الرابعة</option>
              </select>
            </div>
          )}

          {selectedYear && (
            <div className="filter-group">
              <label>الترم:</label>
              <select value={selectedSemester} onChange={(e) => {
                setSelectedSemester(e.target.value);
                if (e.target.value) fetchCourses(selectedSpecialty, selectedYear, e.target.value);
              }}>
                <option value="">— اختر الترم —</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.arabic_name || sem.semester_name}>
                    {sem.arabic_name || sem.semester_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </motion.div>

        {/* Courses Grid */}
        {selectedSpecialty && (
          <motion.div
            className="courses-grid"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3>المواد المخصصة لك</h3>

            {loadingCourses ? (
              <div className="loading">
                <div className="loading-spinner" />
                <p>جاري تحميل المواد...</p>
              </div>
            ) : errorCourses ? (
              <div className="error-block">
                <p>{errorCourses}</p>
                <button className="retry-btn" onClick={() => fetchCourses(selectedSpecialty, selectedYear, selectedSemester)}>
                  إعادة المحاولة
                </button>
              </div>
            ) : courses.length === 0 ? (
              <p className="empty-msg">لا توجد مواد مخصصة لهذا التخصص</p>
            ) : (
              <div className="courses-list">
                {courses.map((course) => {
                  const cid = course.course_id || course.id;
                  const selId = selectedCourse?.course_id || selectedCourse?.id;
                  return (
                    <motion.div
                      key={cid}
                      className={`course-card ${selId === cid ? 'active' : ''}`}
                      onClick={() => handleCourseSelect(course)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="course-icon">
                        <i className="fas fa-book" />
                      </div>
                      <div className="course-info">
                        <h4>{course.Course?.arabic_name || course.arabic_name || course.Course?.course_name || course.course_name}</h4>
                        <p>{course.Course?.course_code || course.course_code}</p>
                        <span>{course.Course?.credit_hours || course.credit_hours} ساعات معتمدة</span>
                        <div className="card-badges">
                          {course.AcademicYear && (
                            <span className="year-badge">{course.AcademicYear.year_label || course.AcademicYear.year}</span>
                          )}
                          {(course.Course?.branch || course.branch) && (course.Course?.branch !== 'Both' && course.branch !== 'Both') && (
                            <span className="branch-badge">
                              {(course.Course?.branch || course.branch) === 'Software' ? 'برمجيات' : 'شبكات'}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Grades Table */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              className="grades-section"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-header">
                <h3>
                  درجات الطلاب —{' '}
                  {selectedCourse.Course?.arabic_name ||
                    selectedCourse.arabic_name ||
                    selectedCourse.Course?.course_name ||
                    selectedCourse.course_name}
                  {selectedCourse.branch && selectedCourse.branch !== 'Both' && (
                    <span className="header-branch-badge">
                      ({selectedCourse.branch === 'Software' ? 'برمجيات' : 'شبكات'})
                    </span>
                  )}
                </h3>
                <motion.button
                  className="submit-grades-btn"
                  onClick={handleSubmitGrades}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={submitting}
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الدرجات للمراجعة'}
                </motion.button>
              </div>

              {loadingGrades ? (
                <div className="loading">
                  <div className="loading-spinner" />
                  <p>جاري تحميل الطلاب...</p>
                </div>
              ) : errorGrades ? (
                <div className="error-block">
                  <p>{errorGrades}</p>
                  <button
                    className="retry-btn"
                    onClick={() => fetchGrades(selectedCourse.course_id || selectedCourse.id)}
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : grades.length === 0 ? (
                <p className="empty-msg">لا يوجد طلاب مسجلون في هذه المادة</p>
              ) : (
                <div className="grades-table-container">
                  {/* Search & Filter Bar */}
                  <div className="grades-filter-bar">
                    <div className="search-box">
                      <i className="fas fa-search search-icon" />
                      <input
                        type="text"
                        placeholder="ابحث بكود الطالب أو اسمه..."
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        className="student-search-input"
                      />
                      {searchCode && (
                        <button className="clear-search" onClick={() => setSearchCode('')}>×</button>
                      )}
                    </div>
                    <button
                      className={`failed-filter-btn ${showFailedOnly ? 'active' : ''}`}
                      onClick={() => setShowFailedOnly((v) => !v)}
                      title="عرض الطلاب الراسبين فقط"
                    >
                      <i className="fas fa-exclamation-triangle" />
                      {showFailedOnly ? 'كل الطلاب' : 'الراسبون فقط'}
                    </button>
                    <span className="results-count">
                      {filteredGrades.length} / {grades.length} طالب
                    </span>
                  </div>
                  {/* Course Config Info */}
                  {courseConfig && (
                    <div className="course-config-info">
                      <h4>إعدادات المادة</h4>
                      <div className="config-grid">
                        <div className="config-item">
                          <span className="config-label">الدرجات القصوى:</span>
                          <span className="config-value">
                            الأعمال 1: {courseConfig.ass1_max} | الأعمال 2: {courseConfig.ass2_max} | النهائي: {courseConfig.final_max}
                          </span>
                        </div>
                        <div className="config-item">
                          <span className="config-label">قيم التقديرات:</span>
                          <span className="config-value">
                            P = {courseConfig.p_value} | M = {courseConfig.m_value} | D = {courseConfig.d_value}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <table ref={tableRef} className="grades-table">
                    <thead>
                      <tr>
                        <th>كود الطالب</th>
                        <th>اسم الطالب</th>
                        <th>الأعمال 1 {courseConfig && `(${courseConfig.ass1_max})`}</th>
                        <th>الأعمال 2 {courseConfig && `(${courseConfig.ass2_max})`}</th>
                        <th>الامتحان النهائي {courseConfig && `(${courseConfig.final_max})`}</th>
                        <th>المعاينة</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrades.length === 0 ? (
                        <tr><td colSpan="8" className="empty-msg">لا توجد نتائج مطابقة</td></tr>
                      ) : null}
                      {filteredGrades.map((grade) => {
                        const livePreview = calculateLivePreview(grade);
                        return (
                          <motion.tr
                            key={grade.student_id}
                            className={`grade-row grade-row-${grade.student_id}`}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <td>{grade.student_code || '—'}</td>
                            <td>{grade.full_name || '—'}</td>
                            <td>
                              <select
                                value={grade._assignment1_grade}
                                onChange={(e) =>
                                  handleGradeChange(grade.student_id, '_assignment1_grade', e.target.value)
                                }
                              >
                                <option value="">—</option>
                                <option value="P">P {courseConfig && `(${courseConfig.p_value})`}</option>
                                <option value="M">M {courseConfig && `(${courseConfig.m_value})`}</option>
                                <option value="D">D {courseConfig && `(${courseConfig.d_value})`}</option>
                              </select>
                            </td>
                            <td>
                              <select
                                value={grade._assignment2_grade}
                                onChange={(e) =>
                                  handleGradeChange(grade.student_id, '_assignment2_grade', e.target.value)
                                }
                              >
                                <option value="">—</option>
                                <option value="P">P {courseConfig && `(${courseConfig.p_value})`}</option>
                                <option value="M">M {courseConfig && `(${courseConfig.m_value})`}</option>
                                <option value="D">D {courseConfig && `(${courseConfig.d_value})`}</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max={courseConfig?.final_max || 150}
                                value={grade._final_exam_score}
                                onChange={(e) =>
                                  handleGradeChange(grade.student_id, '_final_exam_score', e.target.value)
                                }
                                placeholder="0"
                              />
                            </td>
                            <td>
                              {livePreview && (grade._assignment1_grade || grade._assignment2_grade || grade._final_exam_score) ? (
                                <div className="live-preview">
                                  <div className="preview-score">{livePreview.totalScore} / {courseConfig ? (courseConfig.ass1_max + courseConfig.ass2_max + courseConfig.final_max) : 210}</div>
                                  <div className="preview-percentage">{livePreview.totalPercentage}%</div>
                                  <div className={`preview-grade grade-${livePreview.letterGrade}`}>
                                    {livePreview.letterGrade} - {livePreview.finalResult}
                                  </div>
                                </div>
                              ) : (
                                <span className="preview-empty">—</span>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${getStatusClass(grade.grade?.status)}`}>
                                {getStatusLabel(grade.grade?.status)}
                              </span>
                            </td>
                            <td>
                              <motion.button
                                className="save-btn"
                                onClick={() => handleSaveGrade(grade)}
                                disabled={savingId === grade.student_id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {savingId === grade.student_id ? 'حفظ...' : 'حفظ'}
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default ProfessorGrades;
