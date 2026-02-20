const Request = require('../models/Request');
const Resource = require('../models/Resource');

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('userId', 'fullName email')
            .populate('items.resourceId')
            .populate('siteId', 'siteName siteAddress')
            .sort({ createdAt: -1 });

        // Map to ensure frontend gets 'id' and correct structure
        const mappedRequests = requests.map(item => ({
            ...item.toObject(),
            id: item._id.toString(),
            user: item.userId,
            site: item.siteId
        }));

        res.status(200).json(mappedRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ userId: req.user.id })
            .populate('items.resourceId')
            .populate('siteId', 'siteName')
            .sort({ createdAt: -1 });

        const mappedRequests = requests.map(item => ({
            ...item.toObject(),
            id: item._id.toString(),
            site: item.siteId
        }));

        res.status(200).json(mappedRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { items, siteId, purpose } = req.body;

        // Calculate total cost (fetched from DB to ensure accuracy)
        let totalCost = 0;
        for (const item of items) {
            const resource = await Resource.findById(item.resourceId);
            if (resource) {
                totalCost += (resource.price || 0) * item.quantity;
            }
        }

        const request = new Request({
            userId: req.user.id,
            items,
            siteId,
            purpose,
            totalCost,
            status: 'pending'
        });
        await request.save();
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        // Admin authorization check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin role required' });
        }

        const { status, rejectionReason } = req.body;

        // Find the current request to get resource info
        const currentRequest = await Request.findById(req.params.id);
        if (!currentRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Logic for approving a request: Cost calculation and status update (no stock deduction)
        if (status === 'approved' && currentRequest.status !== 'approved') {
            // No stock deduction required as per latest user request
        }

        const request = await Request.findByIdAndUpdate(
            req.params.id,
            {
                status,
                rejectionReason,
                reviewedBy: req.user.id,
                reviewedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'fullName email').populate('items.resourceId').populate('siteId', 'siteName');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Map to include id and match expected structure
        const mappedRequest = {
            ...request.toObject(),
            id: request._id.toString(),
            user: request.userId,
            site: request.siteId
        };

        res.status(200).json(mappedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
