import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as os from 'os';

// ============== Session Management ==============

/**
 * Session ID type (UUID v4 string)
 */
export type SessionId = string;

/**
 * Generate a new session ID
 */
export function generateSessionId(): SessionId {
  return uuidv4();
}

// ============== File Utilities ==============

/**
 * Get the home directory path for the current platform
 */
export function getHomeDir(): string {
  return os.homedir();
}

/**
 * Get the media directory path (btw_media in user's home directory)
 */
export function getMediaDir(): string {
  return path.join(getHomeDir(), 'btw_media');
}

/**
 * Generate a timestamped filename
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

// ============== Browser Types ==============

/**
 * Browser instance state
 */
export interface BrowserState {
  isLaunched: boolean;
  isConnected: boolean;
  pid?: number;
  version?: string;
}

/**
 * Browser launch options
 */
export interface BrowserLaunchOptions {
  headless?: boolean | 'new';
  devtools?: boolean;
  slowMo?: number;
  args?: string[];
}

// ============== Tab Types ==============

/**
 * Tab data stored in session
 */
export interface TabData {
  sessionId: SessionId;
  context: any; // BrowserContext
  page: any; // Page
  createdAt: number;
  contextId: string;
  pageInfo: PageInfo;
  consoleLogs: ConsoleLog[];
  networkRequests: NetworkRequest[];
  networkResponses: NetworkResponse[];
  dialogHandler?: DialogHandler;
  websockets: WebSocketInfo[];
  interceptedPatterns: string[];
  networkAbortPatterns?: string[];
  mockedResponses: Map<string, MockResponseData>;
  downloadPromise?: any;
  downloadPath?: string;
}

/**
 * Page information
 */
export interface PageInfo {
  url: string;
  title: string;
  viewport?: { width: number; height: number };
  isLoaded: boolean;
  isVisible: boolean;
}

/**
 * Tab creation options
 */
export interface TabCreateOptions {
  viewport?: { width: number; height: number };
  userAgent?: string;
  locale?: string;
  timezone?: string;
}

/**
 * Tab information response
 */
export interface TabInfoResponse {
  sessionId: SessionId;
  url: string;
  title: string;
  viewport?: { width: number; height: number };
  isActive: boolean;
  createdAt: number;
}

// ============== Navigation ==============

/**
 * Navigation options
 */
export interface NavigateOptions {
  url: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  timeout?: number;
  referer?: string;
}

/**
 * Navigation response
 */
export interface NavigateResponse {
  success: boolean;
  url: string;
  title?: string;
}

// ============== Element Interaction ==============

/**
 * Click options
 */
export interface ClickOptions {
  selector: string;
  clickCount?: number;
  delay?: number;
  button?: 'left' | 'right' | 'middle';
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
}

/**
 * Type/Fill options
 */
export interface TypeOptions {
  selector: string;
  text: string;
  delay?: number;
}

/**
 * Hover options
 */
export interface HoverOptions {
  selector: string;
}

// ============== JavaScript Evaluation ==============

/**
 * JavaScript evaluation options
 */
export interface EvaluateOptions {
  script: string;
  await?: boolean;
}

/**
 * JavaScript evaluation response
 */
export interface EvaluateResponse {
  success: boolean;
  result?: any;
  error?: string;
}

// ============== Screenshot & PDF ==============

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  type?: 'png' | 'jpeg';
  fullPage?: boolean;
  quality?: number;
  clip?: BoundingBox;
}

/**
 * Screenshot response
 */
export interface ScreenshotResponse {
  success: true;
  filePath: string;
  fileName: string;
  extension: string;
  type: string;
}

/**
 * PDF generation options
 */
export interface PdfOptions {
  format?: 'A4' | 'Letter' | 'Legal' | 'Tabloid' | 'Ledger';
  landscape?: boolean;
  printBackground?: boolean;
  scale?: number;
  displayHeaderFooter?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * PDF response
 */
export interface PdfResponse {
  success: true;
  filePath: string;
  fileName: string;
}

// ============== Element Finding ==============

/**
 * Element information
 */
export interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  text?: string;
  innerHTML?: string;
  visible: boolean;
  enabled: boolean;
  checked?: boolean;
  attributes: Record<string, string>;
  boundingBox?: BoundingBox;
}

/**
 * Bounding box
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Find elements options
 */
export interface FindElementsOptions {
  selector: string;
  type?: 'css' | 'xpath';
  limit?: number;
}

/**
 * Find elements response
 */
export interface FindElementsResponse {
  success: true;
  elements: Array<{
    index: number;
    tagName: string;
    text: string;
    visible: boolean;
    boundingBox?: BoundingBox;
  }>;
  total: number;
}

// ============== Network Monitoring ==============

/**
 * Network request info
 */
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
  resourceType: string;
  timestamp: number;
}

/**
 * Network response info
 */
export interface NetworkResponse {
  id: string;
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  ok: boolean;
  timestamp: number;
  bodySize?: number;
}

/**
 * Mock response data
 */
export interface MockResponseData {
  pattern: string;
  status: number;
  headers: Record<string, string>;
  body: string;
}

// ============== Console Monitoring ==============

/**
 * Console log info
 */
export interface ConsoleLog {
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  text: string;
  location: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
  timestamp: number;
}

// ============== Storage ==============

/**
 * Cookie
 */
export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Storage data
 */
export interface StorageData {
  [key: string]: string;
}

// ============== Dialogs ==============

/**
 * Dialog handler configuration
 */
