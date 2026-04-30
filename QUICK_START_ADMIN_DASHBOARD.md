# 🚀 Admin Dashboard - Quick Start Guide

**Last Updated**: 2026-04-13  
**Status**: ✅ Ready to Use

---

## ⚡ Quick Start

### 1. Start the System
```bash
# Terminal 1: Start Backend
cd server
npm start

# Terminal 2: Start Frontend
cd client/frontend
npm run dev
```

### 2. Login
- **URL**: `http://localhost:5173/login`
- **Username**: `admin`
- **Password**: `admin123`

### 3. Access Dashboard
- **URL**: `http://localhost:5173/admin`

---

## 📋 Admin Pages Quick Reference

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin` | Overview & stats |
| Students | `/admin/students` | Manage students |
| Professors | `/admin/professors` | Manage professors |
| Courses | `/admin/courses` | Manage courses |
| Grade Settings | `/admin/grade-settings` | Configure grade rules |
| Pending Grades | `/admin/pending-grades` | Approve grades |
| Registration Requests | `/admin/registration-requests` | Approve new students |
| Registration Links | `/admin/registration-links` | Create signup links |
| Timetables | `/admin/timetables` | Upload schedules |

---

## 🔧 Common Tasks

### Create a Student
1. Go to `/admin/students`
2. Click "إضافة طالب"
3. Fill form and submit

### Approve Registration Request
1. Go to `/admin/registration-requests`
2. Click "عرض" on a pending request
3. Click "قبول الطلب"

### Configure Grade Settings
1. Go to `/admin/grade-settings`
2. Find the course
3. Click "تعديل الإعدادات"
4. Update values and save

### Promote Students
1. Go to `/admin/students`
2. Find student
3. Click promotion button:
   - "نقل للترم الثاني" (semester)
   - "نقل للسنة الجديدة" (year)
   - "تخريج" (graduate)

---

## 🧪 Testing

### Run API Tests
```bash
newman run .postman.json --env-var "base_url=http://localhost:5000"
```

### Expected Result
```
✅ 36/36 tests passing
```

---

## 📊 API Endpoints

### Base URL
```
http://localhost:5000
```

### Key Endpoints
```http
# Auth
POST /api/auth/login

# Students
GET    /api/admin/students
POST   /api/admin/students
PUT    /api/admin/students/:id
POST   /api/admin/students/:id/promote

# Grade Settings
GET    /api/admin/course-grade-config
PUT    /api/admin/course-grade-config/:courseId
DELETE /api/admin/course-grade-config/:courseId

# Registration
GET    /api/admin/registration-requests
POST   /api/admin/registration-requests/:id/approve
POST   /api/admin/registration-requests/:id/reject
```

---

## 🐛 Troubleshooting

### Problem: Can't login
**Solution**: Check backend is running on port 5000

### Problem: Students page not loading
**Solution**: Verify API URL is relative (`/api/admin` not `http://localhost:5000/api/admin`)

### Problem: API errors
**Solution**: Check token in localStorage, re-login if expired

### Problem: CORS errors
**Solution**: Verify backend CORS configuration allows frontend origin

---

## 📚 Documentation

### Full Documentation
- `ADMIN_DASHBOARD_FINAL_REPORT.md` - Complete overview
- `ADMIN_FRONTEND_TEST_PLAN.md` - Testing guide
- `ADMIN_API_TEST_PLAN.md` - API reference
- `ADMIN_DASHBOARD_COMPLETE_AUDIT.md` - Detailed audit

### Quick Links
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Admin Login: `http://localhost:5173/login`
- Admin Dashboard: `http://localhost:5173/admin`

---

## ✅ System Status

### Backend
- ✅ All endpoints working
- ✅ Authentication working
- ✅ Database connected

### Frontend
- ✅ All pages working
- ✅ API calls fixed
- ✅ Styling consistent

### Tests
- ✅ 36/36 API tests passing
- 🔄 Frontend tests ready

---

## 🎯 Key Features

### Dashboard
- Real-time stats
- Specialty overview
- Quick actions
- Promotion tools

### Students Management
- CRUD operations
- Search & filter
- Promotion workflows
- Status management

### Grade Settings
- Per-course config
- Import/export
- Validation
- Preview calculations

### Registration
- Request management
- Approval workflow
- Automatic account creation
- Status tracking

---

## 📞 Support

### Credentials
- **Admin**: `admin` / `admin123`
- **Student**: `student1` / `student123`

### Ports
- **Backend**: 5000
- **Frontend**: 5173
- **Database**: 5432 (PostgreSQL)

### Environment
- **Node.js**: v18+
- **PostgreSQL**: v14+
- **npm**: v9+

---

**Need Help?** Check the full documentation in `ADMIN_DASHBOARD_FINAL_REPORT.md`

