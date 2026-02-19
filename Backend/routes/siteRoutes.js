const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const auth = require('../middleware/auth');

// User: get my assigned sites
router.get('/my-sites', auth, siteController.getMySites);

// Admin: get all sites
router.get('/', auth, siteController.getAllSites);

// Admin: create site
router.post('/', auth, siteController.createSite);

// Admin: update site
router.put('/:id', auth, siteController.updateSite);

// Admin: delete site
router.delete('/:id', auth, siteController.deleteSite);

module.exports = router;
