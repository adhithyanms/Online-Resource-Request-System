/**
 * Migration: mark all existing users as isAllowed = true
 * Run once: node Backend/scripts/migrateAllowedUsers.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB:', mongoose.connection.name);

    const result = await User.updateMany(
        { isAllowed: { $ne: true } },
        { $set: { isAllowed: true } }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} user(s).`);
    await mongoose.disconnect();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
