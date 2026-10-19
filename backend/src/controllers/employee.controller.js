const { Op } = require('sequelize');
const db = require('../models');
const { User, Employee, sequelize } = db;

// Fields of the user we are allowed to send back (never the password)
const userAttributes = ['id', 'name', 'email', 'role'];

// Generates codes like EMP0001, EMP0002...
async function generateEmployeeCode() {
  const last = await Employee.findOne({ order: [['id', 'DESC']] });
  const next = last ? last.id + 1 : 1;
  return 'EMP' + String(next).padStart(4, '0');
}

// POST /api/employees  (admin, hr)
exports.createEmployee = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      name, email, password, role,
      phone, department, designation,
      dateOfJoining, dateOfBirth, gender, address,
    } = req.body;

    if (!name || !email || !password) {
      await t.rollback();
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ where: { email }, transaction: t });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Only an admin can create hr/admin accounts. HR can only create employees.
    const finalRole = req.user.role === 'admin' && role ? role : 'employee';

    const user = await User.create(
      { name, email, password, role: finalRole },
      { transaction: t }
    );

    const employeeCode = await generateEmployeeCode();

    const employee = await Employee.create(
      {
        userId: user.id,
        employeeCode,
        phone,
        department,
        designation,
        dateOfJoining,
        dateOfBirth,
        gender,
        address,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        ...employee.toJSON(),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/employees  (admin, hr)
// Optional filters: ?search=john&status=active
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, status } = req.query;

    const where = {};
    if (status) where.status = status;

    const userWhere = {};
    if (search) {
      where[Op.or] = [
        { employeeCode: { [Op.like]: `%${search}%` } },
        { '$user.name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } },
      ];
    }

    const employees = await Employee.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: userAttributes, where: userWhere }],
      order: [['id', 'ASC']],
    });

    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/employees/me  (any logged-in user)
exports.getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'user', attributes: userAttributes }],
    });

    if (!employee) {
      return res.status(404).json({ message: 'No employee profile found for this account' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/employees/:id  (admin, hr, or the employee themselves)
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: userAttributes }],
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // A normal employee may only view their own profile
    if (req.user.role === 'employee' && employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/employees/:id  (admin, hr)
exports.updateEmployee = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const employee = await Employee.findByPk(req.params.id, { transaction: t });
    if (!employee) {
      await t.rollback();
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = await User.findByPk(employee.userId, { transaction: t });

    const {
      name, email, role,
      phone, department, designation,
      dateOfJoining, dateOfBirth, gender, address, status,
    } = req.body;

    // If the email is changing, make sure nobody else already uses it
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ where: { email }, transaction: t });
      if (emailTaken) {
        await t.rollback();
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    // Update login details (role can only be changed by an admin)
    await user.update(
      {
        name: name ?? user.name,
        email: email ?? user.email,
        role: req.user.role === 'admin' && role ? role : user.role,
      },
      { transaction: t }
    );

    // Update HR details
    await employee.update(
      {
        phone: phone ?? employee.phone,
        department: department ?? employee.department,
        designation: designation ?? employee.designation,
        dateOfJoining: dateOfJoining ?? employee.dateOfJoining,
        dateOfBirth: dateOfBirth ?? employee.dateOfBirth,
        gender: gender ?? employee.gender,
        address: address ?? employee.address,
        status: status ?? employee.status,
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      message: 'Employee updated successfully',
      employee: {
        ...employee.toJSON(),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/employees/:id  (admin, hr)
// We do NOT delete the row. We mark the employee inactive so their
// attendance/leave history is never lost.
exports.deactivateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update({ status: 'inactive' });

    res.json({ message: 'Employee deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};