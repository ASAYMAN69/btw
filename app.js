const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { browserManager, tabManager } = require('./managers');

const app = express();

function getValidPort(portFromEnv) {
  const DEFAULT_PORT = 5409;
  if (!portFromEnv || portFromEnv.trim() === '') {
    return DEFAULT_PORT;
  }
  const port = parseInt(portFromEnv, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    return DEFAULT_PORT;
  }
  return port;
}

const PORT = getValidPort(process.env.PORT);

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

app.listen(PORT, async () => {
  process.title = "BTW-Browser-API";
  console.log(`BTW (Browse The Web) - API Server running on http://localhost:${PORT}`);

  try {
    await browserManager.ensureBrowser();
    console.log('Browser auto-launched and ready');
  } catch (error) {
    console.error('Failed to auto-launch browser:', error.message);
  }
});

module.exports = { app, browserManager, tabManager };
