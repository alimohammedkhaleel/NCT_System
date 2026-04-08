import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Modal from '../../components/Common/Modal';
import Table from '../../components/Common/Table';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { professorAPI, courseAPI } from '../../services/adminService';
import styles from './ProfessorsManagement.module.css';

export const ProfessorsManagement = () => {
  const { success, error } = useNotification();
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    department: '',
    specialization: ''
  });
  const [assignData, setAssignData] = useState({
    course_id: '',
    academic_year_id: '',
    semester_id: '',
    is_primary: false
  });

  const departments = [
    'Computer Science',
    'Mechatronics',
    'Information Technology',
    'Engineering',
    'Business'
  ];

  useEffect(() => {
    fetchProfessors();
    fetchCourses();
  }, []);

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const response = await professorAPI.getAll();
      setProfessors(response.data.data || []);
    } catch (err) {
      error('Failed to fetch professors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch courses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await professorAPI.update(editingId, formData);
        success('Professor updated successfully');
      } else {
        await professorAPI.create(formData);
        success('Professor created successfully');
      }
      fetchProfessors();
      closeModal();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save professor');
    }
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    try {
      await professorAPI.assignCourse(selectedProfessor.id, assignData);
      success('Course assigned successfully');
      setShowAssignModal(false);
      fetchProfessors();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign course');
    }
  };

  const handleEdit = (professor) => {
    setFormData({
      department: professor.department || '',
      specialization: professor.specialization || '',
      full_name: professor.User?.full_name || ''
    });
    setEditingId(professor.id);
    setShowModal(true);
  };

  const handleDelete = async (profId) => {
    if (window.confirm('Are you sure you want to delete this professor?')) {
      try {
        await professorAPI.delete(profId);
        success('Professor deleted successfully');
        fetchProfessors();
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete professor');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ username: '', email: '', password: '', full_name: '', phone: '', department: '', specialization: '' });
  };

  const columns = [
    { key: 'professor_code', label: 'Code' },
    {
      key: 'User',
      label: 'Name',
      render: (_, row) => row.User?.full_name || '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (_, row) => row.User?.email || '-'
    },
    { key: 'department', label: 'Department' },
    { key: 'specialization', label: 'Specialization' }
  ];

  const actions = [
    { label: 'Edit', onClick: handleEdit, variant: 'primary' },
    { label: 'Assign Courses', onClick: (row) => { setSelectedProfessor(row); setShowAssignModal(true); }, variant: 'primary' },
    { label: 'Delete', onClick: (row) => handleDelete(row.id), variant: 'danger' }
  ];

  const addButton = (
    <button className={styles.addBtn} onClick={() => setShowModal(true)}>
      ➕ Add Professor
    </button>
  );

  return (
    <AdminLayout title="Professors Management" actionButton={addButton}>
      <LoadingSpinner isLoading={loading} />
      <Table columns={columns} data={professors} actions={actions} />

      <Modal isOpen={showModal} onClose={closeModal} title={editingId ? 'Edit Professor' : 'Add Professor'} size="medium"
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>{editingId ? 'Update' : 'Create'}</button>
          </div>
        }>
        <form className={styles.form}>
          {!editingId && (
            <>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className={styles.formGroup}>
                <label>Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </>
          )}
          <div className={styles.formGroup}>
            <label>Department</label>
            <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map(d => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Specialization</label>
            <input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={`Assign Courses to ${selectedProfessor?.User?.full_name}`} size="medium"
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={() => setShowAssignModal(false)}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleAssignCourse}>Assign</button>
          </div>
        }>
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label>Course</label>
            <select value={assignData.course_id} onChange={(e) => setAssignData({ ...assignData, course_id: e.target.value })} required>
              <option value="">Select Course</option>
              {courses.map(c => (<option key={c.id} value={c.id}>{c.course_name}</option>))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Is Primary</label>
            <input type="checkbox" checked={assignData.is_primary} onChange={(e) => setAssignData({ ...assignData, is_primary: e.target.checked })} />
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default ProfessorsManagement;
