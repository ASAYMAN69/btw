const express = require('express');
const router = express.Router();

const usercontrolledController = require('../controllers/usercontrolledController');

router.post('/:browserName/launch', usercontrolledController.launch);
router.post('/:browserName/close', usercontrolledController.close);
router.post('/:browserName/restart', usercontrolledController.restart);
router.get('/:browserName/status', usercontrolledController.status);

router.post('/:browserName/create-profile', usercontrolledController.createProfile);
router.get('/:browserName/profiles', usercontrolledController.listProfiles);
router.get('/:browserName/:profileId/info', usercontrolledController.getProfileInfo);
router.post('/:browserName/:profileId/switch', usercontrolledController.switchProfile);
router.delete('/:browserName/:profileId/close', usercontrolledController.closeProfile);

router.post('/:browserName/:profileId/goto', usercontrolledController.goto);
router.post('/:browserName/:profileId/back', usercontrolledController.back);
router.post('/:browserName/:profileId/forward', usercontrolledController.forward);
router.post('/:browserName/:profileId/reload', usercontrolledController.reload);

router.post('/:browserName/:profileId/elements/find', usercontrolledController.findElements);
router.post('/:browserName/:profileId/element/info', usercontrolledController.getElementInfo);

router.post('/:browserName/:profileId/element/click', usercontrolledController.click);
router.post('/:browserName/:profileId/element/type', usercontrolledController.type);
router.post('/:browserName/:profileId/element/fill', usercontrolledController.fill);
router.post('/:browserName/:profileId/element/scroll', usercontrolledController.scroll);
router.post('/:browserName/:profileId/element/hover', usercontrolledController.hover);
router.post('/:browserName/:profileId/element/focus', usercontrolledController.focus);
router.post('/:browserName/:profileId/element/wait', usercontrolledController.waitForSelector);
router.post('/:browserName/:profileId/element/click-at', usercontrolledController.clickAt);
router.post('/:browserName/:profileId/element/tap', usercontrolledController.tap);
router.post('/:browserName/:profileId/element/screenshot', usercontrolledController.elementScreenshot);
router.post('/:browserName/:profileId/element/double-click', usercontrolledController.doubleClick);
router.post('/:browserName/:profileId/element/right-click', usercontrolledController.rightClick);

router.post('/:browserName/:profileId/screenshot', usercontrolledController.screenshot);
router.post('/:browserName/:profileId/pdf', usercontrolledController.pdf);

router.post('/:browserName/:profileId/devtools/open', usercontrolledController.openDevTools);
router.post('/:browserName/:profileId/devtools/close', usercontrolledController.closeDevTools);

router.get('/:browserName/:profileId/network/requests', usercontrolledController.getNetworkRequests);
router.post('/:browserName/:profileId/network/clear', usercontrolledController.clearNetwork);
router.post('/:browserName/:profileId/network/intercept', usercontrolledController.networkIntercept);
router.post('/:browserName/:profileId/network/abort', usercontrolledController.networkAbort);
router.post('/:browserName/:profileId/network/mock-response', usercontrolledController.networkMockResponse);
router.get('/:browserName/:profileId/network/request/:requestId', usercontrolledController.getRequestDetails);

router.get('/:browserName/:profileId/console/logs', usercontrolledController.getConsoleLogs);
router.post('/:browserName/:profileId/console/clear', usercontrolledController.clearConsoleLogs);

router.post('/:browserName/:profileId/evaluate', usercontrolledController.evaluate);

router.post('/:browserName/:profileId/form/submit', usercontrolledController.submitForm);
router.post('/:browserName/:profileId/form/reset', usercontrolledController.resetForm);
router.post('/:browserName/:profileId/form/fill-multiple', usercontrolledController.fillMultipleForm);

router.get('/:browserName/:profileId/cookies', usercontrolledController.getCookies);
router.post('/:browserName/:profileId/cookies/set', usercontrolledController.setCookie);
router.delete('/:browserName/:profileId/cookies/clear', usercontrolledController.clearCookies);
router.delete('/:browserName/:profileId/cookies/:name', usercontrolledController.deleteCookie);

