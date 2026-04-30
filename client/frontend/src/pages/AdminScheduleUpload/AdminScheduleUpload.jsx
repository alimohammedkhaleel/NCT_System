import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminScheduleUpload.css';

const AdminScheduleUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedSchedules, setUploadedSchedules] = useState([
    {
      id: 1,
      filename: 'Fall_2024_Schedule.pdf',
      uploadDate: '2024-01-15',
      size: '2.3 MB',
      status: 'active'
    },
    {
      id: 2,
      filename: 'Spring_2024_Schedule.pdf',
      uploadDate: '2024-08-01',
      size: '1.8 MB',
      status: 'archived'
    }
  ]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('يرجى اختيار ملف PDF فقط');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 10 ميجابايت');
        return;
      }

      setSelectedFile(file);
      toast.success('تم اختيار الملف بنجاح');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('يرجى اختيار ملف أولاً');
      return;
    }

    setUploading(true);
    try {
      // Mock upload - in real app, upload to server
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newSchedule = {
        id: Date.now(),
        filename: selectedFile.name,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'active'
      };

      setUploadedSchedules(prev => [newSchedule, ...prev]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('تم رفع الجدول الدراسي بنجاح');
    } catch (error) {
      toast.error('فشل في رفع الملف');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      // Mock delete - in real app, delete from server
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadedSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      toast.success('تم حذف الجدول الدراسي');
    } catch (error) {
      toast.error('فشل في حذف الملف');
      console.error('Delete error:', error);
    }
  };

  const handleStatusChange = (scheduleId, newStatus) => {
    setUploadedSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, status: newStatus }
          : schedule
      )
    );
    toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'أرشفة'} الجدول`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-schedule-container">
      <motion.div
        className="schedule-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>إدارة الجداول الدراسية</h1>
        <p>رفع وإدارة جداول المحاضرات والامتحانات</p>
      </motion.div>

      <div className="schedule-content">
        {/* Upload Section */}
        <motion.div
          className="upload-section"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>رفع جدول جديد</h2>
          <div className="upload-form">
            <div className="file-input-container">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="file-input"
                id="schedule-file"
              />
              <label htmlFor="schedule-file" className="file-input-label">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>
                  {selectedFile ? selectedFile.name : 'اختر ملف PDF للجدول الدراسي'}
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className="file-info">
                <p><strong>اسم الملف:</strong> {selectedFile.name}</p>
                <p><strong>الحجم:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
            )}

            <motion.button
              className="upload-btn"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري الرفع...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  رفع الجدول
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Schedules List */}
        <motion.div
          className="schedules-list"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>الجداول المرفوعة</h2>
          <div className="schedules-table-container">
            <table className="schedules-table">
              <thead>
                <tr>
                  <th>اسم الملف</th>
                  <th>تاريخ الرفع</th>
                  <th>الحجم</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {uploadedSchedules.map((schedule) => (
                  <motion.tr
                    key={schedule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td>
                      <div className="file-name">
                        <i className="fas fa-file-pdf"></i>
                        {schedule.filename}
                      </div>
                    </td>
                    <td>{formatDate(schedule.uploadDate)}</td>
                    <td>{schedule.size}</td>
                    <td>
                      <span className={`status-badge ${schedule.status}`}>
                        {schedule.status === 'active' ? 'نشط' : 'مؤرشف'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => window.open(`/api/schedules/${schedule.id}`, '_blank')}
                          title="عرض الجدول"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="action-btn download"
                          onClick={() => window.open(`/api/schedules/${schedule.id}/download`, '_blank')}
                          title="تحميل الجدول"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <select
                          className="status-select"
                          value={schedule.status}
                          onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
                        >
                          <option value="active">نشط</option>
                          <option value="archived">مؤرشف</option>
                        </select>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(schedule.id)}
                          title="حذف الجدول"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminScheduleUpload;