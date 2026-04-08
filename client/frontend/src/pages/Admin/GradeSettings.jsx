import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { gradeSettingsAPI } from '../../services/adminService';
import styles from './GradeSettings.module.css';

export const GradeSettings = () => {
  const { success, error } = useNotification();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedSettings, setEditedSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await gradeSettingsAPI.getAll();
      const data = response.data.data || {};
      setSettings(data);
      setEditedSettings(data);
    } catch (err) {
      error('Failed to fetch grade settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: parseFloat(value) || value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each changed setting
      for (const [key, value] of Object.entries(editedSettings)) {
        if (settings[key] !== value) {
          await gradeSettingsAPI.update(key, value);
        }
      }
      success('Grade settings updated successfully');
      setSettings(editedSettings);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEditedSettings(settings);
  };

  return (
    <AdminLayout title="Grade Settings">
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Grading Configuration</h2>
          <p className={styles.description}>
            Configure the grading values used throughout the system. These settings apply to all grade calculations.
          </p>

          <LoadingSpinner isLoading={loading} />

          {!loading && (
            <>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label>Pass Grade Value (P)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.pass_grade_value || ''}
                      onChange={(e) => handleChange('pass_grade_value', e.target.value)}
                      step="0.1"
                    />
                    <span className={styles.hint}>Points awarded for "Pass" grade</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Merit Grade Value (M)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.merit_grade_value || ''}
                      onChange={(e) => handleChange('merit_grade_value', e.target.value)}
                      step="0.1"
                    />
                    <span className={styles.hint}>Points awarded for "Merit" grade</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Distinction Grade Value (D)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.distinction_grade_value || ''}
                      onChange={(e) => handleChange('distinction_grade_value', e.target.value)}
                      step="0.1"
                    />
                    <span className={styles.hint}>Points awarded for "Distinction" grade</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Max Final Exam Score</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.max_final_exam_score || ''}
                      onChange={(e) => handleChange('max_final_exam_score', e.target.value)}
                      step="0.1"
                    />
                    <span className={styles.hint}>Maximum available points for final exam</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Max Total Score</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.max_total_score || ''}
                      onChange={(e) => handleChange('max_total_score', e.target.value)}
                      step="0.1"
                    />
                    <span className={styles.hint}>Maximum total possible score</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Grade A Percentage (%)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.grade_a_percentage || ''}
                      onChange={(e) => handleChange('grade_a_percentage', e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <span className={styles.hint}>Minimum percentage for A grade</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Grade B Percentage (%)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.grade_b_percentage || ''}
                      onChange={(e) => handleChange('grade_b_percentage', e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <span className={styles.hint}>Minimum percentage for B grade</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Grade C Percentage (%)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.grade_c_percentage || ''}
                      onChange={(e) => handleChange('grade_c_percentage', e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <span className={styles.hint}>Minimum percentage for C grade</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>Grade D Percentage (%)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      value={editedSettings.grade_d_percentage || ''}
                      onChange={(e) => handleChange('grade_d_percentage', e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <span className={styles.hint}>Minimum percentage for D grade</span>
                  </div>
                </div>
              </div>

              <div className={styles.preview}>
                <h3>Grade Scale Preview</h3>
                <div className={styles.gradeScale}>
                  <div className={styles.gradesRow}>
                    <div className={styles.gradeItem}>
                      <span className={styles.gradeLetter}>A</span>
                      <span className={styles.gradeRange}>{editedSettings.grade_a_percentage || 85}% - 100%</span>
                    </div>
                    <div className={styles.gradeItem}>
                      <span className={styles.gradeLetter}>B</span>
                      <span className={styles.gradeRange}>{editedSettings.grade_b_percentage || 75}% - {editedSettings.grade_a_percentage || 85}%</span>
                    </div>
                    <div className={styles.gradeItem}>
                      <span className={styles.gradeLetter}>C</span>
                      <span className={styles.gradeRange}>{editedSettings.grade_c_percentage || 65}% - {editedSettings.grade_b_percentage || 75}%</span>
                    </div>
                    <div className={styles.gradeItem}>
                      <span className={styles.gradeLetter}>D</span>
                      <span className={styles.gradeRange}>{editedSettings.grade_d_percentage || 50}% - {editedSettings.grade_c_percentage || 65}%</span>
                    </div>
                    <div className={styles.gradeItem}>
                      <span className={styles.gradeLetter}>F</span>
                      <span className={styles.gradeRange}>0% - {editedSettings.grade_d_percentage || 50}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.resetBtn}
                  onClick={handleReset}
                  disabled={saving}
                >
                  Reset Changes
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GradeSettings;
