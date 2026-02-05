const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantityAvailable: {
        type: Number,
        required: true
    },
    createdBy: {
        type: String, // userId
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema, 'resources');
