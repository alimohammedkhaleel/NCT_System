const TimetableService = require('../services/timetableService');

class TimetableController {
  /**
   * Create a new timetable with PDF upload
   * POST /api/admin/timetables
   */
  async createTimetable(req, res) {
    try {
      console.log('📥 CREATE TIMETABLE REQUEST:');
      console.log('  - Headers:', req.headers);
      console.log('  - Body:', req.body);
      console.log('  - File:', req.file);
      console.log('  - Files:', req.files);
      
      const { title, specialty_id } = req.body;
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        console.error('❌ No file received in req.file');
        return res.status(400).json({
          success: false,
          message: 'PDF file is required'
        });
      }

      const timetable = await TimetableService.createTimetable(
        { title, specialty_id },
        file,
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Timetable created successfully',
        data: timetable
      });
    } catch (error) {
      console.error('Create timetable error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create timetable'
      });
    }
  }

  /**
   * Get all timetables
   * GET /api/admin/timetables
   */
  async getAllTimetables(req, res) {
    try {
      const filters = {
        specialty_id: req.query.specialty_id ? parseInt(req.query.specialty_id) : null
      };

      const timetables = await TimetableService.getAllTimetables(filters);

      res.json({
        success: true,
        data: timetables,
        count: timetables.length
      });
    } catch (error) {
      console.error('Get timetables error:', error.message, error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch timetables'
      });
    }
  }

  /**
   * Get timetable by ID
   * GET /api/admin/timetables/:id
   */
  async getTimetableById(req, res) {
    try {
      const timetableId = req.params.id;
      const timetable = await TimetableService.getTimetableById(timetableId);

      res.json({
        success: true,
        data: timetable
      });
    } catch (error) {
      console.error('Get timetable error:', error);
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to fetch timetable'
      });
    }
  }

  /**
   * Update timetable (title and/or file)
   * PUT /api/admin/timetables/:id
   */
  async updateTimetable(req, res) {
    try {
      const timetableId = req.params.id;
      const userId = req.user.id;
      const file = req.file;
      const updateData = req.body;

      const timetable = await TimetableService.updateTimetable(
        timetableId,
        updateData,
        file,
        userId
      );

      res.json({
        success: true,
        message: 'Timetable updated successfully',
        data: timetable
      });
    } catch (error) {
      console.error('Update timetable error:', error);
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to update timetable'
      });
    }
  }

  /**
   * Delete timetable and remove file
   * DELETE /api/admin/timetables/:id
   */
  async deleteTimetable(req, res) {
    try {
      const timetableId = req.params.id;
      const userId = req.user.id;

      await TimetableService.deleteTimetable(timetableId, userId);

      res.json({
        success: true,
        message: 'Timetable deleted successfully'
      });
    } catch (error) {
      console.error('Delete timetable error:', error);
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to delete timetable'
      });
    }
  }
}

module.exports = new TimetableController();
