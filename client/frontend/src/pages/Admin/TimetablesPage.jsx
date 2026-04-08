import { useState, useEffect } from 'react';
import { Table, Modal } from '../../components/common';
import { timetablesAPI, specialtiesAPI } from '../../services/apiService';
import styles from './CoursesPage.module.css';

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
        specialtiesAPI.getAll()
      ]);
      setTimetables(timetablesRes.data.data || []);
      
      // Add static specialties as fallback
      const specs = specialtiesRes.data.data || [
        { id: 1, name: 'هندسة البرمجيات', code: 'CS' },
        { id: 2, name: 'هندسة الاتصالات', code: 'EE' },
        { id: 3, name: 'العلوم الإدارية', code: 'BA' }
      ];
      setSpecialties(specs);
    } catch (error) {
      showNotification('Error fetching timetables', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
    if (timetable.file_url) {
      window.open(timetable.file_url, '_blank');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'specialty_id',
      label: 'Specialty',
      render: (specialtyId) => {
        const specialty = specialties.find(s => s.id === specialtyId);
        return specialty ? (specialty.name || specialty.specialty_name) : 'N/A';
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
            color: '#3498db',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '14px',
            fontWeight: '500'
          }}
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
          padding: '40px',
          color: '#7f8c8d',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📅</div>
          <h3>No timetables uploaded yet</h3>
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
                  {specialty.name || specialty.specialty_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>PDF File {!editingId && '*'}</label>
            <div style={{
              border: '2px dashed #3498db',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              background: '#f8f9fa',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
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
                <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                  {fileInfo ? `Selected: ${fileInfo}` : 'Click to select PDF file'}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
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
