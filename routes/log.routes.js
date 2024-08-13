import { Router } from 'express';
import {  addLog ,getLogsByUserId } from '../controller/log.controller.js';
import { authenticateToken } from '../middleware/authMiddlware.js';
const router = Router();

router.route('/add-log').post(authenticateToken,addLog);
router.route('/').get(authenticateToken,getLogsByUserId);

export default router;