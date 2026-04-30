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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token payload'
        });
      }

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // Single Session Check: Compare token version with DB version
      // If version mismatch, it means a newer login occurred elsewhere
      if (decoded.token_version !== undefined && user.token_version !== undefined) {
        if (decoded.token_version !== user.token_version) {
          return res.status(401).json({
            success: false,
            message: 'تم تسجيل الدخول من مكان آخر، يرجى إعادة تسجيل الدخول'
          });
        }
      }

      // Attach user object to request
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active
      };
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
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