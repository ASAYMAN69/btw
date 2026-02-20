const { v4: uuidv4 } = require('uuid');

class TabManager {
  constructor(browserManager) {
    this.browserManager = browserManager;
    this.tabs = new Map();
    this.activeTabId = null;
  }

  static getInstance(browserManager) {
    if (!TabManager.instance) {
      TabManager.instance = new TabManager(browserManager);
    }
    return TabManager.instance;
  }

  async createTab(options = {}) {
    const browser = this.browserManager.getBrowser();

      const defaultViewport = options.viewport || { width: 1920, height: 1080 };

      const contextOptions = {
        viewport: defaultViewport,
        userAgent: options.userAgent,
        locale: options.locale,
        ...options
      };

      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();

      const tabId = uuidv4();

      this.tabs.set(tabId, {
        id: tabId,
        context,
        page,
        createdAt: Date.now()
      });

    this.activeTabId = tabId;

    await this.setupPageListeners(page, tabId);

    return { tabId, message: 'Tab created successfully' };
  }

  async setupPageListeners(page, tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    tab.consoleLogs = [];
    tab.networkRequests = [];
    tab.networkResponses = [];
    tab.dialogHandler = null;
    tab.downloadPath = null;
    tab.websockets = [];
    tab.interceptedPatterns = [];
    tab.mockedResponses = new Map();

    page.on('console', msg => {
      tab.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: Date.now()
      });
    });

    page.on('request', request => {
      const requestData = {
        id: request._guid || uuidv4(),
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      };
      tab.networkRequests.push(requestData);
    });

    page.on('response', response => {
      const responseData = {
        id: response.request()._guid || uuidv4(),
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        ok: response.ok(),
        timestamp: Date.now()
      };
      tab.networkResponses.push(responseData);
    });

    page.on('dialog', async dialog => {
      if (tab.dialogHandler) {
        const { action, promptText } = tab.dialogHandler;
        if (action === 'accept') {
          await dialog.accept(promptText);
        } else {
          await dialog.dismiss();
        }
      } else {
        await dialog.dismiss();
      }
    });

    page.on('websocket', ws => {
      const wsInfo = {
        id: uuidv4(),
        url: ws.url(),
        opened: Date.now()
      };
      tab.websockets.push(wsInfo);

      ws.on('framereceived', ({ frame }) => {
        const wsIndex = tab.websockets.findIndex(w => w.url === ws.url());
        if (wsIndex !== -1) {
          tab.websockets[wsIndex].messages = tab.websockets[wsIndex].messages || [];
          tab.websockets[wsIndex].messages.push({
            server: false,
            text: frame.toString(),
            timestamp: Date.now()
          });
        }
      });

      ws.on('framesent', ({ frame }) => {
        const wsIndex = tab.websockets.findIndex(w => w.url === ws.url());
        if (wsIndex !== -1) {
          tab.websockets[wsIndex].messages = tab.websockets[wsIndex].messages || [];
          tab.websockets[wsIndex].messages.push({
            server: true,
            text: frame.toString(),
            timestamp: Date.now()
          });
        }
      });
    });
  }

  getTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }
    return tab;
  }

  getActiveTab() {
    if (!this.activeTabId) {
      throw new Error('No active tab');
    }
    return this.getTab(this.activeTabId);
  }

  async closeTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    await tab.context.close();
    this.tabs.delete(tabId);

    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.keys());
      this.activeTabId = remainingTabs.length > 0 ? remainingTabs[0] : null;
    }

    return { success: true, message: 'Tab closed successfully' };
  }

  async listTabs() {
    const tabs = [];
    for (const [id, tab] of this.tabs.entries()) {
      tabs.push({
        id,
        url: tab.page.url(),
        title: await tab.page.title().catch(() => ''),
        isActive: id === this.activeTabId,
        createdAt: tab.createdAt
      });
    }
    return tabs;
  }

  async switchTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    this.activeTabId = tabId;

    await tab.page.bringToFront();

    return { success: true, message: 'Tab switched successfully', tabId };
  }

  async getTabInfo(tabId) {
    const tab = this.getTab(tabId);
    return {
      id: tab.id,
      url: tab.page.url(),
      title: await tab.page.title().catch(() => ''),
      viewport: tab.page.viewportSize(),
      isActive: tabId === this.activeTabId,
      createdAt: tab.createdAt
    };
  }
}

module.exports = TabManager;
