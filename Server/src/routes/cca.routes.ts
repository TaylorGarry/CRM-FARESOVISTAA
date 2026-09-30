import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { getCca, getPublicCca, sendCca, submitPublicCca } from '../controllers/BookingManagement/cca.controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { files: 5, fileSize: 8 * 1024 * 1024 } });
const router = Router();

router.get('/public/:token', getPublicCca);
router.post('/public/:token/submit', upload.array('documents', 5), submitPublicCca);
router.get('/booking/:id', authMiddleware, getCca);
router.post('/booking/:id/send', authMiddleware, sendCca);

export default router;
