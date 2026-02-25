# Chrome Tabs API - Priority Rankings

Based on importance for AI browser automation and control.

---

## 🔴 CRITICAL PRIORITY (Must Have - Core Automation)

| # | Chrome API Method | HTTP Endpoint | Status | Importance | Use Case |
|---|-------------------|---------------|--------|------------|----------|
| 1 | `chrome.tabs.create()` | POST /api/browser/:sessionId/tabs/create | ✅ **DONE** | **ESSENTIAL** | Opening pages to scrape/interact |
| 2 | `chrome.tabs.query()` | GET /api/browser/:sessionId/tabs | ✅ **DONE** | **ESSENTIAL** | Finding tabs, listing open pages |
| 3 | `chrome.tabs.update()` | PATCH /api/browser/:sessionId/tabs/:tabId | ✅ **DONE** | **ESSENTIAL** | Navigation, making tabs active |
| 4 | `chrome.tabs.remove()` | DELETE /api/browser/:sessionId/tabs/:tabId | ✅ **DONE** | **ESSENTIAL** | Closing tabs when done |

---

## 🟠 HIGH PRIORITY (Very Important for Automation)

| # | Chrome API Method | HTTP Endpoint | Status | Importance | Use Case |
|---|-------------------|---------------|--------|------------|----------|
| 5 | `chrome.tabs.reload()` | POST /api/browser/:sessionId/tabs/:tabId/reload | ⬜ TODO | **HIGH** | Refreshing pages, getting fresh content |
| 6 | `chrome.tabs.executeScript()` | POST /api/browser/:sessionId/tabs/:tabId/executeScript | ⬜ TODO | **HIGH** | Running JavaScript for data extraction |
| 7 | `chrome.tabs.goBack()` | POST /api/browser/:sessionId/tabs/:tabId/back | ⬜ TODO | **HIGH** | Navigation history - go back |
| 8 | `chrome.tabs.goForward()` | POST /api/browser/:sessionId/tabs/:tabId/forward | ⬜ TODO | **HIGH** | Navigation history - go forward |
| 9 | `chrome.tabs.captureVisibleTab()` | POST /api/browser/:sessionId/tabs/:tabId/screenshot | ⬜ TODO | **HIGH** | Screenshots for visual verification |
| 10 | `chrome.tabs.get()` | GET /api/browser/:sessionId/tabs/:tabId | ⬜ TODO | **HIGH** | Getting specific tab details |

---

## 🟡 MEDIUM PRIORITY (Useful for Advanced Automation)

| # | Chrome API Method | HTTP Endpoint | Status | Importance | Use Case |
|---|-------------------|---------------|--------|------------|----------|
| 11 | `chrome.tabs.sendMessage()` | POST /api/browser/:sessionId/tabs/:tabId/sendMessage | ⬜ TODO | **MEDIUM** | Content scripts communication |
| 12 | `chrome.tabs.detectLanguage()` | GET /api/browser/:sessionId/tabs/:tabId/detectLanguage | ⬜ TODO | **MEDIUM** | Detecting page language for NLP |
| 13 | `chrome.tabs.setZoom()` | POST /api/browser/:sessionId/tabs/:tabId/zoom | ⬜ TODO | **MEDIUM** | Zoom control for different viewports |
| 14 | `chrome.tabs.getZoom()` | GET /api/browser/:sessionId/tabs/:tabId/zoom | ⬜ TODO | **MEDIUM** | Getting current zoom level |
| 15 | `chrome.tabs.highlight()` | POST /api/browser/:sessionId/tabs/:tabId/highlight | ⬜ TODO | **MEDIUM** | Highlighting text for reference |

---

## 🟢 LOW PRIORITY (Convenience / Specialized)

