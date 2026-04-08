import { useState, useEffect } from 'react';
import { Table, Modal } from '../../components/common';
import { gradesAPI } from '../../services/apiService';
import styles from './CoursesPage.module.css';

export default function PendingGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [editFormData, setEditFormData] = useState({
    assignment1_score: 0,
    assignment2_score: 0,
    final_exam_score: 0
  });

  // Fetch pending grades
  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await gradesAPI.getPending();
      setGrades(res.data.data || []);
    } catch (error) {
      showNotification('Error fetching pending grades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenEditModal = (grade) => {
    setSelectedGrade(grade);
    setEditFormData({
      assignment1_score: grade.assignment1_score || 0,
      assignment2_score: grade.assignment2_score || 0,
      final_exam_score: grade.final_exam_score || 0
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedGrade(null);
    setEditFormData({
      assignment1_score: 0,
      assignment2_score: 0,
      final_exam_score: 0
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: parseFloat(value) || 0
    });
  };

  const handleSaveEdit = async () => {
    try {
      await gradesAPI.editPending(selectedGrade.id, editFormData);
      showNotification('Grade updated successfully', 'success');
      handleCloseEditModal();
      fetchGrades();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error updating grade', 'error');
    }
  };

  const handleApprove = async (gradeId) => {
    try {
      await gradesAPI.approve(gradeId);
      showNotification('Grade approved successfully', 'success');
      fetchGrades();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error approving grade', 'error');
    }
  };

  const handleReject = async (gradeId) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    try {
      await gradesAPI.reject(gradeId, reason);
      showNotification('Grade rejected successfully', 'success');
      fetchGrades();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error rejecting grade', 'error');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Student Name',
      render: (id, row) => row.Student?.User?.full_name || 'Unknown'
    },
    {
      key: 'id',
      label: 'Student Code',
      render: (id, row) => row.Student?.student_code || 'N/A'
    },
    {
      key: 'id',
      label: 'Course',
      render: (id, row) => row.Course?.course_name || 'Unknown'
    },
    { key: 'assignment1_score', label: 'Assignment 1' },
    { key: 'assignment2_score', label: 'Assignment 2' },
    { key: 'final_exam_score', label: 'Final Exam' },
    {
      key: 'total_score',
      label: 'Total Score',
      render: (score, row) => {
        const total = (row.assignment1_score || 0) + 
                     (row.assignment2_score || 0) + 
                     (row.final_exam_score || 0);
        return total.toFixed(2);
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: '#f39c12',
          color: 'white'
        }}>
          Pending
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (grade) => handleOpenEditModal(grade),
      variant: 'primary'
    },
    {
      label: 'Approve',
      onClick: (grade) => handleApprove(grade.id),
      variant: 'success'
    },
    {
      label: 'Reject',
      onClick: (grade) => handleReject(grade.id),
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
        <h1 className={styles.pageTitle}>Pending Grade Approvals</h1>
        <span style={{
          padding: '8px 16px',
          background: '#e74c3c',
          color: 'white',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {grades.length} Pending
        </span>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading pending grades...</p>
        </div>
      ) : grades.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#7f8c8d',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
          <h3>All grades approved!</h3>
          <p>There are no pending grades waiting for approval.</p>
        </div>
      ) : (
        <Table columns={columns} data={grades} actions={actions} />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={`Edit Grade - ${selectedGrade?.student?.full_name}`}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className={styles.cancelBtn} onClick={handleCloseEditModal}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleSaveEdit}>
              Save Changes
            </button>
          </div>
        }
      >
        <form>
          <div className={styles.formGroup}>
            <label className={styles.label}>Assignment 1 Score</label>
            <input
              type="number"
              name="assignment1_score"
              className={styles.input}
              value={editFormData.assignment1_score}
              onChange={handleEditInputChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Assignment 2 Score</label>
            <input
              type="number"
              name="assignment2_score"
              className={styles.input}
              value={editFormData.assignment2_score}
              onChange={handleEditInputChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Final Exam Score</label>
            <input
              type="number"
              name="final_exam_score"
              className={styles.input}
              value={editFormData.final_exam_score}
              onChange={handleEditInputChange}
              min="0"
              step="0.01"
            />
          </div>

          <div style={{
            padding: '12px',
            background: '#ecf0f1',
            borderRadius: '4px',
            marginTop: '15px'
          }}>
            <strong>Total Score: </strong>
            {(editFormData.assignment1_score + 
              editFormData.assignment2_score + 
              editFormData.final_exam_score).toFixed(2)}
          </div>
        </form>
      </Modal>
    </div>
  );
}
