const crypto = require('crypto');
const QRCode = require('qrcode');

// ==================== QR Code Generation Service ====================

/**
 * Generate secure QR code for student registration
 * @param {number} studentId - Student ID
 * @param {number} expirationHours - Token expiration in hours (default 24)
 * @returns {Promise<object>} QR code data with secret and image
 */
const generateStudentQRCode = async (studentId, expirationHours = 24) => {
  try {
    // Generate random secret token
    const qrSecret = crypto.randomBytes(32).toString('hex');
    
    // Create payload with student ID and expiration
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + expirationHours);
    
    const payload = {
      studentId,
      secret: qrSecret,
      timestamp: new Date().toISOString(),
      expiresAt: expirationTime.toISOString(),
      type: 'student_registration'
    };
    
    // Encode payload as base64
    const qrData = Buffer.from(JSON.stringify(payload)).toString('base64');
    
    // Generate QR code image
    const qrImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return {
      qr_secret: qrSecret,
      qr_data: qrData,
      qr_image: qrImage,
      expires_at: expirationTime,
      is_active: true
    };
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify QR code token
 * @param {string} qrSecret - QR code secret token
 * @param {string} qrData - QR code data (base64)
 * @returns {object} Payload if valid
 */
const verifyQRCode = (qrSecret, qrData) => {
  try {
    // Decode base64 payload
    const payload = JSON.parse(Buffer.from(qrData, 'base64').toString('utf-8'));
    
    // Verify secret
    if (payload.secret !== qrSecret) {
      throw new Error('Invalid QR code secret');
    }
    
    // Check expiration
    const expirationTime = new Date(payload.expiresAt);
    if (new Date() > expirationTime) {
      throw new Error('QR code has expired');
    }
    
    return payload;
  } catch (error) {
    console.error('QR Code verification error:', error);
    throw error;
  }
};

/**
 * Regenerate QR code with new secret
 * @param {object} oldQRCode - Old QR code object
 * @param {number} expirationHours - New expiration in hours
 * @returns {Promise<object>} New QR code data
 */
const regenerateQRCode = async (oldQRCode, expirationHours = 24) => {
  try {
    // Decode old payload to get student ID
    const oldPayload = JSON.parse(Buffer.from(oldQRCode.qr_data, 'base64').toString('utf-8'));
    
    // Generate new QR code
    return await generateStudentQRCode(oldPayload.studentId, expirationHours);
  } catch (error) {
    console.error('QR Code regeneration error:', error);
    throw new Error('Failed to regenerate QR code');
  }
};

module.exports = {
  generateStudentQRCode,
  verifyQRCode,
  regenerateQRCode
};
