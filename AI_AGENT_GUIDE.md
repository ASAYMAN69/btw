# Browse The Web (BTW) - AI Agent Guide

> **Purpose**: This guide is designed specifically for AI models and agents to understand and use the Browse The Web (BTW) browser automation tool effectively.

---

## 🎯 What is BTW?

**BTW (Browse The Web)** is a browser automation API that allows AI agents to control a real Chromium browser through HTTP endpoints. Think of it as giving you "eyes and hands" to interact with the web.

**Why would an AI need this?**
- To see websites as they appear to humans
- To interact with dynamic JavaScript-heavy sites
- To extract data from modern web applications
- To understand website structure, design, and functionality
- To perform web scraping and research
- To automate browser-based workflows

**When should you use BTW?**
- When you need to understand a website's visual structure
- When a website requires JavaScript to render content
- When API endpoints aren't available or documented
- When you need to interact with forms, buttons, or other UI elements
- When you need to see how a website behaves in a real browser
- When you need to capture screenshots or visual evidence

**When should you NOT use BTW?**
- When the website has a public REST API (use that instead)
- When you only need static HTML content (use a simpler HTTP client)
- When the task doesn't require browser rendering

---

## 🏗️ Architecture Overview

### Key Concepts

**Single Browser Instance**
- BTW runs ONE browser instance at a time (singleton pattern)
- Browser auto-launches when the server starts
- Multiple tabs can exist within this single browser
- Each tab runs in an isolated browser context (cookies, localStorage are separate per tab)

**Session-Based Tab Management**
- Each tab has a unique `sessionId` (UUID v4)
- You MUST use the `sessionId` for all tab operations
- Tabs persist until manually closed (no automatic timeout)
- Multiple tabs can exist simultaneously

**Media Storage**
- Screenshots and PDFs are saved to disk (not base64 in responses)
- Files are stored in `btw_media/` directory in the user's home directory
- Response returns the file path, not the actual file content
- This reduces token consumption for large images

### Server Details

- **Base URL**: `http://localhost:3000`
- **API prefix**: All endpoints are under `/api/`
- **Port**: 3000 (default)
- **Format**: JSON requests and responses
- **Engine**: Node.js with Express and Playwright (Chromium)

---

## 🚀 Quick Start Checklist

When you need to use BTW, follow this sequence:

1. **Check if server is running** (optional, but good practice)
   ```
   GET /api/health
   ```

2. **Check browser status** (auto-launched on startup)
   ```
   GET /api/browser/status
   ```

3. **Create a tab** (returns `sessionId`)
   ```
   POST /api/tabs/create
   Body: {} (empty object or with options)
   ```
   **IMPORTANT**: Save the `sessionId` from the response. You'll need it for all subsequent requests.

4. **Navigate to a URL**
   ```
   POST /api/tabs/{sessionId}/goto
   Body: {"url": "https://example.com"}
   ```

5. **Wait for page to load** (always wait after navigation)
   ```
   POST /api/tabs/{sessionId}/wait/navigation
   Body: {} (empty object)
   ```

6. **Perform your operations** (screenshot, extract data, click, etc.)

7. **Close the tab** (when done)
   ```
   DELETE /api/tabs/{sessionId}/close
   ```
   **IMPORTANT**: Always close tabs when you're done to free resources.

---

## 📋 Complete API Reference

### 🔧 Browser Management

#### GET /api/browser/status
Check if browser is launched and get info.

**Response**:
```json
{
  "isLaunched": true,
  "isConnected": true,
  "pid": 12345,
  "contexts": []
}
```

**Usage**: Use this to verify the browser is running before creating tabs.

---

#### POST /api/browser/launch
Launch the browser (usually auto-launched on startup).

**Request Body**:
```json
{
  "headless": true,
  "devtools": false,
  "slowMo": 0
}
```

**Parameters**:
- `headless` (boolean, optional): Run without visible UI. Default: `true`
- `devtools` (boolean, optional): Open Chrome DevTools. Default: `false`
- `slowMo` (number, optional): Slow down actions by milliseconds. Default: `0`

**Response**:
```json
{
  "success": true,
  "message": "Browser launched successfully"
}
```

**Note**: Browser is auto-launched on server start, so this endpoint is rarely needed.

---

#### POST /api/browser/close
Close the browser and all tabs.

**Response**:
```json
{
  "success": true,
  "message": "Browser closed successfully"
}
```

**Warning**: This closes ALL tabs immediately.

---

#### POST /api/browser/restart
Restart the browser.

**Request Body**:
```json
{
  "headless": true,
  "devtools": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Browser restarted successfully"
}
```

**Use Case**: Use if browser becomes unresponsive or needs fresh state.

---

### 📑 Tab Management

#### POST /api/tabs/create
Create a new tab and get a session ID.

**Request Body**:
```json
{
  "viewport": {"width": 1920, "height": 1080},
  "userAgent": "Mozilla/5.0...",
  "locale": "en-US"
}
```

**Parameters**:
- `viewport` (object, optional): Screen size. Default: `{"width": 1920, "height": 1080}`
- `userAgent` (string, optional): Custom browser user agent
- `locale` (string, optional): Browser locale. Default: `"en-US"`

