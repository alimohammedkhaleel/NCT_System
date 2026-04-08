import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Modal from '../../components/Common/Modal';
import Table from '../../components/Common/Table';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { gradeApprovalAPI } from '../../services/adminService';
import styles from './PendingGrades.module.css';

export const PendingGrades = () => {
  const { success, error } = useNotification();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [editData, setEditData] = useState({
    assignment1_grade: '',
    assignment2_grade: '',
    final_exam_score: '',
    notes: ''
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingGrades();
  }, []);

  const fetchPendingGrades = async () => {
    setLoading(true);
    try {
      const response = await gradeApprovalAPI.getPending();
      setGrades(response.data.data || []);
    } catch (err) {
      error('Failed to fetch pending grades');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (grade) => {
    try {
      const response = await gradeApprovalAPI.preview(grade.id);
      setPreviewData(response.data.data);
      setShowPreviewModal(true);
    } catch (err) {
      error('Failed to preview metrics');
    }
  };

  const handleEdit = (grade) => {
    setSelectedGrade(grade);
    setEditData({
      assignment1_grade: grade.assignment1_grade || '',
      assignment2_grade: grade.assignment2_grade || '',
      final_exam_score: grade.final_exam_score || '',
      notes: grade.notes || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await gradeApprovalAPI.edit(selectedGrade.id, editData);
      success('Grade edited successfully');
      fetchPendingGrades();
      setShowEditModal(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to edit grade');
    }
  };

  const handleApprove = async (grade) => {
    if (window.confirm('Approve this grade? Metrics will be calculated automatically.')) {
      try {
        await gradeApprovalAPI.approve(grade.id);
        success('Grade approved successfully');
        fetchPendingGrades();
      } catch (err) {
        error(err.response?.data?.message || 'Failed to approve grade');
      }
    }
  };

  const handleReject = async (grade) => {
    if (!rejectReason.trim()) {
      error('Please provide a rejection reason');
      return;
    }
    try {
      await gradeApprovalAPI.reject(grade.id, rejectReason);
      success('Grade rejected successfully');
      setRejectReason('');
      setSelectedGrade(null);
      fetchPendingGrades();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject grade');
    }
  };

  const columns = [
    {
      key: 'Student',
      label: 'Student',
      render: (_, row) => row.Student?.User?.full_name || '-'
    },
    {
      key: 'Course',
      label: 'Course',
      render: (_, row) => row.Course?.course_name || '-'
    },
    { key: 'assignment1_grade', label: 'A1' },
    { key: 'assignment2_grade', label: 'A2' },
    { key: 'final_exam_score', label: 'Final Exam' },
    { key: 'status', label: 'Status' }
  ];

  const actions = [
    { label: 'Preview', onClick: handlePreview, variant: 'primary' },
    { label: 'Edit', onClick: handleEdit, variant: 'warning' },
    { label: 'Approve', onClick: handleApprove, variant: 'success' },
    { label: 'Reject', onClick: (row) => { setSelectedGrade(row); setShowEditModal(false); }, variant: 'danger' }
  ];

  return (
    <AdminLayout title="Pending Grades">
      <LoadingSpinner isLoading={loading} />
      <Table columns={columns} data={grades} actions={actions} noDataMessage="No pending grades" />

      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="Grade Metrics Preview" size="medium">
        {previewData && (
          <div className={styles.preview}>
            <div className={styles.previewSection}>
              <h3>Current Values</h3>
              <div className={styles.grid2}>
                <div>Assignment 1 Grade: <strong>{previewData.current_values?.assignment1_grade}</strong></div>
                <div>Assignment 2 Grade: <strong>{previewData.current_values?.assignment2_grade}</strong></div>
                <div>Final Exam Score: <strong>{previewData.current_values?.final_exam_score}</strong></div>
              </div>
            </div>

            <div className={styles.previewSection}>
              <h3>Calculated Metrics</h3>
              <div className={styles.grid2}>
                <div>Assignment 1 Score: <strong>{previewData.calculated_metrics?.assignment1_score}</strong></div>
                <div>Assignment 2 Score: <strong>{previewData.calculated_metrics?.assignment2_score}</strong></div>
                <div>Final Exam Score: <strong>{previewData.calculated_metrics?.final_exam_score}</strong></div>
                <div>Total Score: <strong>{previewData.calculated_metrics?.total_score}</strong></div>
                <div>Percentage: <strong>{previewData.calculated_metrics?.total_percentage?.toFixed(2)}%</strong></div>
                <div>Grade Point: <strong>{previewData.calculated_metrics?.grade_point?.toFixed(2)}</strong></div>
                <div>Letter Grade: <strong>{previewData.calculated_metrics?.letter_grade}</strong></div>
                <div>Final Result: <strong>{previewData.calculated_metrics?.final_result}</strong></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setRejectReason(''); }} title={`${selectedGrade ? (rejectReason ? 'Reject' : 'Edit') : ''} Grade`} size="medium"
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={() => { setShowEditModal(false); setRejectReason(''); }}>Cancel</button>
            {!rejectReason && <button className={styles.submitBtn} onClick={handleSaveEdit}>Save Changes</button>}
            {rejectReason && <button className={styles.submitBtn} onClick={() => handleReject(selectedGrade)}>Reject Grade</button>}
          </div>
        }>
        {!rejectReason ? (
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label>Assignment 1 Grade (P/M/D)</label>
              <input value={editData.assignment1_grade} onChange={(e) => setEditData({ ...editData, assignment1_grade: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label>Assignment 2 Grade (P/M/D)</label>
              <input value={editData.assignment2_grade} onChange={(e) => setEditData({ ...editData, assignment2_grade: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label>Final Exam Score (0-150)</label>
              <input type="number" value={editData.final_exam_score} onChange={(e) => setEditData({ ...editData, final_exam_score: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label>Notes</label>
              <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
            </div>
            <button type="button" className={styles.rejectLink} onClick={() => setRejectReason('Input rejection reason below')}>
              Or reject this grade
            </button>
          </form>
        ) : (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Rejection Reason</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this grade is being rejected" />
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default PendingGrades;
