const prisma = require('../utils/prisma');

const getQueueAnalytics = async (req, res) => {
    try {
        const { range = '7d' } = req.query;
        const now = new Date();
        const past = new Date();

        if (range === '24h') past.setHours(past.getHours() - 24);
        else if (range === '7d') past.setDate(past.getDate() - 7);
        else if (range === '30d') past.setDate(past.getDate() - 30);
        else if (range === '90d') past.setDate(past.getDate() - 90);

        // Date filter
        const dateFilter = { createdAt: { gte: past } };

        // 1. Total Served
        const completedCount = await prisma.queue.count({
            where: {
                status: 'COMPLETED',
                ...dateFilter
            }
        });

        // 2. No Shows / Rejected
        const rejectedCount = await prisma.queue.count({
            where: {
                status: 'REJECTED',
                ...dateFilter
            }
        });

        // 3. Average Wait/Processing Time
        // Prisma doesn't support avg on date diffs directly easily, so we fetch and calc for now (ok for smaller datasets)
        const completedTickets = await prisma.queue.findMany({
            where: { status: 'COMPLETED', ...dateFilter },
            select: { createdAt: true, updatedAt: true }
        });

        let totalDurationMs = 0;
        completedTickets.forEach(t => {
            totalDurationMs += (new Date(t.updatedAt) - new Date(t.createdAt));
        });
        const avgWaitTimeMs = completedTickets.length > 0 ? totalDurationMs / completedTickets.length : 0;
        const avgWaitTimeMinutes = Math.round(avgWaitTimeMs / 1000 / 60);

        // Mock change percentages for now as implementing prev period logic is complex
        res.json({
            served: { value: completedCount, change: '+0%' },
            waitTime: { value: `${avgWaitTimeMinutes}m`, change: '0m' },
            noShows: { value: rejectedCount, change: '+0%' }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Failed to fetch queue analytics', error: error.message });
    }
};

const getServicePerformance = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            include: {
                _count: {
                    select: { queues: { where: { status: 'COMPLETED' } } }
                }
            }
        });

        // For real avg time per service, we'd need complex queries. 
        // Approximating or fetching subset.
        // For now, we'll map the count.

        const performance = services.map(s => ({
            name: s.name,
            total: s._count.queues,
            avgTime: '15m' // Placeholder until we have more data
        }));

        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch service performance', error: error.message });
    }
};

const getPeakHours = async (req, res) => {
    // This requires raw SQL for efficient grouping by hour in many DBs, or fetching all timestamps.
    // Fetching timestamps for last 7 days.
    try {
        const now = new Date();
        const past = new Date();
        past.setDate(past.getDate() - 7);

        const tickets = await prisma.queue.findMany({
            where: { createdAt: { gte: past } },
            select: { createdAt: true }
        });

        const hourCounts = new Array(24).fill(0);
        tickets.forEach(t => {
            const hour = new Date(t.createdAt).getHours();
            hourCounts[hour]++;
        });

        // Normalize to percentage of max for the chart
        const max = Math.max(...hourCounts);
        const normalized = hourCounts.map(c => max === 0 ? 0 : Math.round((c / max) * 100));

        // Return simpler dataset for the UI (maybe just 8am to 6pm for the bar chart?)
        // UI expects an array of heights. Let's send 24h for flexibility or specific range.
        // The UI mock used about 8 bars. Let's send working hours 8-17 (9 hours)

        const workingHours = normalized.slice(8, 18);
        res.json(workingHours);

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch peak hours', error: error.message });
    }
};

module.exports = {
    getQueueAnalytics,
    getServicePerformance,
    getPeakHours
};
