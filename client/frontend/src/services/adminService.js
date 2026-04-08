import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
apiClient.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== COURSES ====================

export const courseAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.specialty_id) params.append('specialty_id', filters.specialty_id);
    if (filters.academic_year_id) params.append('academic_year_id', filters.academic_year_id);
    if (filters.semester_id) params.append('semester_id', filters.semester_id);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    
    return apiClient.get('/courses', { params });
  },
  
  getById: (id) => apiClient.get(`/courses/${id}`),
  
  create: (courseData) => apiClient.post('/courses', courseData),
  
  update: (id, courseData) => apiClient.put(`/courses/${id}`, courseData),
  
  delete: (id) => apiClient.delete(`/courses/${id}`)
};

// ==================== PROFESSORS ====================

export const professorAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.department) params.append('department', filters.department);
    
    return apiClient.get('/professors', { params });
  },
  
  getById: (id) => apiClient.get(`/professors/${id}`),
  
  create: (professorData) => apiClient.post('/professors', professorData),
  
  update: (id, professorData) => apiClient.put(`/professors/${id}`, professorData),
  
  delete: (id) => apiClient.delete(`/professors/${id}`),
  
  assignCourse: (professorId, courseAssignment) => 
    apiClient.post(`/professors/${professorId}/courses`, courseAssignment),
  
  removeCourse: (assignmentId) => apiClient.delete(`/professor-courses/${assignmentId}`)
};

// ==================== GRADE SETTINGS ====================

export const gradeSettingsAPI = {
  getAll: () => apiClient.get('/grade-settings'),
  
  getOne: (settingName) => apiClient.get(`/grade-settings/${settingName}`),
  
  update: (settingName, settingValue) => 
    apiClient.put(`/grade-settings/${settingName}`, { setting_value: settingValue }),
  
  initialize: () => apiClient.post('/grade-settings/initialize')
};

// ==================== GRADE APPROVAL ====================

export const gradeApprovalAPI = {
  getPending: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.course_id) params.append('course_id', filters.course_id);
    if (filters.academic_year_id) params.append('academic_year_id', filters.academic_year_id);
    if (filters.semester_id) params.append('semester_id', filters.semester_id);
    
    return apiClient.get('/grades/pending', { params });
  },
  
  preview: (gradeId) => apiClient.get(`/grades/${gradeId}/preview`),
  
  edit: (gradeId, gradeData) => apiClient.put(`/grades/${gradeId}/edit`, gradeData),
  
  approve: (gradeId) => apiClient.put(`/grades/${gradeId}/approve`),
  
  reject: (gradeId, rejectionReason) => 
    apiClient.put(`/grades/${gradeId}/reject`, { rejection_reason: rejectionReason })
};

// ==================== QR CODES ====================

export const qrCodeAPI = {
  generate: (studentId, expirationHours = 24) => 
    apiClient.post(`/qr-codes/generate/${studentId}`, { expirationHours }),
  
  regenerate: (studentId, expirationHours = 24) => 
    apiClient.post(`/qr-codes/regenerate/${studentId}`, { expirationHours }),
  
  revoke: (studentId) => apiClient.delete(`/qr-codes/${studentId}`)
};

// ==================== TIMETABLES ====================

export const timetableAPI = {
  getAll: () => apiClient.get('/timetables'),
  
  getById: (id) => apiClient.get(`/timetables/${id}`),
  
  create: (formData) => apiClient.post('/timetables', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  update: (id, formData) => apiClient.put(`/timetables/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  delete: (id) => apiClient.delete(`/timetables/${id}`)
};

export default apiClient;
