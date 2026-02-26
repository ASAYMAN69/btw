# BTW Quick Reference - AI Agent Cheat Sheet

## 🎯 Choose Your System

### Playwright System (`/api/browser`, `/api/tabs`)
- ✅ Headless mode available
- ✅ No browser installation needed
- ✅ Complete programmatic control
- ❌ Can't use user's extensions
- **Use for:** Scraping, testing, automation
- **Docs:** `API_BLUEPRINT.md`

### Chrome Extension System (`/api/browser/:sessionId/tabs/*`)
- ✅ Real browser with all extensions
- ✅ User's cookies and auth
- ❌ Requires extension install
- ❌ No headless mode
- **Use for:** Human workflows, real browser control
- **Docs:** `CHROME_EXTENSION_API.md`

---

## 🚀 Chrome Extension Quick Start

### 1. Install & Connect

```bash
# Build extension
npm run dev

# Load in Chrome
chrome://extensions → Load unpacked → dist/btw-chrome-extension/

# Get session ID
curl http://localhost:5409/api/websocket/sessions
```

### 2. Common Operations

```bash
# Create tab
POST /api/browser/{sessionId}/tabs/create
{"url":"https://example.com"}

# Click element
POST /api/browser/{sessionId}/tabs/{tabId}/click
{"selector":"#button"}

# Type text
POST /api/browser/{sessionId}/tabs/{tabId}/type
{"selector":"#input","text":"hello"}

# Take screenshot
POST /api/browser/{sessionId}/tabs/capture

# Scrape data
POST /api/browser/{sessionId}/tabs/{tabId}/scrape
{"selector":".item","fields":{"title":".title::text"}}
```

---

## 📋 All Chrome Extension Endpoints

### Session Management
| Method | Endpoint |
|--------|----------|
| GET | `/api/websocket/sessions` |
| GET | `/api/websocket/sessions/{sessionId}` |
| POST | `/api/websocket/sessions/{sessionId}/message` |

### Tab Management
| Method | Endpoint |
|--------|----------|
| POST | `/api/browser/{sessionId}/tabs/create` |
| GET | `/api/browser/{sessionId}/tabs` |
| PATCH | `/api/browser/{sessionId}/tabs/{tabId}` |
| DELETE | `/api/browser/{sessionId}/tabs/{tabId}` |

### Navigation
| Method | Endpoint |
|--------|----------|
| POST | `/api/browser/{sessionId}/tabs/{tabId}/reload` |
| POST | `/api/browser/{sessionId}/tabs/{tabId}/back` |
| POST | `/api/browser/{sessionId}/tabs/{tabId}/forward` |

### Element Interaction
| Method | Endpoint |
|--------|----------|
| POST | `/api/browser/{sessionId}/tabs/{tabId}/click` |
| POST | `/api/browser/{sessionId}/tabs/{tabId}/type` |
| POST | `/api/browser/{sessionId}/tabs/{tabId}/fill` |
| POST | `/api/browser/{sessionId}/tabs/{tabId}/scrape` |
| POST | `/api/browser/{sessionId}/tabs/{tabId}/scroll` |
| POST | `/api/browser/{sessionId}/tabs/{tabId}/execute` |

### Screenshot
| Method | Endpoint |
|--------|----------|
| POST | `/api/browser/{sessionId}/tabs/capture` |

---

## 🔥 Common Debugging Issues

### Issue: "Session not found" (404)
**Solution:** Get valid sessionId from `/api/websocket/sessions`

### Issue: "Session is not connected" (503)
**Solution:** Reload extension, wait 10s for auto-reconnect

### Issue: executeScript fails (CSP violation)
**Solution:** Use `scrape` endpoint instead. Known limitation on Instagram, GitHub

### Issue: "Element not found"
**Solution:** Take screenshot, test selector with executeScript first

### Issue: "selector/text/code is required" (400)
**Solution:** Include required parameter in request body

**Remember:** All debugging info is in HTTP response - NO server logs needed!

---

## ✅ Success Response Format

```json
{
  "success": true,
  "sessionId": "ext_abc123def456",
  "requestId": "req123abc",
  "result": { ... },
  "timestamp": 1772127000000
}
```

## ❌ Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "timestamp": 1772127000000
}
```

---

## 📝 Example: Complete Workflow

```bash
# 1. Get sessions
GET /api/websocket/sessions

# 2. Use sessionId
sessionId = "ext_abc123def456"

# 3. Create tab
POST /api/browser/{sessionId}/tabs/create
{"url":"https://example.com"}

# 4. Get tabId from response
tabId = 123456

# 5. Click button
POST /api/browser/{sessionId}/tabs/{tabId}/click
{"selector":"#submit"}

# 6. Screenshot to verify
POST /api/browser/{sessionId}/tabs/capture

# 7. Scrape results
POST /api/browser/{sessionId}/tabs/{tabId}/scrape
{"selector":".result","fields":{"text":"::text"}}
```

---

## 🚨 HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Read result from JSON |
| 400 | Bad Request | Check parameters |
| 404 | Not Found | Session/tab/element missing |
| 503 | Service Unavailable | Extension disconnected |
| 500 | Server Error | Read error message |

---

## 📚 Documentation Files

- **Playwright API:** `API_BLUEPRINT.md`
- **Chrome Extension API:** `CHROME_EXTENSION_API.md`
- **Debugging Guide:** `DEBUGGING_GUIDE.md`
- **This Quick Ref:** `QUICK_REFERENCE.md`

---

**Last Updated:** 2026-02-26
**Version:** 2.0.2
