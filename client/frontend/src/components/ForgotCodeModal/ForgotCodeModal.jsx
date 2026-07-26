import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import styles from './ForgotCodeModal.module.css';

const ForgotCodeModal = ({ isOpen, onClose }) => {
  const [nationalId, setNationalId] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setNationalId('');
    setStudentCode('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const validateNationalId = (value) => {
    if (!value.trim()) {
      return 'يرجى إدخال الرقم القومي';
    }
    if (!/^\d{14}$/.test(value)) {
      return 'الرقم القومي يجب أن يكون 14 رقماً بالضبط';
    }
    if (!/^\d+$/.test(value)) {
      return 'الرقم القومي يجب أن يحتوي على أرقام فقط';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate national ID
    const validationError = validateNationalId(nationalId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        '/auth/retrieve-student-code',
        { national_id: nationalId }
      );

      if (response.data.success) {
        setStudentCode(response.data.data.student_code);
        setSuccess(true);
        toast.success('تم العثور على كود الطالب بنجاح');
      }
    } catch (err) {
      console.error('Retrieve student code error:', err);
      const errorMessage = err.response?.data?.message || 'الرقم القومي غير مسجل في النظام';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 14 characters
    if (/^\d*$/.test(value) && value.length <= 14) {
      setNationalId(value);
      setError('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="إغلاق"
              disabled={loading}
            >
              ✕
            </button>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.icon}>🔍</div>
              <h2 className={styles.title}>استرجاع كود الطالب</h2>
              <p className={styles.subtitle}>
                أدخل الرقم القومي للحصول على كود الطالب الخاص بك
              </p>
            </div>

            {/* Success State */}
            {success ? (
              <motion.div
                className={styles.successContainer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={styles.successIcon}>✓</div>
                <h3 className={styles.successTitle}>تم العثور على كود الطالب</h3>
                <div className={styles.codeDisplay}>
                  <span className={styles.codeLabel}>كود الطالب:</span>
                  <span className={styles.codeValue}>{studentCode}</span>
                </div>
                <p className={styles.successMessage}>
                  يمكنك الآن استخدام هذا الكود لتسجيل الدخول
                </p>
                <button
                  className={styles.doneButton}
                  onClick={handleClose}
                >
                  تم
                </button>
              </motion.div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Error message */}
                {error && (
                  <motion.div
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className={styles.errorIcon}>⚠️</span>
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* National ID input */}
                <div className={styles.formGroup}>
                  <label htmlFor="national_id" className={styles.label}>
                    الرقم القومي
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      id="national_id"
                      name="national_id"
                      value={nationalId}
                      onChange={handleInputChange}
                      placeholder="أدخل الرقم القومي (14 رقم)"
                      className={`${styles.input} ${error ? styles.inputError : ''}`}
                      disabled={loading}
                      autoComplete="off"
                      maxLength={14}
                      required
                      autoFocus
                    />
                    <span className={styles.inputIcon}>🆔</span>
                  </div>
                  <p className={styles.hint}>
                    الرقم القومي يجب أن يكون 14 رقماً بالضبط
                  </p>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || nationalId.length !== 14}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner}></span>
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <span>استرجاع الكود</span>
                      <span className={styles.buttonIcon}>→</span>
                    </>
                  )}
                </motion.button>

                {/* Cancel button */}
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                  disabled={loading}
                >
                  إلغاء
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotCodeModal;