**Response**:
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Tab created successfully",
  "createdAt": 1234567890000
}
```

**CRITICAL**: Save the `sessionId` value. You MUST use this for ALL subsequent tab operations.

---

#### GET /api/tabs/list
List all active tabs.

**Response**:
```json
{
  "tabs": [
    {
      "sessionId": "uuid",
      "url": "https://example.com",
      "title": "Example Domain",
      "createdAt": 1234567890000
    }
  ]
}
```

**Usage**: Use to see all active tabs and their URLs.

---

#### GET /api/tabs/{sessionId}/info
Get detailed information about a specific tab.

**Response**:
```json
{
  "sessionId": "uuid",
  "url": "https://example.com",
  "title": "Example Domain",
  "viewport": {"width": 1920, "height": 1080},
  "createdAt": 1234567890000
}
```

---

#### DELETE /api/tabs/{sessionId}/close
Close a specific tab.

**Response**:
```json
{
  "success": true,
  "message": "Tab closed successfully"
}
```

**IMPORTANT**: Always close tabs when done to free resources.

---

### 🧭 Navigation

#### POST /api/tabs/{sessionId}/goto
Navigate to a URL.

**Request Body**:
```json
{
  "url": "https://example.com"
}
```

**Parameters**:
- `url` (string, required): Full URL including protocol (http:// or https://)

**Response**:
```json
{
  "success": true,
  "url": "https://example.com/",
  "title": "Example Domain"
}
```

**Best Practices**:
- Always include protocol (http:// or https://)
- Always use `wait/navigation` or `wait/selector` after navigating
- Check for HTTP redirects in the returned URL

---

#### POST /api/tabs/{sessionId}/back
Go back in browser history.

**Response**:
```json
{
  "success": true
}
```

---

#### POST /api/tabs/{sessionId}/forward
Go forward in browser history.

**Response**:
```json
{
  "success": true
}
```

---

#### POST /api/tabs/{sessionId}/reload
Reload the current page.

**Response**:
```json
{
  "success": true
}
```

---

### 🖼️ Screenshots & PDFs

#### POST /api/tabs/{sessionId}/screenshot
Take a screenshot of the current page.

**Request Body**:
```json
{
  "type": "png",
  "fullPage": false
}
```

**Parameters**:
- `type` (string, optional): Image format. Options: `"png"`, `"jpeg"`. Default: `"png"`
- `fullPage` (boolean, optional): Capture entire scrollable page. Default: `false` (viewport only)
- `quality` (number, optional): JPEG quality (1-100). Only for JPEG. Default: `80`

**Response**:
```json
{
  "success": true,
  "filePath": "/home/username/btw_media/screenshot_1771615728077_ff22jq.png",
  "fileName": "screenshot_1771615728077_ff22jq.png",
  "extension": "png",
  "type": "png"
}
```

**CRITICAL**: The screenshot is saved to disk at the `filePath`. The response returns the path, not the image data.

**File Storage**:
- Screenshots are saved in `btw_media/` in the user's home directory
- Filename format: `screenshot_<timestamp>_<random>.png`
- The path is platform-specific (Linux: `/home/username/btw_media/`, Windows: `C:\Users\username\btw_media\`)

**Usage**:
1. Navigate to the desired page
2. Wait for the page to load completely
3. Call the screenshot endpoint
4. The file path is returned in the response
5. The file is saved on the server's filesystem

**Use Cases**:
- Visual verification of page state
- Debugging layout issues
- Documenting page appearance
- Analyzing visual design

---

#### POST /api/tabs/{sessionId}/pdf
Generate a PDF of the current page.

**Request Body**:
```json
{
  "format": "A4",
  "printBackground": true
}
```

**Parameters**:
- `format` (string, optional): Paper size. Options: `"A4"`, `"Letter"`, `"Legal"`, `"Tabloid"`. Default: `"A4"`
- `printBackground` (boolean, optional): Include background graphics/colors. Default: `true`

**Response**:
```json
{
  "success": true,
  "filePath": "/home/username/btw_media/pdf_1771615449415_xa1npl.pdf",
  "fileName": "pdf_1771615449415_xa1npl.pdf"
}
```

**CRITICAL**: The PDF is saved to disk at the `filePath`, similar to screenshots.

---

### 🔍 Content Extraction

#### POST /api/tabs/{sessionId}/evaluate
Execute JavaScript in the page context and get results.

**Request Body**:
```json
{
  "script": "document.title"
}
```

**Parameters**:
- `script` (string, required): JavaScript code to execute

**Response**:
```json
{
  "success": true,
  "result": "Page Title"
}
```

**Common Use Cases**:
- Get page title: `document.title`
- Get page URL: `window.location.href`
- Get all text: `document.body.innerText`
- Get meta description: `document.querySelector('meta[name="description"]')?.content`
- Get structured data: `JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)`

**Examples**:
```javascript
// Get all links
Array.from(document.querySelectorAll('a')).map(a => ({
  text: a.textContent,
  href: a.href
}))

// Get all headings
Array.from(document.querySelectorAll('h1,h2,h3')).map(h => ({
  tag: h.tagName,
  text: h.textContent
}))

