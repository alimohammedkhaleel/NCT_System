import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { timetablesAPI, specialtiesAPI } from '../../services/apiService';
import { Table, Modal } from '../../components/common';
import styles from './TimetablesPage.module.css';

export default function TimetablesPage() {
  const [timetables, setTimetables] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    specialty_id: '',
    file: null
  });
  const [fileInfo, setFileInfo] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timetablesRes, specialtiesRes] = await Promise.all([
        timetablesAPI.getAll().catch(() => ({ data: { data: [] } })),
        specialtiesAPI.getAll().catch(e => {
          console.error('specialties fetch error:', e.response?.status, e.response?.data);
          return { data: { data: [] } };
        })
      ]);
      setTimetables(timetablesRes.data.data || []);
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
      showNotification('خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const handleOpenModal = (timetable = null) => {
    if (timetable) {
      setEditingId(timetable.id);
      setFormData({
        title: timetable.title,
        specialty_id: timetable.specialty_id,
        file: null
      });
      setFileInfo(timetable.file_name);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        specialty_id: '',
        file: null
      });
      setFileInfo(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '',
      specialty_id: '',
      file: null
    });
    setFileInfo(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        showNotification('Only PDF files are allowed', 'error');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
      }

      setFormData({
        ...formData,
        file: file
      });
      setFileInfo(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.specialty_id) {
      showNotification('Please fill title and select specialty', 'error');
      return;
    }

    if (!editingId && !formData.file) {
      showNotification('Please select a PDF file', 'error');
      return;
    }

    try {
      setUploading(true);
      const fData = new FormData();
      fData.append('title', formData.title);
      fData.append('specialty_id', formData.specialty_id);
      if (formData.file) {
        fData.append('file', formData.file);
        console.log('📤 Uploading file:', formData.file.name, formData.file.size, 'bytes');
      }

      // Debug: Log FormData contents
      console.log('📋 FormData contents:');
      for (let pair of fData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      if (editingId) {
        await timetablesAPI.update(editingId, fData);
        showNotification('Timetable updated successfully', 'success');
      } else {
        await timetablesAPI.create(fData);
        showNotification('Timetable uploaded successfully', 'success');
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('❌ Upload error:', error.response?.data || error.message);
      showNotification(error.response?.data?.message || 'Error saving timetable', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (timetableId) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await timetablesAPI.delete(timetableId);
        showNotification('Timetable deleted successfully', 'success');
        fetchData();
      } catch (error) {
        showNotification(error.response?.data?.message || 'Error deleting timetable', 'error');
      }
    }
  };

  const handleViewPDF = (timetable) => {
    try {
      // Use file_url from database
      const url = timetable.file_url;
      if (url) {
        // Convert relative path to absolute URL
        const baseURL = window.location.origin; // http://localhost:5173
        const backendURL = 'http://localhost:5000'; // Backend server URL
        
        // If url starts with /, it's a relative path - prepend backend URL
        const fullURL = url.startsWith('/') ? `${backendURL}${url}` : url;
        
        // Open in new tab
        window.open(fullURL, '_blank', 'noopener,noreferrer');
        
        toast.success('جاري فتح الملف...');
      } else {
        toast.error('لا يوجد ملف PDF');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.error('فشل في فتح ملف PDF');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'specialty_id',
      label: 'Specialty',
      render: (specialtyId) => {
        const specialty = specialties.find(s => s.id === specialtyId);
        return specialty ? (specialty.arabic_name || specialty.name) : 'N/A';
      }
    },
    {
      key: 'file_name',
      label: 'File',
      render: (fileName, row) => (
        <button
          onClick={() => handleViewPDF(row)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--purple-primary)',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'none'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'underline'}
        >
          📄 {fileName}
        </button>
      )
    },
    {
      key: 'file_size',
      label: 'Size',
      render: (size) => `${(size / 1024).toFixed(2)} KB`
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'View',
      onClick: (timetable) => handleViewPDF(timetable),
      variant: 'primary'
    },
    {
      label: 'Edit',
      onClick: (timetable) => handleOpenModal(timetable),
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (timetable) => handleDelete(timetable.id),
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
          backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: notification.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${notification.type === 'error' ? '#ef4444' : '#10b981'}`,
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
        <h1 className={styles.pageTitle}>Timetables Management</h1>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          + Upload New Timetable
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading timetables...</p>
        </div>
      ) : timetables.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          color: 'var(--text-secondary)',
          background: 'rgba(179, 110, 255, 0.05)',
          border: '1px solid var(--border-purple)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📅</div>
          <h3 style={{ color: 'var(--purple-primary)', marginBottom: '8px' }}>No timetables uploaded yet</h3>
          <p>Click "Upload New Timetable" to add one</p>
        </div>
      ) : (
        <Table columns={columns} data={timetables} actions={actions} />
      )}

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Timetable' : 'Upload New Timetable'}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className={styles.cancelBtn} onClick={handleCloseModal} disabled={uploading}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={uploading}>
              {uploading ? 'Processing...' : (editingId ? 'Update' : 'Upload')}
            </button>
          </div>
        }
      >
        <form>
          <div className={styles.formGroup}>
            <label className={styles.label}>Title *</label>
            <input
              type="text"
              name="title"
              className={styles.input}
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., IT Level 1 - Fall 2024"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Specialty *</label>
            <select
              name="specialty_id"
              className={styles.select}
              value={formData.specialty_id}
              onChange={handleInputChange}
            >
              <option value="">Select Specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.arabic_name || specialty.name} ({specialty.code})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>PDF File {!editingId && '*'}</label>
            <div style={{
              border: '2px dashed var(--purple-primary)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              background: 'rgba(179, 110, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)'
            }} onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--purple-light)';
              e.currentTarget.style.background = 'rgba(179, 110, 255, 0.15)';
            }} onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--purple-primary)';
              e.currentTarget.style.background = 'rgba(179, 110, 255, 0.08)';
            }}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
                <div style={{ fontWeight: '600', color: 'var(--purple-primary)', marginBottom: '5px' }}>
                  {fileInfo ? `✓ Selected: ${fileInfo}` : 'Click to select PDF file'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  or drag and drop (Max 5MB)
                </div>
              </label>
            </div>
          </div>

          {editingId && (
            <div style={{
              background: '#e8f4f8',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#2c3e50',
              borderLeft: '4px solid #3498db'
            }}>
              <strong>Note:</strong> Leave the file field empty to keep the current PDF. Select a new file to replace it.
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
