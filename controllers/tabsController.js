const { tabManager } = require('../managers');

class TabsController {
  async createTab(req, res) {
     try {
       const options = req.body;
       const result = await tabManager.createTab(options);
       res.json(result);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   }

  async listTabs(req, res) {
    try {
      const tabs = await tabManager.listTabs();
      res.json({ tabs });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTabInfo(req, res) {
    try {
      const { tabId } = req.params;
      const info = await tabManager.getTabInfo(tabId);
      res.json(info);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async switchTab(req, res) {
    try {
      const { tabId } = req.params;
      const result = await tabManager.switchTab(tabId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async closeTab(req, res) {
    try {
      const { tabId } = req.params;
      const result = await tabManager.closeTab(tabId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async goto(req, res) {
    try {
      const { tabId } = req.params;
      const { url, waitUntil = 'load', timeout = 30000 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.goto(url, { waitUntil, timeout });

      res.json({ success: true, url: tab.page.url() });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async back(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);
      await tab.page.goBack();
      res.json({ success: true, url: tab.page.url() });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async forward(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);
      await tab.page.goForward();
      res.json({ success: true, url: tab.page.url() });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async reload(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);
      await tab.page.reload();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async findElements(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, type = 'css', limit = 10 } = req.body;

      const tab = tabManager.getTab(tabId);

      let elements;
      if (type === 'xpath') {
        elements = await tab.page.locator(`xpath=${selector}`).all();
      } else {
        elements = await tab.page.locator(selector).all();
      }

      const results = [];
      for (let i = 0; i < Math.min(elements.length, limit); i++) {
        const el = elements[i];
        const box = await el.boundingBox();
        results.push({
          index: i,
          tagName: await el.evaluate(e => e.tagName),
          text: await el.evaluate(e => e.textContent?.substring(0, 100) || ''),
          visible: await el.isVisible(),
          boundingBox: box
        });
      }

      res.json({ elements: results, total: Math.min(elements.length, limit) });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getElementInfo(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      const element = tab.page.locator(selector).first();

      const info = {
        tagName: await element.evaluate(e => e.tagName),
        id: await element.evaluate(e => e.id),
        className: await element.evaluate(e => e.className),
        text: await element.evaluate(e => e.textContent?.substring(0, 500) || ''),
        innerHTML: await element.evaluate(e => e.innerHTML?.substring(0, 1000) || ''),
        visible: await element.isVisible(),
        enabled: await element.isEnabled(),
        checked: await element.isChecked().catch(() => false),
        attributes: await element.evaluate(e => {
          const attrs = {};
          for (const attr of e.attributes) {
            attrs[attr.name] = attr.value;
          }
          return attrs;
        }),
        boundingBox: await element.boundingBox().catch(() => null)
      };

      res.json(info);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async click(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, clickCount = 1, delay = 0 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().click({ clickCount, delay });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async type(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, text, delay = 0 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().type(text, { delay });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async fill(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, text } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().fill(text);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async scroll(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, scrollX = 0, scrollY = 100 } = req.body;

      const tab = tabManager.getTab(tabId);

      if (selector) {
        await tab.page.locator(selector).first().evaluate((el, { x, y }) => {
          el.scrollLeft = x;
          el.scrollTop = y;
        }, { x: scrollX, y: scrollY });
      } else {
        await tab.page.evaluate(({ x, y }) => {
          window.scrollBy(x, y);
        }, { x: scrollX, y: scrollY });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async hover(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().hover();

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async focus(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().focus();

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async clickAt(req, res) {
    try {
      const { tabId } = req.params;
      const { x, y } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.mouse.click(x, y);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async doubleClick(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().dblclick();

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async rightClick(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().click({ button: 'right' });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async screenshot(req, res) {
    try {
      const { tabId } = req.params;
      const { type = 'png', fullPage = false, quality = 80 } = req.body;

      const tab = tabManager.getTab(tabId);

      const screenshot = await tab.page.screenshot({
        type,
        fullPage,
        quality: type === 'jpeg' ? quality : undefined
      });

      const base64 = screenshot.toString('base64');
      res.json({ data: base64, type, fullPage });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async pdf(req, res) {
    try {
      const { tabId } = req.params;
      const { format = 'A4', printBackground = true } = req.body;

      const tab = tabManager.getTab(tabId);

      const pdf = await tab.page.pdf({
        format,
        printBackground
      });

      const base64 = pdf.toString('base64');
      res.json({ data: base64 });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getNetworkRequests(req, res) {
    try {
      const { tabId } = req.params;
      const { limit = 100 } = req.query;

      const tab = tabManager.getTab(tabId);

      const requests = (tab.networkRequests || []).slice(-parseInt(limit));

      res.json({ requests });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async clearNetwork(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);
      tab.networkRequests = [];
      tab.networkResponses = [];
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRequestDetails(req, res) {
    try {
      const { tabId, requestId } = req.params;
      const tab = tabManager.getTab(tabId);

      const request = (tab.networkRequests || []).find(r => r.id === requestId);
      const response = (tab.networkResponses || []).find(r => r.id === requestId);

      res.json({
        request,
        response
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getConsoleLogs(req, res) {
    try {
      const { tabId } = req.params;
      const { limit = 50, types } = req.query;

      const tab = tabManager.getTab(tabId);

      let logs = tab.consoleLogs || [];

      if (types) {
        const allowedTypes = types.split(',');
        logs = logs.filter(log => allowedTypes.includes(log.type));
      }

      logs = logs.slice(-parseInt(limit));

      res.json({ logs });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async clearConsoleLogs(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);
      tab.consoleLogs = [];
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async evaluate(req, res) {
    try {
      const { tabId } = req.params;
      const { script, await: shouldAwait = false } = req.body;

      const tab = tabManager.getTab(tabId);

      let result;
      if (shouldAwait) {
        result = await tab.page.evaluate(async (s) => eval(s), script);
      } else {
        result = await tab.page.evaluate((s) => eval(s), script);
      }

      res.json({ result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async submitForm(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      const form = tab.page.locator(selector).first();
      await form.evaluate(el => el.submit());

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async resetForm(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      const form = tab.page.locator(selector).first();
      await form.evaluate(el => el.reset());

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async fillMultipleForm(req, res) {
    try {
      const { tabId } = req.params;
      const { fields } = req.body;

      const tab = tabManager.getTab(tabId);

      for (const [selector, value] of Object.entries(fields)) {
        await tab.page.locator(selector).first().fill(String(value));
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCookies(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const cookies = await tab.context.cookies();
      res.json({ cookies });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setCookie(req, res) {
    try {
      const { tabId } = req.params;
      const cookieData = req.body;
      
      const tab = tabManager.getTab(tabId);

      if (!cookieData.path) {
        cookieData.path = '/';
      }

      await tab.context.addCookies([cookieData]);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async clearCookies(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      await tab.context.clearCookies();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCookie(req, res) {
    try {
      const { tabId, name } = req.params;
      const tab = tabManager.getTab(tabId);

      await tab.context.clearCookies();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLocalStorage(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const storage = await tab.page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return data;
      });

      res.json({ storage });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setLocalStorage(req, res) {
    try {
      const { tabId } = req.params;
      const { key, value } = req.body;
      const tab = tabManager.getTab(tabId);

      await tab.page.evaluate((args) => {
        localStorage.setItem(args.key, args.value);
      }, { key, value });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async clearLocalStorage(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      await tab.page.evaluate(() => localStorage.clear());
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSessionStorage(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const storage = await tab.page.evaluate(() => {
        const data = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          data[key] = sessionStorage.getItem(key);
        }
        return data;
      });

      res.json({ storage });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setSessionStorage(req, res) {
    try {
      const { tabId } = req.params;
      const { key, value } = req.body;
      const tab = tabManager.getTab(tabId);

      await tab.page.evaluate((args) => {
        sessionStorage.setItem(args.key, args.value);
      }, { key, value });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async clearSessionStorage(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      await tab.page.evaluate(() => sessionStorage.clear());
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForTimeout(req, res) {
    try {
      const { tabId } = req.params;
      const { ms } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.waitForTimeout(ms);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForLoad(req, res) {
    try {
      const { tabId } = req.params;
      const { timeout = 30000 } = req.body;

      const tab = tabManager.getTab(tabId);

      await Promise.race([
        tab.page.waitForLoadState('domcontentloaded', { timeout }),
        tab.page.waitForLoadState('load', { timeout }).catch(() => {})
      ]);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForNavigation(req, res) {
    try {
      const { tabId } = req.params;
      const { url, waitUntil = 'load', timeout = 30000 } = req.body;

      const tab = tabManager.getTab(tabId);
      const options = { waitUntil, timeout };

      if (url) {
        await tab.page.waitForURL(url, { timeout });
      } else {
        await tab.page.waitForLoadState(waitUntil, { timeout }).catch(() => {
          return tab.page.waitForLoadState('domcontentloaded', { timeout });
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForSignal(req, res) {
    try {
      const { tabId } = req.params;
      const { signal, timeout = 30000 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.waitForSignal(signal, { timeout });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForNetworkIdle(req, res) {
    try {
      const { tabId } = req.params;
      const { timeout = 30000 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.waitForLoadState('networkidle', { timeout });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForSelector(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, timeout = 5000, state = 'visible' } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.waitForSelector(selector, { timeout, state });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForElement(req, res) {
    return this.waitForSelector(req, res);
  }

  async emulationViewport(req, res) {
    try {
      const { tabId } = req.params;
      const { width, height, isMobile } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.setViewportSize({ width, height });

      if (isMobile !== undefined) {
        await tab.page.emulateMedia({ media: (isMobile ? 'screen' : 'print'), viewport: null });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async emulationUserAgent(req, res) {
    try {
      const { tabId } = req.params;
      const { userAgent } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.setExtraHTTPHeaders({ 'User-Agent': userAgent });

      res.json({ success: true, userAgent });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async emulationGeolocation(req, res) {
    try {
      const { tabId } = req.params;
      const { latitude, longitude, accuracy = 0 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.context.setGeolocation({ latitude, longitude, accuracy });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async emulationMedia(req, res) {
    try {
      const { tabId } = req.params;
      const { media, colorScheme, reducedMotion } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.emulateMedia({ media, colorScheme, reducedMotion });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async dialogAccept(req, res) {
    try {
      const { tabId } = req.params;
      const { promptText = '' } = req.body;

      const tab = tabManager.getTab(tabId);
      
      try {
        const dialog = tab.page.waitForEvent('dialog', { timeout: 100 });
        (await dialog).accept(promptText);
        res.json({ success: true, message: 'Dialog accepted' });
      } catch (error) {
        res.json({ success: true, message: 'No dialog to accept (or already handled)' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async dialogDismiss(req, res) {
    try {
      const { tabId } = req.params;

      const tab = tabManager.getTab(tabId);
      
      try {
        const dialog = tab.page.waitForEvent('dialog', { timeout: 100 });
        (await dialog).dismiss();
        res.json({ success: true, message: 'Dialog dismissed' });
      } catch (error) {
        res.json({ success: true, message: 'No dialog to dismiss (or already handled)' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async dialogOn(req, res) {
    try {
      const { tabId } = req.params;
      const { action, promptText = '' } = req.body;

      const tab = tabManager.getTab(tabId);
      tab.dialogHandler = { action, promptText };

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async fileUpload(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, files } = req.body;

      const tab = tabManager.getTab(tabId);

      const fs = require('fs');
      const existingFiles = files.filter(f => fs.existsSync(f));
      
      if (existingFiles.length === 0) {
        res.json({ success: false, message: 'None of the specified files exist', provided: files });
        return;
      }

      await tab.page.locator(selector).setInputFiles(existingFiles);
      res.json({ success: true, uploaded: existingFiles });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async downloadStart(req, res) {
    try {
      const { tabId } = req.params;
      const { path: downloadPath } = req.body;

      const tab = tabManager.getTab(tabId);
      const downloadPromise = tab.page.waitForEvent('download');
      tab.downloadPromise = downloadPromise;
      tab.downloadPath = downloadPath;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async downloadStop(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);
      tab.downloadPromise = null;
      tab.downloadPath = null;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDownloads(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      if (tab.downloadPromise) {
        const download = await Promise.race([
          tab.downloadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
        ]);
        res.json({ downloading: true, suggestedFilename: download.suggestedFilename });
      } else {
        res.json({ downloading: false });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async keyboardDown(req, res) {
    try {
      const { tabId } = req.params;
      const { key } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.keyboard.down(key);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async keyboardUp(req, res) {
    try {
      const { tabId } = req.params;
      const { key } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.keyboard.up(key);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async keyboardPress(req, res) {
    try {
      const { tabId } = req.params;
      const { key, delay = 0 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.keyboard.press(key, { delay });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async keyboardType(req, res) {
    try {
      const { tabId } = req.params;
      const { text, delay = 0 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.keyboard.type(text, { delay });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async mouseMove(req, res) {
    try {
      const { tabId } = req.params;
      const { x, y } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.mouse.move(x, y);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async mouseDown(req, res) {
    try {
      const { tabId } = req.params;
      const { button = 'left', clickCount = 1 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.mouse.down({ button, clickCount });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async mouseUp(req, res) {
    try {
      const { tabId } = req.params;
      const { button = 'left', clickCount = 1 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.mouse.up({ button, clickCount });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async mouseWheel(req, res) {
    try {
      const { tabId } = req.params;
      const { deltaX = 0, deltaY = 0 } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.mouse.wheel(deltaX, deltaY);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getFrames(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const frames = tab.page.frames();
      const frameData = frames.map((frame, index) => ({
        id: index.toString(),
        name: frame.name(),
        url: frame.url(),
        parentFrame: frame.parentFrame()?.name()
      }));

      res.json({ frames: frameData });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async evaluateInFrame(req, res) {
    try {
      const { tabId, frameId } = req.params;
      const { script } = req.body;

      const tab = tabManager.getTab(tabId);
      const frames = tab.page.frames();
      const frame = frames[parseInt(frameId)];

      if (!frame) {
        throw new Error('Frame not found');
      }

      const result = await frame.evaluate((s) => eval(s), script);
      res.json({ result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAccessibilityTree(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      if (tab.page && tab.page.accessibility) {
        const tree = await tab.page.accessibility.snapshot({});
        res.json({ tree });
      } else {
        res.json({ tree: null, message: 'Accessibility not available in this browser version' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAccessibilitySnapshot(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      if (tab.page && tab.page.accessibility) {
        const snapshot = await tab.page.accessibility.snapshot({ interestingOnly: false });
        res.json({ snapshot });
      } else {
        res.json({ snapshot: null, message: 'Accessibility not available in this browser version' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPerformanceMetrics(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const metrics = await tab.page.evaluate(() => {
        if (window.performance) {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const connectTime = perfData.responseEnd - perfData.requestStart;
          const renderTime = perfData.domComplete - perfData.domLoading;
          const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;

          return {
            pageLoadTime,
            connectTime,
            renderTime,
            domContentLoadedTime,
            navigationStart: perfData.navigationStart,
            domLoading: perfData.domLoading,
            domComplete: perfData.domComplete,
            loadEventEnd: perfData.loadEventEnd
          };
        }
        return {};
      });

      res.json({ metrics });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async traceStart(req, res) {
    try {
      const { tabId } = req.params;
      const { path } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.context.tracing.start({ path });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async traceStop(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      await tab.context.tracing.stop();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async coverageStart(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      await tab.page.coverage.startJSCoverage();
      await tab.page.coverage.startCSSCoverage();

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async coverageStop(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const [jsCoverage, cssCoverage] = await Promise.all([
        tab.page.coverage.stopJSCoverage().catch(() => []),
        tab.page.coverage.stopCSSCoverage().catch(() => [])
      ]);

      res.json({ jsCoverage, cssCoverage });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWebsockets(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const websockets = [];
      res.json({ websockets });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async grantPermissions(req, res) {
    try {
      const { tabId } = req.params;
      const { permissions = [] } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.context.grantPermissions(permissions);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async clearPermissions(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      await tab.context.clearPermissions();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async networkIntercept(req, res) {
    try {
      const { tabId } = req.params;
      const { enabled = true, patterns = ['**/*'] } = req.body;
      const tab = tabManager.getTab(tabId);

      tab.interceptedPatterns = patterns;

      if (enabled && patterns.length > 0) {
        for (const pattern of patterns) {
          await tab.page.route(pattern, async route => {
            const mocked = tab.mockedResponses.get(route.request().url());
            if (mocked) {
              await route.fulfill({
                status: mocked.status,
                headers: mocked.headers || {},
                body: mocked.body
              });
            } else if (tab.networkAbortPatterns && tab.networkAbortPatterns.some(p => route.request().url().includes(p))) {
              await route.abort();
            } else {
              route.continue();
            }
          });
        }
      } else {
        tab.page.unroute();
      }

      res.json({ success: true, enabled, patterns });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async networkAbort(req, res) {
    try {
      const { tabId } = req.params;
      const { pattern } = req.body;
      const tab = tabManager.getTab(tabId);

      tab.networkAbortPatterns = tab.networkAbortPatterns || [];
      
      if (pattern) {
        tab.networkAbortPatterns.push(pattern);
      }

      res.json({ success: true, patterns: tab.networkAbortPatterns });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async networkMockResponse(req, res) {
    try {
      const { tabId } = req.params;
      const { pattern, status = 200, headers = {}, body = '' } = req.body;
      const tab = tabManager.getTab(tabId);

      tab.mockedResponses.set(pattern, { status, headers, body });
      
      res.json({ success: true, pattern });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWebsockets(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      const websockets = (tab.websockets || []).map(ws => ({
        id: ws.id,
        url: ws.url,
        opened: ws.opened,
        messageCount: ws.messages ? ws.messages.length : 0
      }));

      res.json({ websockets });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWebsocketMessages(req, res) {
    try {
      const { tabId, wsId } = req.params;
      const tab = tabManager.getTab(tabId);

      const websocket = tab.websockets ? tab.websockets.find(ws => ws.id === wsId) : null;
      
      if (websocket) {
        res.json({ messages: websocket.messages || [] });
      } else {
        res.status(404).json({ error: 'WebSocket not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async elementScreenshot(req, res) {
    try {
      const { tabId } = req.params;
      const { selector, type = 'png' } = req.body;

      const tab = tabManager.getTab(tabId);
      const element = tab.page.locator(selector).first();

      const screenshot = await element.screenshot({ type });

      const base64 = screenshot.toString('base64');
      res.json({ data: base64, selector, type });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async tap(req, res) {
    try {
      const { tabId } = req.params;
      const { selector } = req.body;

      const tab = tabManager.getTab(tabId);
      await tab.page.locator(selector).first().tap();

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async openDevTools(req, res) {
    try {
      const { tabId } = req.params;
      const tab = tabManager.getTab(tabId);

      throw new Error('DevTools control is not directly available via Playwright API. Use headless: false during launch.');
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async closeDevTools(req, res) {
    try {
      const { tabId } = req.params;
      throw new Error('DevTools control is not directly available via Playwright API.');
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async waitForSignal(req, res) {
    try {
      const { tabId } = req.params;
      const { signal, timeout = 30000 } = req.body;

      const tab = tabManager.getTab(tabId);

      await tab.page.waitForResponse(res => res.url().includes(signal), { timeout });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCookie(req, res) {
    try {
      const { tabId } = req.params;
      const { name } = req.params;

      const tab = tabManager.getTab(tabId);
      const cookies = await tab.context.cookies();
      const cookieToDelete = cookies.find(c => c.name === name);

      if (cookieToDelete) {
        // Delete by setting expiration
        await tab.context.addCookies([{ 
          name, 
          value: '', 
          domain: cookieToDelete.domain,
          path: cookieToDelete.path,
          expires: Math.floor(Date.now() / 1000) - 86400 
        }]);
      }

      res.json({ success: true, deleted: !!cookieToDelete });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TabsController();
