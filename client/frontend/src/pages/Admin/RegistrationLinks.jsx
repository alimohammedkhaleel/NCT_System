import React, { useState, useEffect } from 'react';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import styles from './RegistrationLinks.module.css';

const RegistrationLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/admin/registration-links');
      // API returns data in response.data.data
      setLinks(response.data.data || response.data.links || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في تحميل الروابط');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    setError('');
    
    try {
      const response = await api.post('/admin/registration-links', {
        expires_in_days: expiryDays
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // API returns data in response.data.data
        const linkData = response.data.data;
        const token = linkData.token;
        const fullUrl = `${window.location.origin}/register/${token}`;
        setGeneratedLink(fullUrl);
        toast.success('تم إنشاء رابط التسجيل بنجاح');
        await fetchLinks();
      }
    } catch (err) {
      console.error('Error creating link:', err);
      setError(err.response?.data?.message || 'فشل في إنشاء الرابط');
      toast.error(err.response?.data?.message || 'فشل في إنشاء الرابط');
    } finally {
      setCreating(false);
    }
  };

  const copyGeneratedLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('تم نسخ الرابط بنجاح');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('فشل في نسخ الرابط');
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setGeneratedLink(null);
    setExpiryDays(7);
  };

  const copyToClipboard = async (link) => {
    try {
      const fullUrl = `${window.location.origin}/register/${link.token}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(link.id);
      toast.success('تم نسخ الرابط بنجاح');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('فشل في نسخ الرابط');
    }
  };

  const getStatusBadge = (link) => {
    if (link.is_used) {
      return <span className={`${styles.badge} ${styles.used}`}>مستخدم</span>;
    }
    
    const now = new Date();
    const expiryDate = new Date(link.expires_at);
    
    if (expiryDate < now) {
      return <span className={`${styles.badge} ${styles.expired}`}>منتهي</span>;
    }
    
    return <span className={`${styles.badge} ${styles.active}`}>نشط</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>جاري التحميل...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>روابط التسجيل</h1>
        <button 
          className={styles.createBtn}
          onClick={() => setShowCreateModal(true)}
        >
          + إنشاء رابط جديد
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>الرابط</th>
              <th>الحالة</th>
              <th>تاريخ الإنشاء</th>
              <th>تاريخ الانتهاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  لا توجد روابط تسجيل
                </td>
              </tr>
            ) : (
              links.map((link, index) => (
                <tr key={link.id}>
                  <td>{index + 1}</td>
                  <td className={styles.tokenCell}>
                    <code className={styles.token}>{link.token.substring(0, 8)}...</code>
                  </td>
                  <td>{getStatusBadge(link)}</td>
                  <td>{formatDate(link.created_at)}</td>
                  <td>{formatDate(link.expires_at)}</td>
                  <td>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(link)}
                      disabled={link.is_used || new Date(link.expires_at) < new Date()}
                    >
                      {copiedId === link.id ? '✓ تم النسخ' : 'نسخ الرابط'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className={styles.modal} onClick={closeCreateModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إنشاء رابط تسجيل جديد</h2>
              <button 
                className={styles.closeBtn}
                onClick={closeCreateModal}
              >
                ×
              </button>
            </div>

            {!generatedLink ? (
              <>
                <div className={styles.formGroup}>
                  <label>مدة صلاحية الرابط (بالأيام)</label>
                  <input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                    min="1"
                    max="365"
                    className={styles.input}
                  />
                  <small className={styles.hint}>
                    سينتهي الرابط بعد {expiryDays} يوم من الآن
                  </small>
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={closeCreateModal}
                    disabled={creating}
                  >
                    إلغاء
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={handleCreateLink}
                    disabled={creating}
                  >
                    {creating ? 'جاري الإنشاء...' : 'إنشاء'}
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.linkGeneratedContent}>
                <div className={styles.successMessage}>
                  ✓ تم إنشاء الرابط بنجاح!
                </div>
                
                <div className={styles.linkBox}>
                  <input 
                    type="text" 
                    value={generatedLink} 
                    readOnly 
                    className={styles.linkInput}
                  />
                  <button 
                    className={styles.copyLinkBtn}
                    onClick={copyGeneratedLink}
                  >
                    نسخ
                  </button>
                </div>
                
                <p className={styles.linkInfo}>
                  هذا الرابط صالح لمدة {expiryDays} يوم من الآن
                </p>
                
                <button
                  className={styles.doneBtn}
                  onClick={closeCreateModal}
                >
                  تم
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationLinks;
