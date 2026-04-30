const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const ProfessorRegistrationRequest = require('../models/ProfessorRegistrationRequest');
const ProfessorRegistrationLink = require('../models/ProfessorRegistrationLink');
const User = require('../models/User');
const Professor = require('../models/Professor');
const Specialty = require('../models/Specialty');
const ActivityLog = require('../models/ActivityLog');

// Helper function to log activities
const logActivity = async (userId, action, entity, entityId = null, details = null) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      details: details ? JSON.stringify(details) : null,
      status: 'success'
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Helper function to generate professor code
const generateProfessorCode = async () => {
  const year = new Date().getFullYear();
  const lastProfessor = await Professor.findOne({
    where: {
      professor_code: {
        [Op.like]: `PROF-${year}-%`
      }
    },
    order: [['id', 'DESC']]
  });

  let sequence = 1;
  if (lastProfessor && lastProfessor.professor_code) {
    const lastSequence = parseInt(lastProfessor.professor_code.split('-')[2]);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `PROF-${year}-${String(sequence).padStart(3, '0')}`;
};

// @desc    Register new professor (public endpoint)
// @route   POST /api/professor-registration/register
// @access  Public
const registerProfessor = async (req, res) => {
  try {
    const {
      full_name,
      national_id,
      email,
      phone,
      specialty_id,
      qualification,
      years_of_experience,
      password,
      username,
      department,
      specialization
    } = req.body;

    // Validate required fields — username required when registering via link
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور)'
      });
    }

    // national_id is optional for link-based registration (professor may not have it)
    if (national_id && !/^[0-9]{14}$/.test(national_id)) {
      return res.status(400).json({
        success: false,
        message: 'الرقم القومي يجب أن يكون 14 رقم'
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صحيح'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      });
    }

    // Check if email already exists in users or requests
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    const existingRequest = await ProfessorRegistrationRequest.findOne({
      where: {
        email,
        status: { [Op.in]: ['pending', 'approved'] }
      }
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'يوجد طلب تسجيل بنفس البريد الإلكتروني'
      });
    }

    // Check if national ID already exists (only when national_id is provided)
    if (national_id) {
      const existingNationalId = await User.findOne({ where: { national_id } });
      if (existingNationalId) {
        return res.status(400).json({
          success: false,
          message: 'الرقم القومي مستخدم بالفعل'
        });
      }

      const existingNationalIdRequest = await ProfessorRegistrationRequest.findOne({
        where: {
          national_id,
          status: { [Op.in]: ['pending', 'approved'] }
        }
      });
      if (existingNationalIdRequest) {
        return res.status(400).json({
          success: false,
          message: 'يوجد طلب تسجيل بنفس الرقم القومي'
        });
      }
    }

    // Validate specialty if provided
    if (specialty_id) {
      const specialty = await Specialty.findByPk(specialty_id);
      if (!specialty) {
        return res.status(400).json({
          success: false,
          message: 'التخصص غير موجود'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create registration request
    const request = await ProfessorRegistrationRequest.create({
      full_name,
      national_id:        national_id || null,
      email,
      phone:              phone || null,
      specialty_id:       specialty_id || null,
      qualification:      qualification || null,
      years_of_experience: years_of_experience || null,
      password_hash,
      username:           username || null,
      department:         department || null,
      specialization:     specialization || null,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلب التسجيل بنجاح. سيتم مراجعته من قبل الإدارة.',
      data: {
        request_id: request.id,
        full_name: request.full_name,
        email: request.email,
        status: request.status
      }
    });

  } catch (error) {
    console.error('Professor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Get all professor registration requests (admin)
// @route   GET /api/admin/professor-requests
// @access  Admin Only
const getProfessorRequests = async (req, res) => {
  try {
    const { status, specialty_id, search, page = 1, limit = 20 } = req.query;

    const where = {};

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filter by specialty
    if (specialty_id) {
      where.specialty_id = specialty_id;
    }

    // Search by name or email
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { national_id: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: requests } = await ProfessorRegistrationRequest.findAndCountAll({
      where,
      include: [
        {
          model: Specialty,
          attributes: ['id', 'code', 'name', 'arabic_name']
        },
        {
          model: User,
          as: 'ProcessedBy',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get professor requests error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Get single professor registration request (admin)
// @route   GET /api/admin/professor-requests/:id
// @access  Admin Only
const getProfessorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ProfessorRegistrationRequest.findByPk(id, {
      include: [
        {
          model: Specialty,
          attributes: ['id', 'code', 'name', 'arabic_name']
        },
        {
          model: User,
          as: 'ProcessedBy',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'CreatedUser',
          attributes: ['id', 'full_name', 'email', 'role']
        },
        {
          model: Professor,
          as: 'CreatedProfessor',
          attributes: ['id', 'professor_code']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get professor request error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Approve professor registration request (admin)
// @route   POST /api/admin/professor-requests/:id/approve
// @access  Admin Only
const approveProfessorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ProfessorRegistrationRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    if (request.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'تم قبول هذا الطلب مسبقاً'
      });
    }

    // If previously rejected, reset rejection reason to allow re-approval
    if (request.status === 'rejected') {
      await request.update({ status: 'pending', rejection_reason: null });
    }

    // Normalize data
    const normalizedNationalId = request.national_id ? request.national_id.trim() : null;

    // Check if email or national_id already exists in users
    // Only check national_id if it's actually provided to avoid matching multiple NULL values
    const checkCriteria = [{ email: request.email }];
    if (normalizedNationalId) {
      checkCriteria.push({ national_id: normalizedNationalId });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: checkCriteria
      }
    });

    if (existingUser) {
      const reason = existingUser.email === request.email ? 'البريد الإلكتروني مستخدم بالفعل' : 'الرقم القومي مستخدم بالفعل';
      return res.status(400).json({
        success: false,
        message: reason
      });
    }

    // Generate professor code
    const professor_code = await generateProfessorCode();

    // Build username: use stored one, or derive from email
    const resolvedUsername = request.username
      || request.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') + '_' + Date.now().toString().slice(-4);

    // Get password_hash - use stored hash or generate a secure random one
    let pHash = request.getDataValue('password_hash') || request.password_hash;
    if (!pHash) {
      pHash = await bcrypt.hash(Math.random().toString(36).slice(-8) + Date.now(), 12);
    }

    // Create user
    const user = await User.create({
      username:      resolvedUsername,
      full_name:     request.full_name,
      email:         request.email,
      national_id:   normalizedNationalId,
      phone:         request.phone,
      password_hash: pHash,
      role:          'professor',
      is_active:     true
    });

    // Create professor
    const professor = await Professor.create({
      user_id:             user.id,
      professor_code,
      specialty_id:        request.specialty_id,
      qualification:       request.qualification,
      years_of_experience: request.years_of_experience,
      department:          request.department    || null,
      specialization:      request.specialization || null,
    });

    // Update request status
    await request.update({
      status: 'approved',
      processed_at: new Date(),
      processed_by: req.user.id,
      created_user_id: user.id,
      created_professor_id: professor.id
    });

    // Log activity
    await logActivity(
      req.user.id,
      'approve',
      'ProfessorRegistrationRequest',
      request.id,
      { professor_code, user_id: user.id, professor_id: professor.id }
    );

    res.json({
      success: true,
      message: 'تم قبول الطلب وإنشاء حساب الدكتور بنجاح',
      data: {
        user_id: user.id,
        professor_id: professor.id,
        professor_code,
        full_name: request.full_name
      }
    });

  } catch (error) {
    console.error('Approve professor request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في الخادم',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// @desc    Reject professor registration request (admin)
// @route   POST /api/admin/professor-requests/:id/reject
// @access  Admin Only
const rejectProfessorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const request = await ProfessorRegistrationRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'هذا الطلب تمت معالجته بالفعل'
      });
    }

    await request.update({
      status: 'rejected',
      rejection_reason: rejection_reason || null,
      processed_at: new Date(),
      processed_by: req.user.id
    });

    // Log activity
    await logActivity(
      req.user.id,
      'reject',
      'ProfessorRegistrationRequest',
      request.id,
      { rejection_reason }
    );

    res.json({
      success: true,
      message: 'تم رفض الطلب'
    });

  } catch (error) {
    console.error('Reject professor request error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Delete professor registration request (admin)
// @route   DELETE /api/admin/professor-requests/:id
// @access  Admin Only
const deleteProfessorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ProfessorRegistrationRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Don't allow deleting approved requests
    if (request.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف طلب مقبول'
      });
    }

    // Log activity before deletion
    await logActivity(
      req.user.id,
      'delete',
      'ProfessorRegistrationRequest',
      request.id,
      { full_name: request.full_name, email: request.email }
    );

    await request.destroy();

    res.json({
      success: true,
      message: 'تم حذف الطلب نهائياً'
    });

  } catch (error) {
    console.error('Delete professor request error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Bulk approve all pending professor registration requests (admin)
// @route   POST /api/professor-registration/admin/approve-all
// @access  Admin Only
const approveBulkProfessorRequests = async (req, res) => {
  try {
    const { sequelize } = require('../config/models');

    // Get all pending requests
    const pendingRequests = await ProfessorRegistrationRequest.findAll({
      where: { status: 'pending' }
    });

    if (pendingRequests.length === 0) {
      return res.json({
        success: true,
        message: 'لا توجد طلبات معلقة',
        data: {
          total: 0,
          approved: 0,
          failed: 0,
          approvedRequests: []
        }
      });
    }

    const approvedRequests = [];
    const failedRequests = [];

    // Approve each request
    for (const request of pendingRequests) {
      try {
        // Normalize data
        const normalizedNationalId = request.national_id ? request.national_id.trim() : null;

        // Check if email or national_id already exists
        const checkCriteria = [{ email: request.email }];
        if (normalizedNationalId) {
          checkCriteria.push({ national_id: normalizedNationalId });
        }

        const existingUser = await User.findOne({
          where: {
            [Op.or]: checkCriteria
          }
        });

        if (existingUser) {
          failedRequests.push({
            id: request.id,
            email: request.email,
            reason: existingUser.email === request.email ? 'البريد الإلكتروني مستخدم بالفعل' : 'الرقم القومي مستخدم بالفعل'
          });
          continue;
        }

        // Generate professor code
        const professor_code = await generateProfessorCode();

        // Build username
        const resolvedUsername = request.username
          || request.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') + '_' + Date.now().toString().slice(-4);

        // Get password_hash - use stored hash or generate a secure random one
        let pHash = request.getDataValue('password_hash') || request.password_hash;
        if (!pHash) {
          pHash = await bcrypt.hash(Math.random().toString(36).slice(-8) + Date.now(), 12);
        }

        // Create user
        const user = await User.create({
          username:      resolvedUsername,
          full_name:     request.full_name,
          email:         request.email,
          national_id:   normalizedNationalId,
          phone:         request.phone,
          password_hash: pHash,
          role:          'professor',
          is_active:     true
        });

        // Create professor
        const professor = await Professor.create({
          user_id:             user.id,
          professor_code,
          specialty_id:        request.specialty_id,
          qualification:       request.qualification,
          years_of_experience: request.years_of_experience,
          department:          request.department    || null,
          specialization:      request.specialization || null,
        });

        // Update request status
        await request.update({
          status: 'approved',
          processed_at: new Date(),
          processed_by: req.user.id,
          created_user_id: user.id,
          created_professor_id: professor.id
        });

        // Log activity
        await logActivity(
          req.user.id,
          'bulk_approve',
          'ProfessorRegistrationRequest',
          request.id,
          { professor_code, user_id: user.id, professor_id: professor.id }
        );

        approvedRequests.push({
          id: request.id,
          professor_code,
          full_name: request.full_name,
          email: request.email
        });

      } catch (error) {
        console.error(`Error approving professor request ${request.id}:`, error);
        failedRequests.push({
          id: request.id,
          email: request.email,
          reason: error.message || 'حدث خطأ أثناء المعالجة'
        });
      }
    }

    // Log bulk activity
    await logActivity(
      req.user.id,
      'bulk_approve_complete',
      'ProfessorRegistrationRequest',
      null,
      { total: pendingRequests.length, approved: approvedRequests.length, failed: failedRequests.length }
    );

    res.json({
      success: true,
      message: `تمت معالجة ${pendingRequests.length} طلب: قبول ${approvedRequests.length}، وفشل ${failedRequests.length}`,
      data: {
        total: pendingRequests.length,
        approved: approvedRequests.length,
        failed: failedRequests.length,
        approvedRequests,
        failedRequests: failedRequests.length > 0 ? failedRequests : undefined
      }
    });

  } catch (error) {
    console.error('Bulk approve professor requests error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Professor Registration Link System - Using Database (Same as Student Links)
// ─────────────────────────────────────────────────────────────────────────────

const createProfessorRegistrationLink = async (req, res) => {
  try {
    const { expires_in_days = 7 } = req.body;
    const token = uuidv4();
    const expires_at = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000);
    
    console.log('Creating professor registration link:', { token: token.substring(0, 8) + '...', expires_at });
    
    const link = await ProfessorRegistrationLink.create({
      token,
      expires_at,
      created_by: req.user.id
    });
    
    await logActivity(req.user.id, 'create', 'ProfessorRegistrationLink', link.id, { token, expires_at });
    
    console.log('Professor registration link created successfully');
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء رابط تسجيل الدكتور بنجاح',
      data: { 
        token: link.token, 
        expires_at: link.expires_at, 
        url: `/register/professor/${link.token}` 
      }
    });
  } catch (error) {
    console.error('createProfessorRegistrationLink error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getProfessorRegistrationLinks = async (req, res) => {
  try {
    const links = await ProfessorRegistrationLink.findAll({
      attributes: ['id', 'token', 'expires_at', 'is_used', 'created_at', 'created_by'],
      order: [['created_at', 'DESC']],
      limit: 100
    });
    
    const formattedLinks = links.map(link => ({
      id: link.id,
      token: link.token,
      expires_at: link.expires_at,
      is_expired: new Date(link.expires_at) < new Date(),
      is_used: link.is_used,
      created_at: link.created_at,
      url: `/register/professor/${link.token}`
    }));
    
    res.json({ success: true, data: formattedLinks });
  } catch (error) {
    console.error('getProfessorRegistrationLinks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const validateProfessorLink = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'رابط التسجيل غير صحيح'
      });
    }

    const link = await ProfessorRegistrationLink.findOne({ where: { token } });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'رابط التسجيل غير صالح أو لم يتم إنشاؤه'
      });
    }

    if (new Date(link.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'انتهت صلاحية رابط التسجيل'
      });
    }

    if (link.is_used) {
      return res.status(400).json({
        success: false,
        message: 'تم استخدام هذا الرابط من قبل'
      });
    }

    // Fetch specialties - if this fails, return empty array but don't fail the request
    let specialties = [];
    try {
      const specialtyRecords = await Specialty.findAll({
        where: { is_active: true },
        attributes: ['id', 'code', 'name', 'arabic_name'],
        raw: true
      });
      specialties = Array.isArray(specialtyRecords) ? specialtyRecords : [];
    } catch (dbError) {
      console.error('Error fetching specialties in validateProfessorLink:', dbError.message);
      // Continue with empty specialties array - don't fail the validation
      specialties = [];
    }

    return res.json({
      success: true,
      data: {
        valid: true,
        expires_at: link.expires_at,
        specialties
      }
    });

  } catch (error) {
    console.error('validateProfessorLink error:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const registerProfessorViaLink = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'رابط التسجيل غير صحيح' 
      });
    }
    
    // Query database for link
    const link = await ProfessorRegistrationLink.findOne({
      where: { token }
    });
    
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'رابط التسجيل غير صالح أو لم يتم إنشاؤه' 
      });
    }
    
    if (new Date(link.expires_at) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'انتهت صلاحية رابط التسجيل' 
      });
    }
    
    // Delegate to registerProfessor
    return registerProfessor(req, res);
  } catch (error) {
    console.error('Register professor via link error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
};

module.exports = {
  registerProfessor,
  registerProfessorViaLink,
  validateProfessorLink,
  getProfessorRequests,
  getProfessorRequest,
  approveProfessorRequest,
  approveBulkProfessorRequests,
  rejectProfessorRequest,
  deleteProfessorRequest,
  createProfessorRegistrationLink,
  getProfessorRegistrationLinks
};
