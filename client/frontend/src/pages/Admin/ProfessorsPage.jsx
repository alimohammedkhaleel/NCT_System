import { useState, useEffect } from 'react';
import { Table, Modal } from '../../components/common';
import { professorsAPI, coursesAPI } from '../../services/apiService';
import styles from './CoursesPage.module.css';

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    department: '',
    specialization: ''
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [professorsRes, coursesRes] = await Promise.all([
        professorsAPI.getAll(),
        coursesAPI.getAll()
      ]);
      setProfessors(professorsRes.data.data || []);
      setCourses(coursesRes.data.data || []);
    } catch (error) {
      showNotification('Error fetching professors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
        specialization: professor.specialization || ''
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
        specialization: ''
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
      specialization: ''
    });
  };

  const handleOpenCourseModal = async (professor) => {
    setSelectedProfessor(professor);
    try {
      const res = await professorsAPI.getAssignedCourses(professor.id);
      setSelectedCourses(res.data.data?.map(c => c.id) || []);
    } catch (error) {
      setSelectedCourses([]);
    }
    setIsCourseModalOpen(true);
  };

  const handleCloseCourseModal = () => {
    setIsCourseModalOpen(false);
    setSelectedProfessor(null);
    setSelectedCourses([]);
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
        // For update, don't send password unless it's being changed
        const updateData = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          specialization: formData.specialization
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await professorsAPI.update(editingId, updateData);
        showNotification('Professor updated successfully', 'success');
      } else {
        // For create, send all required fields
        await professorsAPI.create(formData);
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
    try {
      await professorsAPI.assignCourses(selectedProfessor.id, selectedCourses);
      showNotification('Courses assigned successfully', 'success');
      handleCloseCourseModal();
      fetchData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error assigning courses', 'error');
    }
  };

  const handleDelete = async (professorId) => {
    if (window.confirm('Are you sure you want to delete this professor?')) {
      try {
        await professorsAPI.delete(professorId);
        showNotification('Professor deleted successfully', 'success');
        fetchData();
      } catch (error) {
        showNotification(error.response?.data?.message || 'Error deleting professor', 'error');
      }
    }
  };

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'id',
      label: 'Assigned Courses',
      render: (id, row) => row.professor_courses?.length || 0
    }
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
        <h1 className={styles.pageTitle}>Professors Management</h1>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          + Add New Professor
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading professors...</p>
        </div>
      ) : (
        <Table columns={columns} data={professors} actions={actions} />
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
        title={`Assign Courses to ${selectedProfessor?.full_name}`}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className={styles.cancelBtn} onClick={handleCloseCourseModal}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleAssignCourses}>
              Save Assignments
            </button>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {courses.map((course) => (
            <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <input
                type="checkbox"
                checked={selectedCourses.includes(course.id)}
                onChange={() => handleCourseSelect(course.id)}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{course.code}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{course.name}</div>
              </div>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
