/**
 * Standalone seed script - Run with: node run-seed.js
 * This will populate the database with initial data
 */

require('dotenv').config();
const seedDatabase = require('./seed-data');
const { sequelize, defineAssociations } = require('./config/models');

async function runSeed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Define associations
    defineAssociations();
    console.log('✅ Model associations defined\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Run seed
    await seedDatabase();

    console.log('✅ Seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
