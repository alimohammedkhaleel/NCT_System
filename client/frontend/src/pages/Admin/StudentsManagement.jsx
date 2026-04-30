import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import styles from './StudentsManagement.module.css';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  national_id: '',
  phone: '',
  specialty_id: '',
  current_year: '1',
  academic_status: 'active',
  branch: null,
};

const STATUS_LABELS = {
  active: 'نشط',
  graduated: 'متخرج',
  suspended: 'موقوف',
  dropped: 'منسحب',
  summer_course: 'دراسة صيفية',
};

export const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Bulk promotion state
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null); // result dialog
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [bulkForm, setBulkForm] = useState({
    type: '', // 'semester' | 'year'
    specialty_id: '',
    academic_year_id: '',
    semester_id: '',
    year_number: '',
  });
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  // Summer end state
  const [summerEndLoading, setSummerEndLoading] = useState(false);
  const [summerEndResult, setSummerEndResult] = useState(null);
  const [summerEndSpecialty, setSummerEndSpecialty] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchSpecialties();
    fetchAcademicYears();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterSpecialty) params.specialty_id = filterSpecialty;
      if (filterYear) params.current_year = filterYear;
      if (filterStatus) params.academic_status = filterStatus;
      if (filterBranch) params.branch = filterBranch;

      const res = await api.get('/admin/students', { params });
      setStudents(res.data.data || res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في جلب بيانات الطلاب');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await api.get('/specialties');
      setSpecialties(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch specialties', err);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get('/admin/academic-years');
      setAcademicYears(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch academic years', err);
    }
  };

  const fetchSemesters = async (academicYearId) => {
    if (!academicYearId) { setSemesters([]); return; }
    try {
      const res = await api.get(`/admin/semesters?academic_year_id=${academicYearId}`);
      setSemesters(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch semesters', err);
    }
  };

  const handleBulkFormChange = (field, value) => {
    setBulkForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'academic_year_id') {
        next.semester_id = '';
        fetchSemesters(value);
      }
      return next;
    });
  };

  const handleBulkPromotion = async () => {
    const { type, specialty_id, academic_year_id } = bulkForm;
    if (!type) { toast.error('اختر نوع النقل'); return; }

    // For year promotion: need academic_year_id
    if (type === 'year' && !academic_year_id) { 
      toast.error('اختر السنة الدراسية'); 
      return; 
    }

    setBulkLoading(true);
    try {
      const endpoint = type === 'semester' ? '/admin/promote-semester' : '/admin/promote-year';
      const payload = {};
      
      if (specialty_id) payload.specialty_id = specialty_id;
      
      if (type === 'year') {
        payload.academic_year_id = academic_year_id;
      }
      // For semester: no additional params needed - system checks all active students

      const res = await api.post(endpoint, payload);
      setBulkResult(res.data);
      toast.success(res.data.message || 'تمت العملية بنجاح');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشلت عملية النقل الجماعي');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSummerEnd = async () => {
    if (!window.confirm('هل أنت متأكد من إنهاء مرحلة الدراسة الصيفية؟\nسيتم نقل الطلاب الناجحين تلقائياً للسنة الجديدة.')) return;
    setSummerEndLoading(true);
    try {
      const payload = {};
      if (summerEndSpecialty) payload.specialty_id = summerEndSpecialty;
      const res = await api.post('/admin/promote-summer-passed', payload);
      setSummerEndResult(res.data);
      toast.success(res.data.message || 'تمت العملية بنجاح');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشلت عملية إنهاء الصيفي');
    } finally {
      setSummerEndLoading(false);
    }
  };

  // Client-side filter for instant feedback while typing
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (s.student_code || '').toLowerCase().includes(q) ||
        (s.national_id || '').toLowerCase().includes(q) ||
        (s.User?.full_name || '').toLowerCase().includes(q);
      const matchSpecialty = !filterSpecialty || String(s.specialty_id) === filterSpecialty;
      const matchYear = !filterYear || String(s.current_year) === filterYear;
      const matchStatus = !filterStatus || s.academic_status === filterStatus;
      const matchBranch = !filterBranch || s.branch === filterBranch;
      return matchSearch && matchSpecialty && matchYear && matchStatus && matchBranch;
    });
  }, [students, search, filterSpecialty, filterYear, filterStatus]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingId(student.id);
    setFormData({
      full_name: student.User?.full_name || '',
      email: student.User?.email || '',
      password: '',
      national_id: student.national_id || '',
      phone: student.User?.phone || '',
      specialty_id: student.specialty_id ? String(student.specialty_id) : '',
      current_year: student.current_year ? String(student.current_year) : '1',
      academic_status: student.academic_status || 'active',
      branch: student.branch || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  const handleDelete = async (student) => {
    const name = student.User?.full_name || student.student_code;
    if (!window.confirm(`هل أنت متأكد من حذف الطالب "${name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء.`)) return;
    try {
      await api.delete(`/admin/students/${student.id}`);
      toast.success(`تم حذف الطالب "${name}" بنجاح`);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في حذف الطالب');
    }
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingId && !payload.password) delete payload.password;

      if (editingId) {
        await api.put(`/admin/students/${editingId}`, payload);
        toast.success('تم تحديث بيانات الطالب بنجاح');
      } else {
        await api.post('/admin/students', payload);
        toast.success('تم إضافة الطالب بنجاح');
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الحفظ';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getSpecialtyName = (student) => {
    if (student.Specialty?.arabic_name) return student.Specialty.arabic_name;
    if (student.Specialty?.name) return student.Specialty.name;
    const sp = specialties.find((s) => s.id === student.specialty_id);
    return sp?.arabic_name || sp?.name || '-';
  };

  const addButton = (
    <button className={styles.addBtn} onClick={openAddModal}>
      + إضافة طالب
    </button>
  );

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>إدارة الطلاب</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.bulkBtn}
            onClick={() => setShowBulkPanel(v => !v)}
          >
            {showBulkPanel ? '▲ إخفاء النقل الجماعي' : '▼ النقل الجماعي للطلاب'}
          </button>
          <button className={styles.addBtn} onClick={openAddModal}>+ إضافة طالب</button>
        </div>
      </div>

      {/* Bulk Promotion Panel */}
      {showBulkPanel && (
        <div className={styles.bulkPanel}>
          <h3 className={styles.bulkTitle}>🎓 النقل الجماعي للطلاب</h3>
          <p className={styles.bulkNote}>
            <strong>⚙️ النظام يتحقق تلقائياً من الشروط:</strong><br/>
            • <strong>السنة الثانية والرابعة (سنتا التخرج)</strong> — يجب النجاح في جميع المواد → أي رسوب = دراسة صيفية ☀️<br/>
            • <strong>السنة الأولى والثالثة</strong> — حتى 3 مواد راسب → دراسة صيفية ☀️، أكثر من 3 → إعادة السنة 🔁<br/>
            • الطلاب الناجحون في الدراسة الصيفية ينتقلون للسنة الجديدة مع باقي الطلاب ✅<br/>
            • النظام يطبق القواعد تلقائياً على كل طالب حسب حالته
          </p>
          <div className={styles.bulkFormRow}>
            <div className={styles.bulkField}>
              <label>نوع النقل *</label>
              <select value={bulkForm.type} onChange={e => handleBulkFormChange('type', e.target.value)}>
                <option value="">اختر...</option>
                <option value="semester">نقل جميع الطلاب للترم الثاني</option>
                <option value="year">نقل جميع الطلاب للسنة الجديدة</option>
              </select>
            </div>
            <div className={styles.bulkField}>
              <label>التخصص (اختياري)</label>
              <select value={bulkForm.specialty_id} onChange={e => handleBulkFormChange('specialty_id', e.target.value)}>
                <option value="">كل التخصصات</option>
                {specialties.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.arabic_name || sp.name}</option>
                ))}
              </select>
            </div>
            {bulkForm.type === 'year' && (
              <div className={styles.bulkField}>
                <label>السنة الدراسية *</label>
                <select value={bulkForm.academic_year_id} onChange={e => handleBulkFormChange('academic_year_id', e.target.value)}>
                  <option value="">اختر السنة...</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>
                      السنة {y.year_number} {y.Specialty ? `— ${y.Specialty.arabic_name || y.Specialty.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              className={styles.bulkSubmitBtn}
              onClick={handleBulkPromotion}
              disabled={bulkLoading}
            >
              {bulkLoading ? 'جاري التنفيذ...' : '🚀 تنفيذ النقل'}
            </button>
          </div>

          {/* Summer End Section */}
          <div className={styles.summerEndSection}>
            <div className={styles.summerEndDivider}>
              <span>☀️ إنهاء مرحلة الدراسة الصيفية</span>
            </div>
            <p className={styles.summerEndNote}>
              ينقل طلاب السنة الأولى والثالثة تلقائياً للسنة الجديدة مع مواد الرسوب. طلاب السنة الثانية والرابعة (سنتا التخرج) يجب أن ينجحوا في جميع المواد أولاً.
            </p>
            <div className={styles.summerEndRow}>
              <select
                className={styles.summerEndSelect}
                value={summerEndSpecialty}
                onChange={e => setSummerEndSpecialty(e.target.value)}
              >
                <option value="">☀️ كل التخصصات</option>
                {specialties.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.arabic_name || sp.name}</option>
                ))}
              </select>
              <button
                className={styles.summerEndBtn}
                onClick={handleSummerEnd}
                disabled={summerEndLoading}
              >
                {summerEndLoading ? 'جاري التنفيذ...' : '🏁 إنهاء الصيفي ونقل الناجحين'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="بحث بالكود أو الرقم القومي أو الاسم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
        >
          <option value="">كل التخصصات</option>
          {specialties.map((sp) => (
            <option key={sp.id} value={String(sp.id)}>
              {sp.arabic_name || sp.name}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">كل السنوات</option>
          {[1, 2, 3, 4].map((y) => (
            <option key={y} value={String(y)}>
              السنة {y}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
        >
          <option value="">كل الفروع</option>
          <option value="Software">برمجيات</option>
          <option value="Network">شبكات</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>جاري التحميل...</span>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>كود الطالب</th>
                <th>الاسم الكامل</th>
                <th>الرقم القومي</th>
                <th>التخصص</th>
                <th>السنة</th>
                <th>الترم الحالي</th>
                <th>الفرع</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.noData}>
                    لا يوجد طلاب مطابقون للبحث
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_code || '-'}</td>
                    <td>{student.User?.full_name || '-'}</td>
                    <td>{student.national_id || '-'}</td>
                    <td>{getSpecialtyName(student)}</td>
                    <td>{student.current_year || '-'}</td>
                    <td>
                      <span className={styles.semesterBadge}>
                        {student.current_semester === 2 ? 'الترم الثاني' : 'الترم الأول'}
                      </span>
                    </td>
                    <td>
                      {student.branch === 'Software' ? 'برمجيات' : 
                       student.branch === 'Network' ? 'شبكات' : '-'}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[`badge_${student.academic_status}`]}`}>
                        {STATUS_LABELS[student.academic_status] || student.academic_status || '-'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(student)}
                      >
                        تعديل
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(student)}
                        title="حذف الطالب نهائياً"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              {formError && <div className={styles.errorAlert}>{formError}</div>}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>الاسم الكامل *</label>
                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                    required
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>البريد الإلكتروني *</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="example@email.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>كلمة المرور {editingId ? '(اتركها فارغة للإبقاء على الحالية)' : '*'}</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={!editingId}
                    placeholder="كلمة المرور"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>الرقم القومي *</label>
                  <input
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleFormChange}
                    required
                    placeholder="الرقم القومي"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>رقم الهاتف</label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="رقم الهاتف"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>التخصص</label>
                  <select name="specialty_id" value={formData.specialty_id} onChange={handleFormChange}>
                    <option value="">اختر التخصص</option>
                    {specialties.map((sp) => (
                      <option key={sp.id} value={String(sp.id)}>
                        {sp.arabic_name || sp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>السنة الدراسية</label>
                  <select name="current_year" value={formData.current_year} onChange={handleFormChange}>
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={String(y)}>
                        السنة {y}
                      </option>
                    ))}
                  </select>
                </div>
                {editingId && (
                  <div className={styles.formGroup}>
                    <label>الحالة الأكاديمية</label>
                    <select name="academic_status" value={formData.academic_status} onChange={handleFormChange}>
                      <option value="active">نشط</option>
                      <option value="suspended">موقوف</option>
                      <option value="dropped">منسحب</option>
                      <option value="graduated">خريج</option>
                    </select>
                  </div>
                )}
                {(specialties.find(s => String(s.id) === String(formData.specialty_id))?.code === 'ICT' || 
                  specialties.find(s => String(s.id) === String(formData.specialty_id))?.name?.includes('Information')) && (
                  <div className={styles.formGroup}>
                    <label>الفرع (ICT فقط)</label>
                    <select name="branch" value={formData.branch || ''} onChange={handleFormChange}>
                      <option value="">غير محدد</option>
                      <option value="Software">برمجيات</option>
                      <option value="Network">شبكات</option>
                    </select>
                  </div>
                )}
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  إلغاء
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Promotion Result Dialog */}
      {bulkResult && (
        <div className={styles.modalOverlay} onClick={() => setBulkResult(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>نتيجة النقل الجماعي</h2>
              <button className={styles.closeBtn} onClick={() => setBulkResult(null)}>×</button>
            </div>
            <div className={styles.bulkResultBody}>
              <div className={styles.bulkResultStats}>
                <div className={`${styles.bulkStat} ${styles.bulkStatGreen}`}>
                  <span className={styles.bulkStatNum}>{bulkResult.data?.promoted_count ?? 0}</span>
                  <span>منقول للسنة/الترم الجديد</span>
                </div>
                <div className={`${styles.bulkStat} ${styles.bulkStatOrange}`}>
                  <span className={styles.bulkStatNum}>{bulkResult.data?.summer_count ?? 0}</span>
                  <span>دراسة صيفية</span>
                </div>
                <div className={`${styles.bulkStat} ${styles.bulkStatRed}`}>
                  <span className={styles.bulkStatNum}>{bulkResult.data?.repeat_count ?? 0}</span>
                  <span>إعادة السنة</span>
                </div>
                <div className={`${styles.bulkStat} ${styles.bulkStatGray}`}>
                  <span className={styles.bulkStatNum}>{bulkResult.data?.no_grades_count ?? 0}</span>
                  <span>بدون درجات</span>
                </div>
              </div>

              {bulkResult.data?.is_graduation_year && (
                <p className={styles.bulkGradNote}>⚠️ سنة تخرج — تم تطبيق شرط النجاح في جميع المواد</p>
              )}

              {bulkResult.data?.summer_students?.length > 0 && (
                <details className={styles.bulkDetails}>
                  <summary>☀️ طلاب الدراسة الصيفية ({bulkResult.data.summer_students.length})</summary>
                  <ul>
                    {bulkResult.data.summer_students.map(s => (
                      <li key={s.student_id}>
                        <strong>{s.student_code}</strong> — {s.reason}
                        {s.failed_courses?.length > 0 && (
                          <span className={styles.failedList}>
                            {' '}({s.failed_courses.map(c => c.course_name).join('، ')})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {bulkResult.data?.repeat_students?.length > 0 && (
                <details className={styles.bulkDetails}>
                  <summary>🔁 طلاب إعادة السنة ({bulkResult.data.repeat_students.length})</summary>
                  <ul>
                    {bulkResult.data.repeat_students.map(s => (
                      <li key={s.student_id}>
                        <strong>{s.student_code}</strong> — {s.reason}
                        {s.failed_courses?.length > 0 && (
                          <span className={styles.failedList}>
                            {' '}({s.failed_courses.map(c => c.course_name).join('، ')})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <div className={styles.formActions}>
              <button className={styles.submitBtn} onClick={() => setBulkResult(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Summer End Result Dialog */}
      {summerEndResult && (
        <div className={styles.modalOverlay} onClick={() => setSummerEndResult(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>☀️ نتيجة إنهاء الدراسة الصيفية</h2>
              <button className={styles.closeBtn} onClick={() => setSummerEndResult(null)}>×</button>
            </div>
            <div className={styles.bulkResultBody}>
              <div className={styles.bulkResultStats}>
                <div className={`${styles.bulkStat} ${styles.bulkStatGreen}`}>
                  <span className={styles.bulkStatNum}>{summerEndResult.data?.promoted?.length ?? 0}</span>
                  <span>✅ منقول للسنة الجديدة</span>
                </div>
                <div className={`${styles.bulkStat} ${styles.bulkStatOrange}`}>
                  <span className={styles.bulkStatNum}>{summerEndResult.data?.still_failing?.length ?? 0}</span>
                  <span>⏳ لا يزال في الصيفي</span>
                </div>
              </div>

              {summerEndResult.data?.promoted?.length > 0 && (
                <details className={styles.bulkDetails}>
                  <summary>✅ الطلاب المنقولون ({summerEndResult.data.promoted.length})</summary>
                  <ul>
                    {summerEndResult.data.promoted.map(s => (
                      <li key={s.student_id}>
                        <strong>{s.student_code}</strong> — {s.full_name}
                        {s.to_year && <span style={{ color: '#6ee7b7', marginRight: 8 }}>← السنة {s.to_year}</span>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {summerEndResult.data?.still_failing?.length > 0 && (
                <details className={styles.bulkDetails}>
                  <summary>⏳ الطلاب الباقون في الصيفي ({summerEndResult.data.still_failing.length})</summary>
                  <ul>
                    {summerEndResult.data.still_failing.map(s => (
                      <li key={s.student_id}>
                        <strong>{s.student_code}</strong> — {s.full_name}
                        <span style={{ color: '#fca5a5', marginRight: 8 }}>({s.reason})</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <div className={styles.formActions}>
              <button className={styles.submitBtn} onClick={() => setSummerEndResult(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
