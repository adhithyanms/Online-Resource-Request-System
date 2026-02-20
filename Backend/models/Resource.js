const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    createdBy: {
        type: String, // userId
        required: true
    }
}, { timestamps: true });



// ggg
module.exports = mongoose.model('Resource', resourceSchema, 'resources');