router.get('/:browserName/:profileId/storage/local', usercontrolledController.getLocalStorage);
router.post('/:browserName/:profileId/storage/local/set', usercontrolledController.setLocalStorage);
router.delete('/:browserName/:profileId/storage/local/clear', usercontrolledController.clearLocalStorage);

router.get('/:browserName/:profileId/storage/session', usercontrolledController.getSessionStorage);
router.post('/:browserName/:profileId/storage/session/set', usercontrolledController.setSessionStorage);
router.delete('/:browserName/:profileId/storage/session/clear', usercontrolledController.clearSessionStorage);

router.post('/:browserName/:profileId/wait/timeout', usercontrolledController.waitForTimeout);
router.post('/:browserName/:profileId/wait/load', usercontrolledController.waitForLoad);
router.post('/:browserName/:profileId/wait/navigation', usercontrolledController.waitForNavigation);
router.post('/:browserName/:profileId/wait/signal', usercontrolledController.waitForSignal);
router.post('/:browserName/:profileId/wait/network-idle', usercontrolledController.waitForNetworkIdle);
router.post('/:browserName/:profileId/wait/selector', usercontrolledController.waitForSelector);

router.post('/:browserName/:profileId/emulation/viewport', usercontrolledController.emulationViewport);
router.post('/:browserName/:profileId/emulation/user-agent', usercontrolledController.emulationUserAgent);
router.post('/:browserName/:profileId/emulation/geolocation', usercontrolledController.emulationGeolocation);
router.post('/:browserName/:profileId/emulation/media', usercontrolledController.emulationMedia);

router.post('/:browserName/:profileId/dialog/accept', usercontrolledController.dialogAccept);
router.post('/:browserName/:profileId/dialog/dismiss', usercontrolledController.dialogDismiss);
router.post('/:browserName/:profileId/dialog/on', usercontrolledController.dialogOn);

router.post('/:browserName/:profileId/file/upload', usercontrolledController.fileUpload);
router.post('/:browserName/:profileId/file/download-start', usercontrolledController.downloadStart);
router.post('/:browserName/:profileId/file/download-stop', usercontrolledController.downloadStop);
router.get('/:browserName/:profileId/file/downloads', usercontrolledController.getDownloads);

router.post('/:browserName/:profileId/keyboard/down', usercontrolledController.keyboardDown);
router.post('/:browserName/:profileId/keyboard/up', usercontrolledController.keyboardUp);
router.post('/:browserName/:profileId/keyboard/press', usercontrolledController.keyboardPress);
router.post('/:browserName/:profileId/keyboard/type', usercontrolledController.keyboardType);

router.post('/:browserName/:profileId/mouse/move', usercontrolledController.mouseMove);
router.post('/:browserName/:profileId/mouse/down', usercontrolledController.mouseDown);
router.post('/:browserName/:profileId/mouse/up', usercontrolledController.mouseUp);
router.post('/:browserName/:profileId/mouse/wheel', usercontrolledController.mouseWheel);

router.get('/:browserName/:profileId/frames', usercontrolledController.getFrames);
router.post('/:browserName/:profileId/frames/:frameId/evaluate', usercontrolledController.evaluateInFrame);

router.get('/:browserName/:profileId/accessibility/tree', usercontrolledController.getAccessibilityTree);
router.get('/:browserName/:profileId/accessibility/snapshot', usercontrolledController.getAccessibilitySnapshot);

router.get('/:browserName/:profileId/performance/metrics', usercontrolledController.getPerformanceMetrics);
router.post('/:browserName/:profileId/performance/trace-start', usercontrolledController.traceStart);
router.post('/:browserName/:profileId/performance/trace-stop', usercontrolledController.traceStop);
router.post('/:browserName/:profileId/performance/coverage-start', usercontrolledController.coverageStart);
router.post('/:browserName/:profileId/performance/coverage-stop', usercontrolledController.coverageStop);

router.get('/:browserName/:profileId/websockets', usercontrolledController.getWebsockets);
router.get('/:browserName/:profileId/websockets/:wsId/messages', usercontrolledController.getWebsocketMessages);

router.post('/:browserName/:profileId/permissions/grant', usercontrolledController.grantPermissions);
router.post('/:browserName/:profileId/permissions/clear', usercontrolledController.clearPermissions);

module.exports = router;
