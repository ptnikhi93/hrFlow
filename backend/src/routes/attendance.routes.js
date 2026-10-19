const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Every route requires a valid token
router.use(verifyToken);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/today', attendanceController.getToday);
router.get('/my', attendanceController.getMyAttendance);

module.exports = router;