// Get page structure
const structure = {
  title: document.title,
  meta: Array.from(document.querySelectorAll('meta')).map(m => ({
    name: m.name || m.property,
    content: m.content
  })),
  headings: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => h.textContent)
};
JSON.stringify(structure, null, 2)
```

---

### 🎯 Element Discovery

#### POST /api/tabs/{sessionId}/elements/find
Find multiple elements matching a selector.

**Request Body**:
```json
{
  "selector": "a.link",
  "limit": 10
}
```

**Parameters**:
- `selector` (string, required): CSS selector
- `type` (string, optional): Selector type. Options: `"css"`, `"xpath"`. Default: `"css"`
- `limit` (number, optional): Maximum elements to return. Default: `10`

**Response**:
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

**Usage**: Use to discover elements on a page before interacting with them.

---

#### POST /api/tabs/{sessionId}/element/info
Get detailed information about the first matching element.

**Request Body**:
```json
{
  "selector": "input#email"
}
```

**Parameters**:
- `selector` (string, required): CSS selector
- `type` (string, optional): Selector type. Options: `"css"`, `"xpath"`. Default: `"css"`

**Response**:
```json
{
  "tagName": "INPUT",
  "id": "email",
  "className": "form-input",
  "text": "",
  "attributes": {
    "type": "email",
    "id": "email",
    "name": "email",
    "placeholder": "Enter email"
  },
  "visible": true,
  "enabled": true
}
```

**Usage**: Use to understand element properties before interacting.

---

### 👆 Element Interaction

#### POST /api/tabs/{sessionId}/element/click
Click an element.

**Request Body**:
```json
{
  "selector": "button.submit"
}
```

**Parameters**:
- `selector` (string, required): CSS selector to identify the element
- `clickCount` (number, optional): Number of times to click. Default: `1`
- `delay` (number, optional): Delay between clicks in ms. Default: `0`

**Response**:
```json
{
  "success": true,
  "message": "Element clicked"
}
```

**Best Practices**:
- verify element exists before clicking using `element/info` or `elements/find`
- Wait for element to be visible before clicking
- Use `wait/navigation` after clicking if it causes page navigation

---

#### POST /api/tabs/{sessionId}/element/fill
Fill an input field with text (clears existing value first).

**Request Body**:
```json
{
  "selector": "input#email",
  "text": "user@example.com"
}
```

**Parameters**:
- `selector` (string, required): CSS selector
- `text` (string, required): Text to enter

**Response**:
```json
{
  "success": true,
  "message": "Element filled"
}
```

**Works with**: `<input>`, `<textarea>`, `<select>`, `[contenteditable]`, elements with `aria-readonly` role

---

#### POST /api/tabs/{sessionId}/element/type
Type text character by character (simulates real typing).

**Request Body**:
```json
{
  "selector": "input#search",
  "text": "search query",
  "delay": 50
}
```

**Parameters**:
- `selector` (string, required): CSS selector
- `text` (string, required): Text to type
- `delay` (number, optional): Delay between keystrokes in ms. Default: `0`

**Response**:
```json
{
  "success": true,
  "message": "Text typed"
}
```

**Use Case**: Use when websites have autocomplete or other behaviors triggered by typing.

---

#### POST /api/tabs/{sessionId}/element/hover
Hover over an element.

**Request Body**:
```json
{
  "selector": "button.menu"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Element hovered"
}
```

**Use Case**: Trigger hover effects, dropdown menus, tooltips.

---

#### POST /api/tabs/{sessionId}/element/focus
Focus an element.

**Request Body**:
```json
{
  "selector": "input#search"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Element focused"
}
```

**Use Case**: Prepare element for typing or trigger focus-related events.

---

#### POST /api/tabs/{sessionId}/element/click-at
Click at specific coordinates on the page.

**Request Body**:
```json
{
  "x": 500,
  "y": 300
}
```

**Parameters**:
- `x` (number, required): X coordinate
- `y` (number, required): Y coordinate

**Response**:
```json
{
  "success": true,
  "message": "Clicked at coordinates"
}
```

**Use Case**: Click elements that are difficult to select, or trigger canvas-based interactions.

---

### ⏱️ Waiting & Synchronization

#### POST /api/tabs/{sessionId}/wait/timeout
Wait for a specific amount of time.

**Request Body**:
```json
{
  "ms": 1000
}
```

**Parameters**:
- `ms` (number, required): Milliseconds to wait

**Response**:
```json
{
  "success": true,
  "message": "Waited 1000ms"
}
```

**Use Case**: Static delays, waiting for animations.

---

#### POST /api/tabs/{sessionId}/wait/selector
Wait for an element to appear in a specific state.

**Request Body**:
```json
{
  "selector": "button.submit",
  "timeout": 5000,
  "state": "visible"
}
```

**Parameters**:
- `selector` (string, required): CSS selector
- `timeout` (number, optional): Maximum wait time in ms. Default: `5000`
- `state` (string, optional): What to wait for. Options: `"attached"`, `"detached"`, `"visible"`, `"hidden"`. Default: `"visible"`

**Response**:
```json
{
  "success": true,
  "message": "Element found: visible"
}
```

**Best Practice**: ALWAYS use this before interacting with elements.

---

#### POST /api/tabs/{sessionId}/wait/navigation
Wait for page navigation to complete.

**Request Body**:
```json
{
  "timeout": 30000
}
```

**Parameters**:
- `timeout` (number, optional): Maximum wait time in ms. Default: `30000`

**Response**:
```json
{
  "success": true,
  "message": "Navigation completed"
}
```

**Best Practice**: ALWAYS use this after clicking links, submitting forms, or navigating.

---

#### POST /api/tabs/{sessionId}/wait/network-idle
Wait for network requests to finish.

**Request Body**:
```json
{
  "timeout": 30000
}
```

**Parameters**:
- `timeout` (number, optional): Maximum wait time in ms. Default: `30000`

**Response**:
```json
{
  "success": true,
  "message": "Network idle"
}
```

**Use Case**: Wait for all AJAX/fetch requests to complete (e.g., after page load or form submission).

---

### 🍪 Cookies & Storage

#### GET /api/tabs/{sessionId}/cookies
Get all cookies for the current tab.

**Response**:
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

#### POST /api/tabs/{sessionId}/cookies/set
Set a cookie.

**Request Body**:
```json
{
  "name": "session",
  "value": "abc123",
  "domain": ".example.com",
  "path": "/"
}
```

---

#### DELETE /api/tabs/{sessionId}/cookies/clear
Clear all cookies for the tab.

**Response**:
```json
{
  "success": true,
  "message": "Cookies cleared"
}
```

---

#### GET /api/tabs/{sessionId}/storage/local
Get localStorage content.

**Response**:
```json
{
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

---

#### POST /api/tabs/{sessionId}/storage/local/set
Set a localStorage item.

**Request Body**:
```json
{
  "key": "username",
  "value": "john"
}
```

---

#### DELETE /api/tabs/{sessionId}/storage/local/clear
Clear all localStorage.

---

#### GET /api/tabs/{sessionId}/storage/session
Get sessionStorage content.

**Response**:
```json
{
  "data": {
    "key1": "value1"
  }
}
```

---

#### POST /api/tabs/{sessionId}/storage/session/set
Set a sessionStorage item.

**Request Body**:
```json
{
  "key": "token",
  "value": "abc123"
}
```

---

#### DELETE /api/tabs/{sessionId}/storage/session/clear
Clear all sessionStorage.

---

### 🌐 Network Monitoring

#### GET /api/tabs/{sessionId}/network/requests
Get all captured network requests.

**Query Parameters**:
- `limit` (number, optional): Max requests to return. Default: `100`

**Response**:
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

#### POST /api/tabs/{sessionId}/network/clear
Clear all captured network logs.

---

#### GET /api/tabs/{sessionId}/network/:requestId
Get detailed information about a specific network request.

**Response**:
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

### 🖥️ Console Monitoring

#### GET /api/tabs/{sessionId}/console/logs
Get captured console logs.

**Response**:
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

**Log Types**: `"log"`, `"info"`, `"warn"`, `"error"`, `"debug"`

---

#### POST /api/tabs/{sessionId}/console/clear
Clear captured console logs.

---

### ⌨️ Keyboard & Mouse

#### POST /api/tabs/{sessionId}/keyboard/press
Press a keyboard key.

**Request Body**:
```json
{
  "key": "Enter",
  "delay": 0
}
```

**Parameters**:
- `key` (string, required): Key name. Examples: `"Enter"`, `"Escape"`, `"a"`, `"F1"`, `"Control"`, `"Shift"`
- `delay` (number, optional): Delay in ms. Default: `0`

**Response**:
```json
{
  "success": true,
  "message": "Key pressed"
}
```

---

#### POST /api/tabs/{sessionId}/keyboard/type
Type text directly.

**Request Body**:
```json
{
  "text": "Hello World",
  "delay": 50
}
```

**Parameters**:
- `text` (string, required): Text to type
- `delay` (number, optional): Delay between keystrokes. Default: `0`

**Response**:
```json
{
  "success": true,
  "message": "Text typed"
}
```

---

#### POST /api/tabs/{sessionId}/mouse/click
Click at current mouse position (after moving).

**Request Body**:
```json
{
  "x": 100,
  "y": 200,
  "button": "left",
  "clickCount": 1
}
```

**Parameters**:
- `x` (number, required): X coordinate
- `y` (number, required): Y coordinate
- `button` (string, optional): `"left"`, `"right"`, `"middle"`. Default: `"left"`
- `clickCount` (number, optional): Number of clicks. Default: `1`

---

#### POST /api/tabs/{sessionId}/mouse/move
Move mouse to coordinates.

**Request Body**:
```json
{
  "x": 500,
  "y": 300
}
```

---

### 🔐 Permissions

#### POST /api/tabs/{sessionId}/permissions/grant
Grant permissions to the page.

**Request Body**:
```json
{
  "permissions": ["geolocation", "notifications"]
}
```

**Available Permissions**: `"geolocation"`, `"notifications"`, `"camera"`, `"microphone"`, `"clipboard-read"`, `"clipboard-write"`

**Response**:
```json
{
  "success": true,
  "permissions": ["geolocation", "notifications"]
}
```

---

#### DELETE /api/tabs/{sessionId}/permissions/clear
Clear all granted permissions.

---

### 🎭 Device Emulation

#### POST /api/tabs/{sessionId}/emulation/viewport
Set viewport size (emulate device screen).

**Request Body**:
```json
{
  "width": 375,
  "height": 667,
  "isMobile": true
}
```

**Parameters**:
- `width` (number, required): Width in pixels
- `height` (number, required): Height in pixels
- `isMobile` (boolean, optional): Enable mobile emulation features. Default: `false`

**Common Mobile Viewports**:
- iPhone SE: 375 x 667
- iPhone 12/13: 390 x 844
- iPhone 12/13 Pro Max: 428 x 926
- Android: 360 x 640
- iPad: 768 x 1024

---

#### POST /api/tabs/{sessionId}/emulation/user-agent
Set custom user agent string.

**Request Body**:
```json
{
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)..."
}
```

---

#### POST /api/tabs/{sessionId}/emulation/geolocation
Set geolocation coordinates.

**Request Body**:
```json
{
  "latitude": 51.507351,
  "longitude": -0.127758,
  "accuracy": 100
}
```

**Parameters**:
- `latitude` (number, required): Latitude in degrees
- `longitude` (number, required): Longitude in degrees
- `accuracy` (number, optional): Accuracy in meters. Default: `100`

---

#### POST /api/tabs/{sessionId}/emulation/media
Set media features (color scheme, reduced motion, etc.).

**Request Body**:
```json
{
  "colorScheme": "dark",
  "reducedMotion": "reduce"
}
```

**Parameters**:
- `colorScheme` (string, optional): `"light"`, `"dark"`, `"no-preference"`
- `reducedMotion` (string, optional): `"reduce"`, `"no-preference"`
- `media` (string, optional): `"screen"`, `"print"`

---

### 📁 File Operations

#### POST /api/tabs/{sessionId}/file/upload
Upload files to an `<input type="file">` element.

**Request Body**:
```json
{
  "selector": "input[type='file']",
  "files": ["/path/to/file.txt", "/path/to/image.png"]
}
```

**Parameters**:
- `selector` (string, required): CSS selector for file input element
- `files` (array, required): Array of file paths (must be on the server filesystem)

**Response**:
```json
{
  "success": true,
  "message": "Files uploaded"
}
```

**Limitation**: Files must exist on the server filesystem. Cannot upload files from the client's machine.

---

### 📊 Health & Status

#### GET /api/health
Check if API server is running.

**Response**:
```json
{
  "status": "ok",
  "timestamp": 1234567890123
}
```

---

## 🎓 Common Workflows & Use Cases

### Use Case 1: Understanding Website Structure

**Scenario**: An AI agent needs to understand how a website is built, its layout, design, and functionality.

**Workflow**:
1. Create a tab
2. Navigate to the website URL
3. Wait for page to load
4. Take a screenshot to see the visual layout
5. Extract page structure (headings, meta tags, main sections)
6. Find all links and buttons to understand navigation
7. Extract styles and layout information
8. Close the tab

**Example**:
```bash
# 1. Create tab
POST /api/tabs/create
# Response: {"success": true, "sessionId": "abc123"}

# 2. Navigate
POST /api/tabs/abc123/goto
Body: {"url": "https://example.com"}

# 3. Wait for load
POST /api/tabs/abc123/wait/navigation

# 4. Take screenshot
POST /api/tabs/abc123/screenshot
Body: {"type": "png"}
# Response: {"success": true, "filePath": "/home/user/btw_media/screenshot_...png"}

# 5. Extract structure
POST /api/tabs/abc123/evaluate
Body: {"script": "Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({tag: h.tagName, text: h.textContent}))"}

# 6. Find links
POST /api/tabs/abc123/evaluate
Body: {"script": "Array.from(document.querySelectorAll('a')).map(a => ({text: a.textContent, href: a.href})).slice(0, 20)"}

# 7. Close tab
DELETE /api/tabs/abc123/close
```

---

### Use Case 2: Web Scraping Dynamic Content

**Scenario**: Scrape data from a Single Page Application (SPA) that requires JavaScript to render.

**Workflow**:
1. Create tab
2. Navigate to URL
3. Wait for network idle (all AJAX requests complete)
4. Locate data elements using CSS selectors
5. Extract data using JavaScript evaluation
6. Handle pagination (click next buttons)
7. Repeat until all data collected
8. Close tab

**Example**:
```bash
# Create tab and navigate
POST /api/tabs/create
POST /api/tabs/{sessionId}/goto {"url": "https://example.com/products"}

# Wait for data to load
POST /api/tabs/{sessionId}/wait/network-idle

# Extract product data
POST /api/tabs/{sessionId}/evaluate
Body: {
  "script": "Array.from(document.querySelectorAll('.product-card')).map(p => ({name: p.querySelector('.name')?.textContent, price: p.querySelector('.price')?.textContent}))"
}

# Pagination (if needed)
POST /api/tabs/{sessionId}/element/click {"selector": ".next-page"}
POST /api/tabs/{sessionId}/wait/network-idle
# Extract more data...
```

---

### Use Case 3: Form Automation

**Scenario**: Fill out and submit a form programmatically.

**Workflow**:
1. Create tab
2. Navigate to form URL
3. Wait for form to load
4. Fill each input field
5. Submit the form
6. Wait for navigation
7. Verify result
8. Close tab

**Example**:
```bash
# Navigate
POST /api/tabs/{sessionId}/goto {"url": "https://example.com/signup"}

# Wait
POST /api/tabs/{sessionId}/wait/selector {"selector": "form"}

# Fill fields
POST /api/tabs/{sessionId}/element/fill {"selector": "#username", "text": "testuser"}
POST /api/tabs/{sessionId}/element/fill {"selector": "#email", "text": "test@example.com"}
POST /api/tabs/{sessionId}/element/fill {"selector": "#password", "text": "password123"}

# Submit
POST /api/tabs/{sessionId}/element/click {"selector": "button[type='submit']"}

# Wait for result
POST /api/tabs/{sessionId}/wait/navigation

# Verify
POST /api/tabs/{sessionId}/evaluate {"script": "document.body.innerText.includes('Welcome')")
```

---

### Use Case 4: Verifying Cross-Browser Layout

**Scenario**: Check how a website appears on different devices.

**Workflow**:
1. Create tab with desktop viewport
2. Take screenshot
3. Create new tab with mobile viewport
4. Take screenshot
5. Compare images
6. Close both tabs

**Example**:
```bash
# Desktop
POST /api/tabs/create {"viewport": {"width": 1920, "height": 1080}}
POST /api/tabs/{sessionId}/goto {"url": "https://example.com"}
POST /api/tabs/{sessionId}/wait/navigation
POST /api/tabs/{sessionId}/screenshot {"type": "png"}
DELETE /api/tabs/{sessionId}/close

# Mobile (iPhone)
POST /api/tabs/create {"viewport": {"width": 375, "height": 667, "isMobile": true}}
POST /api/tabs/{sessionId}/goto {"url": "https://example.com"}
POST /api/tabs/{sessionId}/wait/navigation
POST /api/tabs/{sessionId}/screenshot {"type": "png"}
DELETE /api/tabs/{sessionId}/close
```

---

### Use Case 5: Debugging JavaScript Errors

**Scenario**: Find and capture console errors from a website.

**Workflow**:
1. Create tab
2. Navigate to URL
3. Wait for load
4. Get console logs
5. Extract errors
6. Take screenshot of error state
7. Close tab

**Example**:
```bash
POST /api/tabs/create
POST /api/tabs/{sessionId}/goto {"url": "https://example.com"}
POST /api/tabs/{sessionId}/wait/navigation
GET /api/tabs/{sessionId}/console/logs
# Response includes all logs including errors
POST /api/tabs/{sessionId}/close
```

---

### Use Case 6: Testing Responsive Design

**Scenario**: Test website at multiple viewport sizes.

**Workflow**:
1. Create tab
2. Navigate to URL
3. For each viewport size:
   - Set viewport
   - Take screenshot
   - Extract layout info
4. Close tab

**Example**:
```bash
POST /api/tabs/create
POST /api/tabs/{sessionId}/goto {"url": "https://example.com"}

# Test different sizes
POST /api/tabs/{sessionId}/emulation/viewport {"width": 1920, "height": 1080}
POST /api/tabs/{sessionId}/screenshot

POST /api/tabs/{sessionId}/emulation/viewport {"width": 768, "height": 1024}
POST /api/tabs/{sessionId}/screenshot

POST /api/tabs/{sessionId}/emulation/viewport {"width": 375, "height": 667}
POST /api/tabs/{sessionId}/screenshot

DELETE /api/tabs/{sessionId}/close
```

---

### Use Case 7: Monitoring API Calls

**Scenario**: Understand what API endpoints a frontend application uses.

**Workflow**:
1. Create tab
2. Clear network logs
3. Navigate to URL
4. Trigger the action that makes API calls
5. Wait for network idle
6. Get network requests
7. Analyze endpoints, methods, payloads
8. Close tab

**Example**:
```bash
POST /api/tabs/create
POST /api/tabs/{sessionId}/network/clear
POST /api/tabs/{sessionId}/goto {"url": "https://example.com"}
POST /api/tabs/{sessionId}/element/click {"selector": ".load-data"}
POST /api/tabs/{sessionId}/wait/network-idle
GET /api/tabs/{sessionId}/network/requests
# Response includes all API calls with URLs, methods, headers
DELETE /api/tabs/{sessionId}/close
```

---

## ⚠️ Common Pitfalls & How to Avoid Them

### Pitfall 1: Not Waiting for Elements

**Problem**: Trying to click an element before it appears.

**Solution**: Always use `wait/selector` before interacting:
```bash
# WRONG - clicks immediately, may fail if element not ready
POST /api/tabs/{sessionId}/element/click {"selector": ".button"}

# CORRECT - waits for element first
POST /api/tabs/{sessionId}/wait/selector {"selector": ".button"}
POST /api/tabs/{sessionId}/element/click {"selector": ".button"}
```

---

### Pitfall 2: Not Waiting After Navigation

**Problem**: Trying to extract data before page loads.

**Solution**: Always use `wait/navigation` after `goto`:
```bash
POST /api/tabs/{sessionId}/goto {"url": "https://example.com"}
POST /api/tabs/{sessionId}/wait/navigation
POST /api/tabs/{sessionId}/evaluate {"script": "document.title"}
```

---

### Pitfall 3: Incorrect CSS Selectors

**Problem**: Using selectors that don't match any elements.

**Solution**: Use `elements/find` to verify selectors first:
```bash
# First, find elements to verify selector works
POST /api/tabs/{sessionId}/elements/find {"selector": ".button", "limit": 1}
# If total > 0, then the selector is valid

# Now safely click
POST /api/tabs/{sessionId}/element/click {"selector": ".button"}
```

---

### Pitfall 4: Forgetting to Close Tabs

**Problem**: Leaving tabs open consumes memory.

**Solution**: Always close tabs when done:
```bash
# Do your work...
DELETE /api/tabs/{sessionId}/close
```

---

### Pitfall 5: Assuming Screenshots Return Image Data

**Problem**: Expecting base64 image data in screenshot response.

**Solution**: Screenshots save to disk; response returns file path:
```bash
POST /api/tabs/{sessionId}/screenshot {"type": "png"}
# Response: {"success": true, "filePath": "/home/user/btw_media/screenshot_...png"}
# Note: No base64 data in response - file is on server filesystem
```

---

### Pitfall 6: Not Handling Dynamic Content

**Problem**: Trying to extract data before JavaScript loads it.

**Solution**: Use `wait/network-idle` for SPAs:
```bash
POST /api/tabs/{sessionId}/goto {"url": "https://example.com"}
POST /api/tabs/{sessionId}/wait/network-idle  # Waits for all AJAX requests
POST /api/tabs/{sessionId}/evaluate {"script": "..."}
```

---

### Pitfall 7: Using Wrong Session ID

**Problem**: Mixing up session IDs when working with multiple tabs.

**Solution**: Always store and use the correct `sessionId`:
```bash
# Create tab 1
TAB1=$(curl -s -X POST http://localhost:3000/api/tabs/create | jq -r '.sessionId')

# Create tab 2
TAB2=$(curl -s -X POST http://localhost:3000/api/tabs/create | jq -r '.sessionId')

# Use correct session IDs
POST /api/tabs/${TAB1}/goto {"url": "https://site1.com"}
POST /api/tabs/${TAB2}/goto {"url": "https://site2.com"}
```

---

## 🧪 Testing Troubleshooting

### Error: "Browser not launched"

**Cause**: Browser instance hasn't been started.

**Solution**:
```bash
# Check browser status
GET /api/browser/status

# If not launched, launch it
POST /api/browser/launch
```

---

### Error: "Invalid or expired session ID"

**Cause**: The `sessionId` doesn't exist or the tab was closed.

**Solution**:
```bash
# List active tabs to find correct session ID
GET /api/tabs/list

# Create new tab if needed
POST /api/tabs/create
```

---

### Error: "Element not found"

**Cause**: The CSS selector doesn't match any elements.

**Solution**:
```bash
# Verify selector works
POST /api/tabs/{sessionId}/elements/find {"selector": ".target", "limit": 10}

# If total is 0, try different selector:
# - Use more specific selector
# - Check if element requires scrolling into view
# - Wait for element to appear
POST /api/tabs/{sessionId}/wait/selector {"selector": ".target"}
```

---

### Error: "Timeout exceeded"

**Cause**: Wait condition didn't meet within timeout period.

**Solution**:
```bash
# Increase timeout
POST /api/tabs/{sessionId}/wait/selector {"selector": ".slow-element", "timeout": 10000}

# Or use network-idle instead for SPAs
POST /api/tabs/{sessionId}/wait/network-idle {"timeout": 30000}
```

---

## 📚 Advanced JavaScript Snippets

### Extract Complete Page Structure
```javascript
(() => {
  const structure = {
    url: window.location.href,
    title: document.title,
    meta: Array.from(document.querySelectorAll('meta')).map(m => ({
      name: m.name || m.property,
      content: m.content
    })),
    headings: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent.trim()
    })),
    links: Array.from(document.querySelectorAll('a[href]')).slice(0, 20).map(a => ({
      text: a.textContent.trim().substring(0, 50),
      href: a.href
    })),
    forms: Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action || window.location.href,
      method: f.method || 'GET',
      inputs: Array.from(f.querySelectorAll('input,select,textarea')).map(i => ({
        type: i.type || i.tagName.toLowerCase(),
        name: i.name,
        id: i.id
      }))
    })),
    scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
    images: Array.from(document.querySelectorAll('img')).slice(0, 10).map(i => ({
      src: i.src,
      alt: i.alt,
      width: i.naturalWidth,
      height: i.naturalHeight
    }))
  };
  return JSON.stringify(structure, null, 2);
})()
```

### Detect Framework Used
```javascript
(() => {
  const frameworks = {
    React: () => !!window.React || !!document.querySelector('[data-reactroot]'),
    Vue: () => !!window.Vue || !!document.querySelector('[data-v-]'),
    Angular: () => !!window.ng || !!document.querySelector('[ng-app]'),
    jQuery: () => !!window.jQuery,
    Ember: () => !!window.Ember,
    Backbone: () => !!window.Backbone,
    Svelte: () => !!document.querySelector('[data-svelte-h]'),
  };
  const detected = Object.entries(frameworks)
    .filter(([_, test]) => test())
    .map(([name]) => name);
  return detected.length > 0 ? detected : ['Unknown'];
})()
```

### Get All API Endpoints
```javascript
Array.from(performance.getEntriesByType('resource'))
  .filter(r => r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest')
  .map(r => ({
    url: r.name,
    type: r.initiatorType,
    duration: r.duration
  }))
  .reverse()
```

### Extract JSON-LD Structured Data
```javascript
Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
  .map(s => {
    try {
      return JSON.parse(s.textContent);
    } catch (e) {
      return null;
    }
  })
  .filter(Boolean)
```

### Analyze Page Performance Metrics
```javascript
(() => {
  const perf = performance.timing;
  return {
    domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
    pageLoad: perf.loadEventEnd - perf.navigationStart,
    domReady: perf.domInteractive - perf.domLoading,
    firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
  };
})()
```

---

## 🔒 Security Considerations

### Input Sanitization
- Always validate and sanitize user-provided URLs before navigation
- Escape special characters in CSS selectors
- Validate file paths before upload operations

### Resource Limits
- Close tabs after use to prevent memory exhaustion
- Use reasonable timeouts (5-30 seconds) for wait operations
- Limit the number of concurrent tabs

### Sensitive Data
- Be cautious with cookies and storage - may contain authentication tokens
- Don't expose screenshots or PDFs of sensitive pages
- Clear cookies and storage after authentication testing

### Browser Isolation
- Each tab runs in an isolated browser context
- Cookies and localStorage are NOT shared between tabs
- Create separate tabs for different users/logins

---

## 📊 Performance Tips

### Optimize Navigation
1. Use `wait/network-idle` for SPAs instead of long timeouts
2. Disable images if not needed: set browser args `--blink-settings=imagesEnabled=false`
3. Use headless mode for faster execution

### Efficient Data Extraction
1. Use `evaluate` for complex data extraction (more efficient than multiple API calls)
2. Limit results with `limit` parameter in `elements/find`
3. Cache repeated queries

### Tab Management
1. Reuse tabs when possible (close only when necessary)
2. Clear network logs periodically to reduce memory
3. Close tabs after long-running tasks

---

## 🤝 Best Practices Summary

1. **Always create a tab before any navigation**
2. **Always wait for elements before interacting**
3. **Always wait after navigation before extraction**
4. **Always close tabs when done**
5. **Always use correct `sessionId`**
6. **Always validate selectors before using them**
7. **Never mix up session IDs**
8. **Never assume elements exist without verification**
9. **Never forget that screenshots save to disk (not base64)**
10. **Never leave tabs open indefinitely**

---

## 📖 Example Scenarios for Vibe Coders

### Scenario: "Build me a website like Apple.com"

As an AI, you would:
1. Use BTW to navigate to Apple.com
2. Take screenshots to see the visual design
3. Extract the layout structure (hero sections, product grids, etc.)
4. Analyze the CSS and color schemes
5. Understand the navigation patterns
6. Extract content structure and copy
7. Note any animations or interactive elements
8. Use this information to guide your code generation

### Scenario: "Why is this site slow?"

As an AI, you would:
1. Navigate to the problematic URL
2. Monitor network requests to identify slow endpoints
3. Check console logs for JavaScript errors
4. Analyze performance metrics
5. Look for large images or unoptimized assets
6. Suggest specific optimizations based on findings

### Scenario: "Debug why my login form isn't working"

As an AI, you would:
1. Navigate to the login page
2. Inspect the form structure
3. Try filling and submitting the form
4. Monitor network requests to see what's sent
5. Check response status and error messages
6. Analyze console logs for JavaScript errors
7. Provide specific debugging information

### Scenario: "Analyze competitor websites"

As an AI, you would:
1. Navigate to competitor sites
2. Capture screenshots and compare layouts
3. Extract pricing, features, and other competitive information
4. Analyzed their UX patterns and user flows
5. Identify strengths and weaknesses
6. Provide competitive analysis report

### Scenario: "Extract product data from an e-commerce site"

As an AI, you would:
1. Navigate to product listing pages
2. Wait for products to load (network idle)
3. Extract product names, prices, images, ratings
4. Handle pagination by clicking next buttons
5. Save extracted data to a structured format
6. Handle variations and edge cases

### Scenario: "Test my site on mobile"

As an AI, you would:
1. Create tabs with various mobile viewports
2. Navigate to your site with each viewport
3. Take screenshots for visual comparison
4. Test touch interactions (taps, swipes)
5. Test mobile-specific features (hamburger menus, etc.)
6. Identify mobile-specific issues

---

## 🎯 Quick Reference Commands

```bash
# Server Operations
GET /api/health                          # Check server status
GET /api/browser/status                 # Check browser status
POST /api/browser/launch                # Launch browser
POST /api/browser/close                 # Close all tabs and browser

# Tab Operations
POST /api/tabs/create                   # Create new tab (get sessionId)
GET /api/tabs/list                      # List all tabs
GET /api/tabs/{sessionId}/info          # Get tab details
DELETE /api/tabs/{sessionId}/close      # Close tab

# Navigation
POST /api/tabs/{sessionId}/goto         # Navigate to URL
POST /api/tabs/{sessionId}/back         # Go back
POST /api/tabs/{sessionId}/forward      # Go forward
POST /api/tabs/{sessionId}/reload       # Reload page

# Content Extraction
POST /api/tabs/{sessionId}/screenshot   # Take screenshot (saves to disk)
POST /api/tabs/{sessionId}/pdf          # Generate PDF (saves to disk)
POST /api/tabs/{sessionId}/evaluate     # Execute JavaScript

# Element Discovery
POST /api/tabs/{sessionId}/elements/find       # Find elements
POST /api/tabs/{sessionId}/element/info        # Get element details

# Interaction
POST /api/tabs/{sessionId}/element/click      # Click element
POST /api/tabs/{sessionId}/element/fill       # Fill input
POST /api/tabs/{sessionId}/element/type       # Type text
POST /api/tabs/{sessionId}/element/hover      # Hover element
POST /api/tabs/{sessionId}/element/focus      # Focus element

# Waiting
POST /api/tabs/{sessionId}/wait/timeout       # Wait for time
POST /api/tabs/{sessionId}/wait/selector      # Wait for element
POST /api/tabs/{sessionId}/wait/navigation    # Wait for navigation
POST /api/tabs/{sessionId}/wait/network-idle  # Wait for network

# Storage
GET /api/tabs/{sessionId}/cookies             # Get cookies
POST /api/tabs/{sessionId}/cookies/set        # Set cookie
DELETE /api/tabs/{sessionId}/cookies/clear    # Clear cookies
GET /api/tabs/{sessionId}/storage/local       # Get localStorage
POST /api/tabs/{sessionId}/storage/local/set  # Set localStorage
DELETE /api/tabs/{sessionId}/storage/local/clear # Clear localStorage

# Network
GET /api/tabs/{sessionId}/network/requests    # Get network requests
POST /api/tabs/{sessionId}/network/clear      # Clear network logs

# Console
GET /api/tabs/{sessionId}/console/logs        # Get console logs
POST /api/tabs/{sessionId}/console/clear      # Clear console logs

# Keyboard/Mouse
POST /api/tabs/{sessionId}/keyboard/press     # Press key
POST /api/tabs/{sessionId}/keyboard/type      # Type text
POST /api/tabs/{sessionId}/mouse/move        # Move mouse
POST /api/tabs/{sessionId}/mouse/click        # Click at position

# Emulation
POST /api/tabs/{sessionId}/emulation/viewport     # Set viewport
POST /api/tabs/{sessionId}/emulation/user-agent  # Set user agent
POST /api/tabs/{sessionId}/emulation/geolocation # Set geolocation
POST /api/tabs/{sessionId}/emulation/media       # Set media features

# Permissions
POST /api/tabs/{sessionId}/permissions/grant     # Grant permissions
DELETE /api/tabs/{sessionId}/permissions/clear   # Clear permissions
```

---

## 📞 Support & Resources

- **API Blueprint**: See `API_BLUEPRINT.md` for complete technical reference
- **Project Structure**: See `README.md` for installation and setup
- **Troubleshooting**: See "Common Pitfalls & How to Avoid Them" section

---

## 🎉 Conclusion

BTW provides AI agents with complete browser automation capabilities through simple HTTP endpoints. By following this guide and understanding the common workflows, you can effectively use BTW to:

- Understand website structure and design
- Scrape dynamic content from modern web applications
- Automate browser-based workflows
- Test and debug web applications
- Analyze competitor websites
- Perform research across multiple websites

**Key Takeaways**:
- Always use `sessionId` for tab operations
- Always wait for elements and navigation
- Screenshots save to disk (file paths returned)
- Always close tabs when done
- Check the API Blueprint for complete endpoint details

Happy browsing! 🌐
