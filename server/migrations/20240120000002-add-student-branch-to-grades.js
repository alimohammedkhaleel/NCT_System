'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add student_branch_at_creation column to grades table
    await queryInterface.addColumn('grades', 'student_branch_at_creation', {
      type: Sequelize.ENUM('Software', 'Network'),
      allowNull: true,
      comment: 'فرع الطالب وقت إنشاء الدرجة (للحفظ التاريخي - لا يتغير حتى لو تغير فرع الطالب)',
      after: 'student_id'
    });

    // Add index on student_branch_at_creation for filtering performance
    await queryInterface.addIndex('grades', ['student_branch_at_creation'], {
      name: 'idx_grades_student_branch_at_creation'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('grades', 'idx_grades_student_branch_at_creation');
    // Remove column (also removes the ENUM type)
    await queryInterface.removeColumn('grades', 'student_branch_at_creation');
  }
};