export interface DialogHandler {
  action: 'accept' | 'dismiss';
  promptText?: string;
}

// ============== WebSocket ==============

/**
 * WebSocket info
 */
export interface WebSocketInfo {
  id: string;
  url: string;
  opened: number;
  messages?: WebSocketMessage[];
}

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  server: boolean;
  text: string;
  timestamp: number;
}

// ============== Waiting & Conditions ==============

/**
 * Wait for timeout options
 */
export interface WaitTimeoutOptions {
  ms: number;
}

/**
 * Wait for selector options
 */
export interface WaitForSelectorOptions {
  selector: string;
  timeout?: number;
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
}

/**
 * Wait for navigation options
 */
export interface WaitForNavigationOptions {
  url?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  timeout?: number;
}

/**
 * Wait for network idle options
 */
export interface WaitForNetworkIdleOptions {
  timeout?: number;
  concurrency?: number;
}

// ============== Keyboard & Mouse ==============

/**
 * Keyboard press options
 */
export interface KeyboardPressOptions {
  key: string;
  delay?: number;
}

/**
 * Keyboard type options
 */
export interface KeyboardTypeOptions {
  text: string;
  delay?: number;
}

/**
 * Mouse move options
 */
export interface MouseMoveOptions {
  x: number;
  y: number;
}

/**
 * Mouse click options
 */
export interface MouseClickOptions {
  x: number;
  y: number;
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
}

// ============== Files & Downloads ==============

/**
 * File upload options
 */
export interface FileUploadOptions {
  selector: string;
  files: string[];
}

/**
 * Download start options
 */
export interface DownloadStartOptions {
  path?: string;
}

// ============== Permissions ==============

/**
 * Permission types
 */
export type Permission =
  | 'geolocation'
  | 'notifications'
  | 'camera'
  | 'microphone'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'midi-sysex'
  | 'midi';

/**
 * Grant permissions options
 */
export interface GrantPermissionsOptions {
  permissions: Permission[];
}

// ============== Emulation ==============

/**
 * Viewport emulation options
 */
export interface EmulateViewportOptions {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

/**
 * User agent emulation options
 */
export interface EmulateUserAgentOptions {
  userAgent: string;
}

/**
 * Geolocation emulation options
 */
export interface EmulateGeolocationOptions {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Media emulation options
 */
export interface EmulateMediaOptions {
  media?: 'screen' | 'print';
  colorScheme?: 'light' | 'dark' | 'no-preference' | 'high-contrast';
  reducedMotion?: 'reduce' | 'no-preference';
}

// ============== Errors ==============

/**
 * API error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

/**
 * Success response wrapper
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Generic API response
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// ============== API Request/Response ==============

/**
 * Create tab request
 */
export interface CreateTabRequest {
  options?: TabCreateOptions;
}

/**
 * Create tab response
 */
export interface CreateTabResponse extends SuccessResponse {
  sessionId: SessionId;
  message: string;
  createdAt: number;
}

/**
 * Close tab response
 */
export interface CloseTabResponse extends SuccessResponse {
  message: string;
}

/**
 * List tabs response
 */
export interface ListTabsResponse extends SuccessResponse {
  tabs: TabInfoResponse[];
}

/**
 * Browser status response
 */
export interface BrowserStatusResponse extends SuccessResponse {
  launched: boolean;
  contexts: Array<{
    id: string;
    pages: Array<{
      id: string;
      url: string;
      title: string;
    }>;
  }>;
  version: string;
  totalTabs: number;
}

/**
 * Browser launch/restart/close response
 */
export interface BrowserActionResponse extends SuccessResponse {
  message: string;
}

// ============== Chain Actions ==============

/**
 * Chain action request
 */
export interface ChainAction {
  type: string;
  sessionId: SessionId;
  options?: any;
}

/**
 * Chain actions request
 */
export interface ChainActionsRequest {
  actions: ChainAction[];
  stopOnError?: boolean;
}

/**
 * Chain action result
 */
export interface ChainActionResult {
  success: boolean;
  type: string;
  result?: any;
  error?: string;
}

/**
 * Chain actions response
 */
export interface ChainActionsResponse extends SuccessResponse {
  results: ChainActionResult[];
  allSucceeded: boolean;
  totalActions: number;
  succeededActions: number;
  failedActions: number;
}

// ============== Express Types ==============

/**
 * Typed request with session ID
 */
export interface SessionRequest extends Request {
  sessionId?: SessionId;
}

/**
 * Custom error class
 */
export class BrowserToolError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'BrowserToolError';
    Object.setPrototypeOf(this, BrowserToolError.prototype);
  }
}

/**
 * Invalid Session error
 */
export class InvalidSessionError extends BrowserToolError {
  constructor(sessionId: SessionId) {
    super(`Invalid or expired session ID: ${sessionId}`, 404);
    this.name = 'InvalidSessionError';
    Object.setPrototypeOf(this, InvalidSessionError.prototype);
  }
}

/**
 * Browser not launched error
 */
export class BrowserNotLaunchedError extends BrowserToolError {
  constructor() {
    super('Browser is not launched', 503);
    this.name = 'BrowserNotLaunchedError';
    Object.setPrototypeOf(this, BrowserNotLaunchedError.prototype);
  }
}

/**
 * Element not found error
 */
export class ElementNotFoundError extends BrowserToolError {
  constructor(selector: string) {
    super(`Element not found: ${selector}`, 404);
    this.name = 'ElementNotFoundError';
    Object.setPrototypeOf(this, ElementNotFoundError.prototype);
  }
}
