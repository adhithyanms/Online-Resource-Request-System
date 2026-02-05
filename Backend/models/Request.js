const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    resourceId: {
        type: String,
        required: true
    },
    quantityRequested: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    reviewedBy: {
        type: String
    },
    reviewedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema, 'requests');
