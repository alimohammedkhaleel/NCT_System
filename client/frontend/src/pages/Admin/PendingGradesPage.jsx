import { useState, useEffect, useCallback } from 'react';
import { gradesAPI } from '../../services/apiService';
import api from '../../services/apiService';

const STATUS_CONFIG = {
  draft:                  { label: 'مسودة',             color: 'var(--white-dim)',   bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)' },
  pending_admin_approval: { label: 'بانتظار الاعتماد',  color: '#f59e0b',            bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'   },
  approved:               { label: 'معتمدة',            color: '#34d399',            bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)'   },
  rejected:               { label: 'مرفوضة',            color: '#f87171',            bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)'  }
};

export default function PendingGradesPage() {
  const [viewMode, setViewMode]     = useState('pending');
  const [grades, setGrades]         = useState([]);
  const [allGrades, setAllGrades]   = useState([]); // unfiltered
  const [summary, setSummary]       = useState({ total: 0, draft: 0, pending_admin_approval: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]       = useState(true);
  const [approvingAll, setApprovingAll] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editModal, setEditModal]   = useState({ open: false, grade: null });
  const [editForm, setEditForm]     = useState({ assignment1_score: 0, assignment2_score: 0, final_exam_score: 0 });

  // Filters
  const [searchCode, setSearchCode]       = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterYear, setFilterYear]       = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [specialties, setSpecialties]     = useState([]);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch specialties for filter
  useEffect(() => {
    api.get('/specialties').then(res => setSpecialties(res.data.data || [])).catch(() => {});
  }, []);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];
      if (viewMode === 'pending') {
        const res = await gradesAPI.getPending();
        data = res.data.data || [];
        setAllGrades(data);
        // Count both draft and pending_admin_approval
        const pendingCount = data.filter(g => g.status === 'pending_admin_approval' || g.status === 'draft').length;
        setSummary(s => ({ ...s, pending_admin_approval: pendingCount }));
      } else {
        const res = await gradesAPI.getAllGrades();
        data = res.data.data || [];
        setAllGrades(data);
        setSummary(res.data.summary || { total: 0, draft: 0, pending_admin_approval: 0, approved: 0, rejected: 0 });
      }
    } catch {
      notify('حدث خطأ أثناء تحميل الدرجات', 'error');
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  // Apply filters whenever filter state or allGrades changes
  useEffect(() => {
    let filtered = [...allGrades];
    if (searchCode.trim()) {
      const s = searchCode.trim().toLowerCase();
      filtered = filtered.filter(g =>
        (g.Student?.student_code || '').toLowerCase().includes(s) ||
        (g.Student?.User?.full_name || '').toLowerCase().includes(s)
      );
    }
    if (filterSpecialty) {
      filtered = filtered.filter(g => String(g.Student?.specialty_id) === String(filterSpecialty));
    }
    if (filterYear) {
      filtered = filtered.filter(g => String(g.Student?.current_year) === String(filterYear));
    }
    if (filterSemester) {
      filtered = filtered.filter(g => String(g.semester_id) === String(filterSemester));
    }
    setGrades(filtered);
  }, [searchCode, filterSpecialty, filterYear, filterSemester, allGrades]);

  const handleApproveAll = async () => {
    if (!window.confirm(`هل تريد اعتماد جميع الدرجات المعلقة (${summary.pending_admin_approval}) دفعة واحدة؟`)) return;
    try {
      setApprovingAll(true);
      const res = await gradesAPI.approveAll({});
      notify(res.data.message || 'تم اعتماد جميع الدرجات بنجاح');
      fetchGrades();
    } catch (err) {
      notify(err.response?.data?.message || 'حدث خطأ أثناء الاعتماد الجماعي', 'error');
    } finally {
      setApprovingAll(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await gradesAPI.approve(id);
      notify('تم اعتماد الدرجة بنجاح');
      fetchGrades();
    } catch (err) {
      notify(err.response?.data?.message || 'حدث خطأ', 'error');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;
    try {
      await gradesAPI.reject(id, reason);
      notify('تم رفض الدرجة');
      fetchGrades();
    } catch (err) {
      notify(err.response?.data?.message || 'حدث خطأ', 'error');
    }
  };

  const openEdit = (grade) => {
    setEditModal({ open: true, grade });
    setEditForm({
      assignment1_score: grade.assignment1_score || 0,
      assignment2_score: grade.assignment2_score || 0,
      final_exam_score:  grade.final_exam_score  || 0
    });
  };

  const handleSaveEdit = async () => {
    try {
      await gradesAPI.editPending(editModal.grade.id, editForm);
      notify('تم تحديث الدرجة بنجاح');
      setEditModal({ open: false, grade: null });
      fetchGrades();
    } catch (err) {
      notify(err.response?.data?.message || 'حدث خطأ', 'error');
    }
  };

  const pendingCount = summary.pending_admin_approval || 0;
  const hasActiveFilters = searchCode || filterSpecialty || filterYear || filterSemester;

  /* ─── styles ─── */
  const s = {
    page: {
      padding: 'var(--spacing-lg)',
      direction: 'rtl',
      minHeight: 'calc(100vh - 80px)',
      background: 'var(--gradient-background)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: 'var(--white)',
      margin: 0,
      textShadow: '0 2px 10px var(--glow-purple)',
    },
    headerActions: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    toggleWrap: {
      display: 'flex',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--border-purple)',
    },
    toggleBtn: (active) => ({
      padding: '8px 18px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      fontFamily: 'var(--font-family-primary)',
      background: active ? 'var(--purple-primary, #7c3aed)' : 'rgba(255,255,255,0.04)',
      color: active ? '#fff' : 'var(--white-dim)',
      transition: 'all 0.2s',
    }),
    approveAllBtn: {
      padding: '8px 20px',
      background: approvingAll ? 'rgba(52,211,153,0.3)' : 'rgba(52,211,153,0.15)',
      color: '#34d399',
      border: '1px solid rgba(52,211,153,0.4)',
      borderRadius: '8px',
      cursor: approvingAll ? 'not-allowed' : 'pointer',
      fontWeight: 700,
      fontSize: '13px',
      fontFamily: 'var(--font-family-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s',
    },
    notification: (type) => ({
      padding: '12px 16px',
      marginBottom: '16px',
      borderRadius: '8px',
      background: type === 'error' ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
      color: type === 'error' ? '#f87171' : '#34d399',
      border: `1px solid ${type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
    }),
    summaryRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    summaryCard: (color, bg, border) => ({
      padding: '12px 20px',
      borderRadius: '10px',
      background: bg,
      border: `1px solid ${border}`,
      minWidth: '110px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
    }),
    summaryValue: (color) => ({
      fontSize: '22px',
      fontWeight: 700,
      color,
      lineHeight: 1,
    }),
    summaryLabel: {
      fontSize: '11px',
      color: 'var(--white-dim)',
      marginTop: '4px',
    },
    tableWrap: {
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: 'var(--glass-shadow)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
    },
    th: {
      background: 'rgba(179,110,255,0.15)',
      color: 'var(--purple-light, #c084fc)',
      fontWeight: 600,
      padding: '12px 16px',
      textAlign: 'right',
      borderBottom: '1px solid var(--border-purple)',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '11px 16px',
      borderBottom: '1px solid rgba(179,110,255,0.08)',
      color: 'var(--white-dim)',
      verticalAlign: 'middle',
    },
    emptyBox: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--white-dim)',
    },
    loadingBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px',
      gap: '16px',
      color: 'var(--white-dim)',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid rgba(179,110,255,0.2)',
      borderTopColor: 'var(--purple-primary, #7c3aed)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    actionBtn: (variant) => {
      const map = {
        approve: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.3)' },
        reject:  { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
        edit:    { bg: 'rgba(179,110,255,0.12)', color: 'var(--purple-light, #c084fc)', border: 'var(--border-purple)' },
      };
      const c = map[variant] || map.edit;
      return {
        padding: '4px 12px',
        borderRadius: '6px',
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.color,
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'var(--font-family-primary)',
        transition: 'all 0.15s',
      };
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    },
    modal: {
      background: 'var(--purple-dark, #1a0a2e)',
      border: '1px solid var(--border-purple)',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      direction: 'rtl',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 24px',
      borderBottom: '1px solid var(--border-purple)',
    },
    modalTitle: {
      fontSize: '1rem',
      fontWeight: 700,
      color: 'var(--white)',
      margin: 0,
    },
    modalClose: {
      background: 'none',
      border: 'none',
      color: 'var(--white-dim)',
      fontSize: '1.4rem',
      cursor: 'pointer',
      lineHeight: 1,
      padding: '2px 6px',
      borderRadius: '4px',
    },
    modalBody: { padding: '20px 24px' },
    formGroup: { marginBottom: '16px' },
    label: {
      display: 'block',
      fontSize: '13px',
      color: 'var(--white-dim)',
      marginBottom: '6px',
      fontWeight: 500,
    },
    input: {
      width: '100%',
      padding: '9px 12px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid var(--border-purple)',
      borderRadius: '8px',
      color: 'var(--white)',
      fontSize: '14px',
      fontFamily: 'var(--font-family-primary)',
      outline: 'none',
      boxSizing: 'border-box',
    },
    totalBox: {
      padding: '12px 16px',
      background: 'rgba(179,110,255,0.1)',
      border: '1px solid var(--border-purple)',
      borderRadius: '8px',
      color: 'var(--white)',
      fontSize: '14px',
      marginTop: '4px',
    },
    modalFooter: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      padding: '16px 24px',
      borderTop: '1px solid var(--border-purple)',
    },
    cancelBtn: {
      padding: '8px 20px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid var(--border-purple)',
      borderRadius: '8px',
      color: 'var(--white-dim)',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '13px',
      fontFamily: 'var(--font-family-primary)',
    },
    saveBtn: {
      padding: '8px 20px',
      background: 'rgba(179,110,255,0.2)',
      border: '1px solid var(--border-purple)',
      borderRadius: '8px',
      color: 'var(--purple-light, #c084fc)',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '13px',
      fontFamily: 'var(--font-family-primary)',
    },
  };

  const summaryCards = [
    { label: 'الإجمالي',          value: summary.total,                    color: 'var(--white)',  bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
    { label: 'مسودة',             value: summary.draft,                    ...STATUS_CONFIG.draft },
    { label: 'بانتظار الاعتماد',  value: summary.pending_admin_approval,   ...STATUS_CONFIG.pending_admin_approval },
    { label: 'معتمدة',            value: summary.approved,                 ...STATUS_CONFIG.approved },
    { label: 'مرفوضة',            value: summary.rejected,                 ...STATUS_CONFIG.rejected },
  ];

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Notification */}
      {notification && (
        <div style={s.notification(notification.type)}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit' }}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>إدارة درجات الطلاب</h1>
        <div style={s.headerActions}>
          {/* View toggle */}
          <div style={s.toggleWrap}>
            <button style={s.toggleBtn(viewMode === 'pending')} onClick={() => setViewMode('pending')}>
              المعلقة
              {pendingCount > 0 && (
                <span style={{ marginRight: '6px', background: 'rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button style={s.toggleBtn(viewMode === 'all')} onClick={() => setViewMode('all')}>
              جميع الدرجات
            </button>
          </div>

          {/* Approve All */}
          {pendingCount > 0 && (
            <button style={s.approveAllBtn} onClick={handleApproveAll} disabled={approvingAll}>
              {approvingAll ? '⏳ جاري الاعتماد...' : `✅ اعتماد الكل (${pendingCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '14px 16px', background: 'rgba(179,110,255,0.06)', borderRadius: '10px', border: '1px solid rgba(179,110,255,0.15)' }}>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 ابحث بكود الطالب أو اسمه..."
          value={searchCode}
          onChange={e => setSearchCode(e.target.value)}
          style={{ ...s.input, flex: '1', minWidth: '200px', maxWidth: '280px', padding: '8px 12px', fontSize: '13px' }}
        />
        {/* Specialty filter */}
        <select
          value={filterSpecialty}
          onChange={e => setFilterSpecialty(e.target.value)}
          style={{ ...s.input, minWidth: '160px', flex: 1, padding: '8px 12px', fontSize: '13px' }}
        >
          <option value="">— جميع التخصصات —</option>
          {specialties.map(sp => (
            <option key={sp.id} value={sp.id}>{sp.arabic_name || sp.name}</option>
          ))}
        </select>
        {/* Year filter */}
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          style={{ ...s.input, minWidth: '140px', flex: 1, padding: '8px 12px', fontSize: '13px' }}
        >
          <option value="">— جميع السنوات —</option>
          <option value="1">السنة الأولى</option>
          <option value="2">السنة الثانية</option>
          <option value="3">السنة الثالثة</option>
          <option value="4">السنة الرابعة</option>
        </select>
        {/* Semester filter */}
        <select
          value={filterSemester}
          onChange={e => setFilterSemester(e.target.value)}
          style={{ ...s.input, minWidth: '140px', flex: 1, padding: '8px 12px', fontSize: '13px' }}
        >
          <option value="">— جميع الترمات —</option>
          <option value="1">الفصل الأول</option>
          <option value="2">الفصل الثاني</option>
        </select>
        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => { setSearchCode(''); setFilterSpecialty(''); setFilterYear(''); setFilterSemester(''); }}
            style={{ padding: '8px 14px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            ✕ مسح الفلتر
          </button>
        )}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginRight: 'auto', whiteSpace: 'nowrap' }}>
          {grades.length} / {allGrades.length} درجة
        </span>
      </div>

      {/* Summary cards — all-grades view */}
      {viewMode === 'all' && !loading && (
        <div style={s.summaryRow}>
          {summaryCards.map(c => (
            <div key={c.label} style={s.summaryCard(c.color, c.bg, c.border)}>
              <div style={s.summaryValue(c.color)}>{c.value}</div>
              <div style={s.summaryLabel}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={s.loadingBox}>
          <div style={s.spinner} />
          <span>جاري تحميل الدرجات...</span>
        </div>
      ) : grades.length === 0 ? (
        <div style={{ ...s.tableWrap, ...s.emptyBox }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{viewMode === 'pending' ? '✅' : '📋'}</div>
          <h3 style={{ color: 'var(--white)', margin: '0 0 8px' }}>
            {viewMode === 'pending' ? 'لا توجد درجات معلقة!' : 'لا توجد درجات'}
          </h3>
          <p style={{ margin: 0 }}>
            {viewMode === 'pending' ? 'جميع الدرجات تمت معالجتها.' : 'لم يتم إدخال أي درجات بعد.'}
          </p>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['اسم الطالب', 'كود الطالب', 'المادة', 'أعمال 1', 'أعمال 2', 'النهائي', 'النسبة', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => {
                const sc = STATUS_CONFIG[g.status] || STATUS_CONFIG.draft;
                const isPending = g.status === 'pending_admin_approval';
                return (
                  <tr key={g.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(179,110,255,0.03)' }}>
                    <td style={s.td}>{g.Student?.User?.full_name || '—'}</td>
                    <td style={s.td}>{g.Student?.student_code || '—'}</td>
                    <td style={s.td}>{g.Course?.arabic_name || g.Course?.course_name || '—'}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{g.assignment1_score ?? '—'}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{g.assignment2_score ?? '—'}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{g.final_exam_score ?? '—'}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      {g.total_percentage ? `${parseFloat(g.total_percentage).toFixed(1)}%` : '—'}
                    </td>
                    <td style={s.td}>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={s.td}>
                      {(isPending || g.status === 'draft') && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button style={s.actionBtn('edit')}    onClick={() => openEdit(g)}>تعديل</button>
                          <button style={s.actionBtn('approve')} onClick={() => handleApprove(g.id)}>
                            {g.status === 'draft' ? '✅ اعتماد مباشر' : '✅ اعتماد'}
                          </button>
                          <button style={s.actionBtn('reject')}  onClick={() => handleReject(g.id)}>رفض</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setEditModal({ open: false, grade: null })}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>تعديل درجة — {editModal.grade?.Student?.User?.full_name || ''}</h3>
              <button style={s.modalClose} onClick={() => setEditModal({ open: false, grade: null })}>×</button>
            </div>
            <div style={s.modalBody}>
              {[
                { name: 'assignment1_score', label: 'درجة الأعمال 1' },
                { name: 'assignment2_score', label: 'درجة الأعمال 2' },
                { name: 'final_exam_score',  label: 'درجة الامتحان النهائي' },
              ].map(f => (
                <div key={f.name} style={s.formGroup}>
                  <label style={s.label}>{f.label}</label>
                  <input
                    type="number"
                    style={s.input}
                    value={editForm[f.name]}
                    onChange={e => setEditForm(prev => ({ ...prev, [f.name]: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
              <div style={s.totalBox}>
                <strong>المجموع: </strong>
                {(editForm.assignment1_score + editForm.assignment2_score + editForm.final_exam_score).toFixed(2)}
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setEditModal({ open: false, grade: null })}>إلغاء</button>
              <button style={s.saveBtn} onClick={handleSaveEdit}>حفظ التغييرات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
