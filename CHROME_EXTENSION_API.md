# BTW (Browse The Web) - Complete AI Agent Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Dual Browser Control Systems](#dual-browser-control-systems)
3. [Browser System 1: Playwright Controlled](#browser-system-1-playwright-controlled)
4. [Browser System 2: Chrome Extension Controlled](#browser-system-2-chrome-extension-controlled)
5. [WebSocket Session Management](#websocket-session-management)
6. [Chrome Extension HTTP Endpoints](#chrome-extension-http-endpoints)
7. [Common Failures & Debugging](#common-failures--debugging)
8. [Response Format Standards](#response-format-standards)
9. [Best Practices for AI Agents](#best-practices-for-ai-agents)

---

## Architecture Overview

BTW (Browse The Web) is a browser automation system that provides **TWO separate browser control systems** for different use cases:

### System 1: Playwright Controlled (`/api/browser`, `/api/tabs`)
- **Purpose**: Headless browser automation with complete programmatic control
- **Use Cases**: Web scraping, testing, automated tasks, data extraction
- **How it works**: Server launches and manages Playwright (Chromium) instances
- **Advantages**: Full control, no user browser needed, headless mode available
- **Documentation**: Refer to `API_BLUEPRINT.md` for complete Playwright API reference

### System 2: Chrome Extension Controlled (`/api/browser/:sessionId/tabs/*`)
- **Purpose**: Control real browser tabs via WebSocket connection
- **Use Cases**: Human-in-the-loop workflows, real browser interactions, authentication
- **How it works**: Users install Chrome extension, connects via WebSocket to server
- **Advantages**: Real browser context, extensions available, cookies preserved
- **Documentation**: **This file** covers the Chrome extension API

---

## Dual Browser Control Systems

### When to Use Each System

| Feature | Playwright System | Chrome Extension System |
|---------|------------------|------------------------|
| **Headless Mode** | ✅ Yes | ❌ No (real browser) |
| **Extensions** | ❌ Limited | ✅ All extensions available |
| **Cookies/Auth** | ⚠️ Fresh | ✅ Real user cookies |
| **Performance** | ⚠️ Slower start | ✅ Instant (existing browser) |
| **Chrome Install Required?** | ✅ No (bundled) | ❌ Yes (user's Chrome) |
| **WebSocket** | ❌ No | ✅ Required |
| **Privacy** | ✅ Isolated | ⚠️ User's browser data |
| **Best For** | Scraping, testing, automation | Human workflows, auth, debugging |

---

## Browser System 1: Playwright Controlled

**Base URL**: `http://localhost:5409`

### Quick Start

```bash
# 1. Launch browser
curl -X POST http://localhost:5409/api/browser/launch \
  -H "Content-Type: application/json" \
  -d '{"headless":false}'

# 2. Create tab/session
curl -X POST http://localhost:5409/api/tabs/create \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Get session ID from response
# Response: {"sessionId":"uuid", ...}

# 4. Navigate
curl -X POST http://localhost:5409/api/tabs/{sessionId}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Complete API Reference

📖 See `API_BLUEPRINT.md` for the complete Playwright API documentation including:
- 80+ endpoints for browser automation
- Screenshot & PDF generation
- Network monitoring & interception
- Form handling
- Storage management
- Keyboard & mouse control
- And more...

---

## Browser System 2: Chrome Extension Controlled

**Base URL**: `http://localhost:5409`

### Overview

The Chrome Extension system controls real browser tabs through a WebSocket connection. The user installs the BTW Chrome extension, which connects to the server via WebSocket, allowing the server to control their real browser.

### Prerequisites

1. **Install Chrome Extension**

   Follow these steps to install the BTW Chrome extension:

   **Step 1: Build the Extension**
   ```bash
   npm run dev
   ```
   This generates the extension in the `dist/btw-chrome-extension/` directory.

   **Step 2: Open Chrome Extensions Page**
   - In Chrome, navigate to: `chrome://extensions`
   - Or use menu: ⋮ (three dots) → More Tools → Extensions

   **Step 3: Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner
   - Extension tools will appear (Load unpacked, Pack extension, Update)

   **Step 4: Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to your BTW project directory
   - Select: `dist/btw-chrome-extension/`
   - Click "Select Folder"

   **Step 5: Verify Installation**
   - BTW extension should appear in your extensions list
   - You should see a green "Connected" indicator (if server is running)
   - Extension icon may appear in Chrome toolbar

2. **Extension Auto-Connects**
   - Extension automatically connects to: `ws://localhost:5409/ws`
   - You'll see a connection indicator in the extension popup
   - Extension receives a unique `sessionId` (format: `ext_XXXXXXXXXXXX`)

3. **No Server Browsers**
   - Extension system does NOT launch Playwright browsers
   - All browsers are the user's real Chrome instances
   - Your real Chrome tabs are controlled via WebSocket

4. **Server Must Be Running**
   ```bash
   # Start BTW server
   npm start
   # or
   npm run dev

   # Verify server is running
   curl http://localhost:5409/api/health
   ```

### Troubleshooting Installation

**Extension Not Connecting:**
1. Check server is running: `curl http://localhost:5409/api/health`
2. Reload the extension: chrome://extensions → click reload button on BTW extension
3. Check WebSocket connection: Look for "Connected" indicator in extension
4. Check browser console for errors (F12 → Console tab)

**Extension Won't Load:**
1. Make sure you ran `npm run dev` to build the extension
2. Check directory: `dist/btw-chrome-extension/` must exist
3. Look for error messages in chrome://extensions
4. Try restarting Chrome

**Can't Find BTW Extension:**
1. Navigate to chrome://extensions
2. Scroll through the list - BTW should be visible
3. Use search bar at top-right to find "BTW" or "Browse The Web"
4. Check if extension was disabled (toggle switch should be right/on)

---

## WebSocket Session Management

### Get All WebSocket Sessions

```bash
curl http://localhost:5409/api/websocket/sessions
```

**Response:**
```json
{
  "count": 1,
  "sessions": [
    {
      "sessionId": "ext_abc123def456",
      "connectedAt": "2026-02-26T23:00:00.000Z",
      "lastSeen": "2026-02-26T23:05:00.000Z",
      "userAgent": "Mozilla/5.0 ...",
      "ip": "::1"
    }
  ]
}
```

### Get Specific Session Info

```bash
curl http://localhost:5409/api/websocket/sessions/{sessionId}
```

**Response:**
```json
{
  "sessionId": "ext_abc123def456",
  "connectedAt": "2026-02-26T23:00:00.000Z",
  "lastSeen": "2026-02-26T23:05:00.000Z",
  "userAgent": "Mozilla/5.0 ..."
}
```

### Send Direct WebSocket Message

```bash
curl -X POST http://localhost:5409/api/websocket/sessions/{sessionId}/message \
  -H "Content-Type: application/json" \
  -d '{"type":"ping","data":{}}'
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "message": "Message sent successfully",
  "timestamp": 1772127000000
}
```

---

## Chrome Extension HTTP Endpoints

All Chrome Extension endpoints follow the pattern:
`/api/browser/{sessionId}/tabs/{action}` or `/api/browser/{sessionId}/tabs/{tabId}/{action}`

### 📌 Important Notes

1. **Session ID**: Use the `sessionId` returned from WebSocket connection
2. **Tab ID**: After creating a tab, use the returned `tabId` for operations
3. **Timeouts**: Most operations timeout in 10-30 seconds
4. **WebSocket Required**: Extension must be connected (WebSocket.OPEN) for operations to work
5. **No Server Logs**: All errors and debugging info are in HTTP responses

---

### Tab Management

#### Create New Tab

```bash
POST /api/browser/{sessionId}/tabs/create
```

**Request:**
```json
{
  "url": "https://example.com"  // Optional, defaults to chrome://newtab
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req123abc",
  "result": {
    "tabId": 123456,
    "url": "https://example.com",
    "title": "Example Domain",
    "active": true
  },
  "timestamp": 1772127000000
}
```

**Errors:**
- `404`: Session not found (extension not connected)
- `503`: Session is not connected (WebSocket closed or error)
- `500`: Chrome extension error (see error message)

---

#### List All Tabs

```bash
GET /api/browser/{sessionId}/tabs
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req456def",
  "result": [
    {
      "id": 123456,
      "url": "https://example.com",
      "title": "Example Domain",
      "active": true
    },
    {
      "id": 123457,
      "url": "https://google.com",
      "title": "Google",
      "active": false
    }
  ],
  "timestamp": 1772127000000
}
```

---

#### Update Tab

```bash
PATCH /api/browser/{sessionId}/tabs/{tabId}
```

**Request:**
```json
{
  "url": "https://newsite.com",     // Optional
  "active": true,                   // Optional - make tab active
  "pinned": false,                  // Optional - pin tab
  "muted": false,                   // Optional - mute tab
  "highlighted": false              // Optional - highlight tab
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req789ghi",
  "result": {
    "tabId": 123456,
    "updated": true
  },
  "timestamp": 1772127000000
}
```

---

#### Close Tab

```bash
DELETE /api/browser/{sessionId}/tabs/{tabId}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req012jkl",
  "result": {
    "tabId": 123456,
    "closed": true
  },
  "timestamp": 1772127000000
}
```

---

### Navigation

#### Navigate to URL

```bash
PATCH /api/browser/{sessionId}/tabs/{tabId}
```

**Request:**
```json
{
  "url": "https://example.com"
}
```

---

#### Reload Tab

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/reload
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req345mno",
  "result": {
    "tabId": 123456,
    "reloaded": true
  },
  "timestamp": 1772127000000
}
```

---

#### Go Back

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/back
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req678pqr",
  "result": {
    "tabId": 123456,
    "navigatedBack": true
  },
  "timestamp": 1772127000000
}
```

---

#### Go Forward

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/forward
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req901stu",
  "result": {
    "tabId": 123456,
    "navigatedForward": true
  },
  "timestamp": 1772127000000
}
```

---

### Element Interaction

#### Click Element

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/click
```

**Request:**
```json
{
  "selector": "#submit-button"  // CSS selector
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req234vwx",
  "result": {
    "tabId": 123456,
    "clicked": true
  },
  "timestamp": 1772127000000
}
```

**Errors:**
- `400`: selector is required
- `404`: Session not found
- `503`: Session is not connected
- `500`: Element not found or click failed

---

#### Type Text

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/type
```

**Request:**
```json
{
  "selector": "#username",
  "text": "hello world",
  "delay": 50  // Optional, milliseconds between keystrokes (default 50)
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req567yz",
  "result": {
    "tabId": 123456,
    "typed": true
  },
  "timestamp": 1772127000000
}
```

**Errors:**
- `400`: selector or text is required

---

#### Fill Input

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/fill
```

**Request:**
```json
{
  "selector": "#email",
  "text": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req890abc",
  "result": {
    "tabId": 123456,
    "filled": true
  },
  "timestamp": 1772127000000
}
```

---

#### Scrape Elements

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/scrape
```

**Request:**
```json
{
  "selector": ".product-row",
  "fields": {
    "title": ".title::text",
    "price": ".price::text",
    "link": "a::href"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req123def",
  "result": {
    "tabId": 123456,
    "scrapedData": [
      {
        "title": "Product 1",
        "price": "$19.99",
        "link": "/product/1"
      },
      {
        "title": "Product 2",
        "price": "$29.99",
        "link": "/product/2"
      }
    ]
  },
  "timestamp": 1772127000000
}
```

**Errors:**
- `400`: selector is required
- Timeout: 30 seconds (scraping can take longer)

---

#### Scroll Page

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/scroll
```

**Request:**
```json
{
  "direction": "down",  // "up" or "down"
  "amount": 500         // Pixels to scroll (default 500)
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req456ghi",
  "result": {
    "tabId": 123456,
    "scrolled": true
  },
  "timestamp": 1772127000000
}
```

---

### Script Execution

#### Execute JavaScript

```bash
POST /api/browser/{sessionId}/tabs/{tabId}/execute
```

**Request:**
```json
{
  "code": "document.title",
  "args": []  // Optional arguments array
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req789jkl",
  "result": {
    "tabId": 123456,
    "result": "Example Domain"
  },
  "timestamp": 1772127000000
}
```

**Errors:**
- `400`: code is required
- `500`: CSP violation (see below)

---

### Screenshot

#### Capture Visible Tab

```bash
POST /api/browser/{sessionId}/tabs/capture
```

**Request:**
```json
{
  "windowId": -2,         // Optional (default: -2 = current window)
  "format": "png",        // Optional: "png" or "jpeg" (default: png)
  "quality": 90           // Optional: 0-100 for jpeg only (default: 90)
}
```

**Note**: This captures the **active tab** in the window, not a specific tab.

**Response:**
```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req012mno",
  "filePath": "/home/user/btw_media/screenshot_1772127000000_abc123.png",
  "timestamp": 1772127000000
}
```

**File Details:**
- Screenshot is saved to: `$HOME/btw_media/screenshot_{timestamp}_{random}.{ext}`
- Filename format: `screenshot_{timestamp}_{RandomCharacters}.{extension}`
- Extension: `.png` or `.jpeg` based on format parameter

**Errors:**
- `503`: Session is not connected
- `Capture timeout`: Screenshot capture failed (10 second timeout)

---

## Common Failures & Debugging

### All Debugging Info in HTTP Responses

✅ **NO server logs required** - All errors, warnings, and debugging information are returned in HTTP response JSON.

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "timestamp": 1772127000000
}
```

For more detailed errors, additional fields may be included:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": {
    "errorCode": "CSP_VIOLATION",
    "violatedDirective": "script-src",
    "blockedResource": "executeScript"
  },
  "requestId": "req123abc",
  "timestamp": 1772127000000
}
```

---

### 1. Session Not Found (HTTP 404)

**Error:**
```json
{
  "error": "Session not found"
}
```

**Cause:**
- WebSocket session ID is invalid or expired
- Chrome extension is not connected
- Extension disconnected and hasn't reconnected

**Debug Steps:**
1. Check available sessions: `GET /api/websocket/sessions`
2. Verify extension is loaded in Chrome: `chrome://extensions`
3. Check extension is enabled and has WebSocket connection indicator
4. Wait a few seconds for auto-reconnect, then retry

**Solution:**
- Reload extension in Chrome
- Check browser console for extension errors
- Use a valid sessionId from `/api/websocket/sessions`

---

### 2. Session Not Connected (HTTP 503)

**Error:**
```json
{
  "error": "Session is not connected"
}
```

**Cause:**
- WebSocket connection is closed or in error state
- Extension is running but WebSocket disconnected
- Network issue between extension and server

**Debug Steps:**
1. Check session status: `GET /api/websocket/sessions/{sessionId}`
2. Look at `lastSeen` timestamp - if old, connection may be stale
3. Check extension UI for connection status indicator

**Solution:**
- Refresh the page where extension is loaded
- Extension will auto-reconnect within 5-10 seconds
- If persistent, restart Chrome

---

### 3. CSP (Content Security Policy) Violation

**Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to execute script: Refused to execute inline script"
}
```

**Cause:**
- Browser has strict Content Security Policy
- `executeScript` endpoint blocked on pages with strict CSP
- Common on: Instagram, GitHub, some banking sites

**Debug Steps:**
1. Check the URL you're trying to execute script on
2. Look for `Refused to execute` in error message
3. Try on a different page (e.g., example.com)

**Solutions:**

**Option A:** Use scraping instead of executeScript
```bash
# Instead of executeScript:
POST /api/browser/{sessionId}/tabs/{tabId}/execute
{ "code": "document.title" }

# Use scrape:
POST /api/browser/{sessionId}/tabs/{tabId}/scrape
{ "selector": "title::text" }
```

**Option B:** Navigate to a page without strict CSP
- Use example.com for testing
- Use your own controlled pages
- Use pages you control CSP headers

**Option C:** Use Playwright System instead
- Playwright system doesn't have CSP restrictions
- Use `/api/tabs/{tabId}/evaluate` instead

**Known Limitation:**
This is a **documented limitation**. The Chrome extension `executeScript` endpoint will **NOT** work on:
- Instagram.com
- GitHub.com
- Sites with strict `script-src` CSP directives

---

### 4. Screenshot Timeout

**Error:**
```json
{
  "error": "Capture timeout"
}
```

**Cause:**
- Screenshot capture didn't complete within 10 seconds
- Tab is not visible or active
- Browser is busy or frozen
- Extension permissions issue

**Debug Steps:**
1. Check tab is active: `GET /api/browser/{sessionId}/tabs`
2. Verify extension has `activeTab` permission (required)
3. Try with `format: "jpeg"` instead of "png"

**Solution:**
```bash
# Make sure tab is active before capture
PATCH /api/browser/{sessionId}/tabs/{tabId}
{ "active": true }

# Then capture
POST /api/browser/{sessionId}/tabs/capture
{ "format": "jpeg", "quality": 90 }
```

---

### 5. Element Not Found

**Error:**
```json
{
  "error": "Internal server error",
  "message": "Element not found: #my-button"
}
```

**Cause:**
- CSS selector is incorrect
- Element doesn't exist on page
- Page hasn't finished loading
- Element is hidden or in shadow DOM

**Debug Steps:**
1. Take screenshot to see page state:
   ```bash
   POST /api/browser/{sessionId}/tabs/capture
   ```
2. Use browser DevTools to test selector
3. Wait for page load:
   ```bash
   POST /api/browser/{sessionId}/tabs/{tabId}/reload
   ```
4. Try broader selector: `"button"` instead of `"#my-button"`

**Solution:**
```bash
# Option 1: Use a more specific selector
POST .../click
{ "selector": "button[type='submit']" }

# Option 2: Wait for element first
POST .../execute
{ "code": "await new Promise(r => setTimeout(r, 2000)); document.querySelector('#my-button')" }

# Option 3: Check element exists
POST .../execute
{ "code": "!!document.querySelector('#my-button')" }
```

---

### 6. Request Timeout

**Error:**
```json
{
  "error": "Scrape timeout"
}
```

**Cause:**
- Operation exceeded timeout limit
- Scraping timeout: 30 seconds
- Other operations: 10 seconds
- Page is too large or slow

**Debug Steps:**
1. Check page size and complexity
2. Try with smaller selector scope
3. Use screenshot to verify page loaded

**Solution:**
```bash
# Narrow scraping scope
POST .../scrape
{
  "selector": ".results .item",  // More specific
  "fields": { "title": ".title::text" }
}
```

---

### 7. Invalid Request Parameters

**Error:**
```json
{
  "error": "selector is required"
}
```

or

```json
{
  "error": "text is required"
}
```

**Cause:**
- Missing required parameter in request body
- Parameter name misspelled
- Empty value passed

**Debug Steps:**
1. Check API documentation for required parameters
2. Verify request body format
3. Use JSON linter to validate syntax

**Solution:**
```bash
# Bad:
POST .../click
{ "target": "#button" }  # Should be "selector"

# Good:
POST .../click
{ "selector": "#button" }
```

---

### 8. WebSocket Connection Failed

**Symptom:**
- No sessions in `/api/websocket/sessions`
- Extension not appearing in browser

**Cause:**
- Extension not loaded in Chrome
- WebSocket connection failed
- Server not running on `ws://localhost:5409/ws`

**Debug Steps:**
1. Check server is running: `GET /api/health`
2. Check extension is loaded: `chrome://extensions`
3. Check browser console for WebSocket errors

**Solution:**
```bash
# 1. Start server
npm start

# 2. Load extension
chrome://extensions → Load unpacked → dist/btw-chrome-extension/

# 3. Check connection
curl http://localhost:5409/api/websocket/sessions
```

---

### 9. File Path Issues

**Error:**
```json
{
  "error": "Failed to save screenshot"
}
```

**Cause:**
- `$HOME/btw_media` directory doesn't exist
- No write permissions
- Disk full

**Debug Steps:**
1. Check directory exists: `ls -la ~/btw_media`
2. Check permissions: `stat ~/btw_media`
3. Check disk space: `df -h`

**Solution:**
```bash
# Create media directory
mkdir -p ~/btw_media
chmod 755 ~/btw_media

# Verify writable
touch ~/btw_media/test && rm ~/btw_media/test
```

---

## Response Format Standards

### Success Response

All successful responses include:

```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req123abc",
  "result": { ... },
  "timestamp": 1772127000000
}
```

**Fields:**
- `success`: Always `true` for success
- `sessionId`: WebSocket session identifier
- `requestId`: Unique request ID for tracking
- `result`: Operation-specific result data
- `timestamp`: Unix timestamp (milliseconds)

---

### Error Response

All error responses include:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "timestamp": 1772127000000
}
```

**Additional fields (when available):**
- `details`: Structured error details
- `requestId`: Request ID for failed operation
- `statusCode`: HTTP status code
- `errorCode`: Machine-readable error code

---

### Screenshot Response

```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req123abc",
  "filePath": "/home/user/btw_media/screenshot_1772127000000_abc123.png",
  "timestamp": 1772127000000
}
```

The screenshot is saved to disk. No base64 data is returned (file sizes too large for JSON).

---

## Best Practices for AI Agents

### 1. Always Check Session Status

Before any operation, verify session exists and is connected:

```bash
# Step 1: Check session exists
GET /api/websocket/sessions/{sessionId}

# Step 2: If error, list all sessions
GET /api/websocket/sessions

# Step 3: Use valid sessionId
```

### 2. Handle All HTTP Errors

```bash
# Check HTTP status code
# 200 = Success
# 400 = Bad request (parameter error)
# 404 = Not found (session/element missing)
# 503 = Service unavailable (disconnected)
# 500 = Server error (operation failed)
```

### 3. Use Screenshot for Debugging

When operations fail, take a screenshot to see page state:

```bash
POST /api/browser/{sessionId}/tabs/capture
```

### 4. Wait for Page Load

After navigation, wait before interacting:

```bash
# Navigate
PATCH /api/browser/{sessionId}/tabs/{tabId}
{ "url": "https://example.com" }

# Wait 2-3 seconds (automatically)
# Or check page is ready
POST /api/browser/{sessionId}/tabs/{tabId}/execute
{ "code": "document.readyState === 'complete'" }
```

### 5. Use Specific Selectors

```bash
# Bad: Too general
POST .../click
{ "selector": "button" }

# Good: Specific
POST .../click
{ "selector": "button[type='submit']#submit-btn" }
```

### 6. Handle CSP Limitations

If `executeScript` fails on a site:

```bash
# Don't retry executeScript
# Instead, use scraping:
POST /api/browser/{sessionId}/tabs/{tabId}/scrape
```

### 7. Set Appropriate Timeouts

For long operations:

```bash
# Scraping has 30s timeout - good for large pages
POST /api/browser/{sessionId}/tabs/{tabId}/scrape
```

For quick operations:

```bash
# Other operations have 10s timeout - sufficient for normal use
POST /api/browser/{sessionId}/tabs/{tabId}/click
```

### 8. Use JSON for Request Bodies

Always send proper JSON:

```bash
# Bad:
POST /api/browser/{sessionId}/tabs/{tabId}/click
selector=#button

# Good:
POST /api/browser/{sessionId}/tabs/{tabId}/click
Content-Type: application/json
{"selector":"#button"}
```

### 9. Check Response `success` Field

Always check `success` in response:

```json
{
  "success": false,
  "error": "Element not found"
}
```

If `success` is `false`, read `error` field for debugging.

### 10. Prefer Explicit Status Checks

Instead of assuming tab is ready:

```bash
# Before click, check element exists
POST /api/browser/{sessionId}/tabs/{tabId}/execute
{ "code": "!!document.querySelector('#submit-button')" }

# Response will be {"result": true} or {"result": false}
```

---

## Quick Reference

### Common Endpoints Summary

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List Sessions | GET | `/api/websocket/sessions` |
| List Tabs | GET | `/api/browser/{sessionId}/tabs` |
| Create Tab | POST | `/api/browser/{sessionId}/tabs/create` |
| Navigate | PATCH | `/api/browser/{sessionId}/tabs/{tabId}` |
| Reload | POST | `/api/browser/{sessionId}/tabs/{tabId}/reload` |
| Back | POST | `/api/browser/{sessionId}/tabs/{tabId}/back` |
| Forward | POST | `/api/browser/{sessionId}/tabs/{tabId}/forward` |
| Click | POST | `/api/browser/{sessionId}/tabs/{tabId}/click` |
| Type | POST | `/api/browser/{sessionId}/tabs/{tabId}/type` |
| Fill | POST | `/api/browser/{sessionId}/tabs/{tabId}/fill` |
| Scrape | POST | `/api/browser/{sessionId}/tabs/{tabId}/scrape` |
| Scroll | POST | `/api/browser/{sessionId}/tabs/{tabId}/scroll` |
| Execute | POST | `/api/browser/{sessionId}/tabs/{tabId}/execute` |
| Screenshot | POST | `/api/browser/{sessionId}/tabs/capture` |
| Close Tab | DELETE | `/api/browser/{sessionId}/tabs/{tabId}` |

---

## Troubleshooting Checklist

✅ Server running? Check `GET /api/health`
✅ Extension loaded? Check `chrome://extensions`
✅ Session connected? Check `GET /api/websocket/sessions`
✅ Tab exists? Check `GET /api/browser/{sessionId}/tabs`
✅ Element exists? Screenshot + executeScript selector check
✅ CSP issues? Use scraping instead of executeScript
✅ Timeout? Narrow selector scope or check page size
✅ WebSocket issues? Reload extension
✅ File issues? Check `~/btw_media` directory permissions

---

## Support & Issues

For issues not covered here:
- Check `API_BLUEPRINT.md` for Playwright system
- Review error messages in HTTP responses (all debugging info included)
- No server logs needed for debugging

---

**Last Updated:** 2026-02-26
**BTW Version:** 2.0.2
