const prisma = require('../utils/prisma');

const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const taskWhere = isAdmin
      ? {}
      : { assigneeId: userId };

    const projectWhere = isAdmin
      ? {}
      : { members: { some: { userId } } };

    // Parallel queries for performance
    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      totalProjects,
      recentTasks,
      myTasks,
    ] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'TODO' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'DONE' } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
      }),
      prisma.project.count({ where: projectWhere }),
      prisma.task.findMany({
        where: taskWhere,
        include: {
          assignee: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.task.findMany({
        where: { assigneeId: userId, status: { not: 'DONE' } },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 10,
      }),
    ]);

    res.json({
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        totalProjects,
      },
      recentTasks,
      myTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
