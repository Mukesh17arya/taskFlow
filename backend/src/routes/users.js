const router = require('express').Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { getUsers, updateUserRole } = require('../controllers/users');

router.use(verifyToken);

router.get('/', requireAdmin, getUsers);
router.patch('/:id/role', requireAdmin, updateUserRole);

module.exports = router;
