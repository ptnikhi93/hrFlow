const express = require('express');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


// Simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HRFlow backend is running' });
});

module.exports = app;