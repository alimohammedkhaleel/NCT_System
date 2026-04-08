const GradeSetting = require('../models/GradeSetting');

// ==================== Grade Settings Service ====================

/**
 * Get all grade settings
 * @returns {Promise<object>} Grade settings as key-value pairs
 */
const getAllSettings = async () => {
  try {
    const settings = await GradeSetting.findAll();
    const settingsMap = {};
    
    settings.forEach(setting => {
      settingsMap[setting.setting_name] = parseFloat(setting.setting_value);
    });
    
    return settingsMap;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
};

/**
 * Get specific setting by name
 * @param {string} settingName - Setting name
 * @returns {Promise<number>} Setting value
 */
const getSetting = async (settingName) => {
  try {
    const setting = await GradeSetting.findOne({
      where: { setting_name: settingName }
    });
    
    if (!setting) {
      throw new Error(`Setting ${settingName} not found`);
    }
    
    return parseFloat(setting.setting_value);
  } catch (error) {
    console.error(`Get setting ${settingName} error:`, error);
    throw error;
  }
};

/**
 * Update grade setting
 * @param {string} settingName - Setting name
 * @param {number} value - New value
 * @param {number} userId - Admin user ID
 * @returns {Promise<object>} Updated setting
 */
const updateSetting = async (settingName, value, userId) => {
  try {
    const setting = await GradeSetting.findOne({
      where: { setting_name: settingName }
    });
    
    if (!setting) {
      throw new Error(`Setting ${settingName} not found`);
    }
    
    await setting.update({
      setting_value: value,
      updated_by: userId,
      updated_at: new Date()
    });
    
    return setting;
  } catch (error) {
    console.error('Update setting error:', error);
    throw error;
  }
};

/**
 * Initialize default grade settings
 * @param {number} userId - Admin user ID
 * @returns {Promise<void>}
 */
const initializeDefaultSettings = async (userId = 1) => {
  try {
    const defaults = [
      { name: 'pass_grade_value', value: 20, description: 'نقاط درجة النجاح (P)', type: 'grade_value' },
      { name: 'merit_grade_value', value: 30, description: 'نقاط درجة الامتياز (M)', type: 'grade_value' },
      { name: 'distinction_grade_value', value: 40, description: 'نقاط درجة الامتياز الذي (D)', type: 'grade_value' },
      { name: 'max_final_exam_score', value: 150, description: 'الحد الأقصى لدرجة الامتحان النهائي', type: 'max_score' },
      { name: 'max_total_score', value: 200, description: 'الحد الأقصى للدرجة الإجمالية', type: 'max_score' },
      { name: 'grade_a_percentage', value: 85, description: 'نسبة الحصول على درجة A', type: 'other' },
      { name: 'grade_b_percentage', value: 75, description: 'نسبة الحصول على درجة B', type: 'other' },
      { name: 'grade_c_percentage', value: 65, description: 'نسبة الحصول على درجة C', type: 'other' },
      { name: 'grade_d_percentage', value: 50, description: 'نسبة الحصول على درجة D', type: 'other' }
    ];
    
    for (const defaultSetting of defaults) {
      const exists = await GradeSetting.findOne({
        where: { setting_name: defaultSetting.name }
      });
      
      if (!exists) {
        await GradeSetting.create({
          setting_name: defaultSetting.name,
          setting_value: defaultSetting.value,
          description: defaultSetting.description,
          setting_type: defaultSetting.type,
          updated_by: userId
        });
      }
    }
  } catch (error) {
    console.error('Initialize default settings error:', error);
    throw error;
  }
};

/**
 * Calculate grade based on score and settings
 * @param {number} totalScore - Total score
 * @param {object} settings - Grade settings
 * @returns {object} Letter grade and result
 */
const calculateLetterGrade = (totalScore, settings) => {
  const maxScore = settings.max_total_score || 200;
  const percentage = (totalScore / maxScore) * 100;
  
  let letterGrade = 'F';
  let finalResult = 'Fail';
  
  if (percentage >= (settings.grade_a_percentage || 85)) {
    letterGrade = 'A';
    finalResult = 'Excellent';
  } else if (percentage >= (settings.grade_b_percentage || 75)) {
    letterGrade = 'B';
    finalResult = 'Merit';
  } else if (percentage >= (settings.grade_c_percentage || 65)) {
    letterGrade = 'C';
    finalResult = 'Good';
  } else if (percentage >= (settings.grade_d_percentage || 50)) {
    letterGrade = 'D';
    finalResult = 'Pass';
  }
  
  return { letterGrade, finalResult, percentage };
};

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  initializeDefaultSettings,
  calculateLetterGrade
};
