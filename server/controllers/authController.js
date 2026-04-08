const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Student = require('../models/Student');
const Professor = require('../models/Professor');
const Specialty = require('../models/Specialty');

// Store refresh tokens (in production, use Redis or database)
const refreshTokenStore = new Map();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public / Admin (for non-student accounts)
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    // Validate input
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (full_name, email, password)'
      });
    }

    // Default role is student
    const userRole = role || 'student';
    
    // Only admins can create non-student users
    if (userRole !== 'student' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create non-student accounts'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [
          { email },
          { username: email.split('@')[0].toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already registered'
      });
    }

    // Create username from email
    const username = email.split('@')[0].toLowerCase() + '_' + Date.now().toString().slice(-6);

    // Create new user
    const user = await User.create({
      username,
      email,
      full_name,
      phone: phone || null,
      password_hash: password, // Will be hashed in beforeCreate hook
      role: userRole,
      is_active: true
    });

    // If registering as student, create student record
    if (userRole === 'student') {
      // Get default specialty (or first available)
      const specialty = await Specialty.findOne({
        where: { is_active: true }
      });
      
      if (!specialty) {
        return res.status(400).json({
          success: false,
          message: 'No active specialties available for enrollment'
        });
      }
      
      // Generate student code
      const yearCode = new Date().getFullYear().toString().slice(-2);
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const student_code = `NCTU-${yearCode}-${randomCode}`;

      await Student.create({
        user_id: user.id,
        student_code,
        national_id: null,
        specialty_id: specialty.id,
        current_year: 1,
        academic_status: 'active',
        enrollment_date: new Date()
      });
    }

    // If registering as professor, create professor record
    if (userRole === 'professor') {
      await Professor.create({
        user_id: user.id,
        professor_code: `PROF-${Date.now().toString().slice(-6)}`,
        is_active: true
      });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokenStore.set(refreshToken, user.id);

    // Prepare user data
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      profile_picture: user.profile_picture
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userData,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password'
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      where: { 
        [Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been disabled'
      });
    }

    // Check password using the model's checkPassword method
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    try {
      await user.update({ last_login: new Date() });
    } catch (updateError) {
      console.error('Last login update error:', updateError);
      // Don't fail if we can't update last_login
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokenStore.set(refreshToken, user.id);

    // Prepare user data
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      profile_picture: user.profile_picture,
      last_login: user.last_login
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Student,
          as: 'student',
          required: false,
          attributes: ['id', 'student_code', 'national_id', 'specialty_id', 'current_year', 'academic_status', 'enrollment_date', 'graduation_date', 'qr_secret', 'total_paid', 'total_due']
        },
        {
          model: Professor,
          as: 'professor',
          required: false,
          attributes: ['id', 'professor_code', 'department', 'specialization', 'is_active']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      national_id: user.national_id,
      profile_picture: user.profile_picture,
      last_login: user.last_login,
      is_active: user.is_active,
      student: user.student ? {
        id: user.student.id,
        student_code: user.student.student_code,
        national_id: user.student.national_id,
        specialty_id: user.student.specialty_id,
        current_year: user.student.current_year,
        academic_status: user.student.academic_status,
        enrollment_date: user.student.enrollment_date,
        graduation_date: user.student.graduation_date,
        qr_secret: user.student.qr_secret,
        total_paid: user.student.total_paid,
        total_due: user.student.total_due
      } : null,
      professor: user.professor ? {
        id: user.professor.id,
        professor_code: user.professor.professor_code,
        department: user.professor.department,
        specialization: user.professor.specialization,
        is_active: user.professor.is_active
      } : null
    };

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (email) {
      // Check if email is already taken
      const existingEmail = await User.findOne({
        where: { 
          email,
          id: { [Op.ne]: req.user.id }
        }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updateData.email = email;
    }

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password, new password, and confirmation'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findByPk(req.user.id);

    // Check current password
    const isCurrentPasswordValid = await user.checkPassword(current_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed in beforeUpdate hook)
    user.password_hash = new_password;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      
      // Check if token is still valid (not revoked)
      if (!refreshTokenStore.has(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has been revoked'
        });
      }

      // Get user and generate new access token
      const user = await User.findByPk(decoded.id);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or inactive user'
        });
      }

      const newAccessToken = generateToken(user);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newAccessToken
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify token validity
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      is_active: user.is_active
    };

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: userData,
        isValid: true
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout (revoke refresh token)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Revoke the refresh token
      refreshTokenStore.delete(refreshToken);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshAccessToken,
  verifyToken
};