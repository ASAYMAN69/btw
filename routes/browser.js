const express = require('express');
const router = express.Router();

const browserController = require('../controllers/browserController');

router.post('/launch', browserController.launch);
router.post('/close', browserController.close);
router.post('/restart', browserController.restart);
router.get('/status', browserController.status);

module.exports = router;
