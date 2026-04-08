import { useState, useEffect } from 'react';
import { Table, Modal } from '../../components/common';
import { coursesAPI, specialtiesAPI, academicYearsAPI, semestersAPI } from '../../services/apiService';
import styles from './CoursesPage.module.css';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    arabic_name: '',
    specialty_id: '',
    academic_year_id: '',
    semester_id: '',
    credit_hours: '',
    is_active: true
  });

  // Fetch courses and metadata
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, specialtiesRes, yearsRes, semestersRes] = await Promise.all([
        coursesAPI.getAll(),
        specialtiesAPI.getAll(),
        academicYearsAPI.getAll().catch(() => ({ data: { data: [] } })),
        semestersAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);
      setCourses(coursesRes.data.data || []);
      setSpecialties(specialtiesRes.data.data || []);
      
      // Use API data if available, otherwise use static data
      const years = yearsRes.data.data && yearsRes.data.data.length > 0 
        ? yearsRes.data.data 
        : [
            { id: 1, year_number: 1, academic_season: '2024-2025' },
            { id: 2, year_number: 2, academic_season: '2024-2025' },
            { id: 3, year_number: 3, academic_season: '2024-2025' },
            { id: 4, year_number: 4, academic_season: '2024-2025' }
          ];
      
      const sems = semestersRes.data.data && semestersRes.data.data.length > 0 
        ? semestersRes.data.data 
        : [
            { id: 1, semester_name: 'الفصل الأول' },
            { id: 2, semester_name: 'الفصل الثاني' }
          ];
      
      setAcademicYears(years);
      setSemesters(sems);
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
        is_active: course.is_active
      });
    } else {
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
          is_active: formData.is_active
        });
        showNotification('Course updated successfully', 'success');
      } else {
        await coursesAPI.create({
          course_code: formData.course_code,
          course_name: formData.course_name,
          arabic_name: formData.arabic_name,
          specialty_id: formData.specialty_id,
          academic_year_id: formData.academic_year_id,
          semester_id: formData.semester_id,
          credit_hours: formData.credit_hours,
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
        showNotification('Course deleted successfully', 'success');
        fetchData();
      } catch (error) {
        showNotification(error.response?.data?.message || 'Error deleting course', 'error');
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
        return specialty ? specialty.name || specialty.specialty_name : 'N/A';
      }
    },
    {
      key: 'AcademicYear',
      label: 'Academic Year',
      render: (year) => year ? `${year.year_number} ${year.academic_season}` : 'N/A'
    },
    {
      key: 'Semester',
      label: 'Semester',
      render: (semester) => semester ? semester.semester_name : 'N/A'
    },
    { key: 'credit_hours', label: 'Credits' },
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
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '4px',
          backgroundColor: notification.type === 'error' ? '#ffebee' : '#e8f5e9',
          color: notification.type === 'error' ? '#c62828' : '#2e7d32',
          border: `1px solid ${notification.type === 'error' ? '#ef5350' : '#66bb6a'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
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
        <h1 className={styles.pageTitle}>Courses Management</h1>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          + Add New Course
        </button>
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
                  {specialty.specialty_name}
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
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year_number} {year.academic_season}
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
