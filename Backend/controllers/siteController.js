const Site = require('../models/Site');

const SUPER_ADMIN_EMAIL = 'adhithyanshanmugam@gmail.com';
const isAdmin = (req) => req.user?.role === 'admin' || req.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

// GET /sites — admin gets all sites
exports.getAllSites = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const sites = await Site.find()
            .populate('assignedUsers', 'email fullName phone profilePhotoUrl')
            .sort({ createdAt: -1 });
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /sites/my-sites — user gets only their assigned sites
exports.getMySites = async (req, res) => {
    try {
        const sites = await Site.find({ assignedUsers: req.user.id })
            .populate('assignedUsers', 'email fullName phone profilePhotoUrl')
            .sort({ createdAt: -1 });
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /sites — admin creates a site
exports.createSite = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { siteName, siteAddress, contactNumber, assignedUsers } = req.body;
        if (!siteName || !siteAddress || !contactNumber) {
            return res.status(400).json({ message: 'Site name, address, and contact number are required' });
        }
        const site = new Site({
            siteName,
            siteAddress,
            contactNumber,
            assignedUsers: assignedUsers || []
        });
        await site.save();
        const populated = await Site.findById(site._id)
            .populate('assignedUsers', 'email fullName phone profilePhotoUrl');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /sites/:id — admin updates a site
exports.updateSite = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const { siteName, siteAddress, contactNumber, assignedUsers } = req.body;

        const site = await Site.findById(id);
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }

        if (siteName !== undefined) site.siteName = siteName;
        if (siteAddress !== undefined) site.siteAddress = siteAddress;
        if (contactNumber !== undefined) site.contactNumber = contactNumber;
        if (assignedUsers !== undefined) site.assignedUsers = assignedUsers;

        await site.save();
        const populated = await Site.findById(site._id)
            .populate('assignedUsers', 'email fullName phone profilePhotoUrl');
        res.status(200).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /sites/:id — admin deletes a site
exports.deleteSite = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const site = await Site.findById(id);
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }
        await Site.findByIdAndDelete(id);
        res.status(200).json({ message: 'Site deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