| # | Chrome API Method | HTTP Endpoint | Status | Importance | Use Case |
|---|-------------------|---------------|--------|------------|----------|
| 16 | `chrome.tabs.duplicate()` | POST /api/browser/:sessionId/tabs/:tabId/duplicate | ⬜ TODO | **LOW** | Duplicating tabs for parallel tasks |
| 17 | `chrome.tabs.move()` | POST /api/browser/:sessionId/tabs/:tabId/move | ⬜ TODO | **LOW** | Reordering tabs |
| 18 | `chrome.tabs.pin()` | PATCH /api/browser/:sessionId/tabs/:tabId/pin | ⬜ TODO | **LOW** | Pinning important tabs |
| 17 | `chrome.tabs.unpin()` | PATCH /api/browser/:sessionId/tabs/:tabId/unpin | ⬜ TODO | **LOW** | Unpinning tabs |
| 19 | `chrome.tabs.hide()` | PATCH /api/browser/:sessionId/tabs/:tabId/hide | ⬜ TODO | **LOW** | Hiding/showing tabs |
| 20 | `chrome.tabs.show()` | PATCH /api/browser/:sessionId/tabs/:tabId/show | ⬜ TODO | **LOW** | Showing hidden tabs |

---

## 🔵 VERY LOW PRIORITY (Rarely Used)

| # | Chrome API Method | HTTP Endpoint | Status | Importance | Use Case |
|---|-------------------|---------------|--------|------------|----------|
| 21 | `chrome.tabs.setZIndex()` | PATCH /api/browser/:sessionId/tabs/:tabId/zindex | ⬜ TODO | **VERY LOW** | Managing tab order (rare) |
| 22 | `chrome.tabs.discard()` | PATCH /api/browser/:sessionId/tabs/:tabId/discard | ⬜ TODO | **VERY LOW** | Discarding tabs to free memory |
| 23 | `chrome.tabs.toggleReaderMode()` | PATCH /api/browser/:sessionId/tabs/:tabId/readerMode | ⬜ TODO | **VERY LOW** | Reader mode (special use case) |
| 24 | `chrome.tabs.toggleMute()` | PATCH /api/browser/:sessionId/tabs/:tabId/mute | ⬜ TODO | **VERY LOW** | Muting audio (rarely needed) |
| 25 | `chrome.tabs.captureVisibleTab()` | PATCH /api/browser/:sessionId/tabs/:tabId/fullPage | ⬜ TODO | **VERY LOW** | Full-page screenshots |

---

## Convenience / Info-Only Methods

| # | Chrome API Method | HTTP Endpoint | Priority | Note |
|---|-------------------|---------------|----------|-----|
| 26 | `chrome.tabs.getCurrentTabId()` | GET /api/browser/:sessionId/tabs/currentId | LOW | Get current tab ID |
| 27 | `chrome.tabs.getAllInWindow()` | GET /api/browser/:sessionId/tabs/window/:windowId | LOW | Get all tabs in a window |
| 28 | `chrome.tabs.get()` | GET /api/browser/:sessionId/tabs/:tabId | LOW | Get tab details |
| 29 | `chrome.tabs.connect()` | POST /api/browser/:sessionId/tabs/:tabId/connect | LOW | Connect to tab |
| 30 | `chrome.tabs.sendMessage()` | POST /api/browser/:sessionId/tabs/:tabId/sendMessage | LOW | Send message to tab |

---

## Summary

### Implemented (4):
1. ✅ `tabs.createTab`
2. ✅ `tabs.query`
3. ✅ `tabs.closeTab`
4. ✅ `tabs.update`

### Still Needed (26):
- **5 HIGH priority** APIs
- **5 MEDIUM priority** APIs  
- **6 LOW priority** APIs
- **5 VERY LOW priority** APIs

---

## Recommendation

**Implement in this order:**

1. `tabs.reload` - Refreshing pages (critical for dynamic content)
2. `tabs.executeScript` - Running JS (vital for data extraction)
3. `tabs.goBack` / `tabs.goForward` - Navigation history
4. `tabs.captureVisibleTab` - Screenshots (visual verification)
5. `tabs.get` - Getting tab details

**Complete implementation would require ~30 endpoint methods** in total.

Want me to implement the next highest priority API (`tabs.reload`)?
