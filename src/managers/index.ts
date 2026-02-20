import { BrowserManager } from './BrowserManager';
import { TabManager } from './TabManager';

let browserManagerInstance: BrowserManager | null = null;
let tabManagerInstance: TabManager | null = null;

/**
 * Get or create BrowserManager singleton instance
 * @returns BrowserManager
 */
export function getBrowserManager(): BrowserManager {
  if (!browserManagerInstance) {
    browserManagerInstance = BrowserManager.getInstance();
  }
  return browserManagerInstance;
}

/**
 * Get or create TabManager singleton instance
 * @returns TabManager
 */
export function getTabManager(): TabManager {
  if (!tabManagerInstance) {
    const browserManager = getBrowserManager();
    tabManagerInstance = TabManager.getInstance(browserManager);
  }
  return tabManagerInstance;
}

/**
 * Reset all manager instances (for testing)
 */
export function reset(): void {
  browserManagerInstance = null;
  tabManagerInstance = null;
}

export { BrowserManager, TabManager };
export default {
  getBrowserManager,
  getTabManager,
  reset,
  BrowserManager,
  TabManager,
};
