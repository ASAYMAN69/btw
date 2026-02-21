import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { getBrowserManager, getTabManager } from './managers';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import browserRoutes from './routes/browser.routes';
import tabsRoutes from './routes/tabs.routes';

/**
 * AI Browser Tool - Main Server
 *
 * A RESTful API server that enables AI models to control a browser programmatically.
 *
 * Core Features:
 * - Auto-launch browser on server start
 * - Session-based tab management with unique session IDs
 * - Persistent tabs until manual closure
 * - Browser auto-relaunch on disconnection
 * - Comprehensive browser automation capabilities
 */

const DEFAULT_PORT = 5409;

function getValidPort(portFromEnv?: string): number {
  if (!portFromEnv || portFromEnv.trim() === '') {
    return DEFAULT_PORT;
  }
  const port = parseInt(portFromEnv, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    return DEFAULT_PORT;
  }
  return port;
}

class BrowserToolServer {
  private app: Express;
  private port: number;
  private isShuttingDown: boolean;

  constructor(port?: string | number) {
    this.app = express();
    this.port = getValidPort(typeof port === 'string' ? port : port?.toString());
    this.isShuttingDown = false;

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupGracefulShutdown();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req: Request, res: Response, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.json({
        success: true,
        status: 'ok',
        timestamp: Date.now(),
      });
    });

    // Browser management routes
    this.app.use('/api/browser', browserRoutes);

    // Tab management routes
    this.app.use('/api/tabs', tabsRoutes);
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        console.log('Shutdown already in progress, ignoring signal');
        return;
      }

      this.isShuttingDown = true;
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      try {
        // Close all tabs
        console.log('Closing all tabs...');
        const tabManager = getTabManager();
        await tabManager.clearAllTabs();

        // Close browser
        console.log('Closing browser...');
        const browserManager = getBrowserManager();
        const state = browserManager.getStatus();
        if (state.isLaunched) {
          await browserManager.close();
        }

        console.log('Shutdown complete. Goodbye!');
        process.exit(0);
      } catch (error: any) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const server = this.app.listen(this.port, async () => {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║          AI Browser Tool - RESTful API Server             ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`🚀 Server running on http://localhost:${this.port}`);
        console.log(`📚 API Endpoints:`);
        console.log(`   - Browser:  http://localhost:${this.port}/api/browser`);
        console.log(`   - Tabs:     http://localhost:${this.port}/api/tabs`);
        console.log(`   - Health:   http://localhost:${this.port}/api/health`);
        console.log('');
        console.log(`💡 Usage:`);
        console.log(`   1. POST /api/tabs/create → Get session ID`);
        console.log(`   2. Use session ID for all tab operations`);
        console.log(`   3. Tabs persist until manually closed`);
        console.log('');

        // Auto-launch browser
        console.log('🌐 Auto-launching browser...');
        try {
          const browserManager = getBrowserManager();
          await browserManager.ensureBrowser();
          console.log('✅ Browser auto-launched and ready');
        } catch (error: any) {
          console.error('⚠️  Failed to auto-launch browser:', error.message);
          console.error('   Browser will launch on first API request');
        }

        console.log('');
        console.log('═════════════════════════════════════════════════════════════════');
        console.log('');
        resolve();
      });

      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.syscall !== 'listen') {
          reject(error);
          return;
        }

        const bind = typeof this.port === 'string' ? `Pipe ${this.port}` : `Port ${this.port}`;

        switch (error.code) {
          case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
          default:
            reject(error);
        }
      });
    });
  }
}

// Export for testing
export { BrowserToolServer };

// Start server if this file is run directly
if (require.main === module) {
  const server = new BrowserToolServer(process.env.PORT);
  server.start().catch(console.error);
}

export default BrowserToolServer;
