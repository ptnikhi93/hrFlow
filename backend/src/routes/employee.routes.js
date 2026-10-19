const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Every route below requires a valid token
router.use(verifyToken);

// IMPORTANT: '/me' must come BEFORE '/:id', otherwise Express treats "me" as an id
router.get('/me', employeeController.getMyProfile);

router.get('/', checkRole('admin', 'hr'), employeeController.getAllEmployees);
router.post('/', checkRole('admin', 'hr'), employeeController.createEmployee);

router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', checkRole('admin', 'hr'), employeeController.updateEmployee);
router.delete('/:id', checkRole('admin', 'hr'), employeeController.deactivateEmployee);

module.exports = router;