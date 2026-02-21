import { Router } from 'express';
import tabsController from '../controllers/TabsController';
import { validateSessionId } from '../middlewares/validateSession';

const router = Router();

// Tab Lifecycle
router.post('/create', tabsController.createTab.bind(tabsController));
router.get('/list', tabsController.listTabs.bind(tabsController));
router.get('/:sessionId/info', validateSessionId, tabsController.getTabInfo.bind(tabsController));
router.post('/:sessionId/switch', validateSessionId, tabsController.switchTab.bind(tabsController));
router.delete('/:sessionId/close', validateSessionId, tabsController.closeTab.bind(tabsController));

// Navigation
router.post('/:sessionId/goto', validateSessionId, tabsController.goto.bind(tabsController));
router.post('/:sessionId/back', validateSessionId, tabsController.back.bind(tabsController));
router.post('/:sessionId/forward', validateSessionId, tabsController.forward.bind(tabsController));
router.post('/:sessionId/reload', validateSessionId, tabsController.reload.bind(tabsController));

// Content Extraction
router.post('/:sessionId/evaluate', validateSessionId, tabsController.evaluate.bind(tabsController));
router.post('/:sessionId/screenshot', validateSessionId, tabsController.screenshot.bind(tabsController));
router.post('/:sessionId/pdf', validateSessionId, tabsController.pdf.bind(tabsController));

// Element Interaction
router.post('/:sessionId/element/click', validateSessionId, tabsController.click.bind(tabsController));
router.post('/:sessionId/element/type', validateSessionId, tabsController.type.bind(tabsController));
router.post('/:sessionId/element/fill', validateSessionId, tabsController.fill.bind(tabsController));
router.post('/:sessionId/element/hover', validateSessionId, tabsController.hover.bind(tabsController));
router.post('/:sessionId/element/focus', validateSessionId, tabsController.focus.bind(tabsController));
router.post('/:sessionId/element/click-at', validateSessionId, tabsController.clickAt.bind(tabsController));
router.post('/:sessionId/element/scroll', validateSessionId, tabsController.elementScroll.bind(tabsController));
router.post('/:sessionId/element/double-click', validateSessionId, tabsController.doubleClick.bind(tabsController));
router.post('/:sessionId/element/right-click', validateSessionId, tabsController.rightClick.bind(tabsController));
router.post('/:sessionId/element/tap', validateSessionId, tabsController.tap.bind(tabsController));
router.post('/:sessionId/element/screenshot', validateSessionId, tabsController.elementScreenshot.bind(tabsController));

// Element Discovery
router.post('/:sessionId/elements/find', validateSessionId, tabsController.findElements.bind(tabsController));
router.post('/:sessionId/element/info', validateSessionId, tabsController.getElementInfo.bind(tabsController));

// Waiting & Conditions
router.post('/:sessionId/wait/timeout', validateSessionId, tabsController.waitTimeout.bind(tabsController));
router.post('/:sessionId/wait/selector', validateSessionId, tabsController.waitForSelector.bind(tabsController));
router.post('/:sessionId/wait/navigation', validateSessionId, tabsController.waitForNavigation.bind(tabsController));
router.post('/:sessionId/wait/network-idle', validateSessionId, tabsController.waitForNetworkIdle.bind(tabsController));
router.post('/:sessionId/wait/load', validateSessionId, tabsController.waitLoad.bind(tabsController));
router.post('/:sessionId/wait/signal', validateSessionId, tabsController.waitSignal.bind(tabsController));

// Storage - Cookies
router.get('/:sessionId/cookies', validateSessionId, tabsController.getCookies.bind(tabsController));
router.post('/:sessionId/cookies/set', validateSessionId, tabsController.setCookie.bind(tabsController));
router.delete('/:sessionId/cookies/clear', validateSessionId, tabsController.clearCookies.bind(tabsController));
router.delete('/:sessionId/cookies/:name', validateSessionId, tabsController.deleteCookie.bind(tabsController));

// Storage - LocalStorage
router.get('/:sessionId/storage/local', validateSessionId, tabsController.getLocalStorage.bind(tabsController));
router.post('/:sessionId/storage/local/set', validateSessionId, tabsController.setLocalStorage.bind(tabsController));
router.delete('/:sessionId/storage/local/clear', validateSessionId, tabsController.clearLocalStorage.bind(tabsController));

// Storage - SessionStorage
router.get('/:sessionId/storage/session', validateSessionId, tabsController.getSessionStorage.bind(tabsController));
router.post('/:sessionId/storage/session/set', validateSessionId, tabsController.setSessionStorage.bind(tabsController));
router.delete('/:sessionId/storage/session/clear', validateSessionId, tabsController.clearSessionStorage.bind(tabsController));

// Network Monitoring
router.get('/:sessionId/network/requests', validateSessionId, tabsController.getNetworkRequests.bind(tabsController));
router.post('/:sessionId/network/clear', validateSessionId, tabsController.clearNetwork.bind(tabsController));
router.get('/:sessionId/network/:requestId', validateSessionId, tabsController.getRequestDetails.bind(tabsController));
router.post('/:sessionId/network/intercept', validateSessionId, tabsController.networkIntercept.bind(tabsController));
router.post('/:sessionId/network/mock-response', validateSessionId, tabsController.networkMockResponse.bind(tabsController));
router.post('/:sessionId/network/abort', validateSessionId, tabsController.networkAbort.bind(tabsController));

