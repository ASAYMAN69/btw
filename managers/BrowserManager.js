const { chromium } = require('playwright');

class BrowserManager {
  constructor() {
    this.browser = null;
          this.launchOptions = {
          headless: false,
      devtools: false,
      slowMo: 0,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote'
      ]
    };
    this.autoReconnect = true;
  }

  static getInstance() {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  async launch(options = {}) {
    if (this.browser && this.browser.isConnected()) {
      throw new Error('Browser is already launched');
    }

    this.launchOptions = {
      ...this.launchOptions,
      ...options
    };

    this.browser = await chromium.launch(this.launchOptions);

    this.browser.on('disconnected', () => {
      console.log('Browser disconnected (window closed)');
    });

    return { success: true, message: 'Browser launched successfully' };
  }

  async close() {
    if (!this.browser || !this.browser.isConnected()) {
      throw new Error('Browser is not launched');
    }

    await this.browser.close();
    this.browser = null;

    return { success: true, message: 'Browser closed successfully' };
  }

  async restart(options = {}) {
    const currentOptions = this.launchOptions;

    if (this.browser && this.browser.isConnected()) {
      await this.close();
    }

    return await this.launch({ ...currentOptions, ...options });
  }

  getStatus() {
    const isLaunched = !!(this.browser && this.browser.isConnected());

    return {
      launched: isLaunched,
      contexts: isLaunched ? this.browser.contexts().map(c => ({
        id: c._id || 'unknown',
        pages: c.pages().map(p => {
          try {
            return {
              id: p._guid || 'unknown',
              url: p.url() || '',
              title: p.title() || ''
            };
          } catch (e) {
            return {
              id: p._guid || 'unknown',
              url: '',
              title: ''
            };
          }
        })
      })) : [],
      version: chromium.version ? chromium.version() : 'unknown'
    };
  }

  getContextById(contextId) {
    if (!this.browser || !this.browser.isConnected()) {
      throw new Error('Browser is not launched');
    }

    const contexts = this.browser.contexts();
    return contexts.find(c => c._id === contextId);
  }

  async createContext(options = {}) {
    if (!this.browser || !this.browser.isConnected()) {
      throw new Error('Browser is not launched');
    }

    const context = await this.browser.newContext(options);
    return context;
  }

  getBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      throw new Error('Browser is not launched');
    }

    return this.browser;
  }

  async ensureBrowser(options = {}) {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    return await this.launch(options);
  }
}

module.exports = BrowserManager;
