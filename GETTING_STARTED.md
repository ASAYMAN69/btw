# Getting Started with Browse The Web (BTW)

Welcome to Browse The Web (BTW)! This guide will help you get up and running with browser automation in just a few minutes.

## 📋 Table of Contents

1. [What is BTW?](#what-is-btw)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [First Steps](#first-steps)
5. [Common Use Cases](#common-use-cases)
6. [Next Steps](#next-steps)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 What is BTW?

**Browse The Web (BTW)** is a browser automation API that lets you control a headless Chrome browser through simple HTTP requests.

### Why Choose BTW?

- **Simple REST API**: No SDK or programming language required - just HTTP
- **Perfect for AI**: Designed for LLMs and AI agents to control browsers
- **70+ Endpoints**: Complete browser automation capabilities
- **Type-Safe**: Built with TypeScript for reliability
- **Fast**: Built on Playwright for performance

### What Can You Do?

- 📄 **Web Scraping**: Extract data from any website, including SPAs
- 🖼️ **Screenshots**: Capture images and PDFs of web pages
- 🧪 **Testing**: Write automated tests for web applications
- 🤖 **RPA**: Automate repetitive browser tasks
- 🔍 **Debugging**: Monitor network traffic and console logs
- 🤖 **AI Integration**: Give AI agents the ability to browse the web

---

## 📦 Prerequisites

Before installing BTW, make sure you have:

### Required
- **Node.js**: 18.0 or higher
  ```bash
  node --version  # Should show v18 or higher
  ```
- **npm**: 9.0 or higher
  ```bash
  npm --version  # Should show 9 or higher
  ```
- **Operating System**: Linux, macOS, or Windows (all major platforms supported)

### Optional
- **curl**: For testing API endpoints from command line
- **Postman**: For API testing and exploration (recommended)
- **Docker**: For containerized deployment (optional)

### Check Your Setup

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check git (if you're cloning from GitHub)
git --version
```

---

## 🚀 Installation

### Method 1: Clone from GitHub (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/your-username/btw.git
cd btw

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Start the server
npm start
```

BTW will start on `http://localhost:3000`

### Method 2: Install via npm (Coming Soon)

```bash
# Global installation
npm install -g browse-the-web

# Start the server
btw start
```

### Verify Installation

```bash
# Check if the server is running
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":1234567890123}
```

---

## 🎬 First Steps

Let's create your first automated browsing session!

### Step 1: Check Server Health

```bash
curl http://localhost:3000/api/health
```

### Step 2: Check Browser Status

```bash
curl http://localhost:3000/api/browser/status
```

Response:
```json
{
  "isLaunched": true,
  "isConnected": true,
  "pid": 12345,
  "contexts": []
}
```

### Step 3: Create a New Tab

```bash
curl -X POST http://localhost:3000/api/tabs/create \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response (save this `sessionId`):
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Tab created successfully",
  "createdAt": 1234567890000
}
```

**⚠️ Important**: Save the `sessionId` - you'll need it for all operations on this tab!

### Step 4: Navigate to a Website

```bash
# Replace YOUR_SESSION_ID with the actual session ID from step 3
curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Response:
```json
{
  "success": true,
  "url": "https://example.com/",
  "title": "Example Domain"
}
```

### Step 5: Wait for Page to Load

```bash
curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/wait/navigation
```

### Step 6: Extract Page Data

```bash
curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.title"}'
```

Response:
```json
{
  "success": true,
  "result": "Example Domain"
}
```

### Step 7: Take a Screenshot

```bash
curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/screenshot \
  -H "Content-Type: application/json" \
  -d '{"type":"png","fullPage":true}'
```

Response:
```json
{
  "success": true,
  "filePath": "/home/user/btw_media/screenshot_1771615728077_ff22jq.png",
  "fileName": "screenshot_1771615728077_ff22jq.png",
  "extension": "png",
  "type": "png"
}
```

### Step 8: Close the Tab

```bash
curl -X DELETE http://localhost:3000/api/tabs/YOUR_SESSION_ID/close
```

---

## 💡 Common Use Cases

### 1. Web Scraping - Extract Product Data

```bash
# Create tab
TAB_ID=$(curl -s -X POST http://localhost:3000/api/tabs/create | jq -r '.sessionId')

# Navigate to product page
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/products"}'

# Wait for content to load
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/wait/navigation
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/wait/network-idle

# Extract product data
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Array.from(document.querySelectorAll(\".product\")).map(p => ({name: p.querySelector(\".title\")?.textContent, price: p.querySelector(\".price\")?.textContent}))"
  }'

# Close tab
curl -X DELETE http://localhost:3000/api/tabs/$TAB_ID/close
```

### 2. Automated Testing - Sign Up Form

```bash
# Create tab
TAB_ID=$(curl -s -X POST http://localhost:3000/api/tabs/create | jq -r '.sessionId')

# Navigate to signup page
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/signup"}'

# Wait for form to load
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/wait/selector \
  -H "Content-Type: application/json" \
  -d '{"selector":"form#signup"}'

# Fill form fields
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#username","text":"testuser"}'

curl -X POST http://localhost:3000/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#email","text":"test@example.com"}'

curl -X POST http://localhost:3000/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#password","text":"password123"}'

# Submit form
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/element/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"button[type=\"submit\"]"}'

# Wait for navigation
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/wait/navigation

# Verify success
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.body.innerText.includes(\"Welcome\")"}'

# Close tab
curl -X DELETE http://localhost:3000/api/tabs/$TAB_ID/close
```

### 3. Screenshot - Capture Website Design

```bash
# Create tab
TAB_ID=$(curl -s -X POST http://localhost:3000/api/tabs/create | jq -r '.sessionId')

# Set mobile viewport
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/emulation/viewport \
  -H "Content-Type: application/json" \
  -d '{"width":375,"height":667,"isMobile":true}'

# Navigate
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Wait for load
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/wait/navigation

# Capture screenshot
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/screenshot \
  -H "Content-Type: application/json" \
  -d '{"type":"png","fullPage":true}'

# Close tab
curl -X DELETE http://localhost:3000/api/tabs/$TAB_ID/close
```

### 4. Network Monitoring - Find API Endpoints

```bash
# Create tab
TAB_ID=$(curl -s -X POST http://localhost:3000/api/tabs/create | jq -r '.sessionId')

# Clear network logs
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/network/clear

# Navigate
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Trigger action (e.g., click a button)
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/element/click \
  -H "Content-Type: application/json" \
  -d '{"selector":".load-data"}'

# Wait for network idle
curl -X POST http://localhost:3000/api/tabs/$TAB_ID/wait/network-idle

# Get all network requests
curl http://localhost:3000/api/tabs/$TAB_ID/network/requests

# Close tab
curl -X DELETE http://localhost:3000/api/tabs/$TAB_ID/close
```

---

## 📚 Next Steps

Congratulations! You've successfully automated your first browsing session. Here's what to learn next:

### 📖 Documentation

- **[API Blueprint](API_BLUEPRINT.md)** - Complete API reference with all 70+ endpoints
- **[AI Agent Guide](AI_AGENT_GUIDE.md)** - Advanced guide for AI integration
- **[Examples](EXAMPLES.md)** - Practical code examples
- **[Contributing](CONTRIBUTING.md)** - How to contribute to the project

### 🎓 Learn More

1. **Advanced JavaScript Extraction**
   - Learn powerful data extraction techniques
   - Handle dynamic content
   - Parse structured data

2. **Element Selection**
   - Master CSS selectors
   - Use XPath for complex queries
   - Find elements by text, attributes, etc.

3. **Error Handling**
   - Handle timeouts gracefully
   - Retry failed requests
   - Debug common issues

4. **Performance Optimization**
   - Reduce memory usage
   - Optimize network requests
   - Handle concurrent tabs

### 🔧 Development

```bash
# Development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Type checking
npm run typecheck
```

### 🌐 Integration

BTW can be integrated with:
- **Python**: Use `requests` library
- **JavaScript/Node.js**: Use `fetch` or `axios`
- **AI/LLMs**: Designed for GPT, Claude, and other AI models
- **CI/CD**: Automate testing in your pipeline
- **RPA Tools**: Build custom workflows

---

## 🐛 Troubleshooting

### Server Won't Start

**Problem**: Server fails to start or crashes

**Solutions**:
1. Check Node.js version (must be 18+):
   ```bash
   node --version
   ```
2. Clean and rebuild:
   ```bash
   npm run clean
   npm install
   npm run build
   npm start
   ```
3. Check if port 3000 is already in use:
   ```bash
   lsof -i :3000  # macOS/Linux
   netstat -ano | findstr :3000  # Windows
   ```

### Browser Not Auto-Launching

**Problem**: Browser doesn't start automatically

**Solutions**:
1. Manually launch browser:
   ```bash
   curl -X POST http://localhost:3000/api/browser/launch \
     -H "Content-Type: application/json" \
     -d '{"headless":true}'
   ```
2. Check browser status:
   ```bash
   curl http://localhost:3000/api/browser/status
   ```
3. Restart server:
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

### Timeout Errors

**Problem**: "Timeout exceeded" errors

**Solutions**:
1. Increase timeout value:
   ```bash
   curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/wait/selector \
     -H "Content-Type: application/json" \
     -d '{"selector":".element","timeout":10000}'
   ```
2. Use `network-idle` instead:
   ```bash
   curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/wait/network-idle
   ```

### Element Not Found

**Problem**: "Element not found" error

**Solutions**:
1. Verify selector works:
   ```bash
   curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/elements/find \
     -H "Content-Type: application/json" \
     -d '{"selector":".element","limit":10}'
   ```
2. Wait for element:
   ```bash
   curl -X POST http://localhost:3000/api/tabs/YOUR_SESSION_ID/wait/selector \
     -H "Content-Type: application/json" \
     -d '{"selector":".element","timeout":5000}'
   ```

### Invalid Session ID

**Problem**: "Invalid or expired session ID" error

**Solutions**:
1. List active tabs:
   ```bash
   curl http://localhost:3000/api/tabs/list
   ```
2. Create a new tab if needed:
   ```bash
   curl -X POST http://localhost:3000/api/tabs/create
   ```
3. Make sure you're using the correct `sessionId`

### Memory Issues

**Problem**: High memory usage or crashes

**Solutions**:
1. Close tabs when done:
   ```bash
   curl -X DELETE http://localhost:3000/api/tabs/YOUR_SESSION_ID/close
   ```
2. Restart browser periodically:
   ```bash
   curl -X POST http://localhost:3000/api/browser/restart
   ```
3. Limit concurrent tabs

---

## 📞 Getting Help

### Resources

- **Documentation**: [API_BLUEPRINT.md](API_BLUEPRINT.md), [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)
- **Examples**: [EXAMPLES.md](EXAMPLES.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

### Community

- **GitHub Issues**: Report bugs and feature requests
- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Coming soon!

### Common Questions

**Q: Can I use BTW with multiple browsers?**  
A: Currently, BTW supports one browser instance at a time (singleton pattern). Multiple tabs can run concurrently.

**Q: How do I handle CAPTCHAs?**  
A: BTW doesn't solve CAPTCHAs automatically. You'll need to handle them manually or use third-party services.

**Q: Is BTW free to use?**  
A: Yes! BTW is open-source and free under the MIT license.

**Q: Can I run BTW in production?**  
A: Yes! Just run in headless mode and implement proper security measures.

**Q: How do I scale BTW?**  
A: Run multiple instances of BTW behind a load balancer, each managing its own browser.

---

## 🎉 You're Ready to Go!

You now know how to:
- ✅ Install and run BTW
- ✅ Create and manage browser tabs
- ✅ Navigate websites
- ✅ Extract data
- ✅ Take screenshots
- ✅ Handle errors

**Next**: Check out the [Examples](EXAMPLES.md) for more advanced use cases, or dive into the [API Blueprint](API_BLUEPRINT.md) for the complete reference.

Happy browsing! 🚀
