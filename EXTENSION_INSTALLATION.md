## Extension Installation Guide

### Quick Installation

```bash
# Step 1: Build extension
npm run dev

# Step 2: Load in Chrome
# 1. Navigate to chrome://extensions
# 2. Enable "Developer mode" (top-right toggle)
# 3. Click "Load unpacked"
# 4. Select: dist/btw-chrome-extension/

# Step 3: Verify connection
curl http://localhost:5409/api/websocket/sessions
```

### Detailed Installation Steps

**Step 1: Build the Extension**

```bash
npm run dev
```

This generates the Chrome extension in the `dist/btw-chrome-extension/` directory.

**Step 2: Open Chrome Extensions Page**

Option 1: Navigate directly
```
chrome://extensions
```

Option 2: Use Chrome menu
```
⋮ (three dots) → More Tools → Extensions
```

**Step 3: Enable Developer Mode**

1. Look for toggle switch in top-right corner: "Developer mode"
2. Click to enable it
3. Additional extension tools will appear: "Load unpacked", "Pack extension", "Update"

**Step 4: Load the Extension**

1. Click the "Load unpacked" button
2. Navigate to your BTW project root directory
3. Select: `dist/btw-chrome-extension/`
4. Click "Select Folder"

**Step 5: Verify Installation**

The extension should now appear in your extensions list with:
- Name: "Browse The Web" or "BTW"
- Description: "AI Browser Automation"
- Version number
- Toggle switch (showing enabled/on)
- Connection indicator (green "Connected" if server is running)

### Troubleshooting Installation

**Extension Won't Load**

Symptom: "Load unpacked" button shows error or nothing happens

Solutions:
1. **Check if extension was built**
   ```bash
   ls -la dist/btw-chrome-extension/
   # Should see: manifest.json, background.js, icons/, etc.
   ```

2. **Build extension if missing**
   ```bash
   npm run dev
   ```

3. **Check for manifest errors**
   - Look at chrome://extensions
   - Find red error message on BTW extension
   - Click "Errors" button for details

**Extension Not Connecting**

Symptom: Extension loads but shows "Disconnected" or no connection indicator

Solutions:
1. **Verify server is running**
   ```bash
   curl http://localhost:5409/api/health
   # Should return: {"success":true,"status":"ok",...}
   ```

2. **Start server if not running**
   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Reload extension**
   - Go to chrome://extensions
   - Click reload button (circular arrow) on BTW extension
   - Should see connection indicator turn green

4. **Check for WebSocket errors**
   - Open browser console: F12 → Console tab
   - Look for "WebSocket connection failed" errors
   - Check server logs if needed

**Extension Disappears**

Symptom: Extension loaded but disappeared from list

Solutions:
1. **Check Chrome extensions settings**
   - chrome://extensions
   - Scroll through list - extension might be disabled
   - Look for "Browse The Web" or "BTW"
   - Enable toggle if disabled

2. **Use search bar**
   - Top-right of chrome://extensions
   - Type "BTW" or "Browse The Web"

3. **Check for Chrome policies**
   - Some organizations block custom extensions
   - Contact IT if in corporate environment

**Connection Drops Intermittently**

Symptom: Extension connects but randomly disconnects

Solutions:
1. **Check server logs for errors**
   ```bash
   # Server should log WebSocket connections
   ```

2. **Ensure server stays running**
   - Don't stop the server
   - Server must remain running for WebSocket to stay connected

3. **Reload extension**
   - Click reload button on extension
   - Extension will reconnect automatically

4. **Restart Chrome**
   - Close all Chrome windows
   - Reopen Chrome
   - Extension will auto-connect

### Common Installation Errors

**"Manifest file not found"**

Cause: Wrong directory selected or extension not built

Solution:
```bash
# Rebuild extension
npm run dev

# Select correct directory: dist/btw-chrome-extension/
# NOT: dist/ or project root
```

**"Permission denied"**

Cause: Extension requires permissions that user has denied

Solution:
- Extension needs `tabs`, `storage`, `activeTab` permissions
- Click extension icon → Review permissions → Accept

**"WebSocket connection failed"**

Cause: Server not running or wrong WebSocket URL

Solution:
```bash
# Start server
npm start

# Verify server is listening
curl http://localhost:5409/api/health

# Check extension WebSocket URL
# Should be: ws://localhost:5409/ws
```

### Verification Checklist

After installation, verify:

- [ ] Extension appears in chrome://extensions
- [ ] Extension toggle is enabled (right/on)
- [ ] Extension icon appears in toolbar (optional)
- [ ] Connection indicator shows green "Connected"
- [ ] Server is running: `curl http://localhost:5409/api/health`
- [ ] Session appears in API: `curl http://localhost:5409/api/websocket/sessions`
- [ ] No errors in chrome://extensions
- [ ] No errors in browser console (F12 → Console)

### Uninstalling the Extension

To remove the BTW extension:

1. Navigate to chrome://extensions
2. Find "Browse The Web" or "BTW"
3. Click "Remove" button
4. Confirm removal

To reinstall:
- Follow installation steps above
- OR click "Load unpacked" and select directory again

### Advanced Configuration

**Change WebSocket URL**

If running server on different host/port:

1. Find extension ID in chrome://extensions
2. Navigate to: chrome://extensions/{EXTENSION_ID}/
3. Extension will still connect to ws://localhost:5409/ws
4. Currently not configurable (hardcoded in extension)

**Enable Extension on Specific Sites**

By default, extension works on all sites with host permission `<all_urls>`.

To restrict:
- Edit: dist/btw-chrome-extension/manifest.json
- Change: `host_permissions` to specific domains
- Rebuild: `npm run dev`
- Reload extension in Chrome

**Debug Extension**

To see extension internal logs:

1. Navigate to chrome://extensions
2. Find BTW extension
3. Click "service worker" or "background page" link
4. DevTools opens showing extension logs
5. Look for WebSocket connection messages and errors

---

For more information:
- Main docs: CHROME_EXTENSION_API.md
- API reference: API_BLUEPRINT.md (Playwright system)
- Debugging guide: DEBUGGING_GUIDE.md
