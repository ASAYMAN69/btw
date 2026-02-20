import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getTabManager } from '../managers';
import {
  SessionId,
  BrowserToolError,
  InvalidSessionError,
  ElementNotFoundError,
  type NavigateResponse,
  type EvaluateResponse,
  type ScreenshotResponse,
  type PdfResponse,
  type ApiResponse,
  getMediaDir,
  generateFilename,
} from '../types';

/**
 * TabsController - Handles all tab-related operations
 *
 * Provides methods for:
 * - Tab lifecycle (create, close, list, info)
 * - Navigation (goto, back, forward, reload)
 * - Content extraction (evaluate, screenshot, pdf)
 * - Element interaction (click, type, fill, hover)
 * - Element discovery (find, info)
 * - Waiting conditions (timeout, selector, navigation, network idle)
 * - Storage operations (cookies, localStorage, sessionStorage)
 * - Network monitoring (requests, responses, intercept, mock)
 * - Console monitoring (logs, clear)
 * - Keyboard & mouse operations
 * - File operations (upload, download)
 * - Permissions (grant, clear)
 * - Emulation (viewport, user agent, geolocation, media)
 */
export class TabsController {
  private tabManager = getTabManager();

  // ============== Tab Lifecycle ==============

  /**
   * Create a new tab
   */
  public async createTab(req: Request, res: Response): Promise<void> {
    try {
      const { options } = req.body;

      const response = await this.tabManager.createTab(options);
      res.json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * List all active tabs
   */
  public async listTabs(req: Request, res: Response): Promise<void> {
    try {
      const tabs = await this.tabManager.listTabs();
      res.json(tabs);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Get tab info
   */
  public async getTabInfo(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const info = await this.tabManager.getTabInfo(sessionId);
      res.json(info);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Close a tab
   */
  public async closeTab(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const result = await this.tabManager.closeTab(sessionId);
      res.json(result);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Switch active tab
   */
  public async switchTab(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const result = await this.tabManager.switchTab(sessionId);
      res.json(result);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Navigation ==============

  /**
   * Navigate to URL
   */
  public async goto(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { url, waitUntil = 'load', timeout = 30000 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.goto(url, { waitUntil, timeout });

      const response: NavigateResponse = {
        success: true,
        url: tab.page.url(),
        title: await tab.page.title(),
      };
      res.json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Go back
   */
  public async back(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);
      await tab.page.goBack();

      const response: NavigateResponse = {
        success: true,
        url: tab.page.url(),
      };
      res.json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Go forward
   */
  public async forward(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);
      await tab.page.goForward();

      const response: NavigateResponse = {
        success: true,
        url: tab.page.url(),
      };
      res.json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Reload page
   */
  public async reload(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);
      await tab.page.reload();

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Content Extraction ==============

  /**
   * Execute JavaScript
   */
  public async evaluate(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { script, await: shouldAwait = false } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      let result: any;

      if (shouldAwait) {
        result = await tab.page.evaluate(async (s: string) => eval(s), script);
      } else {
        result = await tab.page.evaluate((s: string) => eval(s), script);
      }

      const response: EvaluateResponse = {
        success: true,
        result,
      };
      res.json(response);
    } catch (error: any) {
      const response: EvaluateResponse = {
        success: false,
        error: error.message,
      };
      res.status(400).json(response);
    }
  }

  /**
    * Take screenshot
    */
  public async screenshot(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { type = 'png', fullPage = false, quality = 80 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      const screenshot = await (tab.page as any).screenshot({
        type,
        fullPage,
        quality: type === 'jpeg' ? quality : undefined,
      });

      const extension = type;
      const fileName = generateFilename('screenshot', extension);
      const mediaDir = getMediaDir();
      const filePath = path.join(mediaDir, fileName);

      await fs.mkdir(mediaDir, { recursive: true });
      await fs.writeFile(filePath, screenshot);

      const response: ScreenshotResponse = {
        success: true,
        filePath,
        fileName,
        extension,
        type,
      };
      res.json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
    * Generate PDF
    */
  public async pdf(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { format = 'A4', printBackground = true } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      const pdf = await tab.page.pdf({
        format,
        printBackground,
      });

      const fileName = generateFilename('pdf', 'pdf');
      const mediaDir = getMediaDir();
      const filePath = path.join(mediaDir, fileName);

      await fs.mkdir(mediaDir, { recursive: true });
      await fs.writeFile(filePath, pdf);

      const response: PdfResponse = {
        success: true,
        filePath,
        fileName,
      };
      res.json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Element Interaction ==============

  /**
   * Click element
   */
  public async click(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector, clickCount = 1, delay = 0 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.locator(selector).first().click({ clickCount, delay });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Type text
   */
  public async type(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector, text, delay = 0 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.locator(selector).first().type(text, { delay });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Fill input field
   */
  public async fill(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector, text } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.locator(selector).first().fill(text);

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Hover over element
   */
  public async hover(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.locator(selector).first().hover();

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Focus on element
   */
  public async focus(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.locator(selector).first().focus();

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Click at coordinates
   */
  public async clickAt(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { x, y } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.mouse.click(x, y);

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Element Discovery ==============

  /**
   * Find elements
   */
  public async findElements(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector, type = 'css', limit = 10 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      let elements;
      if (type === 'xpath') {
        elements = await tab.page.locator(`xpath=${selector}`).all();
      } else {
        elements = await tab.page.locator(selector).all();
      }

      const results = [];
       for (let i = 0; i < Math.min(elements.length, limit); i++) {
        const el = elements[i];
        const box = await (el as any).boundingBox().catch(() => null);
        results.push({
          index: i,
          tagName: await (el as any).evaluate((e: any) => e.tagName),
          text: (await (el as any).evaluate((e: any) => e.textContent?.substring(0, 100) || '')) || '',
          visible: await (el as any).isVisible(),
          boundingBox: box,
        });
      }

      res.json({
        success: true,
        elements: results,
        total: Math.min(elements.length, limit),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Get element info
   */
  public async getElementInfo(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      const element = tab.page.locator(selector).first();

      const info = {
        tagName: await element.evaluate((e: any) => e.tagName),
        id: await element.evaluate((e: any) => e.id),
        className: await element.evaluate((e: any) => e.className),
        text: (await element.evaluate((e: any) => e.textContent?.substring(0, 500) || '')) || '',
        innerHTML: (await element.evaluate((e: any) => e.innerHTML?.substring(0, 1000) || '')) || '',
        visible: await element.isVisible(),
        enabled: await element.isEnabled(),
        checked: (await element.evaluate((e: any) => (e as any).checked).catch(() => false)),
        attributes: await element.evaluate((e: any) => {
          const attrs: Record<string, string> = {};
          for (const attr of e.attributes) {
            attrs[attr.name] = attr.value;
          }
          return attrs;
        }),
        boundingBox: await element.boundingBox().catch(() => null),
      };

      res.json({ success: true, ...info });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Waiting & Conditions ==============

  /**
   * Wait for timeout
   */
  public async waitTimeout(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { ms } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.waitForTimeout(ms);

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Wait for selector
   */
  public async waitForSelector(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector, timeout = 5000, state = 'visible' } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.waitForSelector(selector, { timeout, state } as any);

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Wait for navigation
   */
  public async waitForNavigation(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { url, waitUntil = 'load', timeout = 30000 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      if (url) {
        await tab.page.waitForURL(url, { timeout } as any);
      } else {
        await tab.page.waitForLoadState(waitUntil, { timeout }).catch(() => {
          return tab.page.waitForLoadState('domcontentloaded', { timeout });
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Wait for network idle
   */
  public async waitForNetworkIdle(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { timeout = 30000 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.waitForLoadState('networkidle', { timeout });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Storage ==============

  /**
   * Get all cookies
   */
  public async getCookies(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      const cookies = await (tab.context as any).cookies();
      res.json({ success: true, cookies });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Set cookie
   */
  public async setCookie(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const cookieData = req.body;

      const tab = this.tabManager.getTab(sessionId);
      if (!cookieData.path) {
        cookieData.path = '/';
      }

      await (tab.context as any).addCookies([cookieData]);
      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Clear all cookies
   */
  public async clearCookies(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      await (tab.context as any).clearCookies();
      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Delete specific cookie
   */
  public async deleteCookie(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { name } = req.params;
      const tab = this.tabManager.getTab(sessionId);

      const cookies = await (tab.context as any).cookies();
      const cookieToDelete = cookies.find((c: any) => c.name === name);

      if (cookieToDelete) {
        await (tab.context as any).addCookies([
          {
            name,
            value: '',
            domain: cookieToDelete.domain,
            path: cookieToDelete.path,
            expires: Math.floor(Date.now() / 1000) - 86400,
          },
        ]);
      }

      res.json({ success: true, deleted: !!cookieToDelete });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Get localStorage
   */
  public async getLocalStorage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      const storage = await tab.page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)!;
          data[key] = localStorage.getItem(key) || '';
        }
        return data;
      });

      res.json({ success: true, storage });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Set localStorage item
   */
  public async setLocalStorage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { key, value } = req.body;
      const tab = this.tabManager.getTab(sessionId);

      await tab.page.evaluate((args: { key: string; value: string }) => {
        localStorage.setItem(args.key, args.value);
      }, { key, value });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Clear localStorage
   */
  public async clearLocalStorage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      await tab.page.evaluate(() => localStorage.clear());
      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Get sessionStorage
   */
  public async getSessionStorage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      const storage = await tab.page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)!;
          data[key] = sessionStorage.getItem(key) || '';
        }
        return data;
      });

      res.json({ success: true, storage });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Set sessionStorage item
   */
  public async setSessionStorage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { key, value } = req.body;
      const tab = this.tabManager.getTab(sessionId);

      await tab.page.evaluate((args: { key: string; value: string }) => {
        sessionStorage.setItem(args.key, args.value);
      }, { key, value });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Clear sessionStorage
   */
  public async clearSessionStorage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      await tab.page.evaluate(() => sessionStorage.clear());
      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Network Monitoring ==============

  /**
   * Get network requests
   */
  public async getNetworkRequests(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { limit = 100 } = req.query;

      const tab = this.tabManager.getTab(sessionId);
      const requests = (tab.networkRequests || []).slice(-parseInt(limit as string));

      res.json({ success: true, requests });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Clear network logs
   */
  public async clearNetwork(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      tab.networkRequests = [];
      tab.networkResponses = [];
      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Get request/response details
   */
  public async getRequestDetails(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { requestId } = req.params;
      const tab = this.tabManager.getTab(sessionId);

      const request = (tab.networkRequests || []).find(r => r.id === requestId);
      const response = (tab.networkResponses || []).find(r => r.id === requestId);

      res.json({ success: true, request, response });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Setup network interception
   */
  public async networkIntercept(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { enabled = true, patterns = ['**/*'] } = req.body;
      const tab = this.tabManager.getTab(sessionId);

      tab.interceptedPatterns = patterns;

      if (enabled && patterns.length > 0) {
        for (const pattern of patterns) {
          await (tab.page as any).route(pattern, async (route: any) => {
            const mocked = tab.mockedResponses.get(route.request().url());
            if (mocked) {
              await route.fulfill({
                status: mocked.status,
                headers: mocked.headers,
                body: mocked.body,
              });
            } else if (tab.networkAbortPatterns?.some(p => route.request().url().includes(p))) {
              await route.abort();
            } else {
              await route.continue();
            }
          });
        }
      } else {
        (tab.page as any).unroute();
      }

      res.json({ success: true, enabled, patterns });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Mock network response
   */
  public async networkMockResponse(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { pattern, status = 200, headers = {}, body = '' } = req.body;
      const tab = this.tabManager.getTab(sessionId);

      tab.mockedResponses.set(pattern, { pattern, status, headers, body });
      res.json({ success: true, pattern });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Abort network request
   */
  public async networkAbort(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { pattern } = req.body;
      const tab = this.tabManager.getTab(sessionId);

      tab.networkAbortPatterns = tab.networkAbortPatterns || [];
      if (pattern) {
        tab.networkAbortPatterns.push(pattern);
      }

      res.json({ success: true, patterns: tab.networkAbortPatterns });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Console Monitoring ==============

  /**
   * Get console logs
   */
  public async getConsoleLogs(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { limit = 50, types } = req.query;

      const tab = this.tabManager.getTab(sessionId);

      let logs = tab.consoleLogs || [];

      if (types) {
        const allowedTypes = (types as string).split(',');
        logs = logs.filter(log => allowedTypes.includes(log.type));
      }

      logs = logs.slice(-parseInt(limit as string));

      res.json({ success: true, logs });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Clear console logs
   */
  public async clearConsoleLogs(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      tab.consoleLogs = [];
      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Keyboard & Mouse ==============

  /**
   * Keyboard press
   */
  public async keyboardPress(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { key, delay = 0 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.keyboard.press(key, { delay });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Keyboard type
   */
  public async keyboardType(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { text, delay = 0 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.keyboard.type(text, { delay });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Mouse click at coordinates
   */
  public async mouseClick(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { x, y } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.mouse.click(x, y);

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Mouse move
   */
  public async mouseMove(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { x, y } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.mouse.move(x, y);

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Permissions ==============

  /**
   * Grant permissions
   */
  public async grantPermissions(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { permissions = [] } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await (tab.context as any).grantPermissions(permissions);

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Clear permissions
   */
  public async clearPermissions(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const tab = this.tabManager.getTab(sessionId);

      await (tab.context as any).clearPermissions();
      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Emulation ==============

  /**
   * Emulate viewport
   */
  public async emulateViewport(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { width, height, isMobile } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.setViewportSize({ width, height });

      if (isMobile !== undefined) {
        await tab.page.emulateMedia({ media: isMobile ? 'screen' : 'print', viewport: null });
      }

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Emulate user agent
   */
  public async emulateUserAgent(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { userAgent } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.setExtraHTTPHeaders({ 'User-Agent': userAgent });

      res.json({ success: true, userAgent });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Emulate geolocation
   */
  public async emulateGeolocation(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { latitude, longitude, accuracy = 0 } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.context.setGeolocation({ latitude, longitude, accuracy });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Emulate media features
   */
  public async emulateMedia(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { media, colorScheme, reducedMotion } = req.body;

      const tab = this.tabManager.getTab(sessionId);
      await tab.page.emulateMedia({ media, colorScheme, reducedMotion });

      res.json({ success: true });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== File Operations ==============

  /**
   * Upload files
   */
  public async fileUpload(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = (req as any).sessionId;
      const { selector, files } = req.body;
      const tab = this.tabManager.getTab(sessionId);

      await tab.page.locator(selector).setInputFiles(files);
      res.json({ success: true, uploaded: files });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============== Chain Actions ==============

  /**
   * Execute multiple actions in sequence
   */
  public async chainActions(req: Request, res: Response): Promise<void> {
    try {
      const { actions, stopOnError = true } = req.body;

      const results = [];
      let succeededCount = 0;
      let failedCount = 0;

      for (const action of actions) {
        try {
          const result = await this.executeChainAction(action);
          results.push({
            success: true,
            type: action.type,
            result,
          });
          succeededCount++;
        } catch (error: any) {
          results.push({
            success: false,
            type: action.type,
            error: error.message,
          });
          failedCount++;

          if (stopOnError) {
            break;
          }
        }
      }

      res.json({
        success: true,
        results,
        allSucceeded: failedCount === 0,
        totalActions: actions.length,
        succeededActions: succeededCount,
        failedActions: failedCount,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Execute a single chain action
   */
  private async executeChainAction(action: any): Promise<any> {
    const { type, sessionId, options } = action;

    // This would need to call the appropriate method based on type
    // For now, this is a placeholder
    return { type, options };
  }

  // ============== Error Handling ==============

  /**
   * Handle errors consistently
   */
  private handleError(error: any, res: Response): void {
    console.error('Tab controller error:', error.message, error.stack);

    if (error instanceof InvalidSessionError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error instanceof BrowserToolError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
}

// Export singleton instance
export default new TabsController();
