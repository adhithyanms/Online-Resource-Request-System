const Resource = require('../models/Resource');

exports.getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.status(200).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createResource = async (req, res) => {
    try {
        console.log('Creating resource:', req.body);
        const { name, description, category, quantityAvailable } = req.body;
        const resource = new Resource({
            name,
            description,
            category,
            quantityAvailable,
            createdBy: req.user.id
        });
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateResource = async (req, res) => {
    try {
        console.log('Updating resource:', req.params.id, req.body);
        const { name, description, category, quantityAvailable } = req.body;
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { name, description, category, quantityAvailable },
            { new: true }
        );
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.status(200).json(resource);
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
