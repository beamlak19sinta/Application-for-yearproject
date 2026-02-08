const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const prisma = require('./utils/prisma');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const queueRoutes = require('./routes/queueRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/appointments', appointmentRoutes);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'Backend is running', timestamp: new Date() });
});

// System Stats (Admin only)
app.get('/api/admin/stats', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const [users, queues, sectors] = await Promise.all([
            prisma.user.count({ where: { role: 'CITIZEN' } }),
            prisma.queue.count(),
            prisma.serviceSector.count()
        ]);
        res.json({ users, queues, sectors, uptime: '99.9%' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
});

// Port listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
