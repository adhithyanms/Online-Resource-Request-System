const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { verifyToken } = require('../middleware/auth');

// User: get my assigned sites
router.get('/my-sites', verifyToken, siteController.getMySites);

// Admin: get all sites
router.get('/', verifyToken, siteController.getAllSites);

// Admin: create site
router.post('/', verifyToken, siteController.createSite);

// Admin: update site
router.put('/:id', verifyToken, siteController.updateSite);

// Admin: delete site
router.delete('/:id', verifyToken, siteController.deleteSite);

module.exports = router;
