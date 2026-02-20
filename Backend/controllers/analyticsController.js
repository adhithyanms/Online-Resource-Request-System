const Request = require('../models/Request');
const Resource = require('../models/Resource');
const Site = require('../models/Site');
const mongoose = require('mongoose');

exports.getAnalyticsSummary = async (req, res) => {
    try {
        const { startDate, endDate, siteId, userId } = req.query;

        // Build Match Object for Filtering
        const match = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                match.createdAt.$lte = end;
            }
        }
        if (siteId) match.siteId = new mongoose.Types.ObjectId(siteId);
        if (userId) match.userId = new mongoose.Types.ObjectId(userId);

        // 1. Status Distribution
        const statusStats = await Request.aggregate([
            { $match: match },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 2. Top Resources (by count and volume)
        const resourceStats = await Request.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.resourceId',
                    requestCount: { $sum: 1 },
                    totalQuantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { requestCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'resources',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'resourceInfo'
                }
            },
            { $unwind: '$resourceInfo' },
            {
                $project: {
                    name: '$resourceInfo.name',
                    requestCount: 1,
                    totalQuantity: 1
                }
            }
        ]);

        // 3. Overall KPI Counts
        const totalRequests = await Request.countDocuments(match);
        const pendingRequests = await Request.countDocuments({ ...match, status: 'pending' });
        const approvedRequests = await Request.countDocuments({ ...match, status: 'approved' });
        const totalSites = await Site.countDocuments();

        res.status(200).json({
            summary: {
                totalRequests,
                pendingRequests,
                approvedRequests,
                totalSites
            },
            statusStats: statusStats.map(s => ({ name: s._id, value: s.count })),
            resourceStats
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAnalyticsTrends = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const trends = await Request.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    stats: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for Area Chart
        const formattedTrends = trends.map(t => {
            const row = { date: t._id };
            t.stats.forEach(s => {
                row[s.status] = s.count;
            });
            return row;
        });

        res.status(200).json(formattedTrends);
    } catch (error) {
        console.error('Trends Error:', error);
        res.status(500).json({ message: error.message });
    }
};