// Console Monitoring
router.get('/:sessionId/console/logs', validateSessionId, tabsController.getConsoleLogs.bind(tabsController));
router.post('/:sessionId/console/clear', validateSessionId, tabsController.clearConsoleLogs.bind(tabsController));

// Keyboard & Mouse
router.post('/:sessionId/keyboard/press', validateSessionId, tabsController.keyboardPress.bind(tabsController));
router.post('/:sessionId/keyboard/type', validateSessionId, tabsController.keyboardType.bind(tabsController));
router.post('/:sessionId/keyboard/down', validateSessionId, tabsController.keyboardDown.bind(tabsController));
router.post('/:sessionId/keyboard/up', validateSessionId, tabsController.keyboardUp.bind(tabsController));
router.post('/:sessionId/mouse/click', validateSessionId, tabsController.mouseClick.bind(tabsController));
router.post('/:sessionId/mouse/move', validateSessionId, tabsController.mouseMove.bind(tabsController));
router.post('/:sessionId/mouse/down', validateSessionId, tabsController.mouseDown.bind(tabsController));
router.post('/:sessionId/mouse/up', validateSessionId, tabsController.mouseUp.bind(tabsController));
router.post('/:sessionId/mouse/wheel', validateSessionId, tabsController.mouseWheel.bind(tabsController));

// Permissions
router.post('/:sessionId/permissions/grant', validateSessionId, tabsController.grantPermissions.bind(tabsController));
router.delete('/:sessionId/permissions/clear', validateSessionId, tabsController.clearPermissions.bind(tabsController));

// Emulation
router.post('/:sessionId/emulation/viewport', validateSessionId, tabsController.emulateViewport.bind(tabsController));
router.post('/:sessionId/emulation/user-agent', validateSessionId, tabsController.emulateUserAgent.bind(tabsController));
router.post('/:sessionId/emulation/geolocation', validateSessionId, tabsController.emulateGeolocation.bind(tabsController));
router.post('/:sessionId/emulation/media', validateSessionId, tabsController.emulateMedia.bind(tabsController));

// File Operations
router.post('/:sessionId/file/upload', validateSessionId, tabsController.fileUpload.bind(tabsController));
router.post('/:sessionId/file/download-start', validateSessionId, tabsController.fileDownloadStart.bind(tabsController));
router.post('/:sessionId/file/download-stop', validateSessionId, tabsController.fileDownloadStop.bind(tabsController));
router.get('/:sessionId/file/downloads', validateSessionId, tabsController.fileDownloads.bind(tabsController));

// Form Handling
router.post('/:sessionId/form/submit', validateSessionId, tabsController.formSubmit.bind(tabsController));
router.post('/:sessionId/form/reset', validateSessionId, tabsController.formReset.bind(tabsController));
router.post('/:sessionId/form/fill-multiple', validateSessionId, tabsController.formFillMultiple.bind(tabsController));

// Dialog Handling
router.post('/:sessionId/dialog/accept', validateSessionId, tabsController.dialogAccept.bind(tabsController));
router.post('/:sessionId/dialog/dismiss', validateSessionId, tabsController.dialogDismiss.bind(tabsController));
router.post('/:sessionId/dialog/on', validateSessionId, tabsController.dialogOn.bind(tabsController));

// Frame Handling
router.get('/:sessionId/frames', validateSessionId, tabsController.getFrames.bind(tabsController));
router.post('/:sessionId/frames/:frameId/evaluate', validateSessionId, tabsController.evaluateInFrame.bind(tabsController));

// Accessibility
router.get('/:sessionId/accessibility/tree', validateSessionId, tabsController.getAccessibilityTree.bind(tabsController));
router.get('/:sessionId/accessibility/snapshot', validateSessionId, tabsController.getAccessibilitySnapshot.bind(tabsController));

// Performance
router.get('/:sessionId/performance/metrics', validateSessionId, tabsController.getPerformanceMetrics.bind(tabsController));
router.post('/:sessionId/performance/trace-start', validateSessionId, tabsController.performanceTraceStart.bind(tabsController));
router.post('/:sessionId/performance/trace-stop', validateSessionId, tabsController.performanceTraceStop.bind(tabsController));
router.post('/:sessionId/performance/coverage-start', validateSessionId, tabsController.performanceCoverageStart.bind(tabsController));
router.post('/:sessionId/performance/coverage-stop', validateSessionId, tabsController.performanceCoverageStop.bind(tabsController));

// WebSocket
router.get('/:sessionId/websockets', validateSessionId, tabsController.getWebSockets.bind(tabsController));
router.get('/:sessionId/websockets/:wsId/messages', validateSessionId, tabsController.getWebSocketMessages.bind(tabsController));

// Chain Actions
router.post('/chain', tabsController.chainActions.bind(tabsController));

export default router;
