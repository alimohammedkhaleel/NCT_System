const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function repairDatabase() {
  try {
    console.log('🔧 Starting database repair...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');

    // Get all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables in database.\n`);

    // Check and repair each table
    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];
      
      try {
        console.log(`🔍 Checking table: ${tableName}`);
        
        // Check table status
        const [status] = await sequelize.query(`CHECK TABLE ${tableName}`);
        console.log(`   Status:`, status[0]);

        // If table has issues, try to repair
        if (status[0].Msg_text !== 'OK') {
          console.log(`   ⚠️  Table has issues, attempting repair...`);
          const [repairResult] = await sequelize.query(`REPAIR TABLE ${tableName}`);
          console.log(`   Repair result:`, repairResult[0]);
        }

        // Optimize table
        console.log(`   🔧 Optimizing table...`);
        await sequelize.query(`OPTIMIZE TABLE ${tableName}`);
        console.log(`   ✅ Table optimized.\n`);

      } catch (error) {
        console.error(`   ❌ Error processing table ${tableName}:`, error.message);
        
        // If table is completely broken, try to recreate it
        if (error.message.includes("doesn't exist in engine")) {
          console.log(`   🔨 Attempting to drop and recreate table...`);
          try {
            await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);
            console.log(`   ✅ Table dropped. You'll need to run migrations to recreate it.\n`);
          } catch (dropError) {
            console.error(`   ❌ Could not drop table:`, dropError.message, '\n');
          }
        }
      }
    }

    console.log('\n✅ Database repair completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. If any tables were dropped, run: npm run migrate');
    console.log('   2. Run the professor registration migration');
    console.log('   3. Restart the server\n');

  } catch (error) {
    console.error('❌ Database repair failed:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

repairDatabase();
