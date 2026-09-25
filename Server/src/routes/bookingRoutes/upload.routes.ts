import { Router } from 'express';
import multer from 'multer';
import { deleteItineraryImage, uploadItineraryImage } from '../../controllers/BookingManagement/uploads.controller';

const router = Router();

// Keep file in memory (Buffer) — send straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.post(
  '/itinerary-image',
  upload.array('images', 4),
  uploadItineraryImage
);
router.post('/bookings/itinerary/delete-image', deleteItineraryImage);
export default router;