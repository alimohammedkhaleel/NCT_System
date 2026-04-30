import React, { useState, useEffect } from 'react';
import api from '../../services/apiService';
import { professorRegistrationAPI } from '../../services/apiService';
import toast from 'react-hot-toast';
import styles from './RegistrationRequests.module.css';

const ProfessorRegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [viewMode, setViewMode] = useState('data'); // Default to 'data' to show all info
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const response = await professorRegistrationAPI.getRequests();
      setRequests(response.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setCreatingLink(true);
    try {
      const response = await professorRegistrationAPI.createLink({
        expires_in_days: expiryDays
      });
      if (response.data.success) {
        const token = response.data.data.token;
        setGeneratedLink(`${window.location.origin}/register/professor/${token}`);
        toast.success('تم إنشاء رابط التسجيل بنجاح');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في إنشاء الرابط');
    } finally {
      setCreatingLink(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('تم نسخ الرابط');
    } catch {
      toast.error('فشل في نسخ الرابط');
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const response = await professorRegistrationAPI.approve(id);
      if (response.data.success) {
        toast.success(`تم قبول الطلب\nكود الدكتور: ${response.data.data?.professor_code || ''}`);
        await fetchRequests();
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

    if (!window.confirm(`هل تريد قبول جميع الطلبات المعلقة (${pendingCount})؟ سيتم إنشاء حسابات لجميع هؤلاء الدكاترة.`)) return;
    
    setProcessing(true);
    try {
      const response = await professorRegistrationAPI.approveBulk();
      if (response.data.success) {
        const { approved, failed } = response.data.data;
        toast.success(`تم قبول ${approved} طلب${failed > 0 ? ` وفشل ${failed}` : ''}`);
        await fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في قبول الطلبات');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    setProcessingId(id);
    try {
      await professorRegistrationAPI.reject(id, {});
      toast.success('تم رفض الطلب');
      await fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في رفض الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    setProcessingId(id);
    try {
      await professorRegistrationAPI.delete(id);
      toast.success('تم حذف الطلب');
      await fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في حذف الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending:  <span className={`${styles.badge} ${styles.pending}`}>قيد المراجعة</span>,
      approved: <span className={`${styles.badge} ${styles.approved}`}>مقبول</span>,
      rejected: <span className={`${styles.badge} ${styles.rejected}`}>مرفوض</span>,
    };
    return map[status] || status;
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);

  if (loading) return <div className={styles.loading}>جاري التحميل...</div>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>طلبات تسجيل الدكاترة</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {filter === 'pending' && filtered.length > 0 && (
            <button 
              className={styles.approveBtn} 
              onClick={handleApproveAll}
              disabled={processing}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              ✅ قبول الكل ({filtered.length})
            </button>
          )}
          <button className={styles.createLinkBtn} onClick={() => setShowCreateLinkModal(true)}>
            + إنشاء رابط تسجيل دكتور
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {['pending','approved','rejected','all'].map(f => (
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

      {/* List View */}
      {viewMode === 'list' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم الكامل</th>
                <th>الرقم القومي</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>المؤهل</th>
                <th>الخبرة</th>
                <th>الحالة</th>
                <th>تاريخ التقديم</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="10" className={styles.noData}>لا توجد طلبات</td></tr>
              ) : filtered.map((req, i) => (
                <tr key={req.id}>
                  <td>{i + 1}</td>
                  <td>{req.full_name}</td>
                  <td>{req.national_id || '—'}</td>
                  <td>{req.email}</td>
                  <td>{req.phone || '—'}</td>
                  <td>{req.qualification || '—'}</td>
                  <td>{req.years_of_experience != null ? `${req.years_of_experience} سنة` : '—'}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>{fmt(req.created_at)}</td>
                  <td>
                    <button 
                      className={styles.viewBtn} 
                      onClick={() => setSelectedRequest(req)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data View - Shows detailed entries for all */}
      {viewMode === 'data' && (
        <div className={styles.dataViewContainer} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {filtered.length === 0 ? (
            <div className={styles.noData} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد طلبات</div>
          ) : filtered.map((req, i) => (
            <div key={req.id} className={styles.dataCard} style={{
              background: 'rgba(25, 10, 45, 0.6)',
              border: '1px solid rgba(179, 110, 255, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '2rem',
              alignItems: 'start',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease, border-color 0.3s ease'
            }}>
              {/* Data Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                {/* Personal Info */}
                <div>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>👤 البيانات الشخصية</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div><strong>الاسم:</strong> {req.full_name}</div>
                    <div><strong>الرقم القومي:</strong> {req.national_id || '—'}</div>
                    <div><strong>البريد:</strong> {req.email}</div>
                    <div><strong>الهاتف:</strong> {req.phone || '—'}</div>
                  </div>
                </div>

                {/* Academic Info */}
                <div>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>🎓 البيانات الأكاديمية</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div><strong>التخصص:</strong> {req.Specialty?.arabic_name || req.Specialty?.name || '—'}</div>
                    <div><strong>المؤهل:</strong> {req.qualification || '—'}</div>
                    <div><strong>الخبرة:</strong> {req.years_of_experience != null ? `${req.years_of_experience} سنة` : '—'}</div>
                    <div><strong>القسم:</strong> {req.department || '—'}</div>
                  </div>
                </div>

                {/* Request Info */}
                <div>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>📝 معلومات الطلب</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div><strong>تاريخ التقديم:</strong> {fmt(req.created_at)}</div>
                    <div><strong>الحالة:</strong> {getStatusBadge(req.status)}</div>
                    {req.rejection_reason && (
                      <div style={{ color: '#ff4d4d' }}><strong>سبب الرفض:</strong> {req.rejection_reason}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                minWidth: '160px'
              }}>
                {req.status === 'pending' && (
                  <>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id || processing}
                      style={{ width: '100%', padding: '10px' }}
                    >
                      ✅ قبول الطلب
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id || processing}
                      style={{ width: '100%', padding: '10px' }}
                    >
                      ❌ رفض
                    </button>
                  </>
                )}
                {(req.status === 'rejected' || req.status === 'pending') && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(req.id)}
                    disabled={processingId === req.id || processing}
                    style={{ width: '100%', padding: '10px' }}
                  >
                    🗑️ حذف
                  </button>
                )}
                {req.status === 'approved' && (
                  <div style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    color: '#00e676', 
                    fontSize: '1rem',
                    background: 'rgba(0, 230, 118, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 230, 118, 0.3)'
                  }}>
                    ✓ تم القبول
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateLinkModal && (
        <div className={styles.modal} onClick={() => { setShowCreateLinkModal(false); setGeneratedLink(null); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إنشاء رابط تسجيل دكتور</h2>
              <button className={styles.closeBtn} onClick={() => { setShowCreateLinkModal(false); setGeneratedLink(null); }}>×</button>
            </div>

            {!generatedLink ? (
              <div className={styles.createLinkContent}>
                <p className={styles.createLinkDescription}>
                  سيتم إنشاء رابط تسجيل للدكاترة. يمكن للدكتور استخدام هذا الرابط لتقديم طلب التسجيل.
                </p>
                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--white-dim)', fontWeight: 600 }}>
                    مدة صلاحية الرابط (بالأيام)
                  </label>
                  <select
                    value={expiryDays}
                    onChange={e => setExpiryDays(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(17,1,23,0.5)', color: 'var(--white)', border: '1px solid rgba(179,110,255,0.3)' }}
                  >
                    <option value={1}>يوم واحد</option>
                    <option value={3}>3 أيام</option>
                    <option value={7}>أسبوع</option>
                    <option value={14}>أسبوعان</option>
                    <option value={30}>شهر</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowCreateLinkModal(false)} disabled={creatingLink}>إلغاء</button>
                  <button className={styles.confirmBtn} onClick={handleCreateLink} disabled={creatingLink}>
                    {creatingLink ? 'جاري الإنشاء...' : 'إنشاء الرابط'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.linkGeneratedContent}>
                <div className={styles.successMessage}>✓ تم إنشاء الرابط بنجاح!</div>
                <div className={styles.linkBox}>
                  <input type="text" value={generatedLink} readOnly className={styles.linkInput} />
                  <button className={styles.copyLinkBtn} onClick={copyLink}>نسخ</button>
                </div>
                <p className={styles.linkInfo}>أرسل هذا الرابط للدكتور ليقوم بتعبئة بيانات التسجيل</p>
                <button className={styles.doneBtn} onClick={() => { setShowCreateLinkModal(false); setGeneratedLink(null); }}>تم</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Modal (For View button in table) */}
      {selectedRequest && (
        <div className={styles.modal} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>تفاصيل طلب الدكتور</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedRequest(null)}>×</button>
            </div>

            <div className={styles.detailsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '1rem' }}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle} style={{ color: 'var(--accent-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>البيانات الشخصية</h3>
                <p><strong>الاسم:</strong> {selectedRequest.full_name}</p>
                <p><strong>الرقم القومي:</strong> {selectedRequest.national_id || '—'}</p>
                <p><strong>البريد:</strong> {selectedRequest.email}</p>
                <p><strong>الهاتف:</strong> {selectedRequest.phone || '—'}</p>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle} style={{ color: 'var(--accent-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>البيانات الأكاديمية</h3>
                <p><strong>التخصص:</strong> {selectedRequest.Specialty?.arabic_name || selectedRequest.Specialty?.name || '—'}</p>
                <p><strong>المؤهل:</strong> {selectedRequest.qualification || '—'}</p>
                <p><strong>الخبرة:</strong> {selectedRequest.years_of_experience} سنة</p>
                <p><strong>القسم:</strong> {selectedRequest.department || '—'}</p>
              </div>
            </div>

            <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
              {selectedRequest.status === 'pending' && (
                <>
                  <button className={styles.rejectBtn} onClick={() => { handleReject(selectedRequest.id); setSelectedRequest(null); }}>رفض</button>
                  <button className={styles.approveBtn} onClick={() => { handleApprove(selectedRequest.id); setSelectedRequest(null); }}>قبول الطلب</button>
                </>
              )}
              <button className={styles.cancelBtn} onClick={() => setSelectedRequest(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorRegistrationRequests;
