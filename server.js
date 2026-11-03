const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sample API Routes
app.get('/api/weather', (req, res) => {
  res.json({
    location: 'Rural Test Plot A',
    temperature: 28,
    humidity: 75,
    condition: 'Moderate Blight Risk',
    forecast: 'Rain expected in 48 hours'
  });
});

app.get('/api/plots', (req, res) => {
  res.json([
    { id: 1, name: 'Plot A', crop: 'Maize', stage: 'Vegetative', health: 'Good' },
    { id: 2, name: 'Plot B', crop: 'Beans', stage: 'Flowering', health: 'Optimal' }
  ]);
});

app.post('/api/expenses', (req, res) => {
  const { plotId, category, amount, date } = req.body;
  res.status(201).json({ success: true, message: 'Expense logged successfully', data: { plotId, category, amount, date } });
});

app.listen(PORT, () => {
  console.log(`AgriPulse server running on port ${PORT}`);
});
