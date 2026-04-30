/**
 * Grade Config Parser and Pretty Printer
 * 
 * This module provides functions to parse JSON configuration files
 * and convert them to CourseGradeConfig objects, as well as pretty
 * print CourseGradeConfig objects back to JSON format.
 */

/**
 * Parse JSON array to CourseGradeConfig objects
 * @param {string|object} jsonData - JSON string or parsed object
 * @returns {object} - { success: boolean, data: array, errors: array }
 */
const parseGradeConfigs = (jsonData) => {
  const errors = [];
  const validConfigs = [];

  try {
    // Parse JSON if string
    const configs = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // Validate it's an array
    if (!Array.isArray(configs)) {
      return {
        success: false,
        data: [],
        errors: ['البيانات يجب أن تكون مصفوفة (array) من الإعدادات']
      };
    }

    // Validate each config
    configs.forEach((config, index) => {
      const validation = validateConfig(config, index);
      
      if (validation.valid) {
        validConfigs.push(config);
      } else {
        errors.push(...validation.errors);
      }
    });

    return {
      success: errors.length === 0,
      data: validConfigs,
      errors
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`خطأ في تحليل JSON: ${error.message}`]
    };
  }
};

/**
 * Validate a single config object
 * @param {object} config - Config object to validate
 * @param {number} index - Index in array for error reporting
 * @returns {object} - { valid: boolean, errors: array }
 */
const validateConfig = (config, index) => {
  const errors = [];
  const prefix = `الإعداد رقم ${index + 1}`;

  // Required fields
  if (!config.course_id) {
    errors.push(`${prefix}: حقل course_id مطلوب`);
  }

  // Validate percentages
  const percentageFields = ['ass1_percentage', 'ass2_percentage', 'final_percentage'];
  percentageFields.forEach(field => {
    if (config[field] !== undefined) {
      const value = parseFloat(config[field]);
      if (isNaN(value) || value < 0 || value > 100) {
        errors.push(`${prefix}: ${field} يجب أن يكون رقم بين 0 و 100`);
      }
    }
  });

  // Validate percentage sum = 100%
  if (config.ass1_percentage !== undefined && 
      config.ass2_percentage !== undefined && 
      config.final_percentage !== undefined) {
    const sum = parseFloat(config.ass1_percentage) + 
                parseFloat(config.ass2_percentage) + 
                parseFloat(config.final_percentage);
    
    if (Math.abs(sum - 100) > 0.01) {
      errors.push(`${prefix}: مجموع النسب المئوية يجب أن يساوي 100% (الحالي: ${sum.toFixed(2)}%)`);
    }
  }

  // Validate max values
  const maxFields = ['ass1_max', 'ass2_max', 'final_max'];
  maxFields.forEach(field => {
    if (config[field] !== undefined) {
      const value = parseFloat(config[field]);
      if (isNaN(value) || value <= 0) {
        errors.push(`${prefix}: ${field} يجب أن يكون رقم أكبر من 0`);
      }
    }
  });

  // Validate P/M/D values
  const gradeFields = ['p_value', 'm_value', 'd_value'];
  gradeFields.forEach(field => {
    if (config[field] !== undefined) {
      const value = parseFloat(config[field]);
      if (isNaN(value) || value < 0) {
        errors.push(`${prefix}: ${field} يجب أن يكون رقم غير سالب`);
      }
    }
  });

  // Validate P >= M >= D
  if (config.p_value !== undefined && 
      config.m_value !== undefined && 
      config.d_value !== undefined) {
    const p = parseFloat(config.p_value);
    const m = parseFloat(config.m_value);
    const d = parseFloat(config.d_value);
    
    if (p < m || m < d) {
      errors.push(`${prefix}: يجب أن يكون P >= M >= D (الحالي: P=${p}, M=${m}, D=${d})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Pretty print CourseGradeConfig objects to JSON
 * @param {array} configs - Array of config objects
 * @param {object} options - Formatting options
 * @returns {string} - Formatted JSON string
 */
const prettyPrintConfigs = (configs, options = {}) => {
  const {
    indent = 2,
    includeMetadata = false
  } = options;

  // Filter fields to include
  const filteredConfigs = configs.map(config => {
    const filtered = {
      course_id: config.course_id,
      course_code: config.course_code || undefined,
      course_name: config.course_name || undefined,
      ass1_percentage: parseFloat(config.ass1_percentage),
      ass2_percentage: parseFloat(config.ass2_percentage),
      final_percentage: parseFloat(config.final_percentage),
      ass1_max: parseFloat(config.ass1_max),
      ass2_max: parseFloat(config.ass2_max),
      final_max: parseFloat(config.final_max),
      p_value: parseFloat(config.p_value),
      m_value: parseFloat(config.m_value),
      d_value: parseFloat(config.d_value)
    };

    // Remove undefined fields
    Object.keys(filtered).forEach(key => {
      if (filtered[key] === undefined) {
        delete filtered[key];
      }
    });

    return filtered;
  });

  // Add metadata if requested
  const output = includeMetadata ? {
    metadata: {
      exported_at: new Date().toISOString(),
      count: filteredConfigs.length,
      version: '1.0'
    },
    configs: filteredConfigs
  } : filteredConfigs;

  return JSON.stringify(output, null, indent);
};

/**
 * Get default config values
 * @returns {object} - Default configuration
 */
const getDefaultConfig = () => {
  return {
    ass1_percentage: 15.00,
    ass2_percentage: 15.00,
    final_percentage: 70.00,
    ass1_max: 30.00,
    ass2_max: 30.00,
    final_max: 150.00,
    p_value: 30.00,
    m_value: 21.00,
    d_value: 15.00
  };
};

/**
 * Merge config with defaults
 * @param {object} config - Partial config object
 * @returns {object} - Complete config with defaults
 */
const mergeWithDefaults = (config) => {
  const defaults = getDefaultConfig();
  return {
    ...defaults,
    ...config
  };
};

module.exports = {
  parseGradeConfigs,
  validateConfig,
  prettyPrintConfigs,
  getDefaultConfig,
  mergeWithDefaults
};
