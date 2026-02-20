# Browse The Web (BTW) - Complete API Blueprint

## Architecture Overview
**Browse The Web (BTW)** - An AI-powered browser automation API that gives AI agents and applications full control over a Chromium browser through simple HTTP endpoints.

- **Backend**: Node.js with Express
- **Browser Engine**: Playwright (Chromium)
- **Pattern**: Singleton browser instance with multiple browser contexts (tabs)
- **API Style**: REST+JSON
- **Port**: 3000 (configurable)
- **Health Check**: `GET /api/health`

## Quick Start
```bash
# Launch browser
curl -X POST http://localhost:3000/api/browser/launch

# Create tab
curl -X POST http://localhost:3000/api/tabs/create

# Navigate
curl -X POST http://localhost:3000/api/tabs/{tabId}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Get data
curl -X POST http://localhost:3000/api/tabs/{tabId}/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.title"}'

# Close browser
curl -X POST http://localhost:3000/api/browser/close
```

---

## Browser Lifecycle Management

### POST /api/browser/launch
Launch the browser instance. Browser must be launched before creating tabs.

**Request:**
```json
{
  "headless": false,
  "devtools": false,
  "slowMo": 0,
  "args": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Browser launched successfully"
}
```

**Parameters:**
- `headless` (boolean, optional): Run in headless mode. Default: `false`
- `devtools` (boolean, optional): Open DevTools. Default: `false`
- `slowMo` (number, optional): Slow actions by this many ms. Default: `0`
- `args` (array, optional): Additional browser arguments

---

### POST /api/browser/close
Close the browser instance. All tabs will be closed.

**Response:**
```json
{
  "success": true,
  "message": "Browser closed successfully"
}
```

---

### POST /api/browser/restart
Restart the browser instance.

**Request:**
```json
{
  "headless": false,
  "devtools": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Browser restarted successfully"
}
```

---

### GET /api/browser/status
Get browser status and info.

**Response:**
```json
{
  "launched": true,
  "contexts": [
    {
      "id": "uuid",
      "pages": [
        {
          "id": "page-id",
          "url": "https://example.com",
          "title": "Page Title"
        }
      ]
    }
  ],
  "version": "chromium-version"
}
```

---

## Tab/Context Management

### POST /api/tabs/create
Create a new browser context (tab). Browser must be launched first.

**Request:**
```json
{
  "viewport": {"width": 1920, "height": 1080},
  "userAgent": null,
  "locale": "en-US"
}
```

**Response:**
```json
{
  "tabId": "uuid",
  "message": "Tab created successfully"
}
```

**Parameters:**
- `viewport` (object, optional): Default `{width: 1920, height: 1080}`
- `userAgent` (string, optional): Custom user agent
- `locale` (string, optional): Locale string (e.g., "en-US")

---

### GET /api/tabs/list
List all browser contexts (tabs).

**Response:**
```json
{
  "tabs": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "title": "Page Title",
      "isActive": true,
      "createdAt": 1234567890
    }
  ]
}
```

---

### GET /api/tabs/:tabId/info
Get info about a specific tab.

**Response:**
```json
{
  "id": "uuid",
  "url": "https://example.com",
  "title": "Page Title",
  "viewport": {"width": 1920, "height": 1080},
  "isActive": true,
  "createdAt": 1234567890
}
```

---

### POST /api/tabs/:tabId/switch
Switch to a specific tab (makes it active).

**Response:**
```json
{
  "success": true,
  "message": "Tab switched successfully",
  "tabId": "uuid"
}
```

---

### DELETE /api/tabs/:tabId/close
Close a specific tab and its context.

**Response:**
```json
{
  "success": true,
  "message": "Tab closed successfully"
}
```

---

## Navigation

