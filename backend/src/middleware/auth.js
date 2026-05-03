const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Verify user is admin of a specific project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    // Global admins can do anything
    if (req.user.role === 'ADMIN') return next();

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: req.user.id },
      },
    });

    if (!member || member.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Project admin access required' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Verify user is a member of a project
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;

    if (req.user.role === 'ADMIN') return next();

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: req.user.id },
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    req.projectMember = member;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyToken, requireAdmin, requireProjectAdmin, requireProjectMember };
