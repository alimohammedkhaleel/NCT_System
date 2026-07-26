const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect using Neon connection string or fallback to individual env variables
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_y6KiBodv3hwg@ep-wandering-mountain-avtn6o0l-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for some hosted PostgreSQL like Neon
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: false
  }
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = sequelize;