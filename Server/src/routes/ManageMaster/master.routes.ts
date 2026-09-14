import express from 'express';
import {
  getBookingTypes, createBookingType, updateBookingType, deleteBookingType, toggleBookingTypeStatus,
  getCurrencies, createCurrency, updateCurrency, deleteCurrency, toggleCurrencyStatus,
  getSources, createSource, updateSource, deleteSource, toggleSourceStatus,
  getCardTypes, createCardType, updateCardType, deleteCardType, toggleCardTypeStatus,
  getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, toggleEmailTemplateStatus,
  getSaleTypes, createSaleType, updateSaleType, deleteSaleType, toggleSaleTypeStatus,
  getAssignBookingStatuses, createAssignBookingStatus, updateAssignBookingStatus, deleteAssignBookingStatus, toggleAssignBookingStatus,
  getRolesForAssignBooking,
} from "../../controllers/ManageMasters/master.controller";

import { authMiddleware } from "../../middleware/auth.middleware";

const router = express.Router();

// All master routes require authentication
router.use(authMiddleware);

/* Booking Type */
router.get('/booking-types', getBookingTypes);
router.post('/booking-types', createBookingType);
router.put('/booking-types/:id', updateBookingType);
router.delete('/booking-types/:id', deleteBookingType);
router.patch('/booking-types/:id/status', toggleBookingTypeStatus);

/* Currency */
router.get('/currencies', getCurrencies);
router.post('/currencies', createCurrency);
router.put('/currencies/:id', updateCurrency);
router.delete('/currencies/:id', deleteCurrency);
router.patch('/currencies/:id/status', toggleCurrencyStatus);

/* Source / Charging Bifurcation */
router.get('/sources', getSources);
router.post('/sources', createSource);
router.put('/sources/:id', updateSource);
router.delete('/sources/:id', deleteSource);
router.patch('/sources/:id/status', toggleSourceStatus);

/* Card Type */
router.get('/card-types', getCardTypes);
router.post('/card-types', createCardType);
router.put('/card-types/:id', updateCardType);
router.delete('/card-types/:id', deleteCardType);
router.patch('/card-types/:id/status', toggleCardTypeStatus);

/* Email Template */
router.get('/email-templates', getEmailTemplates);
router.post('/email-templates', createEmailTemplate);
router.put('/email-templates/:id', updateEmailTemplate);
router.delete('/email-templates/:id', deleteEmailTemplate);
router.patch('/email-templates/:id/status', toggleEmailTemplateStatus);

/* Sale Type */
router.get('/sale-types', getSaleTypes);
router.post('/sale-types', createSaleType);
router.put('/sale-types/:id', updateSaleType);
router.delete('/sale-types/:id', deleteSaleType);
router.patch('/sale-types/:id/status', toggleSaleTypeStatus);

/* Assign Booking Status */
router.get('/assign-booking-statuses', getAssignBookingStatuses);
router.post('/assign-booking-statuses', createAssignBookingStatus);
router.put('/assign-booking-statuses/:id', updateAssignBookingStatus);
router.delete('/assign-booking-statuses/:id', deleteAssignBookingStatus);
router.patch('/assign-booking-statuses/:id/status', toggleAssignBookingStatus);
router.get('/roles-for-assign-booking', getRolesForAssignBooking);

export default router;