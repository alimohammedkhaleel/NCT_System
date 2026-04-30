import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import styles from './ProfessorRegistration.module.css';

const ProfessorRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // ── نفس حقول فورم إضافة دكتور في الأدمن بالضبط ──
  const [formData, setFormData] = useState({
    username:       '',
    password:       '',
    full_name:      '',
    national_id:    '',
    specialty_id:   '',
    email:          '',
    phone:          '',
    qualification:  '',
    years_of_experience: '',
    department:     '',
    specialization: '',
  });

  useEffect(() => { validateLink(); }, [token]);

  const validateLink = async () => {
    try {
      const res = await api.get(`/professor-registration/register-link/${token}`);
      if (res.data.success) {
        setLinkValid(true);
        setSpecialties(res.data.data?.specialties || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'رابط التسجيل غير صالح أو منتهي الصلاحية');
      setLinkValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // validation
    if (!formData.username || !formData.email || !formData.password || !formData.full_name) {
      setError('يرجى ملء جميع الحقول المطلوبة (اسم المستخدم، البريد، كلمة المرور، الاسم الكامل)');
      return;
    }
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username:       formData.username,
        password:       formData.password,
        full_name:      formData.full_name,
        national_id:    formData.national_id    || undefined,
        email:          formData.email,
        phone:          formData.phone          || undefined,
        qualification:  formData.qualification  || undefined,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
        department:     formData.department     || undefined,
        specialization: formData.specialization || undefined,
        specialty_id:   formData.specialty_id   || undefined,
      };

      const res = await api.post(`/professor-registration/register-link/${token}`, payload);
      if (res.data.success) setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إرسال طلب التسجيل');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) return (
    <div className={styles.container}>
      <div className={styles.stateCard}>
        <div className={styles.spinner} />
        <p>جاري التحقق من الرابط...</p>
      </div>
    </div>
  );

  /* ─── Invalid link ─── */
  if (!linkValid) return (
    <div className={styles.container}>
      <div className={`${styles.stateCard} ${styles.errorState}`}>
        <div className={styles.stateIcon}>⚠️</div>
        <h2>رابط غير صالح</h2>
        <p>{error}</p>
        <button className={styles.backBtn} onClick={() => navigate('/login')}>
          العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );

  /* ─── Success ─── */
  if (success) return (
    <div className={styles.container}>
      <div className={`${styles.stateCard} ${styles.successState}`}>
        <div className={styles.stateIcon}>✅</div>
        <h2>تم إرسال طلب التسجيل بنجاح!</h2>
        <p>سيتم مراجعة طلبك من قبل الإدارة وإبلاغك بالنتيجة قريباً.</p>
        <p className={styles.note}>يمكنك تسجيل الدخول بعد موافقة الإدارة على طلبك.</p>
        <button className={styles.backBtn} onClick={() => navigate('/login')}>
          الذهاب لتسجيل الدخول
        </button>
      </div>
    </div>
  );

  /* ─── Form ─── */
  return (
    <div className={styles.container}>
      <div className={styles.formCard}>

        <div className={styles.header}>
          <div className={styles.logo}>👨‍🏫</div>
          <h1 className={styles.title}>تسجيل عضو هيئة تدريس</h1>
          <p className={styles.subtitle}>كلية NCTU — يرجى ملء جميع البيانات المطلوبة</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* ── بيانات الحساب ── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🔐 بيانات الحساب</h3>

            <div className={styles.formGroup}>
              <label>Username * <span className={styles.hint}>(for login)</span></label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g., dr_ahmed"
                autoComplete="off"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password * <span className={styles.hint}>(for login)</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter secure password (min 8 chars)"
                autoComplete="new-password"
                required
                className={styles.input}
              />
            </div>
          </div>

          {/* ── البيانات الشخصية والأكاديمية ── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📋 البيانات الشخصية والأكاديمية</h3>

            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g., Dr. Ahmed Mohamed"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>الرقم القومي (14 رقم)</label>
              <input
                type="text"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                placeholder="e.g., 29001011234567"
                maxLength={14}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>التخصص</label>
              <select
                name="specialty_id"
                value={formData.specialty_id}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">— اختر التخصص —</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.arabic_name || s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., professor@nctu.edu"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., 01012345678"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>المؤهل العلمي</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., دكتوراه في هندسة الميكاترونكس"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>سنوات الخبرة</label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                placeholder="e.g., 10"
                min="0"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Engineering"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g., Electronics"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? 'جاري الإرسال...' : 'إرسال طلب التسجيل'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfessorRegistration;
