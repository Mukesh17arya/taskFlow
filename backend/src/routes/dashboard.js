const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboard');

router.get('/', verifyToken, getDashboard);

module.exports = router;
