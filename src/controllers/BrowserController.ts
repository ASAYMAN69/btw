import { Request, Response } from 'express';
import { chromium } from 'playwright';
import { getBrowserManager } from '../managers';
import {
  BrowserState,
  BrowserLaunchOptions,
  BrowserStatusResponse,
  BrowserActionResponse,
  ApiResponse,
} from '../types';

/**
 * BrowserController - Handles browser lifecycle operations
 *
 * Responsibilities:
 * - Get browser status
 * - Launch browser
 * - Close browser
 * - Restart browser
 * - Monitor browser state
 */
export class BrowserController {
  private browserManager = getBrowserManager();

  /**
   * Get current browser status
   */
  public async status(req: Request, res: Response): Promise<void> {
    try {
      const state = this.browserManager.getStatus();

      const contexts = this.browserManager.getContexts().map((c: any) => ({
        id: c._id || 'unknown',
        pages: c.pages().map((p: any) => ({
          id: p._guid || 'unknown',
          url: p.url(),
          title: p.title(),
        })),
      }));

      const version = await this.browserManager.getVersion();

      const response: BrowserStatusResponse = {
        success: true,
        ...state,
        launched: state.isLaunched,
        contexts,
        totalTabs: this.browserManager.getContexts().reduce((total, c) => total + c.pages().length, 0),
        version,
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get browser status',
        message: error.message,
      });
    }
  }

  /**
   * Launch browser
   */
  public async launch(req: Request, res: Response): Promise<void> {
    try {
      const options: BrowserLaunchOptions = {
        headless: req.body.headless !== undefined ? req.body.headless : false,
        devtools: req.body.devtools || false,
        slowMo: req.body.slowMo || 0,
        args: req.body.args || [],
      };

      const result = await this.browserManager.launch(options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to launch browser',
        message: error.message,
      });
    }
  }

  /**
   * Close browser
   */
  public async close(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.browserManager.close();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to close browser',
        message: error.message,
      });
    }
  }

  /**
   * Restart browser
   */
  public async restart(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.browserManager.restart(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to restart browser',
        message: error.message,
      });
    }
  }
}

// Export singleton instance
export default new BrowserController();
