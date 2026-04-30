const { sequelize } = require('../config/models');
async function checkTable() {
  try {
    const [results] = await sequelize.query("DESCRIBE professors");
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkTable();
