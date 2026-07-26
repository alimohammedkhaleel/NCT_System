import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL
  // Note: Do NOT set Content-Type here — it breaks FormData uploads
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
    
    // Only logout on 401 if it's a token-related error (not other auth issues)
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      
      // Only force logout if token is invalid/expired
      if (errorMessage.includes('token') || 
          errorMessage.includes('expired') || 
          errorMessage.includes('invalid') ||
          errorMessage.includes('authentication required')) {
        console.warn('[Auth] Token expired or invalid - logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
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
  assignCourse: (professorId, courseAssignment) => 
    api.post(`/admin/professors/${professorId}/courses`, courseAssignment),
  
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
  getAllGrades: (filters) => api.get('/grades/admin/all', { params: filters }),
  approveAll: (filters) => api.put('/grades/admin/approve-all', filters || {}),
  editPending: (id, data) => api.put(`/grades/${id}`, data),
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
    // Let axios automatically set Content-Type with boundary for FormData
    return api.post('/admin/timetables', formData);
  },
  update: (id, formData) => {
    // Let axios automatically set Content-Type with boundary for FormData
    return api.put(`/admin/timetables/${id}`, formData);
  },
  delete: (id) => api.delete(`/admin/timetables/${id}`)
};

// ==================== SPECIALTIES API ====================
export const specialtiesAPI = {
  getAll: () => api.get('/specialties'),
  getById: (id) => api.get(`/specialties/${id}`)
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

// ==================== RESULTS PUBLISHING API ====================
export const resultsAPI = {
  getCoursesWithStats: (filters) => api.get('/admin/publish-results/courses', { params: filters }),
  publishResults: (payload) => api.post('/admin/publish-results', payload)
};

// ==================== PROFESSOR REGISTRATION API ====================
export const professorRegistrationAPI = {
  getRequests: () => api.get('/professor-registration/admin/requests'),
  getRequest: (id) => api.get(`/professor-registration/admin/requests/${id}`),
  approve: (id) => api.post(`/professor-registration/admin/requests/${id}/approve`),
  approveBulk: () => api.post('/professor-registration/admin/requests/approve-all'),
  reject: (id, data) => api.post(`/professor-registration/admin/requests/${id}/reject`, data),
  delete: (id) => api.delete(`/professor-registration/admin/requests/${id}`),
  createLink: (data) => api.post('/professor-registration/admin/links', data),
  getLinks: () => api.get('/professor-registration/admin/links')
};

export default api;
