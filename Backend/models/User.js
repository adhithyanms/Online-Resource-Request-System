const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-z]+\.(it|cs|ee|ec|cd|cb|ad|al|fd)(22|23|24|25|26)@bitsathy\.ac\.in$/.test(v) ||
                    v.toLowerCase() === 'adhithyanshanmugam@gmail.com';
            },
            message: props => `${props.value} is not a valid bitsathy email format!`
        }
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'profiles');
