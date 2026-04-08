# NCTU ERP System - Setup Guide

## 🚀 Initial Setup

### 1️⃣ Prerequisites
- Node.js v16+ installed
- MySQL Server installed and running
- npm or yarn package manager

### 2️⃣ Installation

#### Server Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create database and tables
npm run db:reset
# OR manually run:
# node reset-db.js
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd client/frontend

# Install dependencies
npm install
```

### 3️⃣ Environment Configuration

**Server (.env) - Already configured with defaults:**
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nctu_erp
DB_USER=root
DB_PASSWORD=

JWT_SECRET=nctu_erp_jwt_secret_key_2024_secure_random_string
JWT_EXPIRE=24h
```

**Frontend (.env) - Already configured with defaults:**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BOTPRESS_BOT_ID=your_bot_id
VITE_BOTPRESS_HOST_URL=https://cdn.botpress.cloud/webchat/v1
```

⚠️ **For production**: Change JWT_SECRET and other sensitive values

### 4️⃣ Database Setup

Run the reset script to create the database and seed initial data:

```bash
cd server
npm run db:reset  # Creates nctu_erp database with all tables
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

### 5️⃣ Running the Application

#### Start Server (Terminal 1)
```bash
cd server
npm start
# Server will run on http://localhost:5000
```

#### Start Frontend (Terminal 2)
```bash
cd client/frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### 6️⃣ Test Login
1. Open browser: http://localhost:5173
2. Click Login button
3. Use credentials:
   - Username/Email: `admin`
   - Password: `admin123`

---

## 🔧 Troubleshooting

### Issue: "Error connecting to database"
**Solution:**
1. Ensure MySQL is running: `mysql -u root -p`
2. Check DB_HOST, DB_USER, DB_PASSWORD in `.env`
3. Run `npm run db:reset` to create the database

### Issue: "500 Internal Server Error" on login
**Solution:**
1. Check server console for error messages
2. Ensure database is created: `show databases;`
3. Verify JWT_SECRET is set in `.env`
4. Check User table exists: `use nctu_erp; show tables;`

### Issue: "CORS error" when calling API
**Solution:**
1. Ensure SERVER_PORT matches frontend API_BASE_URL
2. Check CORS_ORIGIN in server `.env`
3. Restart server after changing `.env`

### Issue: "Botpress chat not loading"
**Solution:**
1. This is non-critical - chat is optional
2. If needed, set VITE_BOTPRESS_BOT_ID to valid bot ID
3. Check browser console for errors

---

## 📁 Project Structure

```
project/
├── server/
│   ├── config/
│   │   ├── database.js       # MySQL connection
│   │   ├── models.js         # Sequelize models & associations
│   │   └── botpress.js       # Botpress config
│   ├── models/               # Database models
│   │   └── User.js           # User model with password hashing
│   ├── controllers/          # Business logic
│   │   ├── authController.js # Login/Register logic
│   │   └── gradeController.js
│   ├── routes/               # API endpoints
│   │   └── authRoutes.js     # /api/auth/* routes
│   ├── middleware/           # Custom middleware
│   ├── .env                  # Environment variables
│   └── server.js             # Main server file
│
├── client/frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── auth.js       # Authentication service
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── LoadingPage.jsx
│   │   │   │   └── LoadingPage.css
│   │   │   ├── chat/
│   │   │   │   └── BotpressChat.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Login.css         # Login styles
│   │   │   └── ...other pages
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication state
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # React entry point
│   └── .env                      # Frontend environment variables
```

---

## 🔐 Authentication Flow

1. **User enters credentials** on Login page
2. **Frontend validates** form (email/username, password min 6 chars)
3. **Frontend calls** `POST /api/auth/login` with credentials
4. **Backend validates** and hashes password with bcryptjs
5. **Backend generates** JWT token if valid
6. **Frontend stores** token in localStorage
7. **Frontend redirects** to /dashboard
8. **Protected routes** check token and redirect to /login if expired

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (accepts username or email)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user profile

### Grades
- `GET /api/grades` - Get user grades
- `GET /api/grades/:courseId` - Get course grades

### Health Check
- `GET /api/health` - Server health status

---

## 📝 Available npm Scripts

### Server
```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-reload)
npm run db:reset   # Reset database
```

### Frontend
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Check code quality
```

---

## 🎯 Features Implemented

✅ **Authentication System**
- Login with username or email
- Password hashing with bcryptjs
- JWT token generation (24h expiry)
- Remember Me functionality
- Rate limiting (5 attempts/5 minutes)

✅ **Frontend Components**
- Modern Login page with Form validation
- Loading animations with Framer Motion & GSAP
- Protected route wrapper with role-based access
- Error boundaries
- Full RTL support for Arabic

✅ **Security**
- CORS protection
- JWT token validation
- Password hashing (bcryptjs)
- Rate limiting on login attempts

⚠️ **In Progress**
- Email verification
- Two-factor authentication
- Social login integration

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Check server console logs
3. Check browser console (F12)
4. Verify all environment variables are set

---

**Last Updated:** April 7, 2026
