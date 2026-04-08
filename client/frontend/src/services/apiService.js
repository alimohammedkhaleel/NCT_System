import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data instanceof FormData ? '[FormData]' : config.data
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.debug(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.error(`[API Error] ${error.response?.status} - ${message}`, {
      url: error.config?.url,
      method: error.config?.method,
      statusCode: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== COURSES API ====================
export const coursesAPI = {
  getAll: (specialtyId) => {
    const params = specialtyId ? { specialty_id: specialtyId } : {};
    return api.get('/admin/courses', { params });
  },
  getById: (id) => api.get(`/admin/courses/${id}`),
  create: (data) => api.post('/admin/courses', data),
  update: (id, data) => api.put(`/admin/courses/${id}`, data),
  delete: (id) => api.delete(`/admin/courses/${id}`)
};

// ==================== PROFESSORS API ====================
export const professorsAPI = {
  getAll: () => api.get('/admin/professors'),
  getById: (id) => api.get(`/admin/professors/${id}`),
  create: (data) => api.post('/admin/professors', data),
  update: (id, data) => api.put(`/admin/professors/${id}`, data),
  delete: (id) => api.delete(`/admin/professors/${id}`),
  
  // Course assignment
  assignCourses: (professorId, courseIds) => 
    api.post(`/admin/professors/${professorId}/assign-courses`, { course_ids: courseIds }),
  
  getAssignedCourses: (professorId) => 
    api.get(`/admin/professors/${professorId}/courses`)
};

// ==================== GRADE SETTINGS API ====================
export const gradeSettingsAPI = {
  getSettings: () => api.get('/admin/grade-settings'),
  updateSettings: (data) => api.put('/admin/grade-settings', data)
};

// ==================== GRADES API ====================
export const gradesAPI = {
  getProfessorGrades: (filters) => api.get('/grades/professor', { params: filters }),
  submitGrade: (data) => api.post('/grades', data),
  submitForApproval: (gradeId) => api.post(`/grades/${gradeId}/submit-for-approval`),
  getPending: () => api.get('/grades/admin/pending'),
  editPending: (id, data) => api.put(`/admin/grades/${id}/edit`, data),
  approve: (id) => api.put(`/grades/${id}/approve`),
  reject: (id, reason) => api.put(`/grades/${id}/reject`, { rejection_reason: reason }),
  getStudentGrades: () => api.get('/grades/student/grades')
};

// ==================== QR CODE API ====================
export const qrCodeAPI = {
  generate: (studentId) => api.post(`/admin/qr-codes/generate/${studentId}`),
  getStudentQR: () => api.get('/grades/student/qr-code')
};

// ==================== STUDENT API ====================
export const studentAPI = {
  register: (data) => api.post('/auth/register', data),
  getDashboard: () => api.get('/student/dashboard')
};

// ==================== TIMETABLES API ====================
export const timetablesAPI = {
  getAll: (specialtyId) => {
    const params = specialtyId ? { specialty_id: specialtyId } : {};
    return api.get('/admin/timetables', { params });
  },
  getById: (id) => api.get(`/admin/timetables/${id}`),
  create: (formData) => {
    // Don't set Content-Type header - let axios handle it with FormData
    const config = { headers: {} };
    return api.post('/admin/timetables', formData, config);
  },
  update: (id, formData) => {
    // Don't set Content-Type header - let axios handle it with FormData
    const config = { headers: {} };
    return api.put(`/admin/timetables/${id}`, formData, config);
  },
  delete: (id) => api.delete(`/admin/timetables/${id}`)
};

// ==================== SPECIALTIES API ====================
export const specialtiesAPI = {
  getAll: () => api.get('/admin/specialties'),
  getById: (id) => api.get(`/admin/specialties/${id}`)
};

// ==================== ACADEMIC YEARS API ====================
export const academicYearsAPI = {
  getAll: (specialtyId) => {
    const params = specialtyId ? { specialty_id: specialtyId } : {};
    return api.get('/admin/academic-years', { params });
  },
  getById: (id) => api.get(`/admin/academic-years/${id}`)
};

// ==================== SEMESTERS API ====================
export const semestersAPI = {
  getAll: (academicYearId) => {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    return api.get('/admin/semesters', { params });
  },
  getById: (id) => api.get(`/admin/semesters/${id}`)
};

export default api;
