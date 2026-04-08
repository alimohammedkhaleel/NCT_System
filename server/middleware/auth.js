const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user can access specific professor resources
const checkProfessorAccess = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') {
      return next();
    }

    // For grade-related routes, check if professor teaches the course
    if (req.params.courseId) {
      const Professor = require('../models/Professor');
      const ProfessorCourse = require('../models/ProfessorCourse');
      
      const professor = await Professor.findOne({
        where: { user_id: req.user.id }
      });

      if (!professor) {
        return res.status(403).json({
          success: false,
          message: 'You do not have a professor profile'
        });
      }

      const professorCourse = await ProfessorCourse.findOne({
        where: {
          professor_id: professor.id,
          course_id: req.params.courseId
        }
      });

      if (!professorCourse) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this course'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Professor access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Access check failed'
    });
  }
};

// Middleware to check if user can access student-specific data
const checkStudentAccess = (req, res, next) => {
  if (req.user.role === 'student' && req.params.studentId && req.params.studentId != req.user.id) {
    // Students can only access their own data
    return res.status(403).json({
      success: false,
      message: 'You can only access your own data'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkProfessorAccess,
  checkStudentAccess
};