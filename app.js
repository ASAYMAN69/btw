const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
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
app.use('/api/usercontrolled', require('./routes/usercontrolled'));

app.post('/api/browser/:sessionId/tabs/create', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.ws.readyState !== WebSocket.OPEN) {
    return res.status(503).json({ error: 'Session is not connected' });
  }

  const { url = 'chrome://newtab' } = req.body;
  const requestId = uuidv4().substring(0, 8);
  
  const pendingRequest = {
    requestId,
    sessionId: session.sessionId,
    timestamp: Date.now()
  };

  wssPendingRequests.set(requestId, pendingRequest);

  const message = {
    type: 'tabs.createTab',
    requestId,
    sessionId: session.sessionId,
    data: { url },
    from: 'server',
    timestamp: Date.now()
  };

  session.ws.send(JSON.stringify(message));

  res.json({
    success: true,
    sessionId: session.sessionId,
    requestId,
    message: 'Create tab command sent to browser',
    timestamp: Date.now()
  });
});

app.get('/api/browser/:sessionId/tabs', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.ws.readyState !== WebSocket.OPEN) {
    return res.status(503).json({ error: 'Session is not connected' });
  }

  const requestId = uuidv4().substring(0, 8);
  
  const message = {
    type: 'tabs.query',
    requestId,
    sessionId: session.sessionId,
    data: {},
    from: 'server',
    timestamp: Date.now()
  };

  session.ws.send(JSON.stringify(message));

  res.json({
    success: true,
    sessionId: session.sessionId,
    requestId,
    message: 'Query tabs command sent to browser',
    timestamp: Date.now()
  });
});

app.delete('/api/browser/:sessionId/tabs/:tabId', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.ws.readyState !== WebSocket.OPEN) {
    return res.status(503).json({ error: 'Session is not connected' });
  }

  const { tabId } = req.params;
  const requestId = uuidv4().substring(0, 8);
  
  const message = {
    type: 'tabs.closeTab',
    requestId,
    sessionId: session.sessionId,
    data: { tabId },
    from: 'server',
    timestamp: Date.now()
  };

  session.ws.send(JSON.stringify(message));

  res.json({
    success: true,
    sessionId: session.sessionId,
    requestId,
    message: 'Close tab command sent to browser',
    timestamp: Date.now()
  });
});

app.get('/api/browser/:sessionId/tabs', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.ws.readyState !== WebSocket.OPEN) {
    return res.status(503).json({ error: 'Session is not connected' });
  }

  const requestId = uuidv4().substring(0, 8);
  
  const message = {
    type: 'tabs.query',
    requestId,
    sessionId: session.sessionId,
    data: {},
    from: 'server',
    timestamp: Date.now()
  };

  session.ws.send(JSON.stringify(message));

  res.json({
    success: true,
    sessionId: session.sessionId,
    requestId,
    message: 'Query tabs command sent to browser',
    timestamp: Date.now()
  });
  });

app.patch('/api/browser/:sessionId/tabs/:tabId', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.ws.readyState !== WebSocket.OPEN) {
    return res.status(503).json({ error: 'Session is not connected' });
  }

  const { tabId } = req.params;
  const { url, active, pinned, muted, highlighted } = req.body;
  const requestId = uuidv4().substring(0, 8);
  
  const message = {
    type: 'tabs.update',
    requestId,
    sessionId: session.sessionId,
    data: { tabId, url, active, pinned, muted, highlighted },
    from: 'server',
    timestamp: Date.now()
  };

  session.ws.send(JSON.stringify(message));

  res.json({
    success: true,
    sessionId: session.sessionId,
    requestId,
    message: 'Update tab command sent to browser',
    timestamp: Date.now()
  });
});

app.get('/api/websocket/sessions', (req, res) => {
  const sessions = Array.from(wssSessions.values()).map(session => ({
    sessionId: session.sessionId,
    connectedAt: session.connectedAt,
    lastSeen: session.lastSeen,
    userAgent: session.userAgent || 'Unknown',
    ip: req.ip
  }));

  res.json({
    count: sessions.length,
    sessions: sessions
  });
});

app.get('/api/websocket/sessions/:sessionId', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId: session.sessionId,
    connectedAt: session.connectedAt,
    lastSeen: session.lastSeen,
    userAgent: session.userAgent || 'Unknown'
  });
});

app.post('/api/websocket/sessions/:sessionId/message', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.ws.readyState !== WebSocket.OPEN) {
    return res.status(503).json({ error: 'Session is not connected' });
  }

  try {
    const message = {
      type: req.body.type || 'message',
      data: req.body.data,
      from: 'server',
      timestamp: Date.now()
    };

    session.ws.send(JSON.stringify(message));

    res.json({
      success: true,
      sessionId: session.sessionId,
      message: 'Message sent successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/websocket/sessions/:sessionId', (req, res) => {
  const session = wssSessions.get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    session.ws.close();
    wssSessions.delete(session.sessionId);

    res.json({
      success: true,
      sessionId: session.sessionId,
      message: 'Session closed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: '/ws' });

const wssSessions = new Map();
const wssPendingRequests = new Map();

function generateSessionId() {
  const uuid = uuidv4().replace(/-/g, '');
  return `ext_${uuid.substring(0, 12)}`;
}

wss.on('connection', (ws, req) => {
  const sessionId = generateSessionId();
  const connectedAt = new Date().toISOString();
  
  const session = {
    sessionId,
    connectedAt,
    lastSeen: connectedAt,
    userAgent: req.headers['user-agent'] || 'Unknown',
    ip: req.socket.remoteAddress || 'Unknown',
    ws
  };

  ws.sessionId = sessionId;
  wssSessions.set(sessionId, session);

  console.log(`[WS] New connection: ${sessionId} from ${session.ip}`);

  ws.on('message', (message) => {
    const session = wssSessions.get(ws.sessionId);
    if (session) {
      session.lastSeen = new Date().toISOString();
    }

    console.log(`[WS] [${sessionId}] Received message:`, message.toString());
    
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          sessionId,
          timestamp: Date.now()
        }));
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          sessionId,
          timestamp: Date.now()
        }));
      } else if (data.requestId && wssPendingRequests.has(data.requestId)) {
        const pendingRequest = wssPendingRequests.get(data.requestId);
        pendingRequest.response = {
          success: data.success || true,
          result: data.result,
          error: data.error,
          timestamp: Date.now()
        };
        pendingRequest.completed = true;
        console.log(`[WS] [${sessionId}] Request ${data.requestId} completed`);
      } else {
        ws.send(JSON.stringify({
          type: 'echo',
          sessionId,
          data: data,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        sessionId,
        message: 'Invalid JSON',
        timestamp: Date.now()
      }));
    }
  });

  ws.on('close', () => {
    console.log(`[WS] Connection closed: ${session.sessionId}`);
    wssSessions.delete(session.sessionId);
  });

  ws.on('error', (error) => {
    console.error(`[WS] [${session.sessionId}] Error:`, error.message);
    wssSessions.delete(session.sessionId);
  });

  ws.send(JSON.stringify({
    type: 'connected',
    sessionId: session.sessionId,
    message: 'WebSocket connection established successfully',
    timestamp: Date.now()
  }));
});

server.listen(PORT, async () => {
  process.title = "BTW-Browser-API";
  console.log(`BTW (Browse The Web) - API Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);

  try {
    await browserManager.ensureBrowser();
    console.log('Browser auto-launched and ready');
  } catch (error) {
    console.error('Failed to auto-launch browser:', error.message);
  }
});

module.exports = { app, server, wss, browserManager, tabManager };