### POST /api/tabs/:tabId/goto
Navigate to URL.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/"
}
```

---

### POST /api/tabs/:tabId/back
Go back in history.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/forward
Go forward in history.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/reload
Reload the page.

**Response:**
```json
{
  "success": true
}
```

---

## Element Querying

### POST /api/tabs/:tabId/elements/find
Find multiple elements matching a selector.

**Request:**
```json
{
  "selector": "a.link",
  "type": "css",
  "limit": 10
}
```

**Response:**
```json
{
  "elements": [
    {
      "index": 0,
      "tagName": "A",
      "text": "Link text",
      "visible": true,
      "boundingBox": {
        "x": 100,
        "y": 200,
        "width": 150,
        "height": 30
      }
    }
  ],
  "total": 1
}
```

**Parameters:**
- `selector` (string, required): CSS or XPath selector
- `type` (string, optional): "css" or "xpath". Default: "css"
- `limit` (number, optional): Max elements to return. Default: `10`

---

### POST /api/tabs/:tabId/element/info
Get detailed information about the first element matching the selector.

**Request:**
```json
{
  "selector": "input#email",
  "type": "css"
}
```

**Response:**
```json
{
  "tagName": "INPUT",
  "text": "",
  "value": "",
  "visible": true,
  "enabled": true,
  "attributes": {
    "type": "email",
    "id": "email",
    "name": "email"
  },
  "boundingBox": {
    "x": 100,
    "y": 200,
    "width": 300,
    "height": 40
  }
}
```

---

### POST /api/tabs/:tabId/element/wait
Wait for an element to appear in a specific state.

**Request:**
```json
{
  "selector": "button.submit",
  "timeout": 5000,
  "state": "visible"
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `selector` (string, required): Element selector
- `timeout` (number, optional): Timeout in ms. Default: `5000`
- `state` (string, optional): "attached", "detached", "visible", "hidden". Default: `"visible"`

---

## Page Interaction

### POST /api/tabs/:tabId/element/click
Click an element.

**Request:**
```json
{
  "selector": "button.submit",
  "clickCount": 1,
  "delay": 0
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `selector` (string, required): Element selector
- `clickCount` (number, optional): Number of clicks. Default: `1`
- `delay` (number, optional): Delay between clicks in ms. Default: `0`

---

### POST /api/tabs/:tabId/element/type
Type text character by character.

**Request:**
```json
{
  "selector": "input#email",
  "text": "user@example.com",
  "delay": 0
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `selector` (string, required): Element selector
- `text` (string, required): Text to type
- `delay` (number, optional): Delay between keystrokes in ms. Default: `0`

---

### POST /api/tabs/:tabId/element/fill
Fill element with text (clears existing value first).

**Request:**
```json
{
  "selector": "input#email",
  "text": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

**Note:** Works with `<input>`, `<textarea>`, `<select>`, `[contenteditable]`, and elements with `aria-readonly` role.

---

### POST /api/tabs/:tabId/element/hover
Hover over an element.

**Request:**
```json
{
  "selector": "button.menu"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/element/scroll
Scroll an element or the page.

**Request:**
```json
{
  "selector": "div.scrollable",
  "scrollX": 0,
  "scrollY": 100
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `selector` (string, optional): Element to scroll. If null, scrolls page
- `scrollX` (number, optional): Horizontal scroll amount. Default: `0`
- `scrollY` (number, optional): Vertical scroll amount. Default: `100`

---

### POST /api/tabs/:tabId/element/focus
Focus an element.

**Request:**
```json
{
  "selector": "input#search"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/element/click-at
Click at specific coordinates on the page.

**Request:**
```json
{
  "x": 500,
  "y": 300
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/element/tap
Tap (touch) an element.

**Request:**
```json
{
  "selector": "button.mobile-btn"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/element/double-click
Double click an element.

**Request:**
```json
{
  "selector": "div.card"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/element/right-click
Right click an element (context menu).

**Request:**
```json
{
  "selector": "img.thumbnail"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Screenshot & PDF

### POST /api/tabs/:tabId/screenshot
Take a screenshot of the page or element.

**Request:**
```json
{
  "type": "png",
  "fullPage": false,
  "quality": 80
}
```

**Response:**
```json
{
  "data": "base64-encoded-image-data",
  "type": "png",
  "fullPage": false
}
```

**Parameters:**
- `type` (string, optional): "png" or "jpeg". Default: `"png"`
- `fullPage` (boolean, optional): Capture full page. Default: `false`
- `quality` (number, optional): JPEG quality (1-100). Only applies to jpeg. Default: `80`

---

### POST /api/tabs/:tabId/element/screenshot
Take a screenshot of a specific element.

**Request:**
```json
{
  "selector": "div.content",
  "type": "png"
}
```

**Response:**
```json
{
  "data": "base64-encoded-image-data",
  "selector": "div.content",
  "type": "png"
}
```

**Parameters:**
- `selector` (string, required): Element selector
- `type` (string, optional): "png" or "jpeg". Default: `"png"`

---

### POST /api/tabs/:tabId/pdf
Generate PDF of the page.

**Request:**
```json
{
  "format": "A4",
  "printBackground": true
}
```

**Response:**
```json
{
  "data": "base64-encoded-pdf-data"
}
```

**Parameters:**
- `format` (string, optional): Paper format. Default: `"A4"`
- `printBackground` (boolean, optional): Print backgrounds. Default: `true`

---

## Network Monitoring

### GET /api/tabs/:tabId/network/requests
Get all captured network requests.

**Query Parameters:**
- `limit` (number, optional): Max requests to return. Default: `100`

**Response:**
```json
{
  "requests": [
    {
      "id": "request-id",
      "url": "https://example.com/api/data",
      "method": "GET",
      "headers": {},
      "resourceType": "xhr",
      "timestamp": 1234567890
    }
  ]
}
```

---

### POST /api/tabs/:tabId/network/clear
Clear all captured network logs.

**Response:**
```json
{
  "success": true
}
```

---

### GET /api/tabs/:tabId/network/request/:requestId
Get details of a specific network request.

**Response:**
```json
{
  "request": {
    "id": "request-id",
    "url": "https://example.com/api/data",
    "method": "GET",
    "headers": {},
    "body": "",
    "resourceType": "xhr",
    "timestamp": 1234567890
  },
  "response": {
    "id": "request-id",
    "url": "https://example.com/api/data",
    "status": 200,
    "statusText": "OK",
    "headers": {},
    "ok": true,
    "timestamp": 1234567891
  }
}
```

---

### POST /api/tabs/:tabId/network/intercept
Start/stop network interception for specific patterns.

**Request:**
```json
{
  "enabled": true,
  "patterns": ["**/*", "https://api.example.com/*"]
}
```

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "patterns": ["**/*", "https://api.example.com/*"]
}
```

**Note:** When `enabled` is false or patterns is empty, interception is stopped.

---

### POST /api/tabs/:tabId/network/abort
Aborts requests matching the pattern.

**Request:**
```json
{
  "pattern": "**/*.png"
}
```

**Response:**
```json
{
  "success": true,
  "patterns": ["**/*.png"]
}
```

---

### POST /api/tabs/:tabId/network/mock-response
Mock responses for specific URL patterns.

**Request:**
```json
{
  "pattern": "/api/test",
  "status": 200,
  "headers": {"Content-Type": "application/json"},
  "body": "{\"result\": \"mocked\"}"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## DevTools & Console

### GET /api/tabs/:tabId/console/logs
Get captured console logs.

**Response:**
```json
{
  "logs": [
    {
      "type": "log",
      "text": "Console message",
      "location": {
        "url": "https://example.com",
        "lineNumber": 123,
        "columnNumber": 45
      },
      "timestamp": 1234567890
    }
  ]
}
```

**Log types:** "log", "info", "warn", "error", "debug"

---

### POST /api/tabs/:tabId/console/clear
Clear captured console logs.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/devtools/open
Open DevTools ( limitation: DevTools control is not directly available via Playwright API).

**Response:**
```json
{
  "error": "DevTools control is not directly available via Playwright API."
}
```

---

### POST /api/tabs/:tabId/devtools/close
Close DevTools ( limitation: DevTools control is not directly available via Playwright API).

**Response:**
```json
{
  "error": "DevTools control is not directly available via Playwright API."
}
```

---

## Script Execution

### POST /api/tabs/:tabId/evaluate
Execute JavaScript in the page context.

**Request:**
```json
{
  "script": "document.title",
  "await": false
}
```

**Response:**
```json
{
  "result": "Page Title"
}
```

**Parameters:**
- `script` (string, required): JavaScript code to execute
- `await` (boolean, optional): Use async/await. Default: `false`

**Note:** Script is executed using `eval()`. Use with caution.

---

## Form Handling

### POST /api/tabs/:tabId/form/submit
Submit a form.

**Request:**
```json
{
  "selector": "form#login"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/form/reset
Reset a form to its default values.

**Request:**
```json
{
  "selector": "form#login"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/form/fill-multiple
Fill multiple form fields at once.

**Request:**
```json
{
  "fields": {
    "#username": "user123",
    "#password": "secret",
    "input[type=\"email\"]": "user@example.com"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Cookie & Storage Management

### GET /api/tabs/:tabId/cookies
Get all cookies for the tab.

**Response:**
```json
{
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": "example.com",
      "path": "/",
      "expires": 1234567890,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ]
}
```

---

### POST /api/tabs/:tabId/cookies/set
Set a cookie.

**Request:**
```json
{
  "name": "session",
  "value": "abc123",
  "domain": ".example.com",
  "path": "/",
  "expires": 1234567890
}
```

**Response:**
```json
{
  "success": true
}
```

---

### DELETE /api/tabs/:tabId/cookies/clear
Clear all cookies for the tab.

**Response:**
```json
{
  "success": true
}
```

---

### DELETE /api/tabs/:tabId/cookies/:name
Delete a specific cookie by name.

**Response:**
```json
{
  "success": true,
  "deleted": true
}
```

---

### GET /api/tabs/:tabId/storage/local
Get localStorage content.

**Response:**
```json
{
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

---

### POST /api/tabs/:tabId/storage/local/set
Set a localStorage item.

**Request:**
```json
{
  "key": "username",
  "value": "john"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### DELETE /api/tabs/:tabId/storage/local/clear
Clear all localStorage.

**Response:**
```json
{
  "success": true
}
```

---

### GET /api/tabs/:tabId/storage/session
Get sessionStorage content.

**Response:**
```json
{
  "data": {
    "key1": "value1"
  }
}
```

---

### POST /api/tabs/:tabId/storage/session/set
Set a sessionStorage item.

**Request:**
```json
{
  "key": "token",
  "value": "abc123"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### DELETE /api/tabs/:tabId/storage/session/clear
Clear all sessionStorage.

**Response:**
```json
{
  "success": true
}
```

---

## Wait Conditions

### POST /api/tabs/:tabId/wait/timeout
Wait for a specific timeout.

**Request:**
```json
{
  "ms": 1000
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/wait/load
Wait for page to load.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/wait/navigation
Wait for navigation to complete.

**Request:**
```json
{
  "url": "https://example.com/next",
  "waitUntil": "load",
  "timeout": 30000
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `url` (string, optional): Wait for specific URL
- `waitUntil` (string, optional): "load", "domcontentloaded", "networkidle". Default: `"load"`
- `timeout` (number, optional): Timeout in ms. Default: `30000`

---

### POST /api/tabs/:tabId/wait/signal
Wait for a response containing the signal string.

**Request:**
```json
{
  "signal": "/api/data",
  "timeout": 30000
}
```

**Response:**
```json
{
  "success": true
}
```

**Description:** Waits for a network response whose URL contains the `signal` string.

---

### POST /api/tabs/:tabId/wait/network-idle
Wait for network to be idle.

**Request:**
```json
{
  "timeout": 30000
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/wait/selector
Wait for a selector to appear.

**Request:**
```json
{
  "selector": "button.submit",
  "timeout": 5000,
  "state": "visible"
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `selector` (string, required): Element selector
- `timeout` (number, optional): Timeout in ms. Default: `5000`
- `state` (string, optional): "attached", "detached", "visible", "hidden". Default: `"visible"`

---

## Device Emulation

### POST /api/tabs/:tabId/emulation/viewport
Set the viewport size.

**Request:**
```json
{
  "width": 375,
  "height": 667,
  "isMobile": true
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `width` (number, required): Width in pixels
- `height` (number, required): Height in pixels
- `isMobile` (boolean, optional): Enable mobile emulation. Default: `false`

---

### POST /api/tabs/:tabId/emulation/user-agent
Set custom user agent.

**Request:**
```json
{
  "userAgent": "Mozilla/5.0 Custom"
}
```

**Response:**
```json
{
  "success": true,
  "userAgent": "Mozilla/5.0 Custom"
}
```

---

### POST /api/tabs/:tabId/emulation/geolocation
Set geolocation coordinates.

**Request:**
```json
{
  "latitude": 51.507351,
  "longitude": -0.127758
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/emulation/media
Set media features (color scheme, reduced motion, etc.).

**Request:**
```json
{
  "media": "screen",
  "colorScheme": "dark",
  "reducedMotion": "reduce"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Dialog Handling

### POST /api/tabs/:tabId/dialog/accept
Accept (confirm) any dialog that appears.

**Request:**
```json
{
  "promptText": "default text"
}
```

**Response:**
```json
{
  "success": true
}
```

**Note:** Sets up a handler for future dialogs. Does not accept existing dialogs.

---

### POST /api/tabs/:tabId/dialog/dismiss
Dismiss (cancel) any dialog that appears.

**Response:**
```json
{
  "success": true
}
```

**Note:** Sets up a handler for future dialogs. Does not dismiss existing dialogs.

---

### POST /api/tabs/:tabId/dialog/on
Setup a dialog handler for future dialogs.

**Request:**
```json
{
  "action": "accept",
  "promptText": "default text"
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `action` (string, required): "accept" or "dismiss"
- `promptText` (string, optional): Default text for prompt dialogs

---

## File Operations

### POST /api/tabs/:tabId/file/upload
Upload files to an `<input type="file">` element.

**Request:**
```json
{
  "selector": "input[type=file]",
  "files": ["/path/to/file.txt"]
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/file/download-start
Enable download handling.

**Response:**
```json
{
  "success": true,
  "message": "Download handling enabled"
}
```

---

### POST /api/tabs/:tabId/file/download-stop
Disable download handling.

**Response:**
```json
{
  "success": true
}
```

---

### GET /api/tabs/:tabId/file/downloads
List pending downloads.

**Response:**
```json
{
  "downloading": false
}
```

Or if downloading:
```json
{
  "downloading": true,
  "suggestedFilename": "file.pdf"
}
```

---

## Keyboard & Mouse Actions

### POST /api/tabs/:tabId/keyboard/down
Press a key down.

**Request:**
```json
{
  "key": "Control"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/keyboard/up
Release a key.

**Request:**
```json
{
  "key": "Control"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/keyboard/press
Press and release a key.

**Request:**
```json
{
  "key": "Enter",
  "delay": 0
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `key` (string, required): Key name (e.g., "Enter", "Escape", "a", "F1")
- `delay` (number, optional): Delay between down and up. Default: `0`

---

### POST /api/tabs/:tabId/keyboard/type
Type keyboard input directly.

**Request:**
```json
{
  "text": "Hello World",
  "delay": 0
}
```

**Response:**
```json
{
  "success": true
}
```

**Parameters:**
- `text` (string, required): Text to type
- `delay` (number, optional): Delay between keystrokes. Default: `0`

---

### POST /api/tabs/:tabId/mouse/move
Move mouse to coordinates.

**Request:**
```json
{
  "x": 100,
  "y": 200
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/mouse/down
Press a mouse button down.

**Request:**
```json
{
  "button": "left",
  "clickCount": 1
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/mouse/up
Release a mouse button.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/mouse/wheel
Scroll mouse wheel.

**Request:**
```json
{
  "deltaX": 0,
  "deltaY": 100
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Frame Handling

### GET /api/tabs/:tabId/frames
List all frames on the page.

**Response:**
```json
{
  "frames": [
    {
      "id": "frame-id",
      "name": "main",
      "url": "https://example.com",
      "parent": null
    },
    {
      "id": "frame-id-2",
      "name": "iframe",
      "url": "https://example.com/iframe.html",
      "parent": "frame-id"
    }
  ]
}
```

---

### POST /api/tabs/:tabId/frames/:frameId/evaluate
Execute JavaScript in a specific frame.

**Request:**
```json
{
  "script": "document.body.innerText"
}
```

**Response:**
```json
{
  "result": "Frame content"
}
```

---

## Accessibility

### GET /api/tabs/:tabId/accessibility/tree
Get the accessibility tree of the page.

**Response:**
```json
{
  "tree": null,
  "message": "Accessibility not available in this browser version"
}
```

**Note:** This feature may not work in all browser versions.

---

### GET /api/tabs/:tabId/accessibility/snapshot
Get an accessibility snapshot of the page.

**Response:**
```json
{
  "snapshot": null,
  "message": "Accessibility not available in this browser version"
}
```

**Note:** This feature may not work in all browser versions.

---

## Performance

### GET /api/tabs/:tabId/performance/metrics
Get performance metrics.

**Response:**
```json
{
  "metrics": {
    "Timestamp": 123456.789,
    "Documents": 1,
    "Frames": 1,
    "JSEventListeners": 10,
    "LayoutObjects": 100,
    "RecalcStyleCount": 5,
    "LayoutDuration": 123.45,
    "RecalcStyleDuration": 45.67,
    "ScriptDuration": 789.01
  }
}
```

---

### POST /api/tabs/:tabId/performance/trace-start
Start performance tracing.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/performance/trace-stop
Stop performance tracing and return trace data.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/performance/coverage-start
Start JS/CSS coverage collection.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/tabs/:tabId/performance/coverage-stop
Stop coverage collection and return data.

**Response:**
```json
{
  "jsCoverage": [
    {
      "url": "https://example.com/app.js",
      "ranges": [
        {"start": 0, "end": 100},
        {"start": 150, "end": 200}
      ],
      "text": "script code"
    }
  ],
  "cssCoverage": []
}
```

---

## WebSocket Monitoring

### GET /api/tabs/:tabId/websockets
List all WebSocket connections.

**Response:**
```json
{
  "websockets": [
    {
      "id": "ws-id",
      "url": "wss://example.com/socket",
      "opened": 1234567890,
      "messageCount": 10
    }
  ]
}
```

---

### GET /api/tabs/:tabId/websockets/:wsId/messages
Get messages from a specific WebSocket.

**Response:**
```json
{
  "messages": [
    {
      "server": false,
      "text": "Client message",
      "timestamp": 1234567890
    },
    {
      "server": true,
      "text": "Server response",
      "timestamp": 1234567891
    }
  ]
}
```

**Note:** Returns 404 if WebSocket with given ID not found.

---

## Permissions

### POST /api/tabs/:tabId/permissions/grant
Grant permissions to the page.

**Request:**
```json
{
  "permissions": ["geolocation", "notifications", "camera", "microphone"]
}
```

**Response:**
```json
{
  "success": true,
  "permissions": ["geolocation", "notifications"]
}
```

**Available permissions:** "geolocation", "notifications", "camera", "microphone", "clipboard-read", "clipboard-write"

---

### POST /api/tabs/:tabId/permissions/clear
Clear all granted permissions.

**Response:**
```json
{
  "success": true
}
```

---

## Health & Status

### GET /api/health
API health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1234567890123
}
```

---

## Error Handling

All endpoints may return errors in this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (invalid endpoint or resource)
- `500`: Internal Server Error

---

## Common Use Cases

### Web Scraping Example
```bash
# Navigate to page
curl -X POST http://localhost:3000/api/tabs/{tabId}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Wait for content
curl -X POST http://localhost:3000/api/tabs/{tabId}/wait/selector \
  -H "Content-Type: application/json" \
  -d '{"selector":".content"}'

# Extract data
curl -X POST http://localhost:3000/api/tabs/{tabId}/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.body.innerText"}'
```

### Form Automation Example
```bash
# Fill form
curl -X POST http://localhost:3000/api/tabs/{tabId/form/fill-multiple \
  -H "Content-Type: application/json" \
  -d '{"fields":{"#username":"user","#password":"pass"}}'

# Submit
curl -X POST http://localhost:3000/api/tabs/{tabId/form/submit \
  -H "Content-Type: application/json" \
  -d '{"selector":"form#login"}'
```

### Screenshot Example
```bash
# Take full page screenshot
curl -X POST http://localhost:3000/api/tabs/{tabId}/screenshot \
  -H "Content-Type: application/json" \
  -d '{"fullPage":true,"type":"png"}' | \
  jq -r '.data' | base64 -d > screenshot.png
```

### Network Monitoring Example
```bash
# Start monitoring
curl -X POST http://localhost:3000/api/tabs/{tabId}/network/intercept \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'

# Navigate
curl -X POST http://localhost:3000/api/tabs/{tabId}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Get requests
curl http://localhost:3000/api/tabs/{tabId}/network/requests?limit=100
```

---

## Complete Endpoint List

### Browser (4 endpoints)
- `POST /api/browser/launch` - Launch browser
- `POST /api/browser/close` - Close browser
- `POST /api/browser/restart` - Restart browser
- `GET /api/browser/status` - Get browser status

### Tab Management (5 endpoints)
- `POST /api/tabs/create` - Create tab
- `GET /api/tabs/list` - List tabs
- `GET /api/tabs/:tabId/info` - Get tab info
- `POST /api/tabs/:tabId/switch` - Switch tab
- `DELETE /api/tabs/:tabId/close` - Close tab

### Navigation (4 endpoints)
- `POST /api/tabs/:tabId/goto` - Navigate to URL
- `POST /api/tabs/:tabId/back` - Go back
- `POST /api/tabs/:tabId/forward` - Go forward
- `POST /api/tabs/:tabId/reload` - Reload page

### Element Querying (3 endpoints)
- `POST /api/tabs/:tabId/elements/find` - Find multiple elements
- `POST /api/tabs/:tabId/element/info` - Get element info
- `POST /api/tabs/:tabId/element/wait` - Wait for element

### Page Interaction (10 endpoints)
- `POST /api/tabs/:tabId/element/click` - Click element
- `POST /api/tabs/:tabId/element/type` - Type text (character by character)
- `POST /api/tabs/:tabId/element/fill` - Fill element (clears first)
- `POST /api/tabs/:tabId/element/hover` - Hover element
- `POST /api/tabs/:tabId/element/scroll` - Scroll element/page
- `POST /api/tabs/:tabId/element/focus` - Focus element
- `POST /api/tabs/:tabId/element/click-at` - Click at coordinates
- `POST /api/tabs/:tabId/element/tap` - Tap (touch)
- `POST /api/tabs/:tabId/element/double-click` - Double click
- `POST /api/tabs/:tabId/element/right-click` - Right click

### Screenshots & PDF (3 endpoints)
- `POST /api/tabs/:tabId/screenshot` - Page screenshot
- `POST /api/tabs/:tabId/element/screenshot` - Element screenshot
- `POST /api/tabs/:tabId/pdf` - Generate PDF

### DevTools (2 endpoints)
- `POST /api/tabs/:tabId/devtools/open` - Open DevTools (not supported)
- `POST /api/tabs/:tabId/devtools/close` - Close DevTools (not supported)

### Network (5 endpoints)
- `GET /api/tabs/:tabId/network/requests` - Get all requests
- `POST /api/tabs/:tabId/network/clear` - Clear network logs
- `POST /api/tabs/:tabId/network/intercept` - Start/stop interception
- `POST /api/tabs/:tabId/network/abort` - Abort requests
- `POST /api/tabs/:tabId/network/mock-response` - Mock responses
- `GET /api/tabs/:tabId/network/request/:requestId` - Get request details

### Console (2 endpoints)
- `GET /api/tabs/:tabId/console/logs` - Get console logs
- `POST /api/tabs/:tabId/console/clear` - Clear console logs

### Script Execution (1 endpoint)
- `POST /api/tabs/:tabId/evaluate` - Execute JavaScript

### Forms (3 endpoints)
- `POST /api/tabs/:tabId/form/submit` - Submit form
- `POST /api/tabs/:tabId/form/reset` - Reset form
- `POST /api/tabs/:tabId/form/fill-multiple` - Fill multiple fields

### Cookies (4 endpoints)
- `GET /api/tabs/:tabId/cookies` - Get all cookies
- `POST /api/tabs/:tabId/cookies/set` - Set cookie
- `DELETE /api/tabs/:tabId/cookies/clear` - Clear all cookies
- `DELETE /api/tabs/:tabId/cookies/:name` - Delete specific cookie

### Storage (6 endpoints)
- `GET /api/tabs/:tabId/storage/local` - Get localStorage
- `POST /api/tabs/:tabId/storage/local/set` - Set localStorage item
- `DELETE /api/tabs/:tabId/storage/local/clear` - Clear localStorage
- `GET /api/tabs/:tabId/storage/session` - Get sessionStorage
- `POST /api/tabs/:tabId/storage/session/set` - Set sessionStorage item
- `DELETE /api/tabs/:tabId/storage/session/clear` - Clear sessionStorage

### Wait (6 endpoints)
- `POST /api/tabs/:tabId/wait/timeout` - Wait for timeout
- `POST /api/tabs/:tabId/wait/load` - Wait for page load
- `POST /api/tabs/:tabId/wait/navigation` - Wait for navigation
- `POST /api/tabs/:tabId/wait/signal` - Wait for response
- `POST /api/tabs/:tabId/wait/network-idle` - Wait for network idle
- `POST /api/tabs/:tabId/wait/selector` - Wait for selector

### Emulation (4 endpoints)
- `POST /api/tabs/:tabId/emulation/viewport` - Set viewport
- `POST /api/tabs/:tabId/emulation/user-agent` - Set user agent
- `POST /api/tabs/:tabId/emulation/geolocation` - Set geolocation
- `POST /api/tabs/:tabId/emulation/media` - Set media features

### Dialogs (3 endpoints)
- `POST /api/tabs/:tabId/dialog/accept` - Accept dialogs
- `POST /api/tabs/:tabId/dialog/dismiss` - Dismiss dialogs
- `POST /api/tabs/:tabId/dialog/on` - Setup dialog handler

### Files (4 endpoints)
- `POST /api/tabs/:tabId/file/upload` - Upload file
- `POST /api/tabs/:tabId/file/download-start` - Start downloads
- `POST /api/tabs/:tabId/file/download-stop` - Stop downloads
- `GET /api/tabs/:tabId/file/downloads` - Get downloads

### Keyboard (4 endpoints)
- `POST /api/tabs/:tabId/keyboard/down` - Key down
- `POST /api/tabs/:tabId/keyboard/up` - Key up
- `POST /api/tabs/:tabId/keyboard/press` - Press key
- `POST /api/tabs/:tabId/keyboard/type` - Type text

### Mouse (4 endpoints)
- `POST /api/tabs/:tabId/mouse/move` - Move mouse
- `POST /api/tabs/:tabId/mouse/down` - Mouse down
- `POST /api/tabs/:tabId/mouse/up` - Mouse up
- `POST /api/tabs/:tabId/mouse/wheel` - Mouse wheel

### Frames (2 endpoints)
- `GET /api/tabs/:tabId/frames` - List frames
- `POST /api/tabs/:tabId/frames/:frameId/evaluate` - Evaluate in frame

### Accessibility (2 endpoints)
- `GET /api/tabs/:tabId/accessibility/tree` - Get accessibility tree
- `GET /api/tabs/:tabId/accessibility/snapshot` - Get accessibility snapshot

### Performance (4 endpoints)
- `GET /api/tabs/:tabId/performance/metrics` - Get metrics
- `POST /api/tabs/:tabId/performance/trace-start` - Start trace
- `POST /api/tabs/:tabId/performance/trace-stop` - Stop trace
- `POST /api/tabs/:tabId/performance/coverage-start` - Start coverage
- `POST /api/tabs/:tabId/performance/coverage-stop` - Stop coverage

### WebSocket (2 endpoints)
- `GET /api/tabs/:tabId/websockets` - List WebSockets
- `GET /api/tabs/:tabId/websockets/:wsId/messages` - Get WebSocket messages

### Permissions (2 endpoints)
- `POST /api/tabs/:tabId/permissions/grant` - Grant permissions
- `POST /api/tabs/:tabId/permissions/clear` - Clear permissions

### Health (1 endpoint)
- `GET /api/health` - Health check

---

## Total Endpoints: **74**

All endpoints return JSON responses. Errors return `{ "error": "message" }` with appropriate HTTP status codes.
