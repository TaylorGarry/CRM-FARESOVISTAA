// import { Router } from 'express';
// import {
//   createBooking,
//   getBookings,
//   getBookingById,
//   updateBooking,
//   updateBookingStatus,
//   deleteBooking,
// } from "../../controllers/BookingManagement/bookings.controller";

// const router = Router();

// router.post('/', createBooking);
// router.get('/', getBookings);
// router.get('/:id', getBookingById);
// router.put('/:id', updateBooking);
// router.patch('/:id/status', updateBookingStatus);
// router.delete('/:id', deleteBooking);

// export default router;




import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  // existing
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,

  // lock
  lockBooking,
  getMyLock,
  addRemark,
  forceUnlock,

  // history
  getBookingHistory,
  getBookingAssignments,
  createBookingAssignment,
  listBookingAssignments,
  handleBookingAssignment,

  // per-tab PATCH
  updateSearchInfo,
  updateBookingInfo,
  updateItinerary,
  updateContactInfo,
  updatePaxInfo,
  updatePaymentInfo,
} from '../../controllers/BookingManagement/bookings.controller';

const router = Router();

/* ------------------------------------------------------------------ */
/* Lock — must come BEFORE /:id to avoid matching "/my-lock" as :id    */
/* ------------------------------------------------------------------ */

router.get('/my-lock', getMyLock);

/* Assignment APIs are authenticated and append-only for new assignments. */
router.post('/assignments', authMiddleware, createBookingAssignment);
router.get('/assignments', authMiddleware, listBookingAssignments);
router.patch('/assignments/:assignmentId/handle', authMiddleware, handleBookingAssignment);

/* ------------------------------------------------------------------ */
/* List + create                                                       */
/* ------------------------------------------------------------------ */

router.post('/', createBooking);
router.get('/', getBookings);

/* ------------------------------------------------------------------ */
/* Read one                                                            */
/* ------------------------------------------------------------------ */

router.get('/:id', getBookingById);

/* ------------------------------------------------------------------ */
/* Legacy full update (used by /bookings/edit/:id)                     */
/* ------------------------------------------------------------------ */

router.put('/:id', updateBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

/* ------------------------------------------------------------------ */
/* Lock acquire / release                                              */
/* ------------------------------------------------------------------ */

router.post('/:id/lock', lockBooking);

/**
 * Add remark — the ONLY way to release the lock.
 * Also writes a BookingHistory row (is_system = false).
 */
router.post('/:id/remarks', addRemark);

/**
 * Force unlock — admin only.
 * NOTE: without auth middleware this is currently open; add an admin
 * guard (e.g. isAdminRequest) when auth is wired in.
 */
router.post('/:id/force-unlock', forceUnlock);

/* ------------------------------------------------------------------ */
/* History + Assignments                                               */
/* ------------------------------------------------------------------ */

router.get('/:id/history', getBookingHistory);
router.get('/:id/assignments', authMiddleware, getBookingAssignments);

/* ------------------------------------------------------------------ */
/* Per-tab partial updates                                             */
/* ------------------------------------------------------------------ */

router.patch('/:id/search-info', updateSearchInfo);
router.patch('/:id/booking-info', updateBookingInfo);
router.patch('/:id/itinerary', updateItinerary);
router.patch('/:id/contact-info', updateContactInfo);
router.patch('/:id/pax-info', updatePaxInfo);
router.patch('/:id/payment-info', updatePaymentInfo);

export default router;
