const prisma = require('../utils/prisma');

const getStats = async (req, res) => {
    try {
        const [users, queues, sectors, services] = await Promise.all([
            prisma.user.count({ where: { role: 'CITIZEN' } }),
            prisma.queue.count(),
            prisma.serviceSector.count(),
            prisma.service.count()
        ]);
        res.json({ users, queues, sectors, services });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                role: true,
                identificationNumber: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const logs = await prisma.systemLog.findMany({
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        // Prevent self-deletion
        if (id === currentUserId) {
            return res.status(400).json({ message: "You cannot delete your own admin account." });
        }

        // Fetch target user to check role
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent deleting another admin
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({ message: "Administrator accounts cannot be deleted." });
        }

        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const currentUserId = req.user.id;

        if (!['CITIZEN', 'OFFICER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Fetch target user to check current role
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent changing own role or other admin's role
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({ message: "Administrator roles cannot be modified." });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, role: true }
        });
        res.json({ message: 'User role updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user role', error: error.message });
    }
};

module.exports = { getStats, getUsers, getLogs, deleteUser, updateUserRole };
