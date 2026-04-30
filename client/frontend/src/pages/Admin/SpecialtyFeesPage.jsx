import { useState, useEffect, useCallback } from 'react';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import commonStyles from './AdminCommon.module.css';

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 });

export default function SpecialtyFeesPage() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // specialty id being saved

  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/specialty-fees');
      setSpecialties(res.data.data || []);
    } catch (err) {
      toast.error('فشل تحميل الرسوم الدراسية');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  const handleFeeChange = (specId, yearKey, value) => {
    setSpecialties(prev =>
      prev.map(s => s.id === specId ? { ...s, [yearKey]: value } : s)
    );
  };

  const handleSave = async (spec) => {
    setSaving(spec.id);
    try {
      await api.put(`/admin/specialty-fees/${spec.id}`, {
        year1_fee: parseFloat(spec._year1_fee) || 0,
        year2_fee: parseFloat(spec._year2_fee) || 0,
        year3_fee: parseFloat(spec._year3_fee) || 0,
        year4_fee: parseFloat(spec._year4_fee) || 0,
        summer_fee: parseFloat(spec._summer_fee) || 0,
        course_fail_fee: parseFloat(spec._course_fail_fee) || 0,
      });
      toast.success(`تم حفظ رسوم ${spec.arabic_name || spec.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حفظ الرسوم');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className={commonStyles.pageWrapper}>
      <div className={commonStyles.pageHeader}>
        <h1 className={commonStyles.pageTitle}>الرسوم الدراسية</h1>
        <p className={commonStyles.pageSubtitle}>تحديد رسوم كل تخصص لكل سنة دراسية</p>
      </div>

      <div className={commonStyles.card}>
        <p style={{ color: 'var(--white-dim)', fontSize: '0.875rem', marginBottom: 20 }}>
          💡 الرسوم المحددة هنا تُستخدم تلقائياً لإنشاء فواتير الطلاب في قسم المالية.
          أدخل 0 لأي سنة لا تريد تحديد رسوم لها.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--white-dim)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(179,110,255,0.2)', borderTopColor: 'var(--purple-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            جاري التحميل...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>التخصص</th>
                  <th style={thStyle}>السنة الأولى (ج.م)</th>
                  <th style={thStyle}>السنة الثانية (ج.م)</th>
                  <th style={thStyle}>السنة الثالثة (ج.م)</th>
                  <th style={thStyle}>السنة الرابعة (ج.م)</th>
                  <th style={{ ...thStyle, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>☀️ رسوم صيفية (ج.م)</th>
                  <th style={{ ...thStyle, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>📚 رسوب في مادة (ج.م)</th>
                  <th style={thStyle}>حفظ</th>
                </tr>
              </thead>
              <tbody>
                {specialties.map(spec => (
                  <tr key={spec.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: 'var(--white)' }}>{spec.arabic_name || spec.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--white-dim)' }}>{spec.code}</div>
                    </td>
                    {[1, 2, 3, 4].map(yr => (
                      <td key={yr} style={tdStyle}>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={spec[`_year${yr}_fee`] ?? ''}
                          onChange={e => handleFeeChange(spec.id, `_year${yr}_fee`, e.target.value)}
                          placeholder="0"
                          style={inputStyle}
                        />
                      </td>
                    ))}
                    {/* Summer fee */}
                    <td style={tdStyle}>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={spec._summer_fee ?? ''}
                        onChange={e => handleFeeChange(spec.id, '_summer_fee', e.target.value)}
                        placeholder="0"
                        style={{ ...inputStyle, borderColor: 'rgba(245, 158, 11, 0.4)' }}
                      />
                    </td>
                    {/* Course fail fee */}
                    <td style={tdStyle}>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={spec._course_fail_fee ?? ''}
                        onChange={e => handleFeeChange(spec.id, '_course_fail_fee', e.target.value)}
                        placeholder="0"
                        style={{ ...inputStyle, borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleSave(spec)}
                        disabled={saving === spec.id}
                        style={{
                          padding: '8px 16px',
                          background: saving === spec.id ? 'rgba(179,110,255,0.3)' : 'var(--purple-primary)',
                          color: 'var(--white)',
                          border: 'none',
                          borderRadius: 8,
                          cursor: saving === spec.id ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-family-primary)',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {saving === spec.id ? 'جاري...' : '💾 حفظ'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  background: 'rgba(179, 110, 255, 0.15)',
  color: 'var(--purple-light)',
  fontWeight: 600,
  padding: '12px 16px',
  textAlign: 'right',
  borderBottom: '1px solid var(--border-purple)',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid rgba(179, 110, 255, 0.08)',
  color: 'var(--white-dim)',
  verticalAlign: 'middle'
};

const inputStyle = {
  width: 110,
  padding: '8px 10px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid var(--border-purple)',
  borderRadius: 8,
  color: 'var(--white)',
  fontSize: '0.875rem',
  fontFamily: 'var(--font-family-primary)',
  outline: 'none',
  textAlign: 'center'
};
