const Request = require('../models/Request');
const Resource = require('../models/Resource');

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('userId', 'fullName email')
            .populate('resourceId')
            .sort({ createdAt: -1 });

        // Map to ensure frontend gets 'id' and correct structure
        const mappedRequests = requests.map(item => ({
            ...item.toObject(),
            id: item._id.toString(),
            user: item.userId,
            resource: item.resourceId,
            quantity_requested: item.quantity_requested
        }));

        res.status(200).json(mappedRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ userId: req.user.id })
            .populate('resourceId')
            .sort({ createdAt: -1 });

        const mappedRequests = requests.map(item => ({
            ...item.toObject(),
            id: item._id.toString(),
            resource: item.resourceId,
            quantity_requested: item.quantity_requested
        }));

        res.status(200).json(mappedRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { resourceId, quantity_requested, purpose } = req.body;
        const request = new Request({
            userId: req.user.id,
            resourceId,
            quantity_requested,
            purpose,
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

        // Logic for approving a request: Reduce quantity
        if (status === 'approved' && currentRequest.status !== 'approved') {
            const resource = await Resource.findById(currentRequest.resourceId);
            if (!resource) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            if (resource.quantityAvailable < currentRequest.quantity_requested) {
                return res.status(400).json({ message: 'Insufficient quantity available in stock' });
            }

            // Reduce quantity
            resource.quantityAvailable -= currentRequest.quantity_requested;
            await resource.save();
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
        ).populate('userId', 'fullName email').populate('resourceId');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Map to include id and match expected structure
        const mappedRequest = {
            ...request.toObject(),
            id: request._id.toString(),
            user: request.userId,
            resource: request.resourceId,
            quantity_requested: request.quantity_requested
        };

        res.status(200).json(mappedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
