import { v4 as uuidv4 } from 'uuid';
import { BrowserContext, Page } from 'playwright';
import { BrowserManager } from './BrowserManager';
import {
  SessionId,
  TabCreateOptions,
  TabData,
  TabInfoResponse,
  PageInfo,
  ConsoleLog,
  NetworkRequest,
  NetworkResponse,
  WebSocketInfo,
  MockResponseData,
  DialogHandler,
  BrowserToolError,
  InvalidSessionError,
  type CreateTabResponse,
  type CloseTabResponse,
  type ListTabsResponse,
  type TabInfoResponse as TabInfoResponseType,
} from '../types';

/**
 * TabManager - Manages browser tabs with session ID tracking
 *
 * Responsibilities:
 * - Create tabs with unique session IDs
 * - Track tab state and metadata
 * - Maintain tab persistence until manual closure
 * - Provide session ID-based tab access
 * - Isolate each tab's browsing context
 */
export class TabManager {
  private static instance: TabManager;
  private browserManager: BrowserManager;
  private tabs: Map<SessionId, TabData>;
  private activeSessionId: SessionId | null;

  private constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
    this.tabs = new Map();
    this.activeSessionId = null;
  }

  public static getInstance(browserManager: BrowserManager): TabManager {
    if (!TabManager.instance) {
      TabManager.instance = new TabManager(browserManager);
    }
    return TabManager.instance;
  }

  /**
   * Create a new tab with a unique session ID
   *
   * @param options - Tab creation options
   * @returns Promise<CreateTabResponse>
   */
  public async createTab(options: TabCreateOptions = {}): Promise<CreateTabResponse> {
    // Ensure browser is available
    const browser = await this.browserManager.ensureBrowser();

    // Create isolated browser context
    const contextOptions = {
      viewport: options.viewport || { width: 1920, height: 1080 },
      userAgent: options.userAgent,
      locale: options.locale,
      timezoneId: options.timezone,
    };

    const context = await browser.newContext(contextOptions);

    // Create page within context
    const page = await context.newPage();

    // Generate unique session ID
    const sessionId: SessionId = uuidv4();

    // Initialize tab data
    const pageInfo: PageInfo = {
      url: 'about:blank',
      title: '',
      viewport: options.viewport || { width: 1920, height: 1080 },
      isLoaded: true,
      isVisible: true,
    };

    const tabData: TabData = {
      sessionId,
      context,
      page,
      createdAt: Date.now(),
      contextId: (context as any)._id || 'unknown',
      pageInfo,
      consoleLogs: [],
      networkRequests: [],
      networkResponses: [],
      websockets: [],
      interceptedPatterns: [],
      mockedResponses: new Map(),
    };

    // Store tab in map
    this.tabs.set(sessionId, tabData);

    // Set as active tab
    this.activeSessionId = sessionId;

    // Setup page event listeners
    await this.setupPageListeners(page, sessionId);

    return {
      success: true,
      sessionId,
      message: 'Tab created successfully',
      createdAt: tabData.createdAt,
    };
  }

  /**
   * Get tab data by session ID
   *
   * @param sessionId - Session ID
   * @returns TabData
   * @throws InvalidSessionError if session ID is invalid
   */
  public getTab(sessionId: SessionId): TabData {
    const tab = this.tabs.get(sessionId);
    if (!tab) {
      throw new InvalidSessionError(sessionId);
    }
    return tab;
  }

  /**
   * Check if tab exists
   *
   * @param sessionId - Session ID
   * @returns boolean
   */
  public hasTab(sessionId: SessionId): boolean {
    return this.tabs.has(sessionId);
  }

  /**
   * Get active tab
   *
   * @returns TabData
   * @throws BrowserToolError if no active tab
   */
  public getActiveTab(): TabData {
    if (!this.activeSessionId) {
      throw new BrowserToolError('No active tab', 404);
    }
    return this.getTab(this.activeSessionId);
  }

  /**
   * Close a tab by session ID
   *
   * @param sessionId - Session ID
   * @returns Promise<CloseTabResponse>
   */
  public async closeTab(sessionId: SessionId): Promise<CloseTabResponse> {
    const tab = this.getTab(sessionId);

    try {
      // Close browser context (also closes pages)
      await tab.context.close();
    } catch (error) {
      // Ignore errors during close
    }

    // Remove tab from map
    this.tabs.delete(sessionId);

    // Update active tab if needed
    if (this.activeSessionId === sessionId) {
      const remaining = Array.from(this.tabs.keys());
      this.activeSessionId = remaining.length > 0 ? remaining[0] : null;
    }

    return {
      success: true,
      message: 'Tab closed successfully',
    };
  }

  /**
   * List all tabs
   *
   * @returns Promise<ListTabsResponse>
   */
  public async listTabs(): Promise<ListTabsResponse> {
    const tabs: TabInfoResponseType[] = [];
    for (const [sessionId, tab] of this.tabs.entries()) {
      const pageInfo = await this.getPageInfo(tab);
      tabs.push({
        sessionId,
        url: pageInfo.url,
        title: pageInfo.title,
        viewport: pageInfo.viewport,
        isActive: sessionId === this.activeSessionId,
        createdAt: tab.createdAt,
      });
    }

    return {
      success: true,
      tabs,
    };
  }

  /**
   * Get tab info by session ID
   *
   * @param sessionId - Session ID
   * @returns Promise<TabInfoResponseType>
   */
  public async getTabInfo(sessionId: SessionId): Promise<TabInfoResponseType> {
    const tab = this.getTab(sessionId);
    const pageInfo = await this.getPageInfo(tab);

    return {
      sessionId,
      url: pageInfo.url,
      title: pageInfo.title,
      viewport: pageInfo.viewport,
      isActive: sessionId === this.activeSessionId,
      createdAt: tab.createdAt,
    };
  }

  /**
   * Switch active tab
   *
   * @param sessionId - Session ID
   * @returns TabInfoResponse
   */
  public async switchTab(sessionId: SessionId): Promise<TabInfoResponse> {
    const tab = this.getTab(sessionId);

    this.activeSessionId = sessionId;

    // Bring page to front
    await tab.page.bringToFront();

    const pageInfo = await this.getPageInfo(tab);

    return {
      sessionId,
      url: pageInfo.url,
      title: pageInfo.title,
      viewport: pageInfo.viewport,
      isActive: true,
      createdAt: tab.createdAt,
    };
  }

  /**
   * Get page info from tab
   *
   * @param tab - Tab data
   * @returns Promise<PageInfo>
   */
  private async getPageInfo(tab: TabData): Promise<PageInfo> {
    try {
      const url = tab.page.url();
      const title = await tab.page.title().catch(() => '');
      const viewport = tab.page.viewportSize();

      return {
        url,
        title,
        viewport: viewport || undefined,
        isLoaded: true,
        isVisible: true,
      };
    } catch (error) {
      return {
        url: 'about:blank',
        title: '',
        isLoaded: false,
        isVisible: false,
      };
    }
  }

  /**
   * Setup page event listeners
   *
   * @param page - Playwright Page
   * @param sessionId - Session ID
   */
  private async setupPageListeners(page: Page, sessionId: SessionId): Promise<void> {
    const tab = this.tabs.get(sessionId);
    if (!tab) return;

    // Console events
    page.on('console', msg => {
      tab.consoleLogs.push({
        type: msg.type() as any,
        text: msg.text(),
        location: {
          url: msg.location()!.url,
          lineNumber: msg.location()!.lineNumber,
          columnNumber: msg.location()!.columnNumber,
        },
        timestamp: Date.now(),
      });
    });

    // Request events - only log, don't intercept unless route is set up
    page.on('request', (request: any) => {
      const requestData: NetworkRequest = {
        id: (request as any)._guid || uuidv4(),
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData() || undefined,
        resourceType: request.resourceType(),
        timestamp: Date.now(),
      };
      tab.networkRequests.push(requestData);
    });

    // Response events
    page.on('response', (response: any) => {
      const responseData: NetworkResponse = {
        id: (response.request() as any)._guid || uuidv4(),
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        ok: response.ok(),
        timestamp: Date.now(),
      };
      tab.networkResponses.push(responseData);
    });

    // Dialog events
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

    // WebSocket events
    page.on('websocket', ws => {
      const wsInfo: WebSocketInfo = {
        id: uuidv4(),
        url: ws.url(),
        opened: Date.now(),
        messages: [],
      };
      tab.websockets.push(wsInfo);

      ws.on('framereceived', ({ frame }: any) => {
        const wsIndex = tab.websockets.findIndex(w => w.url === ws.url());
        if (wsIndex !== -1) {
          tab.websockets[wsIndex].messages?.push({
            server: false,
            text: frame.toString(),
            timestamp: Date.now(),
          });
        }
      });

      ws.on('framesent', ({ frame }: any) => {
        const wsIndex = tab.websockets.findIndex(w => w.url === ws.url());
        if (wsIndex !== -1) {
          tab.websockets[wsIndex].messages?.push({
            server: true,
            text: frame.toString(),
            timestamp: Date.now(),
          });
        }
      });
    });

    // Page close event
    page.on('close', () => {
      tab.pageInfo.isLoaded = false;
    });
  }

  /**
   * Get total number of tabs
   *
   * @returns number
   */
  public getTabCount(): number {
    return this.tabs.size;
  }

  /**
   * Get all session IDs
   *
   * @returns SessionId[]
   */
  public getAllSessionIds(): SessionId[] {
    return Array.from(this.tabs.keys());
  }

  /**
   * Clear all tabs
   *
   * @returns Promise<void>
   */
  public async clearAllTabs(): Promise<void> {
    const sessionIds = this.getAllSessionIds();
    for (const sessionId of sessionIds) {
      await this.closeTab(sessionId);
    }
  }
}

export default TabManager;
