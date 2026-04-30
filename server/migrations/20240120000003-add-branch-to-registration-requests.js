'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add current_year column after specialty_id
    await queryInterface.addColumn('registration_requests', 'current_year', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'السنة الدراسية المطلوبة',
      after: 'specialty_id'
    });

    // Add branch column after current_year
    await queryInterface.addColumn('registration_requests', 'branch', {
      type: Sequelize.ENUM('Software', 'Network'),
      allowNull: true,
      comment: 'فرع ICT (للسنة الثالثة والرابعة فقط)',
      after: 'current_year'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('registration_requests', 'branch');
    await queryInterface.removeColumn('registration_requests', 'current_year');
  }
};
