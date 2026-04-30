'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add branch column to courses table
    await queryInterface.addColumn('courses', 'branch', {
      type: Sequelize.ENUM('Software', 'Network', 'Both'),
      allowNull: true,
      comment: 'فرع المادة (للمواد الخاصة بفرع معين في ICT)',
      after: 'semester_id'
    });

    // Add index on branch field for filtering performance
    await queryInterface.addIndex('courses', ['branch'], {
      name: 'idx_courses_branch'
    });

    // Add composite index for common queries (specialty + year + branch)
    await queryInterface.addIndex('courses', ['specialty_id', 'academic_year_id', 'branch'], {
      name: 'idx_courses_specialty_year_branch'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove composite index first
    await queryInterface.removeIndex('courses', 'idx_courses_specialty_year_branch');
    // Remove branch index
    await queryInterface.removeIndex('courses', 'idx_courses_branch');
    // Remove branch column (also removes the ENUM type)
    await queryInterface.removeColumn('courses', 'branch');
  }
};
