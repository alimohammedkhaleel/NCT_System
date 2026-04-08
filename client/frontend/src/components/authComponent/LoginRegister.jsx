import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ username: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      // Do nothing - navigation will happen after login success
    }
  }, [isAuthenticated, navigate]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(loginData.username, loginData.password);
      if (result.success) {
        // Use user role from login response to navigate
        const userRole = result.user?.role;
        
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRRegistration = () => {
    navigate('/qr-register');
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="container login-only">
        <div className="form-box login-box">
          <h2>تسجيل الدخول</h2>
          <p className="login-description">
            ادخل بيانات حسابك للوصول إلى لوحة التحكم والخدمات الأكاديمية
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignIn}>
            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="اسم المستخدم"
                value={loginData.username}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="كلمة المرور"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="qr-divider">
            <span>أو</span>
          </div>

          <motion.button
            type="button"
            className="qr-btn"
            onClick={handleQRRegistration}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={faQrcode} />
            <span>تسجيل عبر QR Code</span>
          </motion.button>

          <div className="login-footer">
            <p>هل أنت طالب جديد؟ استخدم رمز QR في الجامعة لتسجيل بياناتك</p>
          </div>
        </div>

        <div className="toggle-box toggle-login">
          <h2>أهلا بك في NCTU</h2>
          <p>
            نظام إدارة جامعة القاهرة الجديدة التكنولوجية<br/>
            الحقول الهندسية والتكنولوجية
          </p>
          <div className="login-panel-footer">
            <p>بحاجة للمساعدة؟ تواصل مع مكتب القبول والتسجيل</p>
            <p>📞 +20-2-12345678</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;