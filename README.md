# Browse The Web (BTW)

> **BTW**: Browse The Web - AI Browser Automation API

An AI-powered browser automation API that gives AI agents and applications full control over a Chromium browser through simple HTTP endpoints.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Server runs on http://localhost:3000
```

## 📚 Example Usage

```bash
# Launch browser
curl -X POST http://localhost:3000/api/browser/launch

# Create tab
curl -X POST http://localhost:3000/api/tabs/create

# Navigate to a website
curl -X POST http://localhost:3000/api/tabs/{tabId}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Extract data
curl -X POST http://localhost:3000/api/tabs/{tabId}/evaluate \
  -H "Content-Type: application.json" \
  -d '{"script":"document.title"}'

# Close browser
curl -X POST http://localhost:3000/api/browser/close
```

## ✨ Features

- **🧠 AI-Ready**: Perfect for AI agents to control browsers
- **🎯 70+ Endpoints**: Full browser automation capabilities
- **📄 Web Scraping**: Extract text, images, forms, and structured data
- **🔍 Network Monitoring**: Intercept, mock, and analyze network traffic
- **🖼️ Screenshots & PDF**: Capture pages and export as PDF
- **🌐 Multi-Tab Management**: Handle multiple browser contexts
- **⚡ Fast**: Built on Playwright for speed and reliability
- **🔌 REST API**: Simple HTTP endpoints with JSON responses

## 📖 Documentation

See [API_BLUEPRINT.md](API_BLUEPRINT.md) for complete API documentation with 74+ endpoints.

## 🗂️ Project Structure

```
btw/
├── app.js                      # Main server entry point
├── package.json                # Dependencies
├── API_BLUEPRINT.md           # Complete API documentation
├── README.md                  # This file
├── controllers/               # Request handlers
│   ├── browserController.js
│   └── tabsController.js
├── managers/                  # Business logic
│   ├── BrowserManager.js      # Browser lifecycle
│   ├── TabManager.js          # Tab management
│   └── index.js
└── routes/                    # API routes
    ├── browser.js
    └── tabs.js
```

## 🔧 Installation

```bash
git clone <repository-url>
cd btw
npm install
npm start
```

## 🛠️ Development

```bash
# Start server
npm start

# API health check
curl http://localhost:3000/api/health
```

## 📊 Supported Operations

### Browser Management
- Launch, close, restart browser
- Check browser status

### Tab Management
- Create, close, switch tabs
- List all tabs

### Navigation
- Go to URL, back, forward, reload

### Element Interaction
- Click, type, fill, hover, scroll
- Double-click, right-click, tap

### Data Extraction
- Execute JavaScript
- Get page content
- Screenshots and PDFs

### Network Monitoring
- Intercept requests
- Mock responses
- Monitor traffic

### Storage & Cookies
- Manage cookies
- Access localStorage/sessionStorage

### Forms & Files
- Fill and submit forms
- Upload files

### Device Emulation
- Set viewport
- Emulate geolocation
- Set user agent

## 🔐 Security

- Run in headless mode for production
- Use appropriate rate limiting
- Sanitize user inputs
- Manage browser contexts securely

## 📝 License

ISC

## 🤝 Contributing

Contributions welcome! Please read the documentation and ensure all endpoints are tested.

## 📞 Support

For issues and questions, please refer to the [API_BLUEPRINT.md](API_BLUEPRINT.md) documentation.

---

**Browse The Web (BTW)** - Making browser automation easy for AI agents and developers.
