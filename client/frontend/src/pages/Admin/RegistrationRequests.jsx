import React, { useState, useEffect } from 'react';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import styles from './RegistrationRequests.module.css';

const RegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [viewMode, setViewMode] = useState('data'); // Default to 'data' (Display All)
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/registration-requests');
      setRequests(response.data.data || response.data.requests || []);
      setError('');
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setCreatingLink(true);
    setError('');
    try {
      const response = await api.post('/admin/registration-links', {
        expires_in_days: 1 // 24 hours
      });
      if (response.data.success) {
        const linkData = response.data.data;
        if (linkData && linkData.token) {
          const fullUrl = `${window.location.origin}/register/${linkData.token}`;
          setGeneratedLink(fullUrl);
          toast.success('تم إنشاء رابط التسجيل بنجاح');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في إنشاء الرابط');
    } finally {
      setCreatingLink(false);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('تم نسخ الرابط بنجاح');
    } catch (error) {
      toast.error('فشل في نسخ الرابط');
    }
  };

  const closeCreateLinkModal = () => {
    setShowCreateLinkModal(false);
    setGeneratedLink(null);
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      const response = await api.post(`/admin/registration-requests/${requestId}/approve`, {});
      if (response.data.success) {
        const { full_name, student_code } = response.data.data || {};
        await fetchRequests();
        setSelectedRequest(null);
        toast.success(`تم قبول طلب الطالب ${full_name || 'غير معروف'} بنجاح\nكود الطالب: ${student_code || 'تم إنشاؤه'}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في قبول الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    if (pendingCount === 0) {
      toast.error('لا توجد طلبات معلقة لقبولها');
      return;
    }

    if (!window.confirm(`هل تريد قبول جميع الطلبات المعلقة (${pendingCount})؟ سيتم إنشاء حسابات وأكواد لجميع هؤلاء الطلاب.`)) return;
    
    setProcessing(true);
    try {
      const response = await api.post('/admin/registration-requests/approve-all', {});
      if (response.data.success) {
        const { approved, failed, failedRequests } = response.data.data || { approved: pendingCount, failed: 0 };
        if (failed > 0) {
          const reasons = (failedRequests || []).map(r => `• ${r.email}: ${r.reason}`).join('\n');
          toast.error(
            `تمت معالجة ${pendingCount} طلب:\n✅ قبول: ${approved}\n❌ فشل: ${failed}\n\nأسباب الفشل:\n${reasons}`,
            { duration: 8000 }
          );
        } else {
          toast.success(`✅ تم قبول جميع الطلبات بنجاح (${approved} طلب)`, { duration: 4000 });
        }
        await fetchRequests();
      }
    } catch (err) {
      console.error('Bulk approve error:', err);
      toast.error(err.response?.data?.message || 'فشل في قبول الطلبات بالكامل');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    setProcessingId(requestId);
    try {
      await api.post(`/admin/registration-requests/${requestId}/reject`, {});
      await fetchRequests();
      setSelectedRequest(null);
      toast.success('تم رفض الطلب');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في رفض الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    setProcessingId(requestId);
    try {
      await api.delete(`/admin/registration-requests/${requestId}`);
      await fetchRequests();
      setSelectedRequest(null);
      toast.success('تم حذف الطلب بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في حذف الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className={`${styles.badge} ${styles.pending}`}>قيد المراجعة</span>,
      approved: <span className={`${styles.badge} ${styles.approved}`}>مقبول</span>,
      rejected: <span className={`${styles.badge} ${styles.rejected}`}>مرفوض</span>
    };
    return badges[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(req => filter === 'all' ? true : req.status === filter);

  if (loading) return <div className={styles.loading}>جاري التحميل...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>طلبات تسجيل الطلاب</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {filter === 'pending' && filteredRequests.length > 0 && (
            <button 
              className={styles.approveBtn} 
              onClick={handleApproveAll}
              disabled={processing}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              ✅ قبول الكل ({filteredRequests.length})
            </button>
          )}
          <button className={styles.createLinkBtn} onClick={() => setShowCreateLinkModal(true)}>
            + إنشاء رابط تسجيل طلاب
          </button>
        </div>
      </div>
        
      <div className={styles.filters}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => { setFilter(f); }}
          >
            {f === 'pending' ? 'قيد المراجعة' : f === 'approved' ? 'مقبول' : f === 'rejected' ? 'مرفوض' : 'الكل'}
            {' '}({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className={styles.viewModeButtons} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          className={`${styles.filterBtn} ${viewMode === 'list' ? styles.active : ''}`}
          onClick={() => setViewMode('list')}
          style={{ flex: 1 }}
        >
          📋 عرض الجدول
        </button>
        <button
          className={`${styles.filterBtn} ${viewMode === 'data' ? styles.active : ''}`}
          onClick={() => setViewMode('data')}
          style={{ flex: 1 }}
        >
          👁️ عرض تفصيلي (بيانات الكل)
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* List View */}
      {viewMode === 'list' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم الكامل</th>
                <th>الرقم القومي</th>
                <th>التخصص</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>تاريخ التقديم</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr><td colSpan="8" className={styles.noData}>لا توجد طلبات</td></tr>
              ) : filteredRequests.map((req, index) => (
                <tr key={req.id}>
                  <td>{index + 1}</td>
                  <td>{req.full_name}</td>
                  <td>{req.national_id}</td>
                  <td>{req.Specialty?.arabic_name || req.Specialty?.name || '-'}</td>
                  <td>{req.email}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>{formatDate(req.created_at)}</td>
                  <td>
                    <button className={styles.viewBtn} onClick={() => setSelectedRequest(req)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>عرض</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data View - Detailed Cards for all */}
      {viewMode === 'data' && (
        <div className={styles.dataViewContainer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredRequests.length === 0 ? (
            <div className={styles.noData} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد طلبات</div>
          ) : filteredRequests.map((request, i) => (
            <div key={request.id} className={styles.dataCard} style={{
              background: 'rgba(25, 10, 45, 0.6)',
              border: '1px solid rgba(179, 110, 255, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '2rem',
              alignItems: 'start',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {/* Personal Info */}
                <div>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>👤 البيانات الشخصية</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div><strong>الاسم:</strong> {request.full_name}</div>
                    <div><strong>الرقم القومي:</strong> {request.national_id}</div>
                    <div><strong>تاريخ الميلاد:</strong> {new Date(request.birth_date).toLocaleDateString('ar-EG')}</div>
                    <div><strong>النوع:</strong> {request.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>📞 بيانات الاتصال</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div><strong>البريد:</strong> {request.email}</div>
                    <div><strong>الهاتف:</strong> {request.phone || '—'}</div>
                    <div><strong>العنوان:</strong> {request.address || '—'}</div>
                  </div>
                </div>

                {/* Academic Info */}
                <div>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>🎓 البيانات الأكاديمية</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div><strong>التخصص:</strong> {request.Specialty?.arabic_name || request.Specialty?.name || '—'}</div>
                    <div><strong>شهادة الثانوية:</strong> {request.high_school_certificate || '—'}</div>
                    <div><strong>المجموع:</strong> {request.high_school_grade || '—'}</div>
                    <div><strong>الحالة:</strong> {getStatusBadge(request.status)}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '160px' }}>
                {request.status === 'pending' && (
                  <>
                    <button className={styles.approveBtn} onClick={() => handleApprove(request.id)} disabled={processingId === request.id || processing} style={{ width: '100%', padding: '10px' }}>✅ قبول الطالب</button>
                    <button className={styles.rejectBtn} onClick={() => handleReject(request.id)} disabled={processingId === request.id || processing} style={{ width: '100%', padding: '10px' }}>❌ رفض</button>
                  </>
                )}
                {request.status === 'rejected' && (
                  <button className={styles.approveBtn} onClick={() => handleApprove(request.id)} disabled={processingId === request.id || processing} style={{ width: '100%', padding: '10px' }}>✅ قبول الطالب</button>
                )}
                {(request.status === 'rejected' || request.status === 'pending') && (
                  <button className={styles.deleteBtn} onClick={() => handleDelete(request.id)} disabled={processingId === request.id || processing} style={{ width: '100%', padding: '10px' }}>🗑️ حذف</button>
                )}
                {request.status === 'approved' && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#00e676', background: 'rgba(0, 230, 118, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 230, 118, 0.3)' }}>✓ مقبول</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateLinkModal && (
        <div className={styles.modal} onClick={closeCreateLinkModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إنشاء رابط تسجيل جديد</h2>
              <button className={styles.closeBtn} onClick={closeCreateLinkModal}>×</button>
            </div>
            {!generatedLink ? (
              <div className={styles.createLinkContent}>
                <p className={styles.createLinkDescription}>سيتم إنشاء رابط تسجيل صالح لمدة 24 ساعة فقط.</p>
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={closeCreateLinkModal} disabled={creatingLink}>إلغاء</button>
                  <button className={styles.confirmBtn} onClick={handleCreateLink} disabled={creatingLink}>{creatingLink ? 'جاري الإنشاء...' : 'إنشاء الرابط'}</button>
                </div>
              </div>
            ) : (
              <div className={styles.linkGeneratedContent}>
                <div className={styles.successMessage}>✓ تم إنشاء الرابط بنجاح!</div>
                <div className={styles.linkBox}>
                  <input type="text" value={generatedLink} readOnly className={styles.linkInput} />
                  <button className={styles.copyLinkBtn} onClick={copyLinkToClipboard}>نسخ</button>
                </div>
                <button className={styles.doneBtn} onClick={closeCreateLinkModal}>تم</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className={styles.modal} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>تفاصيل الطلب</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <div className={styles.detailsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '1rem' }}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle} style={{ color: 'var(--accent-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>البيانات الشخصية</h3>
                <p><strong>الاسم:</strong> {selectedRequest.full_name}</p>
                <p><strong>الرقم القومي:</strong> {selectedRequest.national_id}</p>
                <p><strong>البريد:</strong> {selectedRequest.email}</p>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle} style={{ color: 'var(--accent-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>بيانات ولي الأمر</h3>
                <p><strong>ولي الأمر:</strong> {selectedRequest.guardian_name || '-'}</p>
                <p><strong>الهاتف:</strong> {selectedRequest.guardian_phone || '-'}</p>
              </div>
            </div>
            <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
              {selectedRequest.status === 'pending' && (
                <>
                  <button className={styles.rejectBtn} onClick={() => { handleReject(selectedRequest.id); setSelectedRequest(null); }}>رفض</button>
                  <button className={styles.approveBtn} onClick={() => { handleApprove(selectedRequest.id); setSelectedRequest(null); }}>قبول الطلب</button>
                </>
              )}
              {selectedRequest.status === 'rejected' && (
                <button className={styles.approveBtn} onClick={() => { handleApprove(selectedRequest.id); setSelectedRequest(null); }}>✅ قبول الطلب</button>
              )}
              <button className={styles.cancelBtn} onClick={() => setSelectedRequest(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRequests;
