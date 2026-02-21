const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // asd
    items: [{
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalCost: {
        type: Number,
        default: 0
    },
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
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
