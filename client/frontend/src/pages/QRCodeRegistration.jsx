import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import './QRCodeRegistration.css';

const QRCodeRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    student_code: searchParams.get('code') || '',
    full_name: '',
    email: '',
    phone: '',
    national_id: '',
    specialty_id: '1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.student_code || !formData.full_name || !formData.email || !formData.national_id) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/students/register-by-qr', formData);
      
      if (response.data.success) {
        toast.success('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'فشل عملية التسجيل';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd use a QR code reader library
      toast.info('تم تحميل الصورة. يرجى ملء البيانات يدويًا.');
    }
  };

  const openQRUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="qr-registration-container">
      <motion.div
        className="qr-registration-box"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="registration-header">
          <h1>تسجيل بيانات الطالب</h1>
          <p>أدخل بيانات الطالب من رمز الاستجابة السريعة QR</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <div className="form-group">
            <label>رقم الطالب * (Student Code)</label>
            <input
              type="text"
              name="student_code"
              value={formData.student_code}
              onChange={handleChange}
              placeholder="مثال: NCTU-24-001234"
              required
              readOnly={searchParams.get('code') ? true : false}
            />
          </div>

          <div className="form-group">
            <label>الاسم الكامل *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="أحمد محمد علي"
              required
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@nctu.edu"
              required
            />
          </div>

          <div className="form-group">
            <label>رقم الهاتف *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01012345678"
              required
            />
          </div>

          <div className="form-group">
            <label>رقم الهوية الوطنية *</label>
            <input
              type="text"
              name="national_id"
              value={formData.national_id}
              onChange={handleChange}
              placeholder="12345678901234"
              required
            />
          </div>

          <div className="form-group">
            <label>التخصص</label>
            <select name="specialty_id" value={formData.specialty_id} onChange={handleChange}>
              <option value="1">الميكاترونكس</option>
              <option value="2">الأوتوترونكس</option>
              <option value="3">تكنولوجيا المعلومات</option>
              <option value="4">الأطراف الصناعية</option>
              <option value="5">إنتاج البترول</option>
              <option value="6">الطاقة المتجددة</option>
            </select>
          </div>

          <motion.button
            type="submit"
            className="submit-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'جاري التسجيل...' : 'تسجيل البيانات'}
          </motion.button>
        </form>

        <div className="qr-upload-section">
          <button
            type="button"
            className="qr-upload-btn"
            onClick={openQRUpload}
          >
            <i className="fas fa-qrcode"></i>
            رفع صورة QR Code
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleQRUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="registration-footer">
          <p>هل لديك حساب بالفعل؟</p>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/login')}
          >
            تسجيل الدخول
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QRCodeRegistration;