require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({ origin: '*' }));   
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/resources', resourceRoutes);
app.use('/requests', requestRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send("we are live");
});



const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log(`Connected to MongoDB : ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;
