const router = require('express').Router();
const { body } = require('express-validator');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/tasks');

router.use(verifyToken);

router.get('/', getTasks);
router.get('/:id', getTask);

router.post('/', requireAdmin, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
], createTask);

router.put('/:id', updateTask);
router.delete('/:id', requireAdmin, deleteTask);

module.exports = router;
