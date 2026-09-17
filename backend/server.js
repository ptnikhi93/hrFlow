require('dotenv').config();
const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 5000;

db.sequelize
  .authenticate()
  .then(() => {
    console.log('✅ MySQL connected successfully via Sequelize');
    app.listen(PORT, () => {
      console.log(`🚀 HRFlow backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err.message);
  });