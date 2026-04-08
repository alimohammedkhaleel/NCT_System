import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { validateLoginForm } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import LoadingPage from '../components/common/LoadingPage';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // UI state
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

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

  const handleSubmit = async (e) => {
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

  // Show loading page while checking initial auth state
  if (loading) {
    return <LoadingPage message="جاري التحقق من بيانات الدخول..." />;
  }

  return (
    <div className="login-container" ref={containerRef}>
      {/* Background with animation */}
      <motion.div
        className="login-background"
        ref={backgroundRef}
        animate={{
          background: [
            'linear-gradient(135deg, #003d82 0%, #00ADB5 100%)',
            'linear-gradient(135deg, #00ADB5 0%, #003d82 100%)',
            'linear-gradient(135deg, #003d82 0%, #00ADB5 100%)'
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Animated blob shapes */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

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
            <h2 className="login-subtitle">نظام إدارة الجامعة</h2>
            <p className="login-description">نظام جديد لإدارة الدراسة بكفاءة</p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
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

          {/* Footer */}
          <div className="login-footer">
            <p className="footer-text">
              جامعة القاهرة الجديدة التكنولوجية © 2024
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

      {/* Test credentials hint */}
      <motion.div
        className="test-credentials"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <p>بيانات الاختبار:</p>
        <p>البريد: admin@nctu.edu.eg</p>
        <p>كلمة المرور: admin123</p>
      </motion.div>
    </div>
  );
};

export default Login;