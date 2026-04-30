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
      role: user.role,
      token_version: user.token_version || 1
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
      role: user.role,
      token_version: user.token_version || 1
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
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      const student_code = `${year}${random}`;

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

    // Update last login and increment token_version to invalidate previous sessions
    try {
      await user.update({ 
        last_login: new Date(),
        token_version: (user.token_version || 0) + 1
      });
    } catch (updateError) {
      console.error('Login update error:', updateError);
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

// @desc    Student login with student_code and national_id
// @route   POST /api/auth/student-login
// @access  Public
const studentLogin = async (req, res) => {
  try {
    const { student_code, national_id } = req.body;

    // Validate input
    if (!student_code || !national_id) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال كود الطالب والرقم القومي'
      });
    }

    // Find student by student_code and national_id
    const student = await Student.findOne({
      where: { 
        student_code,
        national_id
      },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'role', 'phone', 'profile_picture', 'is_active']
      }]
    });

    if (!student || !student.User) {
      return res.status(401).json({
        success: false,
        message: 'كود الطالب أو الرقم القومي غير صحيح'
      });
    }

    const user = student.User;

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'حسابك غير نشط، يرجى التواصل مع الإدارة'
      });
    }

    // Update last login and increment token_version
    try {
      await user.update({ 
        last_login: new Date(),
        token_version: (user.token_version || 0) + 1
      });
    } catch (updateError) {
      console.error('Last login update error:', updateError);
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
      last_login: user.last_login,
      student_code: student.student_code,
      specialty_id: student.specialty_id,
      current_year: student.current_year,
      academic_status: student.academic_status
    };

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: userData,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Validate that req.user exists (should be set by authenticateToken middleware)
    if (!req.user || !req.user.id) {
      console.error('getProfile: req.user is missing or invalid', req.user);
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log(`getProfile: Fetching profile for user ID ${req.user.id}, role: ${req.user.role}`);

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      console.error(`getProfile: User not found with ID ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`getProfile: User found - ${user.username} (${user.role})`);

    // Fetch student/professor separately to avoid alias issues
    let studentData = null;
    let professorData = null;

    if (user.role === 'student') {
      try {
        console.log(`getProfile: Fetching student data for user_id ${user.id}`);
        const studentRecord = await Student.findOne({
          where: { user_id: user.id },
          attributes: ['id', 'student_code', 'national_id', 'specialty_id', 'current_year', 'academic_status', 'enrollment_date', 'total_paid', 'total_due'],
          include: [{
            model: Specialty,
            attributes: ['id', 'code', 'name', 'arabic_name'],
            required: false
          }]
        });
        
        if (studentRecord) {
          studentData = studentRecord.toJSON();
          console.log(`getProfile: Student data found - code: ${studentData.student_code}`);
        } else {
          console.warn(`getProfile: No student record found for user_id ${user.id}`);
        }
      } catch (studentError) {
        console.error('getProfile: Error fetching student data:', studentError.message);
        console.error('getProfile: Student error stack:', studentError.stack);
        // Continue without student data - don't fail the entire request
      }
    } else if (user.role === 'professor') {
      try {
        console.log(`getProfile: Fetching professor data for user_id ${user.id}`);
        const professorRecord = await Professor.findOne({
          where: { user_id: user.id },
          attributes: ['id', 'professor_code', 'department', 'specialization', 'is_active']
        });
        
        if (professorRecord) {
          professorData = professorRecord.toJSON();
          console.log(`getProfile: Professor data found - code: ${professorData.professor_code}`);
        } else {
          console.warn(`getProfile: No professor record found for user_id ${user.id}`);
        }
      } catch (professorError) {
        console.error('getProfile: Error fetching professor data:', professorError.message);
        console.error('getProfile: Professor error stack:', professorError.stack);
        // Continue without professor data - don't fail the entire request
      }
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
      profile_image: user.profile_image,
      last_login: user.last_login,
      is_active: user.is_active,
      student: studentData,
      professor: professorData
    };

    console.log(`getProfile: Successfully returning profile for ${user.username}`);
    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('getProfile: Unexpected error:', error.message);
    console.error('getProfile: Error stack:', error.stack);
    console.error('getProfile: Error details:', {
      name: error.name,
      message: error.message,
      sql: error.sql || 'N/A'
    });
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// @desc    Retrieve student code by national ID
// @route   POST /api/auth/retrieve-student-code
// @access  Public
const retrieveStudentCode = async (req, res) => {
  try {
    const { national_id } = req.body;

    // Validate input
    if (!national_id) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال الرقم القومي'
      });
    }

    // Validate national ID format (14 digits)
    if (!/^\d{14}$/.test(national_id)) {
      return res.status(400).json({
        success: false,
        message: 'الرقم القومي يجب أن يكون 14 رقماً بالضبط'
      });
    }

    // Find student by national_id
    const student = await Student.findOne({
      where: { national_id },
      attributes: ['student_code', 'national_id'],
      include: [{
        model: User,
        attributes: ['full_name']
      }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الرقم القومي غير مسجل في النظام'
      });
    }

    res.json({
      success: true,
      message: 'تم العثور على كود الطالب بنجاح',
      data: {
        student_code: student.student_code,
        full_name: student.User?.full_name
      }
    });

  } catch (error) {
    console.error('Retrieve student code error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث عن كود الطالب'
    });
  }
};

// @desc    Verify QR Code and return student info
// @route   POST /api/auth/verify-qr
// @access  Public
const verifyQRCode = async (req, res) => {
  try {
    const { qr_secret } = req.body;

    if (!qr_secret) {
      return res.status(400).json({
        success: false,
        message: 'qr_secret is required'
      });
    }

    const StudentQRCode = require('../models/StudentQRCode');
    const qrCode = await StudentQRCode.findOne({
      where: { qr_secret },
      include: [{
        model: Student,
        include: [{ model: User, attributes: ['full_name'] }],
        attributes: ['student_code']
      }]
    });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR Code غير موجود'
      });
    }

    if (!qrCode.is_active) {
      return res.status(400).json({
        success: false,
        message: 'QR Code غير نشط أو منتهي الصلاحية'
      });
    }

    // Check expiry if expires_at exists
    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      await qrCode.update({ is_active: false });
      return res.status(400).json({
        success: false,
        message: 'QR Code منتهي الصلاحية'
      });
    }

    // Increment scan count and update scanned_at
    await qrCode.update({
      scan_count: (qrCode.scan_count || 0) + 1,
      scanned_at: new Date()
    });

    return res.json({
      success: true,
      data: {
        student_code: qrCode.Student?.student_code,
        full_name: qrCode.Student?.User?.full_name,
        is_active: qrCode.is_active
      },
      message: 'تم التحقق من QR Code بنجاح'
    });
  } catch (error) {
    console.error('verifyQRCode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  login,
  studentLogin,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshAccessToken,
  verifyToken,
  verifyQRCode
};

// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.profile_image) {
      const fs = require('fs');
      const path = require('path');
      const oldImagePath = path.join(__dirname, '..', user.profile_image);
      
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new avatar path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await user.update({ profile_image: avatarPath });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        profile_image: avatarPath
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during avatar upload'
    });
  }
};

// @desc    Delete avatar
// @route   DELETE /api/auth/avatar
// @access  Private
const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete avatar file if exists
    if (user.profile_image) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', user.profile_image);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Update user to remove avatar
    await user.update({ profile_image: null });

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during avatar deletion'
    });
  }
};

module.exports = {
  register,
  login,
  studentLogin,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  refreshAccessToken,
  verifyToken,
  retrieveStudentCode,
  verifyQRCode,
  uploadAvatar,
  deleteAvatar
};
