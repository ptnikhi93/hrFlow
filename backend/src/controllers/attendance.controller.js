const { Op } = require('sequelize');
const db = require('../models');
const { Employee, Attendance } = db;

// Today's date as YYYY-MM-DD in the server's local time
function todayDate() {
  return new Date().toLocaleDateString('en-CA');
}

// Finds the employee profile that belongs to the logged-in user
async function getMyEmployee(req) {
  return Employee.findOne({ where: { userId: req.user.id } });
}

// POST /api/attendance/check-in
exports.checkIn = async (req, res) => {
  try {
    const employee = await getMyEmployee(req);
    if (!employee) {
      return res.status(404).json({ message: 'No employee profile found for this account' });
    }
    if (employee.status !== 'active') {
      return res.status(403).json({ message: 'Your employee account is inactive' });
    }

    const date = todayDate();

    const existing = await Attendance.findOne({
      where: { employeeId: employee.id, date },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already checked in today' });
    }

    const record = await Attendance.create({
      employeeId: employee.id,
      date,
      checkIn: new Date(),
      status: 'present',
    });

    res.status(201).json({ message: 'Checked in successfully', attendance: record });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'You have already checked in today' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/attendance/check-out
exports.checkOut = async (req, res) => {
  try {
    const employee = await getMyEmployee(req);
    if (!employee) {
      return res.status(404).json({ message: 'No employee profile found for this account' });
    }

    const record = await Attendance.findOne({
      where: { employeeId: employee.id, date: todayDate() },
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You have not checked in today' });
    }
    if (record.checkOut) {
      return res.status(409).json({ message: 'You have already checked out today' });
    }

    const now = new Date();
    const hours = (now - new Date(record.checkIn)) / (1000 * 60 * 60);
    const workHours = Math.round(hours * 100) / 100;

    await record.update({
      checkOut: now,
      workHours,
      status: workHours < 4 ? 'half_day' : 'present',
    });

    res.json({ message: 'Checked out successfully', attendance: record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/attendance/today
// Tells the frontend whether to show "Check In" or "Check Out"
exports.getToday = async (req, res) => {
  try {
    const employee = await getMyEmployee(req);
    if (!employee) {
      return res.status(404).json({ message: 'No employee profile found for this account' });
    }

    const date = todayDate();
    const record = await Attendance.findOne({
      where: { employeeId: employee.id, date },
    });

    res.json({ date, attendance: record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/attendance/my?month=2026-10
// If no month is given, the current month is used
exports.getMyAttendance = async (req, res) => {
  try {
    const employee = await getMyEmployee(req);
    if (!employee) {
      return res.status(404).json({ message: 'No employee profile found for this account' });
    }

    const month = req.query.month || todayDate().slice(0, 7);

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
    }

    const [year, mon] = month.split('-').map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const records = await Attendance.findAll({
      where: {
        employeeId: employee.id,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'DESC']],
    });

    const summary = {
      presentDays: records.filter((r) => r.status === 'present').length,
      halfDays: records.filter((r) => r.status === 'half_day').length,
      totalWorkHours:
        Math.round(records.reduce((sum, r) => sum + Number(r.workHours || 0), 0) * 100) / 100,
    };

    res.json({ month, summary, records });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};