const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection and models with associations defined
const { sequelize, User, Specialty, Student, Professor, Course, Grade, ProfessorCourse, StudentEnrollment, GradeSetting, defineAssociations } = require('./config/models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const extendedAdminRoutes = require('./routes/extendedAdminRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const accountantRoutes = require('./routes/accountantRoutes');
const studentRoutes = require('./routes/studentRoutes');
const professorRegistrationRoutes = require('./routes/professorRegistrationRoutes');

// Import seed data function
const seedDatabase = require('./seed-data');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow all localhost origins for development
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, process.env.CLIENT_URL || 'http://localhost:5173');
    }
  },
  credentials: true
}));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests in dev, 100 in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain routes if needed
  skip: (req) => {
    // Skip rate limiting for static files
    return req.path.startsWith('/uploads/');
  }
});
app.use(limiter);

// Compression
// (removed - use nginx/reverse proxy for compression in production)

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - with CORS headers so frontend can load avatars cross-origin
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// Public specialties endpoint (accessible by all authenticated roles)
const { authenticateToken } = require('./middleware/auth');

app.get('/api/specialties', authenticateToken, async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      where: { is_active: true },
      attributes: ['id', 'code', 'name', 'arabic_name', 'duration_years', 'annual_fee'],
      order: [['code', 'ASC']]
    });
    res.json({ success: true, data: specialties, count: specialties.length });
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public endpoint to get specialty by ID (accessible by all authenticated roles)
app.get('/api/specialties/:id', authenticateToken, async (req, res) => {
  try {
    const specialty = await Specialty.findOne({
      where: { id: req.params.id, is_active: true },
      attributes: ['id', 'code', 'name', 'arabic_name', 'duration_years', 'annual_fee']
    });
    if (!specialty) {
      return res.status(404).json({ success: false, message: 'Specialty not found' });
    }
    res.json({ success: true, data: specialty });
  } catch (error) {
    console.error('Get specialty by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public semesters endpoint (accessible by all authenticated roles)
const { Semester, AcademicYear } = require('./config/models');
app.get('/api/semesters', authenticateToken, async (req, res) => {
  try {
    const { academic_year_id, all } = req.query;
    const where = {};
    if (all !== 'true') where.is_active = true;
    if (academic_year_id) where.academic_year_id = academic_year_id;

    const semesters = await Semester.findAll({
      where,
      attributes: ['id', 'semester_name', 'academic_year_id', 'start_date', 'end_date'],
      order: [['academic_year_id', 'ASC'], ['id', 'ASC']]
    });

    // Add arabic_name dynamically based on semester_name or id pattern
    const arabicNames = {
      'Fall': 'الفصل الدراسي الأول',
      'Spring': 'الفصل الدراسي الثاني',
      'Summer': 'الفصل الصيفي',
      'الفصل الدراسي الأول': 'الفصل الدراسي الأول',
      'الفصل الدراسي الثاني': 'الفصل الدراسي الثاني',
    };

    const data = semesters.map(s => ({
      ...s.toJSON(),
      arabic_name: arabicNames[s.semester_name] || s.semester_name
    }));

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Get semesters error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', extendedAdminRoutes);
app.use('/api/admin', timetableRoutes);  // Admin timetable management
app.use('/api/student', timetableRoutes); // Student timetable access (bypasses admin auth)
app.use('/api/admin/students', studentRoutes);
app.use('/api/student', studentRoutes); // Student-specific routes
app.use('/api/grades', gradeRoutes);
app.use('/api/professor-registration', professorRegistrationRoutes);
app.use('/api/accountant', accountantRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Database sync and server start
const startServer = async () => {
  try {
    // Define all associations BEFORE syncing
    defineAssociations();
    console.log('✅ Model associations defined successfully.');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if tables exist, if not sync with force
    const results = await sequelize.getQueryInterface().showAllTables();
    if (results.length === 0) {
      await sequelize.sync({ force: true });
      console.log('✅ Database tables created successfully.');
    } else {
      // Just verify tables exist, don't alter
      console.log('✅ Database tables already exist.');
    }

    // Run any pending migrations (safe - checks before creating)
    const ProfessorRegistrationLink = require('./models/ProfessorRegistrationLink');
    await ProfessorRegistrationLink.sync({ force: false });
    console.log('✅ professor_registration_links table verified.');

    // Relax national_id NOT NULL constraint on professor_registration_requests (idempotent)
    try {
      const { DataTypes } = require('sequelize');
      await sequelize.getQueryInterface().changeColumn(
        'professor_registration_requests',
        'national_id',
        { type: DataTypes.STRING(14), allowNull: true }
      );
      console.log('✅ professor_registration_requests.national_id is nullable.');
    } catch (alterError) {
      // Column may already be nullable or table may not exist yet — non-fatal
      console.warn('⚠️ Could not alter national_id column (may already be nullable):', alterError.message);
    }

    // Add token_version column to users table if it doesn't exist
    try {
      const { DataTypes } = require('sequelize');
      await sequelize.getQueryInterface().addColumn(
        'users',
        'token_version',
        { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false }
      );
      console.log('✅ users.token_version column added successfully.');
    } catch (columnError) {
      // Column likely already exists
      console.log('ℹ️ users.token_version column verified.');
    }

    // Add specialty_id column to professors table if it doesn't exist
    try {
      const { DataTypes } = require('sequelize');
      await sequelize.getQueryInterface().addColumn(
        'professors',
        'specialty_id',
        { 
          type: DataTypes.INTEGER, 
          allowNull: true,
          references: { model: 'specialties', key: 'id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        }
      );
      console.log('✅ professors.specialty_id column added successfully.');
    } catch (columnError) {
      // Column likely already exists
      console.log('ℹ️ professors.specialty_id column verified.');
    }

    // Add summer_fee and course_fail_fee columns to specialty_fees table
    try {
      const { DataTypes } = require('sequelize');
      await sequelize.getQueryInterface().addColumn(
        'specialty_fees',
        'summer_fee',
        { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
      );
      console.log('✅ specialty_fees.summer_fee column added successfully.');
    } catch (columnError) {
      console.log('ℹ️ specialty_fees.summer_fee column verified.');
    }

    try {
      const { DataTypes } = require('sequelize');
      await sequelize.getQueryInterface().addColumn(
        'specialty_fees',
        'course_fail_fee',
        { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
      );
      console.log('✅ specialty_fees.course_fail_fee column added successfully.');
    } catch (columnError) {
      console.log('ℹ️ specialty_fees.course_fail_fee column verified.');
    }

    // Seed database with default data if empty
    await seedDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;