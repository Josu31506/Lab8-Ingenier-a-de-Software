const express = require('express');
const restaurantRoutes = require('./restaurant/restaurant.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Rewards system backend is running',
  });
});

app.use('/api', restaurantRoutes);

module.exports = app;
