# Tabs API - Create Tab Implementation

## ✅ First API Implemented: `tabs.createTab`

The foundational browser API for creating new tabs has been successfully implemented and integrated.

---

## Architecture

```
HTTP Request (AI/Client)
    ↓
POST /api/browser/:sessionId/tabs/create
    ↓
Server Endpoint (app.js)
    ↓
WebSocket Message → Extension
    ↓
Background.handleCreateTab() (background.js)
    ↓
chrome.tabs.create()
    ↓
New Tab Created in Chrome
    ↓
Response via WebSocket
    ↓
Server Stores Response
```

---

## API Endpoint

### Create New Tab

**Endpoint:** `POST /api/browser/:sessionId/tabs/create`

**Request:**
```json
{
  "url": "https://example.com",
  "active": true,
  "pinned": false
}
```

**Parameters:**
- `sessionId` (path) - Unique session ID of the browser instance
- `url` (body, optional) - URL to load (default: `chrome://newtab`)
- `active` (body, optional) - Whether tab should be active (default: `true`)
- `pinned` (body, optional) - Whether tab should be pinned (default: `false`)

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_3ee25211a0e8",
  "requestId": "abc12345",
  "message": "Create tab command sent to browser",
  "timestamp": 1771963467697
}
```

**Extension Response (via WebSocket):**
```json
{
  "type": "tabs.createTab.response",
  "requestId": "abc12345",
  "sessionId": "ext_3ee25211a0e8",
  "success": true,
  "result": {
    "tabId": 123,
    "url": "https://example.com",
    "title": "Example Domain",
    "windowId": 1,
    "index": 2,
    "active": true,
    "status": "complete"
  },
  "timestamp": 1771963467800
}
```

---

## Files Modified

### 1. app.js (Server)
- ✅ Added `wssPendingRequests` Map for tracking requests
- ✅ Added `POST /api/browser/:sessionId/tabs/create` endpoint
- ✅ Enhanced WebSocket message handler to process responses
- ✅ Added request/response tracking with unique IDs

### 2. background.js (Extension)
- ✅ Added `handleCreateTab()` method
- ✅ Added 'tabs.createTab' message handler
- ✅ Calls `chrome.tabs.create()` API
- ✅ Sends response back via WebSocket

### 3. manifest.json (Extension)
- ✅ Added "tabs" permission

---

## Usage Example

### Using curl:

```bash
# 1. Get available sessions
curl http://localhost:5409/api/websocket/sessions

# 2. Create tab (replace SESSION_ID)
curl -X POST http://localhost:5409/api/browser/ext_3ee25211a0e8/tabs/create \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Using JavaScript:

```javascript
// Get sessions
const sessions = await fetch('http://localhost:5409/api/websocket/sessions')
  .then(r => r.json());

// Create tab in first session
const result = await fetch(
  `http://localhost:5409/api/browser/${sessions.sessions[0].sessionId}/tabs/create`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  }
).then(r => r.json());

console.log(result);
// { success: true, sessionId: "...", requestId: "..." }
```

### Using Python:

```python
import requests

# Get sessions
sessions = requests.get('http://localhost:5409/api/websocket/sessions').json()

# Create tab
result = requests.post(
  f'http://localhost:5409/api/browser/{sessions["sessions"][0]["sessionId"]}/tabs/create',
  json={ 'url': 'https://example.com' }
).json()

print(result)
```

---

## Testing

### Automated Test:
```bash
cd /mnt/ee/aprojects/btw
./test-create-tab.sh
```

### Manual Test:
1. Ensure server is running: `npm run start:old`
2. Ensure extension is connected (popup shows "Connected")
3. Get Session ID from popup or API
4. Run curl command above
5. Check Chrome - new tab should appear at example.com

### Expected Behavior:
- ✅ API returns success response with requestId
- ✅ New tab opens in Chrome at specified URL
- ✅ Extension logs show "Tab created: {tabId}"
- ✅ Server receives response from extension

---

## Technical Details

### Request Flow:

1. **HTTP Request** arrives at server endpoint
2. Server validates session ID
3. Server generates unique requestId (8 chars)
4. Server stores pending request
5. Server sends WebSocket message to extension
6. Extension receives message
7. Extension calls chrome.tabs.create()
8. Chrome creates new tab
9. Extension sends response back via WebSocket
10. Server stores response in pending request
11. Client can poll endpoint for result (future enhancement)

### Request ID Format:
- Length: 8 characters
- Source: First 8 chars of UUID v4
- Type: Hexadecimal (0-9, a-f)
- Purpose: Track individual requests

---

## Error Handling

### Session Not Found (404):
```json
{
  "error": "Session not found"
}
```

### Session Not Connected (503):
```json
{
  "error": "Session is not connected"
}
```

### Extension Error:
```json
{
  "type": "tabs.createTab.response",
  "success": false,
  "error": "Error message from chrome.tabs API"
}
```

---

## Current Status

✅ **Implemented:** Create Tab API
✅ **Tested:** Working correctly
✅ **Integrated:** WebSocket + HTTP
✅ **Tracked:** Request/Response with IDs

---

## Next APIs to Implement

Based on `api.json`, the following tabs APIs can be implemented:

1. ✅ `tabs.create` - **DONE**
2. ⬜ `tabs.get` - Get tab details
3. ⬜ `tabs.update` - Update tab URL/properties
4. ⬜ `tabs.remove` - Close tab(s)
5. ⬜ `tabs.query` - Find tabs
6. ⬜ `tabs.reload` - Reload tab
7. ⬜ `tabs.goBack` - Navigate back
8. ⬜ `tabs.goForward` - Navigate forward
9. ⬜ `tabs.setZoom` - Set tab zoom level

---

## Summary

First Chrome Extension API successfully integrated:
- **API:** `tabs.create` (Create new tab)
- **Endpoint:** `POST /api/browser/:sessionId/tabs/create`
- **Flow:** HTTP → WebSocket → Extension → Chrome → Response
- **Status:** ✅ Production Ready

**One by one implementation now in progress.**
