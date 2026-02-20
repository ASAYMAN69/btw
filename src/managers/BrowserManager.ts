import { chromium, Browser, BrowserContext } from 'playwright';
import {
  BrowserLaunchOptions,
  BrowserState,
  BrowserToolError,
  type BrowserActionResponse,
} from '../types';

/**
 * BrowserManager - Singleton class to manage browser instance
 *
 * Responsibilities:
 * - Auto-launch browser on server start
 * - Ensure browser is available before operations
 * - Auto-relaunch browser if disconnected
 * - Provide singleton access to browser instance
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private launchOptions: BrowserLaunchOptions;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  private constructor() {
    this.launchOptions = {
      headless: false,
      devtools: false,
      slowMo: 0,
      args: [
        '--start-maximized',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
      ],
    };
  }

  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /**
   * Ensure browser is launched and connected
   * Relaunches automatically if browser is disconnected
   *
   * @returns Promise<Browser>
   */
  public async ensureBrowser(options?: BrowserLaunchOptions): Promise<any> {
    // Check if browser exists and is connected
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    // Browser is not connected - launch new instance
    return await this.launch(options);
  }

  /**
   * Launch a new browser instance
   *
   * @param options - Optional launch options
   * @returns Promise<BrowserActionResponse>
   */
  public async launch(options?: BrowserLaunchOptions): Promise<BrowserActionResponse> {
    // Check if browser is already launched and connected
    if (this.browser && this.browser.isConnected()) {
      throw new BrowserToolError('Browser is already launched', 409);
    }

    // Merge provided options with defaults
    // Preserve headless: false for visibility
    const launchOptions: any = {
      ...this.launchOptions,
      ...options,
    };

    // Ensure headless is false (visible browser)
    if (launchOptions.headless === undefined || launchOptions.headless === 'new') {
      launchOptions.headless = false;
    }

    try {
      // Launch browser
      this.browser = await chromium.launch(launchOptions);
      this.reconnectAttempts = 0;

      // Monitor for disconnection
      this.browser.on('disconnected', () => {
        console.error('Browser disconnected (window closed or crashed)');
        this.browser = null;
      });

      console.log('✅ Browser launched:', launchOptions.headless ? 'Headless mode' : 'Visible mode');

      return {
        success: true,
        message: 'Browser launched successfully',
      };
    } catch (error: any) {
      this.browser = null;
      throw new BrowserToolError(
        `Failed to launch browser: ${error.message}`,
        500,
        error
      );
    }
  }

  /**
   * Close the browser instance
   *
   * @returns Promise<BrowserActionResponse>
   */
  public async close(): Promise<BrowserActionResponse> {
    if (!this.browser || !this.browser.isConnected()) {
      throw new BrowserToolError('Browser is not launched', 404);
    }

    try {
      await this.browser.close();
      this.browser = null;

      return {
        success: true,
        message: 'Browser closed successfully',
      };
    } catch (error: any) {
      throw new BrowserToolError(
        `Failed to close browser: ${error.message}`,
        500,
        error
      );
    }
  }

  /**
   * Restart the browser instance
   *
   * @param options - Optional launch options
   * @returns Promise<BrowserActionResponse>
   */
  public async restart(options?: BrowserLaunchOptions): Promise<BrowserActionResponse> {
    const currentOptions = { ...this.launchOptions };

    // Close existing browser if connected
    if (this.browser && this.browser.isConnected()) {
      await this.close();
    }

    // Launch new browser with options
    return await this.launch({ ...currentOptions, ...options });
  }

  /**
   * Get current browser status
   *
   * @returns BrowserState
   */
  public getStatus(): BrowserState {
    const isLaunched = !!(this.browser && this.browser.isConnected());

    return {
      isLaunched,
      isConnected: isLaunched,
      pid: (this.browser as any)?.process?.()?.pid,
    };
  }

  /**
   * Get the browser instance (throws if not connected)
   *
   * @returns Browser
   * @throws BrowserToolError if browser is not launched
   */
  public getBrowser(): Browser {
    if (!this.browser || !this.browser.isConnected()) {
      throw new BrowserToolError('Browser is not launched', 503);
    }

    return this.browser;
  }

  /**
   * Get browser version
   *
   * @returns Promise<string>
   */
  public async getVersion(): Promise<string> {
    try {
      return chromium.executablePath();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get all contexts in browser
   *
   * @returns Array<BrowserContext>
   */
  public getContexts(): any[] {
    if (!this.browser || !this.browser.isConnected()) {
      return [];
    }

    return this.browser.contexts();
  }

  /**
   * Get context by ID
   *
   * @param contextId - Context ID
   * @returns BrowserContext | undefined
   */
  public getContextById(contextId: string): any {
    const contexts = this.getContexts();
    return contexts.find((c: any) => c._id === contextId);
  }

  /**
   * Create a new browser context
   *
   * @param options - Context options
   * @returns Promise<BrowserContext>
   */
  public async createContext(options: any = {}): Promise<any> {
    const browser = this.getBrowser();
    return await browser.newContext(options);
  }
}

export default BrowserManager;
