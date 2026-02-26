# BTW Debugging Guide - No Server Logs Required

## 🚀 Core Principle

**All debugging information is returned in HTTP responses. You NEVER need to check server.log.**

---

## 📊 How to Debug Without Server Logs

### Step 1: Check HTTP Status Code

```bash
curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:5409/api/health
```

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| 200 | Success | Read response JSON |
| 400 | Bad Request | Check request parameters |
| 404 | Not Found | Session/tab/element doesn't exist |
| 503 | Service Unavailable | Extension disconnected |
| 500 | Server Error | Read error message in response |

---

### Step 2: Read Response JSON

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "result": { ... },
  "timestamp": 1772127000000
}
```

**Error:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "timestamp": 1772127000000
}
```

**Key Fields to Check:**
- `success`: Is the operation successful?
- `error`: What went wrong?
- `result`: What was returned?
- `timestamp`: When did the operation complete?

---

## 🔍 Common Issues & Solutions

### Issue 1: "Session not found" (HTTP 404)

**Error Response:**
```json
{
  "success": false,
  "error": "Session not found"
}
```

**Debug Steps:**
```bash
# 1. List all available sessions
curl http://localhost:5409/api/websocket/sessions

# Response example:
{
  "count": 1,
  "sessions": [
    {
      "sessionId": "ext_abc123def456",
      "connectedAt": "2026-02-26T23:00:00.000Z",
      "lastSeen": "2026-02-26T23:05:00.000Z"
    }
  ]
}

# 2. Use one of the returned sessionId values
curl http://localhost:5409/api/browser/ext_abc123def456/tabs
```

**Solution:**
- Extension not connected → Reload extension in Chrome
- Wrong sessionId → Use correct ID from `/api/websocket/sessions`
- Extension crashed → Reload `chrome://extensions`

---

### Issue 2: "Session is not connected" (HTTP 503)

**Error Response:**
```json
{
  "success": false,
  "error": "Session is not connected"
}
```

**Debug Steps:**
```bash
# 1. Check session details
curl http://localhost:5409/api/websocket/sessions/ext_abc123def456

# Response example:
{
  "sessionId": "ext_abc123def456",
  "connectedAt": "2026-02-26T23:00:00.000Z",
  "lastSeen": "2026-02-26T23:05:00.000Z"
}

# 2. Check if lastSeen is recent (within last 5 minutes)
# If lastSeen is old (>5 minutes), connection is stale

# 3. Wait 10 seconds for auto-reconnect, then retry
```

**Solution:**
- Refresh the page with the extension
- Extension auto-reconnects within 5-10 seconds
- If persistent, restart Chrome

---

### Issue 3: CSP Violation - executeScript Fails

**Error Response:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to execute script: Refused to execute inline script"
}
```

**Debug Steps:**
```bash
# 1. Check which URL you're on
curl http://localhost:5409/api/browser/ext_abc123def456/tabs |

# 2. Identify URL from response
# If URL is: instagram.com, github.com, or similar = CSP issue

# 3. Try scraping instead
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "selector": "title::text",
    "fields": {}
  }'
```

**Solution:**
This is a **known limitation**. Don't retry executeScript on:
- Instagram.com
- GitHub.com
- Sites with strict CSP

**Alternatives:**
1. Use `scrape` endpoint instead
2. Navigate to page without strict CSP
3. Use Playwright system (`/api/tabs/{tabId}/evaluate`)

---

### Issue 4: "selector is required" (HTTP 400)

**Error Response:**
```json
{
  "success": false,
  "error": "selector is required"
}
```

**Debug Steps:**
```bash
# Check your request body
# Bad:
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/click \
  -H "Content-Type: application/json" \
  -d '{"target":"#button"}'  # ← Wrong parameter name

# Good:
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"#button"}'  # ← Correct parameter name
```

**Solution:**
- Check API documentation for correct parameter names
- Use JSON linter to validate request body
- Ensure Content-Type header is `application/json`

---

### Issue 5: "Element not found"

**Error Response:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Element not found: #my-button"
}
```

**Debug Steps:**
```bash
# 1. Take screenshot to see page state
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/capture

# 2. Check if element exists
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"!!document.querySelector('\''#my-button'\'')"'}'

# Response:
# {"result": true} = Exists
# {"result": false} = Doesn't exist

# 3. Try broader selector
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"!!document.querySelector('\''button'\'')"'}'
```

**Solution:**
1. Use screenshot to verify page loaded
2. Wait a few seconds if page still loading
3. Use broader selector (e.g., `"button"` instead of `"#my-button"`)
4. Check if element is in iframe (use iframe-specific methods)

---

### Issue 6: "Capture timeout"

**Error Response:**
```json
{
  "success": false,
  "error": "Capture timeout"
}
```

**Debug Steps:**
```bash
# 1. Check tab is active
curl http://localhost:5409/api/browser/ext_abc123def456/tabs |

# Find tab with "active": true

# 2. Make tab active
curl -X PATCH http://localhost:5409/api/browser/ext_abc123def456/tabs/123 \
  -H "Content-Type: application/json" \
  -d '{"active":true}'

# 3. Try capture again with jpeg
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/capture \
  -H "Content-Type: application/json" \
  -d '{"format":"jpeg","quality":90}'
```

