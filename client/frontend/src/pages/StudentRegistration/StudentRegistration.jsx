import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import BranchSelector from '../../components/BranchSelector/BranchSelector';
import styles from './StudentRegistration.module.css';

const StudentRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [branchError, setBranchError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    birth_date: '',
    gender: 'male',
    email: '',
    phone: '',
    address: '',
    specialty_id: '',
    current_year: '1',
    branch: null,
    high_school_certificate: '',
    high_school_grade: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: ''
  });

  // Determine if branch selection is required
  const selectedSpecialty = specialties.find(s => String(s.id) === String(formData.specialty_id));
  const isICT = selectedSpecialty && (
    selectedSpecialty.code === 'ICT' ||
    selectedSpecialty.name?.toLowerCase().includes('information')
  );
  const showBranchSelector = isICT && parseInt(formData.current_year) >= 3;

  useEffect(() => {
    validateLink();
  }, [token]);

  const validateLink = async () => {
    try {
      const response = await api.get(`/auth/register-link/${token}`);
      if (response.data.success) {
        setLinkValid(true);
        const specialties = response.data.data?.specialties || response.data.specialties || [];
        setSpecialties(specialties);
      }
    } catch (err) {
      console.error('Link validation error:', err);
      setError(err.response?.data?.message || 'رابط التسجيل غير صالح أو منتهي الصلاحية');
      setLinkValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset branch when specialty or year changes
      ...(name === 'specialty_id' || name === 'current_year' ? { branch: null } : {})
    }));
    // Clear branch error when user changes relevant fields
    if (name === 'specialty_id' || name === 'current_year') {
      setBranchError('');
    }
  };

  const handleBranchChange = (branch) => {
    setFormData(prev => ({ ...prev, branch }));
    setBranchError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBranchError('');

    // Client-side branch validation
    if (showBranchSelector && !formData.branch) {
      setBranchError('يرجى اختيار الفرع (البرمجيات أو الشبكات) - Branch selection is required');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        current_year: parseInt(formData.current_year) || 1,
        branch: showBranchSelector ? formData.branch : null
      };

      const response = await api.post(`/auth/register-link/${token}`, payload);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'فشل في إرسال طلب التسجيل';
      // Check if it's a branch-related error
      if (err.response?.data?.message?.includes('فرع') || err.response?.data?.message_en?.includes('branch')) {
        setBranchError(errMsg);
      } else {
        setError(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>جاري التحقق من الرابط...</div>
      </div>
    );
  }

  if (!linkValid) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>رابط غير صالح</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <h2>تم إرسال طلب التسجيل بنجاح!</h2>
          <p>سيتم مراجعة طلبك من قبل الإدارة وسيتم إبلاغك بالنتيجة قريباً.</p>
          <p>جاري التحويل إلى صفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>طلب التسجيل - كلية NCTU</h1>
        <p className={styles.subtitle}>يرجى ملء جميع البيانات المطلوبة</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Personal Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>البيانات الشخصية</h3>
            
            <div className={styles.formGroup}>
              <label>الاسم الكامل *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>الرقم القومي *</label>
                <input
                  type="text"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  required
                  maxLength="14"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>تاريخ الميلاد *</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>النوع *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={styles.input}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>بيانات الاتصال</h3>
            
            <div className={styles.formGroup}>
              <label>البريد الإلكتروني *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>رقم الهاتف *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>العنوان</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={styles.textarea}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>البيانات الأكاديمية</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>التخصص المطلوب *</label>
                <select
                  name="specialty_id"
                  value={formData.specialty_id}
                  onChange={handleChange}
                  required
                  className={styles.input}
                >
                  <option value="">اختر التخصص</option>
                  {specialties.map(spec => (
                    <option key={spec.id} value={spec.id}>
                      {spec.arabic_name || spec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>السنة الدراسية *</label>
                <select
                  name="current_year"
                  value={formData.current_year}
                  onChange={handleChange}
                  required
                  className={styles.input}
                >
                  <option value="1">السنة الأولى</option>
                  <option value="2">السنة الثانية</option>
                  <option value="3">السنة الثالثة</option>
                  <option value="4">السنة الرابعة</option>
                </select>
              </div>
            </div>

            {/* Branch Selector - shown only for ICT year 3 or 4 */}
            {showBranchSelector && (
              <div className={styles.formGroup}>
                <BranchSelector
                  value={formData.branch}
                  onChange={handleBranchChange}
                  required={true}
                  error={branchError}
                />
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>شهادة الثانوية العامة</label>
                <input
                  type="text"
                  name="high_school_certificate"
                  value={formData.high_school_certificate}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>مجموع الثانوية العامة</label>
                <input
                  type="number"
                  name="high_school_grade"
                  value={formData.high_school_grade}
                  onChange={handleChange}
                  step="0.01"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>بيانات ولي الأمر</h3>
            
            <div className={styles.formGroup}>
              <label>اسم ولي الأمر</label>
              <input
                type="text"
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>رقم هاتف ولي الأمر</label>
                <input
                  type="tel"
                  name="guardian_phone"
                  value={formData.guardian_phone}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>صلة القرابة</label>
                <input
                  type="text"
                  name="guardian_relation"
                  value={formData.guardian_relation}
                  onChange={handleChange}
                  placeholder="مثال: الأب، الأم، الأخ"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال طلب التسجيل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
