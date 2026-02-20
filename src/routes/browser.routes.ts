import { Router } from 'express';
import browserController from '../controllers/BrowserController';

const router = Router();

// Browser Management
router.get('/status', browserController.status.bind(browserController));
router.post('/launch', browserController.launch.bind(browserController));
router.post('/close', browserController.close.bind(browserController));
router.post('/restart', browserController.restart.bind(browserController));

export default router;
