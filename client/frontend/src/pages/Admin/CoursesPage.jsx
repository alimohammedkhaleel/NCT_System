import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Table, Modal } from '../../components/common';
import api, { coursesAPI, academicYearsAPI, semestersAPI } from '../../services/apiService';
import styles from './CoursesPage.module.css';

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const specialtyFilter = searchParams.get('specialty');
  const trackFilter = searchParams.get('track');

  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // all courses unfiltered
  const [specialties, setSpecialties] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Active filters
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    arabic_name: '',
    specialty_id: '',
    academic_year_id: '',
    semester_id: '',
    credit_hours: '',
    branch: '',
    is_active: true
  });

  // Fetch courses and metadata
  useEffect(() => {
    fetchData();
  }, [specialtyFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, specialtiesRes] = await Promise.all([
        // Pass is_active=false to get ALL courses (active and inactive)
        api.get('/admin/courses', { params: { is_active: undefined } }).catch(e => { 
          console.error('courses error:', e.response?.status, e.response?.data); 
          return { data: { data: [] } }; 
        }),
        api.get('/specialties').catch(e => { 
          console.error('specialties error:', e.response?.status, e.response?.data); 
          return { data: { data: [] } }; 
        })
      ]);

      const specialtiesData = specialtiesRes.data.data || [];
      const finalSpecialties = specialtiesData.length > 0 ? specialtiesData : [
        { id: 1, code: 'MCT', name: 'Mechatronics Technology', arabic_name: 'تكنولوجيا الميكاترونكس' },
        { id: 2, code: 'AUT', name: 'Autotronics Technology', arabic_name: 'تكنولوجيا الأوتوترونكس' },
        { id: 3, code: 'ICT', name: 'Information Technology', arabic_name: 'تكنولوجيا المعلومات' },
        { id: 4, code: 'PRO', name: 'Prosthetics Technology', arabic_name: 'تكنولوجيا الأطراف الصناعية' },
        { id: 5, code: 'OIL', name: 'Oil Production Technology', arabic_name: 'تكنولوجيا إنتاج البترول' },
        { id: 6, code: 'REN', name: 'Renewable Energy Technology', arabic_name: 'تكنولوجيا الطاقة المتجددة' },
      ];
      setSpecialties(finalSpecialties);

      // Filter courses by specialty if filter is active
      let allCoursesData = coursesRes.data.data || [];
      if (specialtyFilter) {
        const matchedSpec = finalSpecialties.find(s => s.code === specialtyFilter);
        if (matchedSpec) {
          allCoursesData = allCoursesData.filter(c => c.specialty_id === matchedSpec.id);
        }
      }
      setAllCourses(allCoursesData);
      setCourses(allCoursesData);

      // Static year/semester data — no need to fetch 24 records from API
      setAcademicYears([
        { id: 1, year_number: 1 },
        { id: 2, year_number: 2 },
        { id: 3, year_number: 3 },
        { id: 4, year_number: 4 }
      ]);
      setSemesters([
        { id: 1, semester_name: 'الفصل الأول' },
        { id: 2, semester_name: 'الفصل الثاني' }
      ]);
    } catch (error) {
      showNotification('Error fetching courses and metadata', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Apply filters whenever filter state or allCourses changes
  useEffect(() => {
    let filtered = [...allCourses];
    if (filterSpecialty) {
      filtered = filtered.filter(c => String(c.specialty_id) === String(filterSpecialty));
    }
    if (filterYear) {
      filtered = filtered.filter(c => c.AcademicYear && String(c.AcademicYear.year_number) === String(filterYear));
    }
    if (filterSemester) {
      filtered = filtered.filter(c => {
        const semName = filterSemester === '1' ? 'الفصل الأول' : 'الفصل الثاني';
        return c.Semester?.semester_name === semName || String(c.semester_id) === String(filterSemester);
      });
    }
    setCourses(filtered);
  }, [filterSpecialty, filterYear, filterSemester, allCourses]);

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingId(course.id);
      setFormData({
        course_code: course.course_code,
        course_name: course.course_name,
        arabic_name: course.arabic_name || '',
        specialty_id: course.specialty_id,
        academic_year_id: course.academic_year_id,
        semester_id: course.semester_id,
        credit_hours: course.credit_hours,
        branch: course.branch || '',
        is_active: course.is_active
      });
    } else {
      setEditingId(null);
      const defaultSpecialtyId = specialties.find(s => s.code === specialtyFilter)?.id || '';
      setFormData({
        course_code: '',
        course_name: '',
        arabic_name: '',
        specialty_id: defaultSpecialtyId,
        academic_year_id: '',
        semester_id: '',
        credit_hours: '',
        branch: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      course_code: '',
      course_name: '',
      arabic_name: '',
      specialty_id: '',
      academic_year_id: '',
      semester_id: '',
      credit_hours: '',
      is_active: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.course_code || !formData.course_name || !formData.specialty_id || !formData.academic_year_id || !formData.semester_id) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    try {
      if (editingId) {
        await coursesAPI.update(editingId, {
          course_name: formData.course_name,
          arabic_name: formData.arabic_name,
          credit_hours: formData.credit_hours,
          branch: formData.branch || null,
          is_active: formData.is_active
        });
        showNotification('Course updated successfully', 'success');
      } else {
        // Fetch the real academic_year_id and semester_id from the API based on specialty + year_number
        let realAcademicYearId = formData.academic_year_id;
        let realSemesterId = formData.semester_id;
        
        try {
          const yearsRes = await api.get(`/admin/academic-years?specialty_id=${formData.specialty_id}`);
          const years = yearsRes.data.data || [];
          const matchedYear = years.find(y => String(y.year_number) === String(formData.academic_year_id));
          
          if (matchedYear) {
            realAcademicYearId = matchedYear.id;
            
            // Fetch semesters for this academic year
            const semsRes = await api.get(`/admin/semesters?academic_year_id=${matchedYear.id}`);
            const sems = semsRes.data.data || [];
            
            // Find semester by semester_name match
            const selectedSemesterName = semesters.find(s => String(s.id) === String(formData.semester_id))?.semester_name;
            const matchedSemester = sems.find(s => s.semester_name === selectedSemesterName);
            
            if (matchedSemester) {
              realSemesterId = matchedSemester.id;
            } else {
              console.warn('Could not find matching semester, using first available');
              realSemesterId = sems[0]?.id || formData.semester_id;
            }
          }
        } catch (err) {
          console.warn('Could not resolve academic year/semester IDs:', err);
        }

        await coursesAPI.create({
          course_code: formData.course_code,
          course_name: formData.course_name,
          arabic_name: formData.arabic_name,
          specialty_id: formData.specialty_id,
          academic_year_id: realAcademicYearId,
          semester_id: realSemesterId,
          credit_hours: formData.credit_hours,
          branch: formData.branch || null,
          is_active: formData.is_active
        });
        showNotification('Course created successfully', 'success');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error saving course', 'error');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await coursesAPI.delete(courseId);
        toast.success('Course deleted successfully');
        fetchData();
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Error deleting course';
        toast.error(errorMsg);
        console.error('Delete error:', error);
      }
    }
  };

  const columns = [
    { key: 'course_code', label: 'Code' },
    { key: 'course_name', label: 'Course Name' },
    {
      key: 'specialty_id',
      label: 'Specialty',
      render: (specialtyId) => {
        const specialty = specialties.find(s => s.id === specialtyId);
        return specialty ? (specialty.arabic_name || specialty.name) : 'N/A';
      }
    },
    {
      key: 'AcademicYear',
      label: 'Academic Year',
      render: (year) => {
        if (!year) return 'N/A';
        const labels = { 1: 'السنة الأولى', 2: 'السنة الثانية', 3: 'السنة الثالثة', 4: 'السنة الرابعة' };
        return labels[year.year_number] || `السنة ${year.year_number}`;
      }
    },
    {
      key: 'Semester',
      label: 'Semester',
      render: (semester, course) => {
        // Try both Semester (from association) and semester_id (raw field)
        if (semester && semester.semester_name) {
          return semester.semester_name;
        }
        // Fallback: try to match semester_id with local semesters array
        if (course.semester_id) {
          const localSem = semesters.find(s => s.id === course.semester_id);
          return localSem ? localSem.semester_name : `Semester ${course.semester_id}`;
        }
        return 'N/A';
      }
    },
    { key: 'credit_hours', label: 'Credits' },
    {
      key: 'branch',
      label: 'Branch',
      render: (branch, course) => {
        const specialty = specialties.find(s => s.id === course.specialty_id);
        if (!specialty || specialty.code !== 'ICT') return 'N/A';
        if (!branch) return 'All Branches';
        if (branch === 'Both') return 'Both (S & N)';
        return branch;
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (isActive) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: isActive ? '#d4edda' : '#f8d7da',
          color: isActive ? '#155724' : '#721c24'
        }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (course) => handleOpenModal(course),
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (course) => handleDelete(course.id),
      variant: 'danger'
    }
  ];

  return (
    <div className={styles.pageWrapper}>
      {notification && (
        <div className={`${styles.notification} ${notification.type === 'error' ? styles.notificationError : styles.notificationSuccess}`}>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className={styles.notificationCloseBtn}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {specialtyFilter
            ? `مواد تخصص: ${specialties.find(s => s.code === specialtyFilter)?.arabic_name || specialtyFilter}`
            : 'Courses Management'}
        </h1>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          + Add New Course
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', padding: '16px', background: 'rgba(179,110,255,0.06)', borderRadius: '10px', border: '1px solid rgba(179,110,255,0.15)' }}>
        <span style={{ fontWeight: 600, color: 'var(--white-dim)', fontSize: '14px', minWidth: '60px' }}>🔍 فلتر:</span>
        <select
          value={filterSpecialty}
          onChange={e => setFilterSpecialty(e.target.value)}
          className={styles.select}
          style={{ minWidth: '180px', flex: 1 }}
        >
          <option value="">— جميع التخصصات —</option>
          {specialties.map(s => (
            <option key={s.id} value={s.id}>{s.arabic_name || s.name}</option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className={styles.select}
          style={{ minWidth: '150px', flex: 1 }}
        >
          <option value="">— جميع السنوات —</option>
          <option value="1">السنة الأولى</option>
          <option value="2">السنة الثانية</option>
          <option value="3">السنة الثالثة</option>
          <option value="4">السنة الرابعة</option>
        </select>
        <select
          value={filterSemester}
          onChange={e => setFilterSemester(e.target.value)}
          className={styles.select}
          style={{ minWidth: '150px', flex: 1 }}
        >
          <option value="">— جميع الترمات —</option>
          <option value="1">الفصل الأول</option>
          <option value="2">الفصل الثاني</option>
        </select>
        {(filterSpecialty || filterYear || filterSemester) && (
          <button
            onClick={() => { setFilterSpecialty(''); setFilterYear(''); setFilterSemester(''); }}
            style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            ✕ مسح الفلتر
          </button>
        )}
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginRight: 'auto' }}>
          {courses.length} / {allCourses.length} مادة
        </span>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading courses...</p>
        </div>
      ) : (
        <Table columns={columns} data={courses} actions={actions} />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Course' : 'Add New Course'}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className={styles.cancelBtn} onClick={handleCloseModal}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <form>
          <div className={styles.formGroup}>
            <label className={styles.label}>Course Code *</label>
            <input
              type="text"
              name="course_code"
              className={styles.input}
              value={formData.course_code}
              onChange={handleInputChange}
              placeholder="e.g., ICT101"
              disabled={Boolean(editingId)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Course Name *</label>
            <input
              type="text"
              name="course_name"
              className={styles.input}
              value={formData.course_name}
              onChange={handleInputChange}
              placeholder="e.g., Introduction to Programming"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Arabic Name</label>
            <input
              type="text"
              name="arabic_name"
              className={styles.input}
              value={formData.arabic_name}
              onChange={handleInputChange}
              placeholder="e.g., مقدمة في البرمجة"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Specialty *</label>
            <select
              name="specialty_id"
              className={styles.select}
              value={formData.specialty_id}
              onChange={handleInputChange}
              disabled={Boolean(editingId)}
            >
              <option value="">Select Specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.arabic_name || specialty.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Academic Year *</label>
            <select
              name="academic_year_id"
              className={styles.select}
              value={formData.academic_year_id}
              onChange={handleInputChange}
              disabled={Boolean(editingId)}
            >
              <option value="">— اختر السنة الدراسية —</option>
              {academicYears.map((year) => (
                <option key={year.year_number} value={year.year_number}>
                  {year.year_number === 1 ? 'السنة الأولى' :
                   year.year_number === 2 ? 'السنة الثانية' :
                   year.year_number === 3 ? 'السنة الثالثة' :
                   year.year_number === 4 ? 'السنة الرابعة' :
                   `السنة ${year.year_number}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Semester *</label>
            <select
              name="semester_id"
              className={styles.select}
              value={formData.semester_id}
              onChange={handleInputChange}
              disabled={Boolean(editingId)}
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.semester_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Credit Hours *</label>
            <input
              type="number"
              name="credit_hours"
              className={styles.input}
              value={formData.credit_hours}
              onChange={handleInputChange}
              placeholder="e.g., 3"
              min="1"
              max="10"
            />
          </div>
          
          {(specialties.find(s => String(s.id) === String(formData.specialty_id))?.code === 'ICT' || 
            specialties.find(s => String(s.id) === String(formData.specialty_id))?.name?.includes('Information')) && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Branch (ICT Only)</label>
              <select
                name="branch"
                className={styles.select}
                value={formData.branch}
                onChange={handleInputChange}
              >
                <option value="">All Branches / للجميع</option>
                <option value="Software">Software / برمجيات</option>
                <option value="Network">Network / شبكات</option>
                <option value="Both">Both / كلاهما</option>
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span>Active</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
