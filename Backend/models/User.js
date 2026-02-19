const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: false,
        default: null
    },
    fullName: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isAllowed: {
        type: Boolean,
        default: false
    },
    // Profile fields managed by admin
    phone: {
        type: String,
        default: '',
        validate: {
            validator: function (v) {
                return v === '' || /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    address: {
        type: String,
        default: ''
    },
    profilePhotoUrl: {
        type: String,
        default: ''
    },
    aadhaarPhotoUrl: {
        type: String,
        default: ''
    },
    panCardPhotoUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'profiles');
