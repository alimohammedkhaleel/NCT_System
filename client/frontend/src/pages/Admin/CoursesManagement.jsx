import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Modal from '../../components/Common/Modal';
import Table from '../../components/Common/Table';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { courseAPI } from '../../services/adminService';
import styles from './CoursesManagement.module.css';

export const CoursesManagement = () => {
  const { success, error } = useNotification();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    specialty_id: '',
    academic_year_id: '',
    semester_id: '',
    course_code: '',
    course_name: '',
    arabic_name: '',
    credit_hours: ''
  });

  // Mock data for dropdowns (in a real app, these would come from API)
  const specialties = [
    { id: 1, name: 'Computer Science' },
    { id: 2, name: 'Mechatronics' },
    { id: 3, name: 'Information Technology' }
  ];

  const academicYears = [
    { id: 1, name: '2023-2024' },
    { id: 2, name: '2024-2025' }
  ];

  const semesters = [
    { id: 1, number: 'Semester 1' },
    { id: 2, number: 'Semester 2' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.data || []);
    } catch (err) {
      error('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await courseAPI.update(editingId, formData);
        success('Course updated successfully');
      } else {
        await courseAPI.create(formData);
        success('Course created successfully');
      }
      fetchCourses();
      closeModal();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      specialty_id: course.specialty_id,
      academic_year_id: course.academic_year_id,
      semester_id: course.semester_id,
      course_code: course.course_code,
      course_name: course.course_name,
      arabic_name: course.arabic_name,
      credit_hours: course.credit_hours
    });
    setEditingId(course.id);
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.delete(courseId);
        success('Course deleted successfully');
        fetchCourses();
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      specialty_id: '',
      academic_year_id: '',
      semester_id: '',
      course_code: '',
      course_name: '',
      arabic_name: '',
      credit_hours: ''
    });
  };

  const columns = [
    { key: 'course_code', label: 'Code' },
    { key: 'course_name', label: 'Course Name' },
    { key: 'arabic_name', label: 'Arabic Name' },
    { key: 'credit_hours', label: 'Credits' },
    {
      key: 'Specialty',
      label: 'Specialty',
      render: (_, row) => row.Specialty?.specialty_name || '-'
    }
  ];

  const actions = [
    { label: 'Edit', onClick: handleEdit, variant: 'primary' },
    { label: 'Delete', onClick: (row) => handleDelete(row.id), variant: 'danger' }
  ];

  const addButton = (
    <button className={styles.addBtn} onClick={() => setShowModal(true)}>
      ➕ Add Course
    </button>
  );

  return (
    <AdminLayout title="Courses Management" actionButton={addButton}>
      <LoadingSpinner isLoading={loading} />
      
      <Table
        columns={columns}
        data={courses}
        actions={actions}
        noDataMessage="No courses found"
      />

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingId ? 'Edit Course' : 'Add New Course'}
        size="medium"
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label>Specialty</label>
            <select
              value={formData.specialty_id}
              onChange={(e) => setFormData({ ...formData, specialty_id: e.target.value })}
              required
            >
              <option value="">Select Specialty</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Academic Year</label>
            <select
              value={formData.academic_year_id}
              onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Semester</label>
            <select
              value={formData.semester_id}
              onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
              required
            >
              <option value="">Select Semester</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.number}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Course Code</label>
            <input
              type="text"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Course Name</label>
            <input
              type="text"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Arabic Name</label>
            <input
              type="text"
              value={formData.arabic_name}
              onChange={(e) => setFormData({ ...formData, arabic_name: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Credit Hours</label>
            <input
              type="number"
              value={formData.credit_hours}
              onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
              required
              min="1"
              max="6"
            />
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default CoursesManagement;
