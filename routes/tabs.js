const express = require('express');
const router = express.Router();

const tabsController = require('../controllers/tabsController');

router.post('/create', tabsController.createTab);
router.get('/list', tabsController.listTabs);
router.get('/:tabId/info', tabsController.getTabInfo);
router.post('/:tabId/switch', tabsController.switchTab);
router.delete('/:tabId/close', tabsController.closeTab);

router.post('/:tabId/goto', tabsController.goto);
router.post('/:tabId/back', tabsController.back);
router.post('/:tabId/forward', tabsController.forward);
router.post('/:tabId/reload', tabsController.reload);

router.post('/:tabId/elements/find', tabsController.findElements);
router.post('/:tabId/element/info', tabsController.getElementInfo);

router.post('/:tabId/element/click', tabsController.click);
router.post('/:tabId/element/type', tabsController.type);
router.post('/:tabId/element/fill', tabsController.fill);
router.post('/:tabId/element/scroll', tabsController.scroll);
router.post('/:tabId/element/hover', tabsController.hover);
router.post('/:tabId/element/focus', tabsController.focus);
router.post('/:tabId/element/wait', tabsController.waitForSelector);
router.post('/:tabId/element/click-at', tabsController.clickAt);
router.post('/:tabId/element/tap', tabsController.tap);
router.post('/:tabId/element/screenshot', tabsController.elementScreenshot);
router.post('/:tabId/element/double-click', tabsController.doubleClick);
router.post('/:tabId/element/right-click', tabsController.rightClick);

router.post('/:tabId/screenshot', tabsController.screenshot);
router.post('/:tabId/pdf', tabsController.pdf);

router.post('/:tabId/devtools/open', tabsController.openDevTools);
router.post('/:tabId/devtools/close', tabsController.closeDevTools);

router.get('/:tabId/network/requests', tabsController.getNetworkRequests);
router.post('/:tabId/network/clear', tabsController.clearNetwork);
router.post('/:tabId/network/intercept', tabsController.networkIntercept);
router.post('/:tabId/network/abort', tabsController.networkAbort);
router.post('/:tabId/network/mock-response', tabsController.networkMockResponse);
router.get('/:tabId/network/request/:requestId', tabsController.getRequestDetails);

router.get('/:tabId/console/logs', tabsController.getConsoleLogs);
router.post('/:tabId/console/clear', tabsController.clearConsoleLogs);

router.post('/:tabId/evaluate', tabsController.evaluate);

router.post('/:tabId/form/submit', tabsController.submitForm);
router.post('/:tabId/form/reset', tabsController.resetForm);
router.post('/:tabId/form/fill-multiple', tabsController.fillMultipleForm);

router.get('/:tabId/cookies', tabsController.getCookies);
router.post('/:tabId/cookies/set', tabsController.setCookie);
router.delete('/:tabId/cookies/clear', tabsController.clearCookies);
router.delete('/:tabId/cookies/:name', tabsController.deleteCookie);

router.get('/:tabId/storage/local', tabsController.getLocalStorage);
router.post('/:tabId/storage/local/set', tabsController.setLocalStorage);
router.delete('/:tabId/storage/local/clear', tabsController.clearLocalStorage);

router.get('/:tabId/storage/session', tabsController.getSessionStorage);
router.post('/:tabId/storage/session/set', tabsController.setSessionStorage);
router.delete('/:tabId/storage/session/clear', tabsController.clearSessionStorage);

router.post('/:tabId/wait/timeout', tabsController.waitForTimeout);
router.post('/:tabId/wait/load', tabsController.waitForLoad);
router.post('/:tabId/wait/navigation', tabsController.waitForNavigation);
router.post('/:tabId/wait/signal', tabsController.waitForSignal);
router.post('/:tabId/wait/network-idle', tabsController.waitForNetworkIdle);
router.post('/:tabId/wait/selector', tabsController.waitForSelector);

router.post('/:tabId/emulation/viewport', tabsController.emulationViewport);
router.post('/:tabId/emulation/user-agent', tabsController.emulationUserAgent);
router.post('/:tabId/emulation/geolocation', tabsController.emulationGeolocation);
router.post('/:tabId/emulation/media', tabsController.emulationMedia);

router.post('/:tabId/dialog/accept', tabsController.dialogAccept);
router.post('/:tabId/dialog/dismiss', tabsController.dialogDismiss);
router.post('/:tabId/dialog/on', tabsController.dialogOn);

router.post('/:tabId/file/upload', tabsController.fileUpload);
router.post('/:tabId/file/download-start', tabsController.downloadStart);
router.post('/:tabId/file/download-stop', tabsController.downloadStop);
router.get('/:tabId/file/downloads', tabsController.getDownloads);

router.post('/:tabId/keyboard/down', tabsController.keyboardDown);
router.post('/:tabId/keyboard/up', tabsController.keyboardUp);
router.post('/:tabId/keyboard/press', tabsController.keyboardPress);
router.post('/:tabId/keyboard/type', tabsController.keyboardType);

router.post('/:tabId/mouse/move', tabsController.mouseMove);
router.post('/:tabId/mouse/down', tabsController.mouseDown);
router.post('/:tabId/mouse/up', tabsController.mouseUp);
router.post('/:tabId/mouse/wheel', tabsController.mouseWheel);

router.get('/:tabId/frames', tabsController.getFrames);
router.post('/:tabId/frames/:frameId/evaluate', tabsController.evaluateInFrame);

router.get('/:tabId/accessibility/tree', tabsController.getAccessibilityTree);
router.get('/:tabId/accessibility/snapshot', tabsController.getAccessibilitySnapshot);

router.get('/:tabId/performance/metrics', tabsController.getPerformanceMetrics);
router.post('/:tabId/performance/trace-start', tabsController.traceStart);
router.post('/:tabId/performance/trace-stop', tabsController.traceStop);
router.post('/:tabId/performance/coverage-start', tabsController.coverageStart);
router.post('/:tabId/performance/coverage-stop', tabsController.coverageStop);

router.get('/:tabId/websockets', tabsController.getWebsockets);
router.get('/:tabId/websockets/:wsId/messages', tabsController.getWebsocketMessages);

router.post('/:tabId/permissions/grant', tabsController.grantPermissions);
router.post('/:tabId/permissions/clear', tabsController.clearPermissions);

module.exports = router;
