const Request = require('../models/Request');

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { resourceId, quantityRequested, purpose } = req.body;
        const request = new Request({
            userId: req.user.id,
            resourceId,
            quantityRequested,
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
        const { status, rejectionReason } = req.body;
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            {
                status,
                rejectionReason,
                reviewedBy: req.user.id,
                reviewedAt: new Date()
            },
            { new: true }
        );
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
