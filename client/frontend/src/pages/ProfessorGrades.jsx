import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import { useGSAP } from '../hooks/useGSAP';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import './ProfessorGrades.css';

gsap.registerPlugin(ScrollTrigger);

const ProfessorGrades = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('Fall');

  const gsapInstance = useGSAP();
  const tableRef = useRef(null);
  const formRef = useRef(null);

  // Fetch professor's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Mock API call - in real app, fetch from API
        const mockCourses = [
          {
            id: 1,
            course_code: 'ICT101',
            course_name: 'Programming Fundamentals',
            arabic_name: 'أساسيات البرمجة',
            credit_hours: 3,
            semester_level: 1
          },
          {
            id: 2,
            course_code: 'ICT103',
            course_name: 'Web Development',
            arabic_name: 'تطوير تطبيقات الويب',
            credit_hours: 3,
            semester_level: 2
          }
        ];

        setCourses(mockCourses);

        // GSAP animation for course cards
        setTimeout(() => {
          gsap.fromTo('.course-card',
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out"
            }
          );
        }, 100);

      } catch (error) {
        toast.error('فشل في تحميل المواد');
        console.error('Fetch courses error:', error);
      }
    };

    if (user?.role === 'professor') {
      fetchCourses();
    }
  }, [user]);

  // Fetch students for selected course
  const fetchStudents = async (courseId) => {
    setLoading(true);
    try {
      // Mock API call - in real app, fetch from API
      const mockStudents = [
        {
          id: 1,
          enrollment_id: 101,
          student_code: 'NCTU-ICT-001',
          full_name: 'أحمد علي محمود',
          grade: {
            assignment1_score: 25,
            assignment2_score: 28,
            final_exam_score: 140,
            total_score: 193,
            total_percentage: 91.9,
            letter_grade: 'A-',
            result: 'Distinction'
          }
        },
        {
          id: 2,
          enrollment_id: 102,
          student_code: 'NCTU-ICT-002',
          full_name: 'منى حسن إبراهيم',
          grade: null // No grade yet
        }
      ];

      setStudents(mockStudents);

      // GSAP animation for table
      setTimeout(() => {
        if (tableRef.current) {
          gsap.fromTo(tableRef.current.querySelectorAll('tr'),
            { x: -30, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.05,
              ease: "power2.out",
              scrollTrigger: {
                trigger: tableRef.current,
                start: "top 80%"
              }
            }
          );
        }
      }, 200);

    } catch (error) {
      toast.error('فشل في تحميل الطلاب');
      console.error('Fetch students error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchStudents(course.id);
  };

  const handleGradeChange = (studentId, field, value) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? {
              ...student,
              grade: {
                ...student.grade,
                [field]: parseFloat(value) || 0
              }
            }
          : student
      )
    );
  };

  const calculateGrade = (assignment1, assignment2, final) => {
    const total = (assignment1 || 0) + (assignment2 || 0) + (final || 0);
    const percentage = total / 210 * 100;

    let letterGrade = 'F';
    let result = 'Fail';
    let gradePoint = 0;

    if (percentage >= 97) {
      letterGrade = 'A+';
      gradePoint = 4.0;
      result = 'Distinction';
    } else if (percentage >= 93) {
      letterGrade = 'A';
      gradePoint = 4.0;
      result = 'Distinction';
    } else if (percentage >= 90) {
      letterGrade = 'A-';
      gradePoint = 3.7;
      result = 'Distinction';
    } else if (percentage >= 87) {
      letterGrade = 'B+';
      gradePoint = 3.3;
      result = 'Merit';
    } else if (percentage >= 83) {
      letterGrade = 'B';
      gradePoint = 3.0;
      result = 'Merit';
    } else if (percentage >= 80) {
      letterGrade = 'B-';
      gradePoint = 2.7;
      result = 'Merit';
    } else if (percentage >= 77) {
      letterGrade = 'C+';
      gradePoint = 2.3;
      result = 'Pass';
    } else if (percentage >= 73) {
      letterGrade = 'C';
      gradePoint = 2.0;
      result = 'Pass';
    } else if (percentage >= 70) {
      letterGrade = 'C-';
      gradePoint = 1.7;
      result = 'Pass';
    } else if (percentage >= 67) {
      letterGrade = 'D+';
      gradePoint = 1.3;
      result = 'Referral';
    } else if (percentage >= 63) {
      letterGrade = 'D';
      gradePoint = 1.0;
      result = 'Referral';
    } else if (percentage >= 60) {
      letterGrade = 'D-';
      gradePoint = 0.7;
      result = 'Referral';
    }

    return {
      total_score: total,
      total_percentage: percentage,
      letter_grade: letterGrade,
      grade_point: gradePoint,
      result
    };
  };

  const handleSaveGrade = async (student) => {
    setSaving(true);
    try {
      const gradeData = {
        student_id: student.id,
        course_id: selectedCourse.id,
        academic_year: academicYear,
        semester,
        assignment1_score: student.grade?.assignment1_score || 0,
        assignment2_score: student.grade?.assignment2_score || 0,
        final_exam_score: student.grade?.final_exam_score || 0
      };

      // Calculate grade automatically
      const calculatedGrade = calculateGrade(
        gradeData.assignment1_score,
        gradeData.assignment2_score,
        gradeData.final_exam_score
      );

      Object.assign(gradeData, calculatedGrade);

      // Mock API call - in real app, send to API
      console.log('Saving grade:', gradeData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setStudents(prevStudents =>
        prevStudents.map(s =>
          s.id === student.id
            ? { ...s, grade: { ...gradeData, status: 'draft' } }
            : s
        )
      );

      toast.success('تم حفظ الدرجة بنجاح');

      // GSAP success animation
      gsap.to(`.grade-row-${student.id}`, {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        duration: 0.5,
        yoyo: true,
        repeat: 1
      });

    } catch (error) {
      toast.error('فشل في حفظ الدرجة');
      console.error('Save grade error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitGrades = async () => {
    try {
      // Mock API call to submit all grades for approval
      toast.success('تم إرسال الدرجات للمراجعة');

      // Update status to submitted
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          grade: student.grade ? { ...student.grade, status: 'submitted' } : null
        }))
      );

    } catch (error) {
      toast.error('فشل في إرسال الدرجات');
      console.error('Submit grades error:', error);
    }
  };

  if (user?.role !== 'professor') {
    return (
      <div className="access-denied">
        <h2>غير مصرح لك بالوصول إلى هذه الصفحة</h2>
        <p>هذه الصفحة مخصصة للأساتذة فقط</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div
        className="professor-grades"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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

      {/* Academic Year and Semester Selection */}
      <motion.div
        className="filters-section"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="filter-group">
          <label>السنة الدراسية:</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(parseInt(e.target.value))}
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>
        <div className="filter-group">
          <label>الفصل الدراسي:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="Fall">خريف</option>
            <option value="Spring">ربيع</option>
            <option value="Summer">صيف</option>
          </select>
        </div>
      </motion.div>

      {/* Courses Grid */}
      <motion.div
        className="courses-grid"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3>المواد المخصصة لك</h3>
        <div className="courses-list">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              className={`course-card ${selectedCourse?.id === course.id ? 'active' : ''}`}
              onClick={() => handleCourseSelect(course)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="course-icon">
                <i className="fas fa-book"></i>
              </div>
              <div className="course-info">
                <h4>{course.arabic_name}</h4>
                <p>{course.course_code}</p>
                <span>{course.credit_hours} ساعات معتمدة</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Students Grades Table */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            ref={formRef}
            className="grades-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-header">
              <h3>درجات الطلاب - {selectedCourse.arabic_name}</h3>
              <motion.button
                className="submit-grades-btn"
                onClick={handleSubmitGrades}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={saving}
              >
                إرسال الدرجات للمراجعة
              </motion.button>
            </div>

            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>جاري تحميل الطلاب...</p>
              </div>
            ) : (
              <div className="grades-table-container">
                <table ref={tableRef} className="grades-table">
                  <thead>
                    <tr>
                      <th>كود الطالب</th>
                      <th>اسم الطالب</th>
                      <th>الأعمال 1 (30)</th>
                      <th>الأعمال 2 (30)</th>
                      <th>الامتحان النهائي (150)</th>
                      <th>المجموع</th>
                      <th>النسبة</th>
                      <th>الدرجة</th>
                      <th>النتيجة</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <motion.tr
                        key={student.id}
                        className={`grade-row grade-row-${student.id}`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <td>{student.student_code}</td>
                        <td>{student.full_name}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={student.grade?.assignment1_score || ''}
                            onChange={(e) => handleGradeChange(student.id, 'assignment1_score', e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={student.grade?.assignment2_score || ''}
                            onChange={(e) => handleGradeChange(student.id, 'assignment2_score', e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="150"
                            value={student.grade?.final_exam_score || ''}
                            onChange={(e) => handleGradeChange(student.id, 'final_exam_score', e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          {student.grade ? calculateGrade(
                            student.grade.assignment1_score,
                            student.grade.assignment2_score,
                            student.grade.final_exam_score
                          ).total_score : 0}
                        </td>
                        <td>
                          {student.grade ? calculateGrade(
                            student.grade.assignment1_score,
                            student.grade.assignment2_score,
                            student.grade.final_exam_score
                          ).total_percentage.toFixed(1) + '%' : '0%'}
                        </td>
                        <td>
                          {student.grade ? calculateGrade(
                            student.grade.assignment1_score,
                            student.grade.assignment2_score,
                            student.grade.final_exam_score
                          ).letter_grade : '-'}
                        </td>
                        <td>
                          <span className={`result-badge ${
                            student.grade ? calculateGrade(
                              student.grade.assignment1_score,
                              student.grade.assignment2_score,
                              student.grade.final_exam_score
                            ).result.toLowerCase() : 'fail'
                          }`}>
                            {student.grade ? calculateGrade(
                              student.grade.assignment1_score,
                              student.grade.assignment2_score,
                              student.grade.final_exam_score
                            ).result : 'Fail'}
                          </span>
                        </td>
                        <td>
                          <motion.button
                            className="save-btn"
                            onClick={() => handleSaveGrade(student)}
                            disabled={saving}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {saving ? 'حفظ...' : 'حفظ'}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
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