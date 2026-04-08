import { useState, useEffect } from 'react';
import { gradeSettingsAPI } from '../../services/apiService';
import styles from './CoursesPage.module.css';

export default function GradeSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    pass_score: 0,
    merit_score: 0,
    distinction_score: 0,
    max_final_exam_score: 0
  });

  // Fetch settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await gradeSettingsAPI.getSettings();
      const data = res.data.data;
      setSettings(data);
      setFormData({
        pass_score: data.pass_score || 0,
        merit_score: data.merit_score || 0,
        distinction_score: data.distinction_score || 0,
        max_final_exam_score: data.max_final_exam_score || 0
      });
    } catch (error) {
      showNotification('Error fetching grade settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate values
    if (formData.pass_score < 0 || formData.merit_score < 0 || 
        formData.distinction_score < 0 || formData.max_final_exam_score < 0) {
      showNotification('All values must be positive', 'error');
      return;
    }

    if (formData.pass_score > formData.merit_score || 
        formData.merit_score > formData.distinction_score) {
      showNotification('Pass Score < Merit Score < Distinction Score', 'error');
      return;
    }

    try {
      await gradeSettingsAPI.updateSettings(formData);
      showNotification('Grade settings updated successfully', 'success');
      fetchSettings();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error updating settings', 'error');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading grade settings...</p>
      </div>
    );
  }

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
        <h1 className={styles.pageTitle}>Grade Settings</h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Current Grading Scale</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Pass (P)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                {formData.pass_score}%
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Merit (M)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                {formData.merit_score}%
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Distinction (D)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {formData.distinction_score}%
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Max Final Exam</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b59b6' }}>
                {formData.max_final_exam_score}%
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Update Values</h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Pass Score (%) *</label>
            <input
              type="number"
              name="pass_score"
              className={styles.input}
              value={formData.pass_score}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
            <small style={{ color: '#7f8c8d' }}>Minimum score to pass</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Merit Score (%) *</label>
            <input
              type="number"
              name="merit_score"
              className={styles.input}
              value={formData.merit_score}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
            <small style={{ color: '#7f8c8d' }}>Score for merit (M) grade</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Distinction Score (%) *</label>
            <input
              type="number"
              name="distinction_score"
              className={styles.input}
              value={formData.distinction_score}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
            <small style={{ color: '#7f8c8d' }}>Score for distinction (D) grade</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Max Final Exam Score (%) *</label>
            <input
              type="number"
              name="max_final_exam_score"
              className={styles.input}
              value={formData.max_final_exam_score}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
            <small style={{ color: '#7f8c8d' }}>Maximum weight for final exam</small>
          </div>

          <div style={{
            padding: '15px',
            background: '#e8f4f8',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#2c3e50',
            borderLeft: '4px solid #3498db'
          }}>
            <strong>Note:</strong> Ensure Pass Score &lt; Merit Score &lt; Distinction Score
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
