# WebSocket Session Management - Implementation

## Overview
WebSocket connections are now uniquely identified with session IDs, enabling AI agents to track and control multiple browser instances simultaneously.

## Session ID Format

**Format:** `ext_xxxxxxxxxxxx`

**Example:** `ext_3ee25211a0e8`

**Characteristics:**
- **Length:** 16 characters
- **Prefix:** `ext_` (identifies extension connections)
- **Suffix:** 12 characters from UUID (unique identifier)
- **Type:** Only alphanumeric characters
- **Case:** Lowercase hexadecimal

**Benefits for AI:**
- Short and easy to reference
- Unique across all connections
- Parseable (identifiable by prefix)
- No special characters
- Consistent format
- ASCII only (no encoding issues)

## API Endpoints

### 1. List All Sessions
```http
GET /api/websocket/sessions
```

**Response:**
```json
{
  "count": 2,
  "sessions": [
    {
      "sessionId": "ext_3ee25211a0e8",
      "connectedAt": "2026-02-24T19:22:16.015Z",
      "lastSeen": "2026-02-24T19:22:16.015Z",
      "userAgent": "Mozilla/5.0...",
      "ip": "::1"
    }
  ]
}
```

**Use Case:** AI lists all available browser instances to pick one for control.

---

### 2. Get Specific Session
```http
GET /api/websocket/sessions/:sessionId
```

**Response:**
```json
{
  "sessionId": "ext_3ee25211a0e8",
  "connectedAt": "2026-02-24T19:22:16.015Z",
  "lastSeen": "2026-02-24T19:22:16.015Z",
  "userAgent": "Mozilla/5.0..."
}
```

**Use Case:** AI gets details about a specific browser instance before controlling it.

---

### 3. Send Message to Session
```http
POST /api/websocket/sessions/:sessionId/message
```

**Request Body:**
```json
{
  "type": "navigate",
  "data": { "url": "https://example.com" }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_3ee25211a0e8",
  "message": "Message sent successfully",
  "timestamp": 1771960941234
}
```

**Use Case:** AI sends commands to a specific browser instance.

---

### 4. Close Session
```http
DELETE /api/websocket/sessions/:sessionId
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_3ee25211a0e8",
  "message": "Session closed successfully"
}
```

**Use Case:** AI requests disconnection of a specific browser instance.

## Chrome Extension Changes

### Session ID Storage

The extension now:
1. Receives session ID upon connection
2. Stores session ID in chrome.storage
3. Displays session ID in popup UI

### Background Service (background.js)

```javascript
this.sessionId = null; // Stores session ID

// On connect, server sends:
{
  "type": "connected",
  "sessionId": "ext_xxxxxxxxxxxx",
  "message": "WebSocket connection established successfully"
}

// Handles session ID in handleMessage()
if (message.type === 'connected' && message.sessionId) {
  this.sessionId = message.sessionId;
  this.log(`Session ID assigned: ${this.sessionId}`, 'success');
  this.saveState();
}
```

### Popup UI (popup.html)

Added Session ID field to Connection Info:
```
Session ID: ext_3ee25211a0e8
```

## Server Implementation

### Session Tracking

Sessions are tracked in a Map:

```javascript
const wssSessions = new Map();

// On connection
const sessionId = generateSessionId();
const session = {
  sessionId,
  connectedAt: new Date().toISOString(),
  lastSeen: connectedAt,
  userAgent: req.headers['user-agent'],
  ip: req.socket.remoteAddress,
  ws
};

wssSessions.set(sessionId, session);
ws.sessionId = sessionId;
```

### Session ID Generation

```javascript
function generateSessionId() {
  const uuid = uuidv4().replace(/-/g, '');
  return `ext_${uuid.substring(0, 12)}`;
}
```

### Session Cleanup

Sessions are automatically removed when connection closes:

```javascript
ws.on('close', () => {
  console.log(`[WS] Connection closed: ${session.sessionId}`);
  wssSessions.delete(session.sessionId);
});
```

## Use Cases for AI

### Use Case 1: Multi-Instance Control

