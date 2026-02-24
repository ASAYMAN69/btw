# WebSocket Session Management - Complete Guide

## 🎯 Overview

Every WebSocket connection from the Chrome extension is now assigned a **unique session ID**, enabling AI agents to track and control multiple browser instances simultaneously.

---

## 🆔 Session ID Format

```
ext_3ee25211a0e8
```

### Format Breakdown
- **Prefix**: `ext_` (identifies extension connections)
- **Length**: 16 characters total
- **Uniqueness**: Generated from UUID (first 12 hex chars)
- **Type**: Alphanumeric (lowercase hex)
- **ASCII Only**: No special characters or encoding issues

### Why This Format for AI?

| Property | Value | AI Benefit |
|----------|-------|------------|
| **Short** | 16 chars | Easy to reference in prompts |
| **Unique** | UUID-based | No collisions |
| **Parseable** | Starts with `ext_` | Validatable format |
| **Simple** | Hex chars | No special encoding |
| **Consistent** | Always same format | Predictable patterns |

---

## 📡 New API Endpoints

### 1. List All Sessions
```
GET /api/websocket/sessions
```

**Response:**
```json
{
  "count": 3,
  "sessions": [
    {
      "sessionId": "ext_3ee25211a0e8",
      "connectedAt": "2026-02-24T19:22:16.015Z",
      "lastSeen": "2026-02-24T19:22:16.015Z",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "ip": "::1"
    },
    {
      "sessionId": "ext_2d4ba56d7ecf",
      "connectedAt": "2026-02-24T19:22:20.123Z",
      "lastSeen": "2026-02-24T19:22:20.123Z",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "ip": "::1"
    },
    {
      "sessionId": "ext_9127c1caeed2",
      "connectedAt": "2026-02-24T19:22:25.456Z",
      "lastSeen": "2026-02-24T19:22:25.456Z",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "ip": "::1"
    }
  ]
}
```

**AI Use Case:**
> "I need to know which browser instances are available so I can distribute tasks among them."

---

### 2. Get Specific Session
```
GET /api/websocket/sessions/:sessionId
```

