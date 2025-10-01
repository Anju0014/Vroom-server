import { Router } from 'express';
import { BookingController } from '../controllers/implementation/bookings/bookingController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const bookingController = new BookingController(/* inject BookingService */);

router.get('/admin', authMiddleware, bookingController.getAllBookings.bind(bookingController));

export default router;



import { Router } from 'express';
import { BookingController } from '../controllers/implementation/bookings/bookingController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const bookingController = new BookingController(/* inject BookingService */);

router.get('/owner', authMiddleware, bookingController.getCarOwnerBookings.bind(bookingController));
router.get('/owner/:id', authMiddleware, bookingController.getBookingsByCarId.bind(bookingController));
router.get('/owner/:id/active', authMiddleware, bookingController.getActiveBooking.bind(bookingController));
router.get('/admin', authMiddleware, bookingController.getAllBookings.bind(bookingController));

export default router;



import { Router } from 'express';
import { BookingController } from '../controllers/implementation/bookings/bookingController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const bookingController = new BookingController(/* inject BookingService */);

router.get('/customer', authMiddleware, bookingController.getCustomerBookings.bind(bookingController));
router.post('/customer/pending', authMiddleware, bookingController.createPendingBooking.bind(bookingController));
router.post('/customer/:bookingId/confirm', bookingController.confirmBooking.bind(bookingController));
router.post('/customer/:bookingId/failed', bookingController.failedBooking.bind(bookingController));
router.post('/customer/tracking', authMiddleware, bookingController.updateCarTracking.bind(bookingController));
router.post('/customer/:bookingId/cancel', authMiddleware, bookingController.cancelBooking.bind(bookingController));
router.get('/owner', authMiddleware, bookingController.getCarOwnerBookings.bind(bookingController));
router.get('/owner/:id', authMiddleware, bookingController.getBookingsByCarId.bind(bookingController));
router.get('/owner/:id/active', authMiddleware, bookingController.getActiveBooking.bind(bookingController));
router.get('/admin', authMiddleware, bookingController.getAllBookings.bind(bookingController));

export default router;