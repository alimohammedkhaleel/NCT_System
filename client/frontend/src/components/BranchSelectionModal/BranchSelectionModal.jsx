import React, { useState } from 'react';
import BranchSelector from '../BranchSelector/BranchSelector';
import styles from './BranchSelectionModal.module.css';

/**
 * BranchSelectionModal Component
 * Non-dismissible modal for existing ICT students (year 3-4) to select their branch
 * Appears on first login when branch is null
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onSubmit - Async callback called with selected branch value
 * @param {object} studentInfo - Student information to display
 * @param {string} studentInfo.name - Student full name
 * @param {string} studentInfo.studentCode - Student code
 * @param {number} studentInfo.currentYear - Student current year
 */
const BranchSelectionModal = ({ isOpen, onSubmit, studentInfo }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedBranch) {
      setError('يرجى اختيار الفرع قبل المتابعة - Please select a branch to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(selectedBranch);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ الفرع. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  const yearLabel = studentInfo?.currentYear === 3 ? 'الثالثة' : 'الرابعة';

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="branch-modal-title">
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>🎓</div>
          <h2 id="branch-modal-title" className={styles.title}>
            اختيار الفرع الدراسي
          </h2>
          <p className={styles.subtitle}>Branch Selection</p>
        </div>

        {/* Student Info */}
        <div className={styles.studentInfo}>
          <div className={styles.studentInfoRow}>
            <span className={styles.infoLabel}>الاسم:</span>
            <span className={styles.infoValue}>{studentInfo?.name || '—'}</span>
          </div>
          <div className={styles.studentInfoRow}>
            <span className={styles.infoLabel}>كود الطالب:</span>
            <span className={styles.infoValue}>{studentInfo?.studentCode || '—'}</span>
          </div>
          <div className={styles.studentInfoRow}>
            <span className={styles.infoLabel}>السنة الدراسية:</span>
            <span className={styles.infoValue}>السنة {yearLabel}</span>
          </div>
        </div>

        {/* Description */}
        <div className={styles.description}>
          <p className={styles.descAr}>
            أنت طالب في السنة {yearLabel} بتخصص تكنولوجيا المعلومات. يرجى اختيار فرعك الدراسي للمتابعة.
          </p>
          <p className={styles.descEn}>
            As a {studentInfo?.currentYear === 3 ? '3rd' : '4th'} year ICT student, please select your branch to continue.
          </p>
        </div>

        {/* Branch Selector */}
        <div className={styles.selectorWrapper}>
          <BranchSelector
            value={selectedBranch}
            onChange={setSelectedBranch}
            required={true}
            disabled={loading}
            error={error}
          />
        </div>

        {/* Submit Button */}
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading || !selectedBranch}
          aria-busy={loading}
        >
          {loading ? (
            <span className={styles.loadingContent}>
              <span className={styles.spinner} aria-hidden="true" />
              جاري الحفظ...
            </span>
          ) : (
            'تأكيد الاختيار / Confirm Selection'
          )}
        </button>

        {/* Note */}
        <p className={styles.note}>
          ⚠️ لا يمكن تغيير الفرع بعد التأكيد. يرجى الاختيار بعناية.
          <br />
          <span className={styles.noteEn}>Branch cannot be changed after confirmation. Choose carefully.</span>
        </p>
      </div>
    </div>
  );
};

export default BranchSelectionModal;