**Response:**
```json
{
  "sessionId": "ext_3ee25211a0e8",
  "connectedAt": "2026-02-24T19:22:16.015Z",
  "lastSeen": "2026-02-24T19:22:16.015Z",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

**AI Use Case:**
> "I want to verify the browser I'm about to control is the right one."

---

### 3. Send Message to Session
```
POST /api/websocket/sessions/:sessionId/message
```

**Request Body:**
```json
{
  "type": "navigate",
  "data": {
    "url": "https://example.com"
  }
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

**AI Use Case:**
> "I found the right browser session ID, now I'll send it a command to navigate to a specific URL."

---

### 4. Close Session
```
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

**AI Use Case:**
> "I'm done with this browser instance, I'll disconnect it now."

---

## 🤖 AI Workflow Example

### Scenario: Multi-Browser Web Scraping

```python
# AI Agent workflow

async def scrape_multiple_sites(sites):
    # 1. List all available browser instances
    sessions = await get_sessions()
    print(f"Found {len(sessions.sessions)} browsers available")
    
    # 2. Assign sites to browsers
    tasks = []
    for i, site in enumerate(sites):
        if i >= len(sessions.sessions):
            break
            
        session_id = sessions.sessions[i].sessionId
        
        # 3. Send navigation command to specific browser
        task = send_message(session_id, {
            "type": "navigate",
            "data": {"url": f"https://{site}"}
        })
        tasks.append(task)
    
    # 4. Wait for all browsers to navigate
    await asyncio.gather(*tasks)
    
    # 5. Extract data from each browser
    results = []
    for i in range(min(len(sites), len(sessions.sessions))):
        session_id = sessions.sessions[i].sessionId
        data = await extract_from_browser(session_id)
        results.append(data)
    
    return results
```

---

## 🎨 Chrome Extension Updates

### New Popup UI

The extension popup now displays your Session ID:

```
┌─────────────────────────────────┐
│  BTW Browser Control            │
│  ● Connected                    │
├─────────────────────────────────┤
│  Connection Info:               │
│    Status: Connected            │
│    Session ID: ext_3ee25211a0e8  ← NEW!
│    Retry Count: 0/1             │
│    Last Connected: Feb 24, 2026 │
├─────────────────────────────────┤
│  [Reconnect] [Disconnect]       │
├─────────────────────────────────┤
│  Logs:                          │
│  [22:22:16] Connected           │
│  [22:22:16] Session ID: ext_3ee25211a0e8 ← NEW!
└─────────────────────────────────┘
```

### Finding Your Session ID

1. Click the BTW extension icon in Chrome
2. Look at "Connection Info" section
3. Your Session ID is displayed (e.g., `ext_3ee25211a0e8`)
4. Copy this Session ID for use with AI agents

---

## 🧪 Testing

### Quick Tests

```bash
# 1. List all sessions
curl http://localhost:5409/api/websocket/sessions

# 2. Get specific session
curl http://localhost:5409/api/websocket/sessions/ext_3ee25211a0e8

# 3. Send message
curl -X POST http://localhost:5409/api/websocket/sessions/ext_3ee25211a0e8/message \
  -H "Content-Type: application/json" \
  -d '{"type":"ping","data":{}}'

# 4. Close session
curl -X DELETE http://localhost:5409/api/websocket/sessions/ext_3ee25211a0e8
```

### Multi-Instance Test

```bash
# 1. Open multiple Chrome instances with extension
# 2. Each gets a unique session ID

# 3. List all sessions
curl -s http://localhost:5409/api/websocket/sessions | jq

# Output:
# {
#   "count": 3,
#   "sessions": [
#     { "sessionId": "ext_3ee25211a0e8", ... },
#     { "sessionId": "ext_2d4ba56d7ecf", ... },
#     { "sessionId": "ext_9127c1caeed2", ... }
#   ]
# }

# 4. Send different commands to each
for session_id in ext_3ee25211a0e8 ext_2d4ba56d7ecf ext_9127c1caeed2; do
  curl -X POST http://localhost:5409/api/websocket/sessions/$session_id/message \
    -H "Content-Type: application/json" \
    -d '{"type":"ping","data":{}}'
done
```

---

## 🔧 Implementation Details

### Server-Side (app.js)

```javascript
const wssSessions = new Map();

function generateSessionId() {
  const uuid = uuidv4().replace(/-/g, '');
  return `ext_${uuid.substring(0, 12)}`;
}

wss.on('connection', (ws, req) => {
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

  ws.send(JSON.stringify({
    type: 'connected',
    sessionId: session.sessionId,
    message: 'WebSocket connection established'
  }));

  ws.on('close', () => {
    wssSessions.delete(session.sessionId);
  });
});
```

### Extension-Side (background.js)

```javascript
this.sessionId = null;

handleMessage(data) {
  const message = JSON.parse(data);

  if (message.type === 'connected' && message.sessionId) {
    this.sessionId = message.sessionId;
    console.log(`Session ID: ${this.sessionId}`);
    this.saveState();
  }
}

async saveState() {
  await chrome.storage.sync.set({
    sessionId: this.sessionId,
    connectionStatus: this.getConnectionStatus(),
    // ... other state
  });
}
```

---

## 📦 What's Included

### New API Routes
- ✅ GET /api/websocket/sessions
- ✅ GET /api/websocket/sessions/:sessionId
- ✅ POST /api/websocket/sessions/:sessionId/message
- ✅ DELETE /api/websocket/sessions/:sessionId

### Extension Updates
- ✅ Session ID display in popup
- ✅ Session ID storage
- ✅ Session ID in logs
- ✅ README documentation

### Documentation
- ✅ SESSION_MANAGEMENT.md - Technical details
- ✅ SESSION_IDS.md - User guide
- ✅ SESSION_SUMMARY.md - Quick reference
- ✅ This guide - Complete overview

---

## 🎓 Common Use Cases

### 1. Multi-Tab Web Scraping
AI uses different browser instances to scrape different sites simultaneously.

### 2. Parallel Testing
Run tests on multiple browsers (different versions, OS, configs) in parallel.

### 3. Task Queue
Distribute tasks from AI to available browser instances efficiently.

### 4. Session Routing
Route commands from AI to specific browser instances based on context.

### 5. Health Monitoring
Track which browser instances are active and their connection status.

---

## 🔍 Error Handling

| Error Code | Condition | Response |
|------------|-----------|----------|
| 404 | Session not found | `{"error": "Session not found"}` |
| 503 | Session not connected | `{"error": "Session is not connected"}` |
| 400 | Invalid JSON | `{"error": "Invalid message format"}` |

---

## 🚀 Quick Start

### 1. Start Server
```bash
cd /mnt/ee/aprojects/btw
npm run start:old
```

### 2. Connect Extension
Open Chrome with BTW extension installed

### 3. Find Session ID
Click extension icon → Look at "Connection Info"

### 4. Use Session ID
```bash
# Send command to your browser
curl -X POST http://localhost:5409/api/websocket/sessions/YOUR_SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"type":"ping","data":{}}'
```

---

## ✅ Benefits

**For AI:**
- ✅ Short, predictable session IDs
- ✅ Easy to reference in prompts
- ✅ Unique identification per instance
- ✅ Parallel task execution
- ✅ Selective instance control

**For Users:**
- ✅ See your session ID in extension
- ✅ Know which browser AI is controlling
- ✅ Support for multiple browsers
- ✅ Session persistence

**For Developers:**
- ✅ Simple REST API
- ✅ Memory-efficient storage
- ✅ Automatic cleanup
- ✅ Scalable architecture

---

## 📋 Checklist

- [x] Session ID generation (ext_xxxxxxxxxxxx)
- [x] Session tracking (Map storage)
- [x] List sessions endpoint
- [x] Get session endpoint
- [x] Send message endpoint
- [x] Close session endpoint
- [x] Extension session ID handling
- [x] Popup session ID display
- [x] Documentation complete
- [x] Testing successful

---

## 🎯 Summary

WebSocket sessions now have unique 16-character session IDs that are:
- **Short** enough for easy AI reference
- **Unique** enough for multi-instance support
- **Parseable** enough for validation
- **Persistent** while connected
- **Available** via REST API

**Session ID Format:** `ext_3ee25211a0e8`

**Status:** ✅ Production Ready

---

**Need more info?**
- See `SESSION_MANAGEMENT.md` for technical details
- See `SESSION_IDS.md` for user guide
- See `SESSION_SUMMARY.md` for quick reference
