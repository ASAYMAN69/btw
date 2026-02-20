const BrowserManager = require('./BrowserManager');
const TabManager = require('./TabManager');

const browserManager = BrowserManager.getInstance();
const tabManager = TabManager.getInstance(browserManager);

module.exports = {
  browserManager,
  tabManager
};
