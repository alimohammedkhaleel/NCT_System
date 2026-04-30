/**
 * Migration: Create professor_registration_requests table
 * Purpose: Store professor registration requests before admin approval
 * Date: 2024-04-24
 */

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function up() {
  const queryInterface = sequelize.getQueryInterface();

  console.log('Creating professor_registration_requests table...');

  await queryInterface.createTable('professor_registration_requests', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Personal Information
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    national_id: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true
    },
    // Contact Information
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    // Academic Information
    specialty_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'specialties',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Password (hashed)
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    // Status
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Processing Information
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    // Created User/Professor IDs (after approval)
    created_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_professor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'professors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    // Timestamps
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  console.log('Adding indexes to professor_registration_requests table...');

  // Add indexes for better query performance (check if exists first)
  try {
    await queryInterface.addIndex('professor_registration_requests', ['status'], {
      name: 'idx_status'
    });
  } catch (e) {
    if (e.original?.errno !== 1061) throw e; // Ignore duplicate key error
  }

  try {
    await queryInterface.addIndex('professor_registration_requests', ['email'], {
      name: 'idx_email'
    });
  } catch (e) {
    if (e.original?.errno !== 1061) throw e;
  }

  try {
    await queryInterface.addIndex('professor_registration_requests', ['national_id'], {
      name: 'idx_national_id'
    });
  } catch (e) {
    if (e.original?.errno !== 1061) throw e;
  }

  try {
    await queryInterface.addIndex('professor_registration_requests', ['created_at'], {
      name: 'idx_created_at'
    });
  } catch (e) {
    if (e.original?.errno !== 1061) throw e;
  }

  try {
    await queryInterface.addIndex('professor_registration_requests', ['specialty_id'], {
      name: 'idx_specialty_id'
    });
  } catch (e) {
    if (e.original?.errno !== 1061) throw e;
  }

  console.log('✅ professor_registration_requests table created successfully!');
}

async function down() {
  const queryInterface = sequelize.getQueryInterface();

  console.log('Dropping professor_registration_requests table...');
  await queryInterface.dropTable('professor_registration_requests');
  console.log('✅ professor_registration_requests table dropped successfully!');
}

// Run migration if called directly
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connection established.');
      
      await up();
      
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { up, down };
