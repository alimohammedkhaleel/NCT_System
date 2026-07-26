import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { validateLoginForm } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import LoadingPage from '../../components/common/LoadingPage';
import ForgotCodeModal from '../../components/ForgotCodeModal/ForgotCodeModal';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, login } = useAuth();

  // Login type state
  const [loginType, setLoginType] = useState('staff'); // 'staff' | 'student'

  // Form state for staff
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // Form state for student
  const [studentFormData, setStudentFormData] = useState({
    student_code: '',
    national_id: '',
    rememberMe: false
  });

  // UI state
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotCodeModalOpen, setIsForgotCodeModalOpen] = useState(false);

  // Refs for animations
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const backgroundRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate]);

  // Load saved credentials if "Remember Me" was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedRemember = localStorage.getItem('rememberMe') === 'true';

    if (savedUsername && savedRemember) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

  // Setup GSAP animations
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Animate background
    tl.fromTo(
      backgroundRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8 },
      0
    );

    // Animate form
    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    );

    return () => tl.kill();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (loginType === 'staff') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      setStudentFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateStudentForm = () => {
    const errors = {};

    if (!studentFormData.student_code.trim()) {
      errors.student_code = 'يرجى إدخال كود الطالب';
    }

    if (!studentFormData.national_id.trim()) {
      errors.national_id = 'يرجى إدخال الرقم القومي';
    } else if (!/^\d{14}$/.test(studentFormData.national_id)) {
      errors.national_id = 'الرقم القومي يجب أن يكون 14 رقماً';
    } else if (!/^\d+$/.test(studentFormData.national_id)) {
      errors.national_id = 'الرقم القومي يجب أن يحتوي على أرقام فقط';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate form
    const validation = validateLoginForm(formData.username, formData.password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('يرجى التحقق من البيانات المدخلة');
      return;
    }

    setLoginLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Call login function from AuthContext
      const result = await login(formData.username, formData.password);

      if (result.success) {
        // Save credentials if "Remember Me" is checked
        if (formData.rememberMe) {
          localStorage.setItem('savedUsername', formData.username);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('rememberMe');
        }

        // Determine navigation based on role
        const targetRoute = result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

        // Success animation
        gsap.to(formRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            navigate(targetRoute, { replace: true });
          }
        });
      } else {
        setError(result.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى');
        if (result.errors) {
          setFieldErrors(result.errors);
        }

        // Shake animation on error
        gsap.to(formRef.current, {
          x: [0, -5, 5, -5, 5, 0],
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ. يرجى المحاولة لاحقاً');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate form
    const validation = validateStudentForm();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('يرجى التحقق من البيانات المدخلة');
      return;
    }

    setLoginLoading(true);

    try {
      const response = await api.post(
        '/auth/student-login',
        {
          student_code: studentFormData.student_code,
          national_id: studentFormData.national_id
        }
      );

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success('تم تسجيل الدخول بنجاح');

        // Success animation
        gsap.to(formRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            window.location.href = '/dashboard'; // Force reload to update auth context
          }
        });
      }
    } catch (err) {
      console.error('Student login error:', err);
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMessage);
      toast.error(errorMessage);

      // Shake animation on error
      gsap.to(formRef.current, {
        x: [0, -5, 5, -5, 5, 0],
        duration: 0.4,
        ease: 'power2.out'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // Show loading page while checking initial auth state
  if (loading) {
    return <LoadingPage message="جاري التحقق من بيانات الدخول..." />;
  }

  return (
    <>
      <Helmet>
        <title>تسجيل الدخول - نظام NCTU</title>
        <meta name="description" content="تسجيل الدخول إلى النظام الجامعي المتكامل لجامعة القاهرة التكنولوجية الجديدة (NCTU)." />
      </Helmet>
      <div className="login-container" ref={containerRef}>
      {/* Background with animation */}
      <motion.div
        className="login-background"
        ref={backgroundRef}
      />

      {/* Animated blob shapes */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      {/* Saturn Ring Animation */}
      <div className="saturn-ring-container">
        <div className="saturn-ring"></div>
      </div>

      {/* Login form */}
      <motion.div
        className="login-form-wrapper"
        ref={formRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="login-form">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">NCTU</h1>
            <h2 className="login-subtitle">مرحبا بك في NCT</h2>
            <p className="login-description">نظام جديد لإدارة الدراسة بكفاءة</p>
          </div>

          {/* Login Type Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`tab-button ${loginType === 'staff' ? 'active' : ''}`}
              onClick={() => {
                setLoginType('staff');
                setError('');
                setFieldErrors({});
              }}
              disabled={loginLoading}
            >
              الموظفين والأساتذة
            </button>
            <button
              type="button"
              className={`tab-button ${loginType === 'student' ? 'active' : ''}`}
              onClick={() => {
                setLoginType('student');
                setError('');
                setFieldErrors({});
              }}
              disabled={loginLoading}
            >
              الطلاب
            </button>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Staff Login Form */}
          {loginType === 'staff' && (
            <form onSubmit={handleStaffLogin} noValidate>
              {/* Username/Email field */}
              <div className="form-group">
                <label htmlFor="username">البريد الإلكتروني أو اسم المستخدم</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="admin@nctu.edu.eg أو admin"
                    className={`form-input ${fieldErrors.username ? 'error' : ''}`}
                    disabled={loginLoading}
                    autoComplete="username"
                    required
                    aria-invalid={!!fieldErrors.username}
                    aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  />
                  <span className="input-icon">👤</span>
                </div>
                {fieldErrors.username && (
                  <span className="field-error" id="username-error">
                    {fieldErrors.username}
                  </span>
                )}
              </div>

              {/* Password field */}
              <div className="form-group">
                <label htmlFor="password">كلمة المرور</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="أدخل كلمة المرور"
                    className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                    disabled={loginLoading}
                    autoComplete="current-password"
                    required
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginLoading}
                    title={showPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="field-error" id="password-error">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              {/* Remember Me */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={loginLoading}
                  />
                  <span>تذكرني</span>
                </label>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                className="submit-btn"
                disabled={loginLoading}
                whileHover={{ scale: loginLoading ? 1 : 1.02 }}
                whileTap={{ scale: loginLoading ? 1 : 0.98 }}
              >
                {loginLoading ? (
                  <>
                    <span className="spinner"></span>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </motion.button>
            </form>
          )}

          {/* Student Login Form */}
          {loginType === 'student' && (
            <form onSubmit={handleStudentLogin} noValidate>
              {/* Student Code field */}
              <div className="form-group">
                <label htmlFor="student_code">كود الطالب</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="student_code"
                    name="student_code"
                    value={studentFormData.student_code}
                    onChange={handleInputChange}
                    placeholder="مثال: NCTU-24-001"
                    className={`form-input ${fieldErrors.student_code ? 'error' : ''}`}
                    disabled={loginLoading}
                    autoComplete="off"
                    required
                    aria-invalid={!!fieldErrors.student_code}
                    aria-describedby={fieldErrors.student_code ? 'student-code-error' : undefined}
                  />
                  <span className="input-icon">🎓</span>
                </div>
                {fieldErrors.student_code && (
                  <span className="field-error" id="student-code-error">
                    {fieldErrors.student_code}
                  </span>
                )}
              </div>

              {/* National ID field */}
              <div className="form-group">
                <label htmlFor="national_id">الرقم القومي</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="national_id"
                    name="national_id"
                    value={studentFormData.national_id}
                    onChange={handleInputChange}
                    placeholder="14 رقماً"
                    className={`form-input ${fieldErrors.national_id ? 'error' : ''}`}
                    disabled={loginLoading}
                    autoComplete="off"
                    maxLength={14}
                    required
                    aria-invalid={!!fieldErrors.national_id}
                    aria-describedby={fieldErrors.national_id ? 'national-id-error' : undefined}
                  />
                  <span className="input-icon">🆔</span>
                </div>
                {fieldErrors.national_id && (
                  <span className="field-error" id="national-id-error">
                    {fieldErrors.national_id}
                  </span>
                )}
              </div>

              {/* Remember Me */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={studentFormData.rememberMe}
                    onChange={handleInputChange}
                    disabled={loginLoading}
                  />
                  <span>تذكرني</span>
                </label>
                <button
                  type="button"
                  className="forgot-code-link"
                  onClick={() => setIsForgotCodeModalOpen(true)}
                  disabled={loginLoading}
                >
                  نسيت كود الطالب؟
                </button>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                className="submit-btn"
                disabled={loginLoading}
                whileHover={{ scale: loginLoading ? 1 : 1.02 }}
                whileTap={{ scale: loginLoading ? 1 : 0.98 }}
              >
                {loginLoading ? (
                  <>
                    <span className="spinner"></span>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </motion.button>
            </form>
          )}

          {/* Footer */}
          <div className="login-footer">
            <p className="footer-text">
              جامعة القاهرة الجديدة التكنولوجية © 2026
            </p>
            <p className="footer-subtext">
              نسأل عن أي مشاكل؟{' '}
              <a href="mailto:support@nctu.edu.eg" className="footer-link">
                تواصل معنا
              </a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Forgot Code Modal */}
      <ForgotCodeModal
        isOpen={isForgotCodeModalOpen}
        onClose={() => setIsForgotCodeModalOpen(false)}
      />
    </div>
    </>
  );
};

export default Login;