**Solution:**
- Screenshot only captures the **active tab**
- Make sure tab is active before capture
- Try with different format/quality

---

### Issue 7: "Scrape timeout"

**Error Response:**
```json
{
  "success": false,
  "error": "Scrape timeout"
}
```

**Debug Steps:**
```bash
# 1. Take screenshot to see page size
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/capture

# 2. Narrow selector scope
# Instead of:
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/scrape \
  -H "Content-Type: application/json" \
  -d '{"selector":"div","fields":{"text":"::text"}}'

# Use:
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/scrape \
  -H "Content-Type: application/json" \
  -d '{"selector":".results .item","fields":{"title":".title::text"}}'
```

**Solution:**
- Scrape timeout is 30 seconds
- Use more specific selectors
- Scrape smaller sections at a time

---

## 🛠️ Quick Debugging Workflow

### When an Operation Fails:

```bash
# Step 1: Check HTTP status code
# (already done with curl -w "\nHTTP_CODE:%{http_code}")

# Step 2: Read error message from response JSON
# (error field tells you what went wrong)

# Step 3: Check session status
curl http://localhost:5409/api/websocket/sessions/{sessionId}

# Step 4: Check tab status (if tab operation)
curl http://localhost:5409/api/browser/{sessionId}/tabs

# Step 5: Take screenshot to see page state
curl -X POST http://localhost:5409/api/browser/{sessionId}/tabs/capture

# Step 6: Fix the issue (see solutions above)

# Step 7: Retry the operation
```

---

## 📝 Example: Debugging Complete Workflow

### Problem: Click fails

```bash
# 1. Try click operation
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"#submit-button"}'

# Response:
# HTTP_CODE:500
# {"success":false,"error":"Internal server error","message":"Element not found: #submit-button"}

# 2. Take screenshot
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/capture

# Response:
# {"success":true,"filePath":"/home/user/btw_media/screenshot_...png"}

# 3. Check if button exists
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"!!document.querySelector('#submit-button')"}'

# Response:
# {"success":true,"result":false}

# 4. Check if any button exists
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"!!document.querySelector('button')"}'

# Response:
# {"success":true,"result":true}

# 5. Click the button that exists
curl -X POST http://localhost:5409/api/browser/ext_abc123def456/tabs/123/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"button"}'

# Response:
# HTTP_CODE:200
# {"success":true,"result":{"clicked":true}}
```

---

## 🚨 Error Message Glossary

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Session not found" | Invalid sessionId | Get valid sessionId from `/api/websocket/sessions` |
| "Session is not connected" | WebSocket closed | Reload extension, wait 10s |
| "selector is required" | Missing parameter | Include `selector` in request body |
| "text is required" | Missing parameter | Include `text` in request body |
| "code is required" | Missing parameter | Include `code` in request body |
| "Element not found" | CSS selector invalid | Use screenshot + executeScript to debug |
| "Refused to execute inline script" | CSP violation | Use scrape endpoint instead |
| "Capture timeout" | Screenshot failed | Make tab active, try jpeg format |
| "Scrape timeout" | Page too large | Use narrower selector |
| "Internal server error" | Operation failed | Check error message details |

---

## ✅ Debugging Checklist

Before assuming server issue:

- [ ] Checked HTTP status code (200 vs 400/404/500/503)
- [ ] Read error message from response JSON
- [ ] Checked session exists and is connected
- [ ] Checked tab exists (if tab operation)
- [ ] Taken screenshot to see page state
- [ ] Verified element exists (if element operation)
- [ ] Checked request body JSON is valid
- [ ] Verified required parameters are included

---

## 🎯 Best Practices

### 1. Always Use Full Error Context

```bash
# Don't just check success
if response.error:
    print(response.error)  # ✅ Good

# Include full error context
if not response.success:
    print(f"Error: {response.error}")
    print(f"Timestamp: {response.timestamp}")
    print(f"Request ID: {response.get('requestId')}")  # ✅ Better
```

### 2. Use Screenshots for Visual Debugging

```bash
# When in doubt, screenshot first
curl -X POST /api/browser/{sessionId}/tabs/capture
```

### 3. Check Session Before Every Operation

```bash
curl http://localhost:5409/api/websocket/sessions/{sessionId}
```

### 4. Verify Tab Active Before Screenshot

```bash
curl -X PATCH /api/browser/{sessionId}/tabs/{tabId} \
  -H "Content-Type: application/json" \
  -d '{"active":true}'
```

### 5. Use executeScript to Debug Selectors

```bash
# Test selector before using it
curl -X POST /api/browser/{sessionId}/tabs/{tabId}/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"!!document.querySelector(''selector'')"}'
```

---

## 📚 Additional Resources

- **Chrome Extension API:** `CHROME_EXTENSION_API.md`
- **Playwright API:** `API_BLUEPRINT.md`
- **No server logs needed** - All debugging info in responses

---

**Remember: The JSON response has ALL the information you need. Never check server.log.**
