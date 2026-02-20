const express = require('express');
const cors = require('cors');
const path = require('path');

const { browserManager, tabManager } = require('./managers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/browser', require('./routes/browser'));
app.use('/api/tabs', require('./routes/tabs'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  process.title = "BTW-Browser-API";
  console.log(`BTW (Browse The Web) - API Server running on http://localhost:${PORT}`);
});

module.exports = { app, browserManager, tabManager };
