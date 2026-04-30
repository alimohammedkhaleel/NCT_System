const fs = require('fs').promises;
const path = require('path');
const sequelize = require('../config/database');

// Use models from config/models to ensure associations are defined
const getModels = () => {
  const { Timetable, Specialty, User, ActivityLog } = require('../config/models');
  return { Timetable, Specialty, User, ActivityLog };
};

class TimetableService {
  /**
   * Create a new timetable with file upload
   * @param {Object} timetableData - { title, specialty_id }
   * @param {Object} file - Uploaded file object from multer
   * @param {number} userId - ID of user creating the timetable
   * @returns {Promise<Object>} Created timetable with associations
   */
  async createTimetable(timetableData, file, userId) {
    const { Timetable, Specialty, ActivityLog } = getModels();
    if (!file) {
      throw new Error('PDF file is required');
    }

    if (!timetableData.title || !timetableData.specialty_id) {
      throw new Error('title and specialty_id are required');
    }

    // Verify specialty exists
    const specialty = await Specialty.findByPk(timetableData.specialty_id);
    if (!specialty) {
      throw new Error('Specialty not found');
    }

    const transaction = await sequelize.transaction();
    try {
      // Calculate file URL (relative path for frontend)
      const fileUrl = `/uploads/timetables/${file.filename}`;

      // Create timetable record
      const timetable = await Timetable.create(
        {
          title: timetableData.title,
          specialty_id: timetableData.specialty_id,
          file_url: fileUrl,
          file_name: file.originalname,
          file_size: file.size,
          created_by: userId
        },
        { transaction }
      );

      // Log activity
      await ActivityLog.create(
        {
          user_id: userId,
          action: 'create',
          entity: 'Timetable',
          entity_id: timetable.id,
          details: `Created timetable: ${timetable.title}`
        },
        { transaction }
      );

      await transaction.commit();

      // Fetch with associations
      return await this.getTimetableById(timetable.id);
    } catch (error) {
      await transaction.rollback();
      // Delete uploaded file if transaction failed
      if (file && file.path) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
      throw error;
    }
  }

  /**
   * Get all timetables
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of timetables with associations
   */
  async getAllTimetables(filters = {}) {
    const { Timetable, Specialty, User } = getModels();
    const where = {};

    if (filters.specialty_id) {
      where.specialty_id = filters.specialty_id;
    }

    const timetables = await Timetable.findAll({
      where,
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name']
        },
        {
          model: User,
          as: 'createdByUser',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return timetables;
  }

  /**
   * Get timetable by ID
   * @param {number} timetableId
   * @returns {Promise<Object>} Timetable with associations
   */
  async getTimetableById(timetableId) {
    const { Timetable, Specialty, User } = getModels();
    const timetable = await Timetable.findByPk(timetableId, {
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name']
        },
        {
          model: User,
          as: 'createdByUser',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    if (!timetable) {
      throw new Error('Timetable not found');
    }

    return timetable;
  }

  /**
   * Update timetable (title and/or file)
   * @param {number} timetableId
   * @param {Object} updateData - { title, ... }
   * @param {Object} file - Optional new file from multer
   * @param {number} userId - ID of user updating
   * @returns {Promise<Object>} Updated timetable
   */
  async updateTimetable(timetableId, updateData, file, userId) {
    const { Timetable, ActivityLog } = getModels();
    const timetable = await Timetable.findByPk(timetableId);
    if (!timetable) {
      throw new Error('Timetable not found');
    }

    const transaction = await sequelize.transaction();
    try {
      // Prepare update object
      const updateObject = {};

      if (updateData.title) {
        updateObject.title = updateData.title;
      }

      if (file) {
        // Delete old file from disk
        const oldFilePath = path.join(__dirname, '../uploads/timetables', timetable.file_url.split('/').pop());
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old file:', err);
        }

        // Update file information
        updateObject.file_url = `/uploads/timetables/${file.filename}`;
        updateObject.file_name = file.originalname;
        updateObject.file_size = file.size;
      }

      // Update timetable
      await timetable.update(updateObject, { transaction });

      // Log activity
      await ActivityLog.create(
        {
          user_id: userId,
          action: 'update',
          entity: 'Timetable',
          entity_id: timetable.id,
          details: `Updated timetable: ${timetable.title}`
        },
        { transaction }
      );

      await transaction.commit();

      return await this.getTimetableById(timetableId);
    } catch (error) {
      await transaction.rollback();
      // Delete new file if update failed
      if (file && file.path) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
      throw error;
    }
  }

  /**
   * Delete timetable and remove file from disk
   * @param {number} timetableId
   * @param {number} userId - ID of user deleting
   * @returns {Promise<void>}
   */
  async deleteTimetable(timetableId, userId) {
    const { Timetable, ActivityLog } = getModels();
    const timetable = await Timetable.findByPk(timetableId);
    if (!timetable) {
      throw new Error('Timetable not found');
    }

    const transaction = await sequelize.transaction();
    try {
      // Delete file from disk
      const filePath = path.join(__dirname, '../uploads/timetables', timetable.file_url.split('/').pop());
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
        // Don't throw - continue with database deletion
      }

      // Log activity before deletion
      await ActivityLog.create(
        {
          user_id: userId,
          action: 'delete',
          entity: 'Timetable',
          entity_id: timetable.id,
          details: `Deleted timetable: ${timetable.title}`
        },
        { transaction }
      );

      // Delete record
      await timetable.destroy({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new TimetableService();
