'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add branch column to students table
    await queryInterface.addColumn('students', 'branch', {
      type: Sequelize.ENUM('Software', 'Network'),
      allowNull: true,
      comment: 'فرع الطالب (للسنة الثالثة والرابعة في ICT) - البرمجيات أو الشبكات',
      after: 'current_year'
    });

    // Add index on branch field for filtering performance
    await queryInterface.addIndex('students', ['branch'], {
      name: 'idx_students_branch'
    });

    // Add composite index for common queries (specialty + year + branch)
    await queryInterface.addIndex('students', ['specialty_id', 'current_year', 'branch'], {
      name: 'idx_students_specialty_year_branch'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove composite index first
    await queryInterface.removeIndex('students', 'idx_students_specialty_year_branch');
    // Remove branch index
    await queryInterface.removeIndex('students', 'idx_students_branch');
    // Remove branch column (also removes the ENUM type)
    await queryInterface.removeColumn('students', 'branch');
  }
};