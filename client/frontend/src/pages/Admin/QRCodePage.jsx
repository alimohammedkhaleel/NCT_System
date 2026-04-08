import { useState, useEffect } from 'react';
import { Table } from '../../components/common';
import { qrCodeAPI } from '../../services/apiService';
import api from '../../services/apiService';
import styles from './CoursesPage.module.css';

export default function QRCodePage() {
  const [students, setStudents] = useState([]);
  const [qrCodes, setQrCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch students from an endpoint - using /api/admin/students or similar
      const res = await api.get('/admin/students');
      setStudents(res.data.data || []);
    } catch (error) {
      // If /admin/students doesn't exist, try alternative
      if (error.response?.status === 404) {
        showNotification('Students endpoint not found. Trying grade endpoint...', 'info');
        try {
          const gradeRes = await api.get('/grades/admin/pending');
          // Extract unique students from pending grades
          const uniqueStudents = [];
          const seen = new Set();
          gradeRes.data.data?.forEach(grade => {
            if (grade.Student && !seen.has(grade.Student.id)) {
              seen.add(grade.Student.id);
              uniqueStudents.push(grade.Student);
            }
          });
          setStudents(uniqueStudents);
        } catch (e) {
          showNotification('Could not load students', 'error');
        }
      } else {
        showNotification('Error loading students', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (studentId) => {
    try {
      setGenerating(prev => ({ ...prev, [studentId]: true }));
      const res = await qrCodeAPI.generate(studentId);
      setQrCodes(prev => ({
        ...prev,
        [studentId]: res.data.data
      }));
      showNotification(`QR Code generated for student ${studentId}`, 'success');
    } catch (error) {
      console.error('Generate QR error:', error);
      showNotification(error.response?.data?.message || 'Error generating QR code', 'error');
    } finally {
      setGenerating(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleDownloadQR = (studentId) => {
    const qrData = qrCodes[studentId];
    if (!qrData?.qr_image) {
      showNotification('No QR code to download', 'error');
      return;
    }

    const link = document.createElement('a');
    link.href = qrData.qr_image;
    link.download = `qr-code-student-${studentId}-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('QR Code downloaded', 'success');
  };

  const columns = [
    { key: 'student_code', label: 'Student Code' },
    {
      key: 'User',
      label: 'Name',
      render: (user) => user?.full_name || 'N/A'
    },
    {
      key: 'User',
      label: 'Email',
      render: (user) => user?.email || 'N/A'
    },
    {
      key: 'id',
      label: 'QR Status',
      render: (studentId) => {
        const qr = qrCodes[studentId];
        return qr ? (
          <span style={{ color: '#27ae60', fontWeight: '600' }}>✓ Generated</span>
        ) : (
          <span style={{ color: '#95a5a6' }}>Pending</span>
        );
      }
    }
  ];

  const actions = [
    {
      label: 'Generate QR',
      onClick: (student) => handleGenerateQR(student.id),
      variant: 'primary'
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
        <h1 className={styles.pageTitle}>QR Code Management</h1>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading students...</p>
        </div>
      ) : students.length > 0 ? (
        <>
          <Table columns={columns} data={students} actions={actions} />

          {/* QR Code Displays */}
          {Object.entries(qrCodes).length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Generated QR Codes</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {Object.entries(qrCodes).map(([studentId, qrData]) => {
                  const student = students.find(s => s.id === parseInt(studentId));
                  return (
                    <div key={studentId} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2c3e50' }}>
                        {student?.student_code}
                      </h4>
                      <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#7f8c8d' }}>
                        {student?.User?.full_name}
                      </p>
                      
                      {qrData.qr_image ? (
                        <img
                          src={qrData.qr_image}
                          alt={`QR for ${student?.student_code}`}
                          style={{
                            width: '200px',
                            height: '200px',
                            margin: '0 auto 15px auto',
                            border: '2px solid #3498db',
                            borderRadius: '4px'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '200px',
                          height: '200px',
                          margin: '0 auto 15px auto',
                          background: '#ecf0f1',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#7f8c8d'
                        }}>
                          No Image
                        </div>
                      )}

                      <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '12px', wordBreak: 'break-all' }}>
                        Secret: {qrData.qr_secret?.substr(0, 10)}...
                      </div>

                      <button
                        className={styles.submitBtn}
                        onClick={() => handleDownloadQR(studentId)}
                        style={{ width: '100%' }}
                      >
                        📥 Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#7f8c8d'
        }}>
          <p>No students found. Enroll students first.</p>
        </div>
      )}
    </div>
  );
}
