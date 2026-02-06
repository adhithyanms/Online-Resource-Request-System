const Resource = require('../models/Resource');

exports.getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        const mappedResources = resources.map(resource => ({
            ...resource.toObject(),
            id: resource._id.toString(),
            quantity_available: resource.quantityAvailable
        }));
        res.status(200).json(mappedResources);
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
        const mappedResource = {
            ...resource.toObject(),
            id: resource._id.toString(),
            quantity_available: resource.quantityAvailable
        };
        res.status(200).json(mappedResource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createResource = async (req, res) => {
    try {
        // Admin authorization check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin role required' });
        }

        console.log('Creating resource:', req.body);
        const { name, description, category, quantity_available } = req.body;
        const resource = new Resource({
            name,
            description,
            category,
            quantityAvailable: quantity_available,
            createdBy: req.user.id
        });
        await resource.save();

        const mappedResource = {
            ...resource.toObject(),
            id: resource._id.toString(),
            quantity_available: resource.quantityAvailable
        };
        res.status(201).json(mappedResource);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateResource = async (req, res) => {
    try {
        // Admin authorization check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin role required' });
        }

        console.log('Updating resource:', req.params.id, req.body);
        const { name, description, category, quantity_available } = req.body;
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                category,
                quantityAvailable: quantity_available
            },
            { new: true }
        );
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const mappedResource = {
            ...resource.toObject(),
            id: resource._id.toString(),
            quantity_available: resource.quantityAvailable
        };
        res.status(200).json(mappedResource);
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        // Admin authorization check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin role required' });
        }

        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
