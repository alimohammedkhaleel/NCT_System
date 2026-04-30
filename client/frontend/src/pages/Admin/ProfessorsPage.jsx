import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/apiService';
import { Table, Modal } from '../../components/common';
import styles from './CoursesPage.module.css';

export default function ProfessorsPage() {
  const [searchParams] = useSearchParams();
  const specialtyFilter = searchParams.get('specialty');

  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Search state
  const [search, setSearch] = useState('');

  // Assign course modal filters
  const [assignFilterSpecialty, setAssignFilterSpecialty] = useState('');
  const [assignFilterYear, setAssignFilterYear] = useState('');
  const [assignFilterSemester, setAssignFilterSemester] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    department: '',
    specialization: '',
    specialty_id: '',
    national_id: ''
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [specialtyFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [professorsRes, coursesRes, specialtiesRes] = await Promise.all([
        api.get(specialtyFilter ? `/admin/professors?specialty=${specialtyFilter}` : '/admin/professors'),
        api.get('/admin/courses'),
        api.get('/specialties').catch(() => ({ data: { data: [] } }))
      ]);
      setProfessors(professorsRes.data.data || []);
      setCourses(coursesRes.data.data || []);

      const specsData = specialtiesRes.data.data || [];
      setSpecialties(specsData.length > 0 ? specsData : [
        { id: 1, code: 'MCT', name: 'Mechatronics Technology', arabic_name: 'تكنولوجيا الميكاترونكس' },
        { id: 2, code: 'AUT', name: 'Autotronics Technology', arabic_name: 'تكنولوجيا الأوتوترونكس' },
        { id: 3, code: 'ICT', name: 'Information Technology', arabic_name: 'تكنولوجيا المعلومات' },
        { id: 4, code: 'PRO', name: 'Prosthetics Technology', arabic_name: 'تكنولوجيا الأطراف الصناعية' },
        { id: 5, code: 'OIL', name: 'Oil Production Technology', arabic_name: 'تكنولوجيا إنتاج البترول' },
        { id: 6, code: 'REN', name: 'Renewable Energy Technology', arabic_name: 'تكنولوجيا الطاقة المتجددة' },
      ]);
    } catch (error) {
      showNotification('Error fetching professors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), type === 'error' ? 5000 : 3000);
  };

  // Client-side search filter
  const filteredProfessors = useMemo(() => {
    if (!search.trim()) return professors;
    const q = search.toLowerCase();
    return professors.filter((p) =>
      (p.professor_code || '').toLowerCase().includes(q) ||
      (p.User?.full_name || '').toLowerCase().includes(q)
    );
  }, [professors, search]);

  const handleOpenModal = (professor = null) => {
    if (professor) {
      setEditingId(professor.id);
      setFormData({
        username: professor.User?.username || '',
        email: professor.User?.email || '',
        password: '',
        full_name: professor.User?.full_name || '',
        phone: professor.User?.phone || '',
        department: professor.department || '',
        specialization: professor.specialization || '',
        specialty_id: professor.specialty_id || '',
        national_id: professor.User?.national_id || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        department: '',
        specialization: '',
        national_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      phone: '',
      department: '',
      specialization: '',
      specialty_id: '',
      national_id: ''
    });
  };

  const handleOpenCourseModal = async (professor) => {
    setSelectedProfessor(professor);
    setAssignFilterSpecialty(professor.specialty_id ? String(professor.specialty_id) : '');
    setAssignFilterYear('');
    setAssignFilterSemester('');
    try {
      const res = await api.get(`/admin/professors/${professor.id}/courses`);
      // res.data.data is array of ProfessorCourse objects with nested Course
      const assignments = res.data.data || [];
      setSelectedCourses(assignments.map(a => a.course_id || a.Course?.id).filter(Boolean));
    } catch (error) {
      setSelectedCourses([]);
    }
    setIsCourseModalOpen(true);
  };

  const handleCloseCourseModal = () => {
    setIsCourseModalOpen(false);
    setSelectedProfessor(null);
    setSelectedCourses([]);
    setAssignFilterSpecialty('');
    setAssignFilterYear('');
    setAssignFilterSemester('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For new professor, all fields including password are required
    if (!editingId && (!formData.username || !formData.email || !formData.password || !formData.full_name)) {
      showNotification('Please fill all required fields (username, email, password, name)', 'error');
      return;
    }
    
    // For edit, at least name and email required
    if (editingId && (!formData.full_name || !formData.email)) {
      showNotification('Please fill required fields (email, name)', 'error');
      return;
    }

    try {
      if (editingId) {
        const updateData = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          specialization: formData.specialization,
          specialty_id: formData.specialty_id,
          national_id: formData.national_id,
          ...(formData.password ? { password: formData.password } : {})
        };
        await api.put(`/admin/professors/${editingId}`, updateData);
        showNotification('Professor updated successfully', 'success');
      } else {
        await api.post('/admin/professors', {
          full_name: formData.full_name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          department: formData.department,
          specialization: formData.specialization,
          specialty_id: formData.specialty_id || null,
          national_id: formData.national_id
        });
        showNotification('Professor created successfully', 'success');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      showNotification(error.response?.data?.message || 'Error saving professor', 'error');
    }
  };

  const handleAssignCourses = async () => {
    if (selectedCourses.length === 0) {
      showNotification('Please select at least one course', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get course details to extract academic_year_id and semester_id
      const courseDetails = await Promise.all(
        selectedCourses.map(courseId => 
          api.get(`/admin/courses/${courseId}`)
        )
      );
      
      const promises = courseDetails.map(({ data }) => {
        const course = data.data;
        return api.post(`/admin/professors/${selectedProfessor.id}/courses`, {
          course_id: course.id,
          academic_year_id: course.academic_year_id,
          semester_id: course.semester_id,
          is_primary: true
        });
      });
      
      await Promise.all(promises);
      showNotification('تم تعيين المواد بنجاح', 'success');
      handleCloseCourseModal();
      fetchData();
    } catch (error) {
      console.error('Assign courses error:', error);
      const errorMsg = error.response?.data?.message || 'خطأ في تعيين المواد';
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (professorId) => {
    if (window.confirm('Are you sure you want to delete this professor?')) {
      try {
        await api.delete(`/admin/professors/${professorId}`);
        showNotification('Professor deleted successfully', 'success');
        fetchData();
      } catch (error) {
        showNotification(error.response?.data?.message || 'Error deleting professor', 'error');
      }
    }
  };

  const columns = [
    { key: 'professor_code', label: 'كود الدكتور' },
    { key: 'full_name', label: 'الاسم', render: (_, row) => row.User?.full_name || '—' },
    { key: 'national_id', label: 'الرقم القومي', render: (_, row) => row.User?.national_id || '—' },
    { key: 'email', label: 'البريد', render: (_, row) => row.User?.email || '—' },
    { key: 'phone', label: 'الهاتف', render: (_, row) => row.User?.phone || '—' },
    { key: 'department', label: 'القسم' },
    { key: 'courses', label: 'المواد', render: (_, row) => row.ProfessorCourses?.length || 0 }
  ];

  const actions = [
    {
      label: 'Assign Courses',
      onClick: (professor) => handleOpenCourseModal(professor),
      variant: 'primary'
    },
    {
      label: 'Edit',
      onClick: (professor) => handleOpenModal(professor),
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (professor) => handleDelete(professor.id),
      variant: 'danger'
    }
  ];

  return (
    <div className={styles.pageWrapper}>
      {notification && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '8px',
          backgroundColor: notification.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          color: notification.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${notification.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {specialtyFilter
            ? `دكاترة تخصص: ${specialties.find(s => s.code === specialtyFilter)?.arabic_name || specialtyFilter}`
            : 'إدارة الدكاترة'}
        </h1>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          + إضافة دكتور جديد
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          className={styles.searchInput || styles.input}
          placeholder="🔍 بحث بالاسم أو كود الدكتور..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(179,110,255,0.3)',
            background: 'rgba(17,1,23,0.6)',
            color: 'var(--white, #f0f0f0)',
            fontSize: '14px',
            outline: 'none',
            backdropFilter: 'blur(8px)',
          }}
        />
        {search && (
          <span style={{ marginRight: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            {filteredProfessors.length} نتيجة
          </span>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading professors...</p>
        </div>
      ) : (
        <Table columns={columns} data={filteredProfessors} actions={actions} />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Professor' : 'Add New Professor'}
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
          {!editingId && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Username * (for login)</label>
                <input
                  type="text"
                  name="username"
                  className={styles.input}
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g., dr_ahmed"
                  autoComplete="off"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password * (for login)</label>
                <input
                  type="password"
                  name="password"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter secure password"
                  autoComplete="off"
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name *</label>
            <input
              type="text"
              name="full_name"
              className={styles.input}
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="e.g., Dr. Ahmed Ahmed"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>National ID</label>
            <input
              type="text"
              name="national_id"
              className={styles.input}
              value={formData.national_id}
              onChange={handleInputChange}
              placeholder="e.g., 29001011234567"
              maxLength={14}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>التخصص</label>
            <select
              name="specialty_id"
              className={styles.select}
              value={formData.specialty_id}
              onChange={handleInputChange}
            >
              <option value="">— اختر التخصص —</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.arabic_name || s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., professor@nctu.edu"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone</label>
            <input
              type="tel"
              name="phone"
              className={styles.input}
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g., 01012345678"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Department</label>
            <input
              type="text"
              name="department"
              className={styles.input}
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Engineering"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Specialization</label>
            <input
              type="text"
              name="specialization"
              className={styles.input}
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="e.g., Electronics"
            />
          </div>

          {editingId && formData.password && (
            <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px', color: '#1976d2', marginTop: '10px' }}>
              ℹ️ Password field is optional on edit. Leave blank to keep current password.
            </div>
          )}
        </form>
      </Modal>

      {/* Assign Courses Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={handleCloseCourseModal}
        title={`تعيين مواد للدكتور: ${selectedProfessor?.User?.full_name || selectedProfessor?.full_name || 'الدكتور'}`}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className={styles.cancelBtn} onClick={handleCloseCourseModal}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleAssignCourses} disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'Save Assignments'}
            </button>
          </div>
        }
      >
        {/* Filter by Specialty, Year, Semester */}
        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(179,110,255,0.08)', borderRadius: '8px', border: '1px solid rgba(179,110,255,0.2)' }}>
          <div style={{ fontWeight: '600', color: 'var(--white-dim)', marginBottom: '12px', fontSize: '14px' }}>🔍 فلترة المواد:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>التخصص</label>
              <select
                className={styles.select}
                value={assignFilterSpecialty}
                onChange={e => setAssignFilterSpecialty(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">— جميع التخصصات —</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.arabic_name || s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>السنة الدراسية</label>
              <select
                className={styles.select}
                value={assignFilterYear}
                onChange={e => setAssignFilterYear(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">— جميع السنوات —</option>
                <option value="1">السنة الأولى</option>
                <option value="2">السنة الثانية</option>
                <option value="3">السنة الثالثة</option>
                <option value="4">السنة الرابعة</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>الترم</label>
              <select
                className={styles.select}
                value={assignFilterSemester}
                onChange={e => setAssignFilterSemester(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">— جميع الترمات —</option>
                <option value="1">الفصل الأول</option>
                <option value="2">الفصل الثاني</option>
              </select>
            </div>
          </div>
          {(assignFilterSpecialty || assignFilterYear || assignFilterSemester) && (
            <button
              onClick={() => { setAssignFilterSpecialty(''); setAssignFilterYear(''); setAssignFilterSemester(''); }}
              style={{ marginTop: '10px', padding: '6px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
            >
              ✕ مسح الفلتر
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {courses
            .filter(course => {
              if (assignFilterSpecialty && String(course.specialty_id) !== String(assignFilterSpecialty)) return false;
              if (assignFilterYear && course.AcademicYear && String(course.AcademicYear.year_number) !== String(assignFilterYear)) return false;
              if (assignFilterSemester) {
                const semName = assignFilterSemester === '1' ? 'الفصل الأول' : 'الفصل الثاني';
                if (course.Semester?.semester_name !== semName && String(course.semester_id) !== String(assignFilterSemester)) return false;
              }
              return true;
            })
            .map((course) => (
            <label 
              key={course.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '10px', 
                cursor: 'pointer', 
                padding: '12px', 
                border: selectedCourses.includes(course.id) ? '2px solid var(--purple-primary)' : '1px solid rgba(179,110,255,0.2)', 
                borderRadius: '8px',
                background: selectedCourses.includes(course.id) ? 'rgba(179,110,255,0.15)' : 'rgba(17,1,23,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={selectedCourses.includes(course.id)}
                onChange={() => handleCourseSelect(course.id)}
                style={{ marginTop: '4px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--white)' }}>
                  {course.course_code}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--white-dim)', marginBottom: '4px' }}>
                  {course.arabic_name || course.course_name}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  {course.Specialty?.arabic_name || course.Specialty?.name} - 
                  {course.AcademicYear?.year_number ? ` السنة ${course.AcademicYear.year_number}` : ''} - 
                  {course.credit_hours} ساعة معتمدة
                </div>
              </div>
            </label>
          ))}
        </div>
        
        {courses.filter(course => {
          if (assignFilterSpecialty && String(course.specialty_id) !== String(assignFilterSpecialty)) return false;
          if (assignFilterYear && course.AcademicYear && String(course.AcademicYear.year_number) !== String(assignFilterYear)) return false;
          if (assignFilterSemester) {
            const semName = assignFilterSemester === '1' ? 'الفصل الأول' : 'الفصل الثاني';
            if (course.Semester?.semester_name !== semName && String(course.semester_id) !== String(assignFilterSemester)) return false;
          }
          return true;
        }).length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--white-dim)' }}>
            <p>لا توجد مواد متاحة للتخصص المختار</p>
            <p style={{ fontSize: '13px', marginTop: '8px', color: 'rgba(255,255,255,0.4)' }}>يرجى اختيار تخصص آخر أو إضافة مواد جديدة</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