```javascript
// 1. List all available browser instances
const response = await fetch('http://localhost:5409/api/websocket/sessions');
const data = await response.json();

// 2. AI picks the most recently connected session
const targetSession = data.sessions.sort((a, b) => 
  new Date(b.connectedAt) - new Date(a.connectedAt)
)[0];

// 3. Send command to selected instance
await fetch(`/api/websocket/sessions/${targetSession.sessionId}/message`, {
  method: 'POST',
  body: JSON.stringify({
    type: 'navigate',
    data: { url: 'https://example.com' }
  })
});
```

### Use Case 2: Parallel Task Execution

```javascript
// Get all sessions
const response = await fetch('http://localhost:5409/api/websocket/sessions');
const data = await response.json();

// Assign tasks to different instances
const tasks = ['site1.com', 'site2.com', 'site3.com'];

data.sessions.forEach((session, index) => {
  if (index < tasks.length) {
    fetch(`/api/websocket/sessions/${session.sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'navigate',
        data: { url: `https://${tasks[index]}` }
      })
    });
  }
});
```

### Use Case 3: Health Monitoring

```javascript
// Check number of active instances
const response = await fetch('http://localhost:5409/api/websocket/sessions');
const data = await response.json();

console.log(`Active browser instances: ${data.count}`);

if (data.count === 0) {
  console.log('No browsers connected! Waiting...');
} else {
  console.log('Available session IDs:', 
    data.sessions.map(s => s.sessionId).join(', ')
  );
}
```

## Testing Examples

### Test 1: Connect Multiple Browsers

```bash
# Start multiple Chrome instances with extension
# Each will get a unique session ID

# List sessions
curl http://localhost:5409/api/websocket/sessions

# Response:
# {
#   "count": 3,
#   "sessions": [
#     { "sessionId": "ext_3ee25211a0e8", ... },
#     { "sessionId": "ext_2d4ba56d7ecf", ... },
#     { "sessionId": "ext_9127c1caeed2", ... }
#   ]
# }
```

### Test 2: Send Command

```bash
curl -X POST http://localhost:5409/api/websocket/sessions/ext_3ee25211a0e8/message \
  -H "Content-Type: application/json" \
  -d '{"type":"ping","data":{}}'

# Response:
# {
#   "success": true,
#   "sessionId": "ext_3ee25211a0e8",
#   "message": "Message sent successfully"
# }
```

### Test 3: Close Specific Session

```bash
curl -X DELETE http://localhost:5409/api/websocket/sessions/ext_3ee25211a0e8

# Response:
# {
#   "success": true,
#   "sessionId": "ext_3ee25211a0e8",
#   "message": "Session closed successfully"
# }
```

## Error Handling

### Session Not Found (404)
```json
{
  "error": "Session not found"
}
```

### Session Not Connected (503)
```json
{
  "error": "Session is not connected"
}
```

### Invalid JSON (400)
```json
{
  "error": "Invalid message format"
}
```

## Security Considerations

### Current Implementation
- Session IDs are public and accessible via API
- Anyone with session ID can send messages to that instance
- Session IDs are UUID-based (not guessable)

### Recommendations for Production
- Implement authentication/authorization
- Add session owner identification
- Implement message signing/validation
- Rate limiting per session
- Session timeout/disconnect after inactivity

## Performance

### Scalability
- Sessions stored in memory Map
- O(1) lookup by session ID
- Automatic cleanup on disconnect
- Minimal memory footprint per session

### Connection Tracking
- `connectedAt` timestamp for diagnostics
- `lastSeen` timestamp for activity monitoring
- User agent and IP for session identification

## Limitations

1. Sessions are not persistent - lost on server restart
2. No session history or message queue
3. No built-in authentication

## Future Enhancements

### Planned Features
- Session persistence ( survive restarts)
- Message history and replay
- Session grouping/organization
- Session heartbeat monitoring
- Session statistics (messages sent/received)
- Session-specific configuration

## Summary

✅ **Session ID Format**: Short (16 chars), unique, AI-friendly
✅ **API Endpoints**: List, Get, Send Message, Delete
✅ **Extension Support**: Receives, stores, displays session IDs
✅ **Multi-Instance**: Supports unlimited concurrent connections
✅ **AI Integration**: Easy for AI to track and control instances

Session IDs are perfect for AI use:
- Short enough to work with easily
- Unique enough to identify instances
- Parseable enough to validate format
- Consistent enough for predictable behavior
