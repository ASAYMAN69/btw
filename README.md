# Browse The Web (BTW) 

[![npm version](https://badge.fury.io/js/browse-the-web.svg)](https://www.npmjs.com/package/browse-the-web)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.58+-green.svg)](https://playwright.dev/)

> **BTW**: Browse The Web - AI Browser Automation API with HTTP REST Endpoints for Headless Chrome Control

An AI-powered browser automation API that gives AI agents, applications, and developers full control over a Chromium browser through simple HTTP endpoints. Perfect for web scraping, automated testing, RPA, and AI-driven workflows.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

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

- **🧠 AI-Ready**: Perfect for AI agents and LLMs to control browsers programmatically
- **🎯 70+ Endpoints**: Full browser automation capabilities via REST API
- **📄 Web Scraping**: Extract text, images, forms, and structured data from any website
- **🔍 Network Monitoring**: Intercept, mock, and analyze network traffic for debugging
- **🖼️ Screenshots & PDF**: Capture full-page screenshots and export pages as PDF
- **🌐 Multi-Tab Management**: Handle multiple isolated browser contexts simultaneously
- **⚡ Fast & Reliable**: Built on Playwright Chromium engine for speed and stability
- **🔌 REST API**: Simple HTTP endpoints with JSON responses - easy to integrate
- **🛡️ Isolated Contexts**: Each tab runs in isolated browser context (separate cookies, storage)
- **📝 TypeScript**: Fully typed codebase with excellent IDE support and type safety

## 💡 Use Cases

### For AI Agents and LLMs
- **Control Browsers**: Give AI models eyes and hands to interact with websites dynamically
- **Render JavaScript**: Access content from SPAs and JavaScript-heavy applications
- **Web Research**: Analyze website structure, design patterns, and functionality
- **Data Extraction**: Scrape data dynamically for research and content generation

### For Developers
- **Web Scraping**: Extract data from websites that block simple HTTP requests or require JavaScript
- **Automated Testing**: Write end-to-end tests for web applications with real browser execution
- **RPA (Robotic Process Automation)**: Automate repetitive browser tasks and workflows
- **Screenshot Generation**: Generate PDFs and screenshots for documentation and reports
- **Network Debugging**: Monitor and analyze API calls, headers, and responses from frontend applications

### For Data Science & Marketing
- **Product Data Collection**: Scrape product catalogs from e-commerce platforms
- **Social Media Monitoring**: Track social media posts, trends, and engagement
- **Price Tracking**: Monitor pricing across multiple websites and marketplaces
- **Lead Generation**: Extract contact information from business directories
- **Competitor Analysis**: Analyze competitor pricing, features, and content

## 📖 Documentation

- **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** - Comprehensive guide for AI models and agents. **Start here** if you're an AI model or building AI-driven workflows.
- **[API_BLUEPRINT.md](API_BLUEPRINT.md)** - Complete technical API reference with 70+ endpoints and detailed specifications.

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

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **OS**: Windows, macOS, or Linux (Playwright supports all major platforms)

### Install from Source
```bash
# Clone the repository
git clone https://github.com/ASAYMAN69/btw.git
cd btw

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Quick Start with npm (coming soon)
```bash
npm install -g browse-the-web
btw start
```

## 🔄 Why Choose BTW?

| Feature | BTW | Puppeteer | Selenium |
|---------|-----|-----------|----------|
| **API Type** | REST/HTTP | JavaScript SDK | Multiple language bindings |
| **AI Integration** | ✅ Native support | ❌ Requires wrapper | ❌ Complex setup |
| **Browser Engine** | Playwright (Chromium) | Chromium | Multiple browsers |
| **Multi-Tab Management** | ✅ Isolated contexts | ⚠️ Manual | ✅ |
| **Network Interception** | ✅ Built-in | ✅ Manual | ⚠️ Limited |
| **Screenshots/PDF** | ✅ Native | ✅ Native | ⚠️ Requires plugins |
| **TypeScript Support** | ✅ Fully typed | ⚠️ Basic | ⚠️ Limited |
| **Learning Curve** | ❤️ Simple (REST API) | ⚠️ Moderate | ⚠️ Steep |
| **Memory Usage** | ⚡ Optimized | ⚡ Optimized | ⚠️ Higher |

**BTW stands out for:**
- **Simple REST API**: No SDK required - just HTTP requests
- **AI-Friendly**: Designed specifically for AI agents and LLM integration
- **Isolated Contexts**: Each tab has separate cookies and storage
- **Type Safety**: Fully written in TypeScript with comprehensive types
- **Active Development**: Built with modern best practices

## 🛠️ Development

```bash
# Build the project
npm run build

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

MIT

## 🤝 Contributing

Contributions welcome! Please read the documentation and ensure all endpoints are tested.

## 📞 Support

For issues and questions, please refer to the [API_BLUEPRINT.md](API_BLUEPRINT.md) documentation.

## 🏷️ Keywords & Tags

**Keywords:** browser automation, web scraping, headless browser, Chrome automation, Playwright, TypeScript, REST API, HTTP API, AI agent, LLM integration, automated testing, RPA, web crawler, puppeteer alternative, selenium alternative, browser control, screenshot API, PDF generation, network monitoring.

**Tags:** `#browser-automation` `#web-scraping` `#headless-browser` `#playwright` `#typescript` `#rest-api` `#ai-agent` `#llm` `#testing` `#rpa` `#web-crawler`

## 🔗 Related Projects

- **[Playwright](https://playwright.dev/)** - Browser automation library that powers BTW
- **[Puppeteer](https://pptr.dev/)** - Node.js library for controlling Chrome
- **[Selenium](https://www.selenium.dev/)** - Browser automation framework
- **[Cypress](https://www.cypress.io/)** - End-to-end testing framework

## 📈 Roadmap

- [ ] Docker container support
- [ ] WebSocket API for real-time updates
- [ ] Video recording capability
- [ ] Mobile browser emulation (iOS/Android)
- [ ] Cluster mode for multiple browser instances
- [ ] Rate limiting and authentication
- [ ] Swagger/OpenAPI documentation

## ⚡ Performance

- **Startup Time**: ~2-3 seconds (browser launch)
- **Memory per Tab**: ~50-100MB (Chrome headless)
- **Request Latency**: ~10-50ms (local API calls)
- **Concurrent Tabs**: 10+ (depends on hardware)

## 🌍 Community & Social

**Star us on GitHub** if you find BTW useful!

Share your use cases with #BrowseTheWeb

---

**Browse The Web (BTW)** - Making browser automation easy for AI agents and developers.
Built with ❤️ using TypeScript, Express, and Playwright.
