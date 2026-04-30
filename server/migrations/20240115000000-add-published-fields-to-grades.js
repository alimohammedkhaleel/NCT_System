/**
 * Migration: Add publishing fields to grades table
 * 
 * This migration adds three new fields to support grade publishing:
 * - is_published: Boolean flag indicating if grade is published to student
 * - published_at: Timestamp when grade was published
 * - published_by: Foreign key to users table (admin who published)
 * 
 * Related to: NCTU Dashboard UI Enhancements - Task 7.1
 * Requirements: 5.3, 5.4
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Starting migration: add-published-fields-to-grades');

      // Add is_published column
      await queryInterface.addColumn('grades', 'is_published', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'هل تم نشر الدرجة للطالب'
      });
      console.log('✅ Added is_published column');

      // Add published_at column
      await queryInterface.addColumn('grades', 'published_at', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'تاريخ النشر'
      });
      console.log('✅ Added published_at column');

      // Add published_by column with foreign key
      await queryInterface.addColumn('grades', 'published_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'الأدمن الذي نشر الدرجة'
      });
      console.log('✅ Added published_by column with foreign key');

      // Add index on is_published for faster queries
      await queryInterface.addIndex('grades', ['is_published'], {
        name: 'idx_grades_is_published'
      });
      console.log('✅ Added index on is_published');

      console.log('✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Starting rollback: add-published-fields-to-grades');

      // Remove index
      await queryInterface.removeIndex('grades', 'idx_grades_is_published');
      console.log('✅ Removed index on is_published');

      // Remove columns in reverse order
      await queryInterface.removeColumn('grades', 'published_by');
      console.log('✅ Removed published_by column');

      await queryInterface.removeColumn('grades', 'published_at');
      console.log('✅ Removed published_at column');

      await queryInterface.removeColumn('grades', 'is_published');
      console.log('✅ Removed is_published column');

      console.log('✅ Rollback completed successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
