const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
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
const botRoutes = require('./routes/botRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', extendedAdminRoutes);
app.use('/api/admin', timetableRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api', botRoutes);

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
    const [results] = await sequelize.query("SHOW TABLES");
    if (results.length === 0) {
      await sequelize.sync({ force: true });
      console.log('✅ Database tables created successfully.');
    } else {
      console.log('✅ Database tables already exist, skipping sync.');
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
    process.exit(1);
  }
};

startServer();

module.exports = app;