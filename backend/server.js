require('dotenv').config();
const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 5000;

db.sequelize
  .sync() // creates tables if they don't exist yet
  .then(() => {
    console.log('✅ MySQL connected & synced successfully via Sequelize');
    app.listen(PORT, () => {
      console.log(`🚀 HRFlow backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err.message);
  });