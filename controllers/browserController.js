const { browserManager } = require('../managers');

class BrowserController {
  async launch(req, res) {
    try {
      const options = {
        headless: req.body.headless !== undefined ? req.body.headless : false,
        devtools: req.body.devtools || false,
        slowMo: req.body.slowMo || 0,
        args: req.body.args || []
      };

      const result = await browserManager.launch(options);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async close(req, res) {
    try {
      const result = await browserManager.close();
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async restart(req, res) {
    try {
      const result = await browserManager.restart(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async status(req, res) {
    try {
      const status = browserManager.getStatus();
      res.json(status);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new BrowserController();
