import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Table, Modal } from '../../components/common';
import { coursesAPI, professorsAPI, studentAPI } from '../../services/apiService';
import styles from './YearManagement.module.css';

export default function YearManagement() {
  const { code, yearNum } = useParams();
  const navigate = useNavigate();

  // State
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses'); // courses, professors, students

  // Courses state
  const [courses, setCourses] = useState([]);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_name: '',
    arabic_name: '',
    credit_hours: '',
    semester_id: ''
  });

  // Professors state
  const [professors, setProfessors] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    professor_id: '',
    course_id: ''
  });
  const [allProfessors, setAllProfessors] = useState([]);

  // Students state
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all'); // For ICT year 3 & 4

  const yearLabels = {
    1: 'السنة الأولى',
    2: 'السنة الثانية',
    3: 'السنة الثالثة',
    4: 'السنة الرابعة'
  };

  const semesters = [
    { id: 1, name: 'الفصل الأول' },
    { id: 2, name: 'الفصل الثاني' }
  ];

  const academicStatuses = [
    { value: 'all', label: 'الكل' },
    { value: 'active', label: 'نشط' },
    { value: 'graduated', label: 'متخرج' },
    { value: 'suspended', label: 'موقوف' },
    { value: 'dropped', label: 'منسحب' }
  ];

  const tracks = [
    { value: 'all', label: 'جميع المسارات' },
    { value: 'Networks', label: 'Networks' },
    { value: 'Software', label: 'Software' }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchSpecialtyData();
  }, [code, yearNum]);

  useEffect(() => {
    if (specialty) {
      if (activeTab === 'courses') fetchCourses();
      else if (activeTab === 'professors') fetchProfessors();
      else if (activeTab === 'students') fetchStudents();
    }
  }, [specialty, activeTab, statusFilter, trackFilter]);

  const fetchSpecialtyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/specialties');
      const specialtyData = res.data.data?.find(s => s.code === code);
      
      if (!specialtyData) {
        setError('التخصص غير موجود');
        return;
      }

      setSpecialty(specialtyData);
    } catch (err) {
      console.error('Error fetching specialty:', err);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // ==================== COURSES SECTION ====================
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`/admin/courses`, {
        params: {
          specialty_id: specialty.id,
          year_number: yearNum
        }
      });
      setCourses(res.data.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      showToast('حدث خطأ أثناء تحميل المواد', 'error');
    }
  };

  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        course_code: course.course_code,
        course_name: course.course_name,
        arabic_name: course.arabic_name || '',
        credit_hours: course.credit_hours,
        semester_id: course.semester_id || ''
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        course_code: '',
        course_name: '',
        arabic_name: '',
        credit_hours: '',
        semester_id: ''
      });
    }
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    
    if (!courseForm.course_code || !courseForm.course_name || !courseForm.credit_hours || !courseForm.semester_id) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    try {
      // Get academic year ID for this specialty and year number
      const yearsRes = await axios.get(`/admin/academic-years?specialty_id=${specialty.id}`);
      const years = yearsRes.data.data || [];
      const matchedYear = years.find(y => String(y.year_number) === String(yearNum));
      
      if (!matchedYear) {
        showToast('لم يتم العثور على السنة الدراسية', 'error');
        return;
      }

      // Get semester ID
      const semsRes = await axios.get(`/admin/semesters?academic_year_id=${matchedYear.id}`);
      const sems = semsRes.data.data || [];
      const semester = sems.find(s => s.id === parseInt(courseForm.semester_id));
      
      if (!semester) {
        showToast('لم يتم العثور على الفصل الدراسي', 'error');
        return;
      }

      const payload = {
        course_code: courseForm.course_code,
        course_name: courseForm.course_name,
        arabic_name: courseForm.arabic_name,
        specialty_id: specialty.id,
        academic_year_id: matchedYear.id,
        semester_id: semester.id,
        credit_hours: parseInt(courseForm.credit_hours),
        is_active: true
      };

      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, payload);
        showToast('تم تحديث المادة بنجاح', 'success');
      } else {
        await coursesAPI.create(payload);
        showToast('تم إضافة المادة بنجاح', 'success');
      }

      setCourseModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error('Error saving course:', err);
      showToast(err.response?.data?.message || 'حدث خطأ أثناء حفظ المادة', 'error');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟')) return;

    try {
      await coursesAPI.delete(courseId);
      showToast('تم حذف المادة بنجاح', 'success');
      fetchCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      showToast(err.response?.data?.message || 'حدث خطأ أثناء حذف المادة', 'error');
    }
  };

  // ==================== PROFESSORS SECTION ====================
  const fetchProfessors = async () => {
    try {
      const res = await axios.get(`/admin/professors`, {
        params: {
          specialty_id: specialty.id,
          year_number: yearNum
        }
      });
      setProfessors(res.data.data || []);

      // Fetch all professors for assignment dropdown
      const allProfsRes = await professorsAPI.getAll();
      setAllProfessors(allProfsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching professors:', err);
      showToast('حدث خطأ أثناء تحميل الأساتذة', 'error');
    }
  };

  const handleOpenAssignModal = () => {
    setAssignForm({ professor_id: '', course_id: '' });
    setAssignModalOpen(true);
  };

  const handleAssignProfessor = async (e) => {
    e.preventDefault();

    if (!assignForm.professor_id || !assignForm.course_id) {
      showToast('يرجى اختيار الأستاذ والمادة', 'error');
      return;
    }

    try {
      // Get academic year and semester for the course
      const course = courses.find(c => c.id === parseInt(assignForm.course_id));
      if (!course) {
        showToast('المادة غير موجودة', 'error');
        return;
      }

      // Use the correct endpoint: POST /api/admin/professors/:id/courses
      await axios.post(`/admin/professors/${assignForm.professor_id}/courses`, {
        course_id: assignForm.course_id,
        academic_year_id: course.academic_year_id,
        semester_id: course.semester_id,
        is_primary: true
      });
      
      showToast('تم تعيين الأستاذ للمادة بنجاح', 'success');
      setAssignModalOpen(false);
      fetchProfessors();
    } catch (err) {
      console.error('Error assigning professor:', err);
      showToast(err.response?.data?.message || 'حدث خطأ أثناء تعيين الأستاذ', 'error');
    }
  };

  // ==================== STUDENTS SECTION ====================
  const fetchStudents = async () => {
    try {
      const params = {
        specialty_id: specialty.id,
        current_year: yearNum
      };

      if (statusFilter !== 'all') {
        params.academic_status = statusFilter;
      }

      const res = await axios.get(`/admin/students`, { params });
      let studentsData = res.data.data || [];

      // Filter by track for ICT year 3 & 4
      if (specialty.code === 'ICT' && (yearNum === '3' || yearNum === '4') && trackFilter !== 'all') {
        studentsData = studentsData.filter(s => s.track === trackFilter);
      }

      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching students:', err);
      showToast('حدث خطأ أثناء تحميل الطلاب', 'error');
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  const showToast = (message, type) => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast(message);
    }
  };

  const renderCoursesTab = () => {
    const columns = [
      { key: 'course_code', label: 'كود المادة' },
      { key: 'arabic_name', label: 'الاسم بالعربي', render: (val, row) => val || row.course_name },
      { key: 'course_name', label: 'الاسم بالإنجليزي' },
      { key: 'credit_hours', label: 'الساعات المعتمدة' },
      {
        key: 'semester_id',
        label: 'الفصل الدراسي',
        render: (val) => {
          const sem = semesters.find(s => s.id === val);
          return sem ? sem.name : 'غير محدد';
        }
      }
    ];

    const actions = [
      { label: 'تعديل', onClick: handleOpenCourseModal, variant: 'primary' },
      { label: 'حذف', onClick: (course) => handleDeleteCourse(course.id), variant: 'danger' }
    ];

    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <h3>المواد الدراسية</h3>
          <button className={styles.addBtn} onClick={() => handleOpenCourseModal()}>
            + إضافة مادة
          </button>
        </div>
        <Table columns={columns} data={courses} actions={actions} noDataMessage="لا توجد مواد لهذه السنة" />
      </div>
    );
  };

  const renderProfessorsTab = () => {
    const columns = [
      { key: 'full_name', label: 'اسم الأستاذ', render: (val, row) => row.User?.full_name || 'غير محدد' },
      {
        key: 'courses',
        label: 'المواد المعينة',
        render: (val, row) => {
          const assignedCourses = row.ProfessorCourses || [];
          return assignedCourses.length > 0
            ? assignedCourses.map(pc => pc.Course?.arabic_name || pc.Course?.course_name).join(', ')
            : 'لا توجد مواد';
        }
      },
      { key: 'email', label: 'البريد الإلكتروني', render: (val, row) => row.User?.email || 'غير محدد' }
    ];

    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <h3>الأساتذة</h3>
          <button className={styles.addBtn} onClick={handleOpenAssignModal}>
            + تعيين أستاذ لمادة
          </button>
        </div>
        <Table columns={columns} data={professors} noDataMessage="لا يوجد أساتذة معينون لهذه السنة" />
      </div>
    );
  };

  const renderStudentsTab = () => {
    const showTrackFilter = specialty?.code === 'ICT' && (yearNum === '3' || yearNum === '4');

    const columns = [
      { key: 'student_code', label: 'كود الطالب' },
      { key: 'full_name', label: 'الاسم', render: (val, row) => row.User?.full_name || 'غير محدد' },
      { key: 'national_id', label: 'الرقم القومي' },
      {
        key: 'academic_status',
        label: 'الحالة الأكاديمية',
        render: (status) => {
          const statusLabels = {
            active: 'نشط',
            graduated: 'متخرج',
            suspended: 'موقوف',
            dropped: 'منسحب'
          };
          return statusLabels[status] || status;
        }
      }
    ];

    // Add track column for ICT year 3 & 4
    if (showTrackFilter) {
      columns.push({
        key: 'track',
        label: 'المسار',
        render: (track) => track || 'غير محدد'
      });
    }

    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <h3>الطلاب</h3>
          <div className={styles.filters}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {academicStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            {showTrackFilter && (
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className={styles.filterSelect}
              >
                {tracks.map(track => (
                  <option key={track.value} value={track.value}>{track.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <Table columns={columns} data={students} noDataMessage="لا يوجد طلاب في هذه السنة" />
      </div>
    );
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
          <button onClick={() => navigate(`/admin/specialty/${code}`)} className={styles.backButton}>
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button onClick={() => navigate(`/admin/specialty/${code}`)} className={styles.backBtn}>
          ← العودة
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>
            {specialty.arabic_name} - {yearLabels[yearNum]}
          </h1>
          <p className={styles.subtitle}>{specialty.name} - Year {yearNum}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'courses' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          المواد
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'professors' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('professors')}
        >
          الأساتذة
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'students' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('students')}
        >
          الطلاب
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' && renderCoursesTab()}
      {activeTab === 'professors' && renderProfessorsTab()}
      {activeTab === 'students' && renderStudentsTab()}

      {/* Course Modal */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={editingCourse ? 'تعديل المادة' : 'إضافة مادة جديدة'}
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={() => setCourseModalOpen(false)}>
              إلغاء
            </button>
            <button className={styles.submitBtn} onClick={handleSaveCourse}>
              {editingCourse ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        }
      >
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label>كود المادة *</label>
            <input
              type="text"
              value={courseForm.course_code}
              onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
              placeholder="مثال: ICT101"
              disabled={Boolean(editingCourse)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>اسم المادة بالإنجليزي *</label>
            <input
              type="text"
              value={courseForm.course_name}
              onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
              placeholder="مثال: Introduction to Programming"
            />
          </div>

          <div className={styles.formGroup}>
            <label>اسم المادة بالعربي</label>
            <input
              type="text"
              value={courseForm.arabic_name}
              onChange={(e) => setCourseForm({ ...courseForm, arabic_name: e.target.value })}
              placeholder="مثال: مقدمة في البرمجة"
            />
          </div>

          <div className={styles.formGroup}>
            <label>الساعات المعتمدة *</label>
            <input
              type="number"
              value={courseForm.credit_hours}
              onChange={(e) => setCourseForm({ ...courseForm, credit_hours: e.target.value })}
              placeholder="مثال: 3"
              min="1"
              max="10"
            />
          </div>

          <div className={styles.formGroup}>
            <label>الفصل الدراسي *</label>
            <select
              value={courseForm.semester_id}
              onChange={(e) => setCourseForm({ ...courseForm, semester_id: e.target.value })}
            >
              <option value="">اختر الفصل</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.name}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Assign Professor Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="تعيين أستاذ لمادة"
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={() => setAssignModalOpen(false)}>
              إلغاء
            </button>
            <button className={styles.submitBtn} onClick={handleAssignProfessor}>
              تعيين
            </button>
          </div>
        }
      >
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label>الأستاذ *</label>
            <select
              value={assignForm.professor_id}
              onChange={(e) => setAssignForm({ ...assignForm, professor_id: e.target.value })}
            >
              <option value="">اختر الأستاذ</option>
              {allProfessors.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.User?.full_name || `Professor ${prof.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>المادة *</label>
            <select
              value={assignForm.course_id}
              onChange={(e) => setAssignForm({ ...assignForm, course_id: e.target.value })}
            >
              <option value="">اختر المادة</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.arabic_name || course.course_name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
