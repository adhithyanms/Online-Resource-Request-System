require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');
const siteRoutes = require('./routes/siteRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const mongoURI = process.env.MONGODB_URI;

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = !!db.connections[0].readyState;
    console.log(`Connected to MongoDB : ${mongoose.connection.name}`);
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Serve uploaded files (profile photos, documents)
const { uploadsDir } = require('./middleware/uploadMiddleware');
app.use('/uploads', express.static(uploadsDir));

app.use('/auth', authRoutes);
app.use('/resources', resourceRoutes);
app.use('/requests', requestRoutes);
app.use('/users', userRoutes);
app.use('/sites', siteRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send("we are live");
});




if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;
