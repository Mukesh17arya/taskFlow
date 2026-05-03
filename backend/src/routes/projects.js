const router = require('express').Router();
const { body } = require('express-validator');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember
} = require('../controllers/projects');

router.use(verifyToken);

router.get('/', getProjects);
router.get('/:id', getProject);

router.post('/', requireAdmin, [
  body('name').trim().notEmpty().withMessage('Project name is required'),
], createProject);

router.put('/:id', requireAdmin, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

router.post('/:id/members', requireAdmin, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], addMember);

router.delete('/:id/members/:userId', requireAdmin, removeMember);

module.exports = router;
