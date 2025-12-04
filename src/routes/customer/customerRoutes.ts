import { Router } from 'express';
import CustomerController from '../../controllers/implementation/customer/customerController';
import CustomerService from '../../services/implementation/customer/customerServices';
import CustomerRepository from '../../repositories/implementation/customer/customerRepository';

import CustomerCarAndBookingController from '../../controllers/implementation/customer/customerCarAndBookingController';
import CustomerCarAndBookingService from '../../services/implementation/customer/customerCarAndBookingServices';
import CustomerCarAndBookingRepository from '../../repositories/implementation/customer/customerCarAndBookingRepository';

import CustomerDashBoardController from '../../controllers/implementation/customer/customerDashBoardController';
import CustomerDashBoardService from '../../services/implementation/customer/customerDashBoardServices';
import CustomerDashBoardRepository from '../../repositories/implementation/customer/customerDashBoardRepository';

import authMiddleware from '../../middlewares/authMiddleWare';
const customerRouter = Router();

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);
const customerController = new CustomerController(customerService);

const customerCarAndBookingRepository = new CustomerCarAndBookingRepository();
const customerCarAndBookingService = new CustomerCarAndBookingService(
  customerCarAndBookingRepository
);
const customerCarAndBookingController = new CustomerCarAndBookingController(
  customerCarAndBookingService
);

const customerDashBoardRepository = new CustomerDashBoardRepository();
const customerDashBoardService = new CustomerDashBoardService(customerDashBoardRepository);
const customerDashBoardController = new CustomerDashBoardController(customerDashBoardService);

customerRouter.post('/signup', (req, res) => customerController.registerBasicDetails(req, res));

customerRouter.post('/verifyotp', (req, res) => customerController.verifyOtp(req, res));

customerRouter.post('/resendotp', (req, res) => customerController.resendOtp(req, res));

customerRouter.post('/forgotpassword', (req, res) => customerController.forgotPassword(req, res));

customerRouter.post('/resetpassword', (req, res) => customerController.resetPassword(req, res));

customerRouter.post('/login', (req, res) => customerController.login(req, res));

customerRouter.post('/changepassword', authMiddleware, (req, res) =>
  customerController.changePassword(req, res)
);

customerRouter.post('/refreshToken', (req, res) =>
  customerController.renewRefreshAccessToken(req, res)
);

customerRouter.post('/logout', (req, res) => customerController.logout(req, res));

customerRouter.post('/googleSignIn', (req, res) => customerController.googleSignIn(req, res));

// customerRouter.post('/googleSignOut', (req, res) => customerController.googleSignOut(req, res));

customerRouter.get('/getCustomerProfile', authMiddleware, (req, res) =>
  customerController.getCustomerProfile(req, res)
);

customerRouter.put('/updateProfile', authMiddleware, (req, res) =>
  customerController.updateProfileCustomer(req, res)
);

customerRouter.put('/updateProfileIdProof', authMiddleware, (req, res) =>
  customerController.updateProfileCustomerIdProof(req, res)
);

customerRouter.get('/checkblockstatus/:userId', authMiddleware, (req, res) =>
  customerController.getBlockStatus(req, res)
);

customerRouter.get('/car/nearby', (req, res) =>
  customerCarAndBookingController.getNearbyCars(req, res)
);

customerRouter.get('/car/featured', (req, res) =>
  customerCarAndBookingController.getFeaturedCars(req, res)
);

customerRouter.get('/car/getAllCars', (req, res) =>
  customerCarAndBookingController.getAllCars(req, res)
);

customerRouter.get('/car/getCarDetails/:carId', (req, res) =>
  customerCarAndBookingController.getCarDetail(req, res)
);

customerRouter.get('/car/getBookingDetails/:carId', (req, res) =>
  customerCarAndBookingController.getbookedDatesCars(req, res)
);

customerRouter.post('/bookings/create', (req, res) =>
  customerCarAndBookingController.createPendingBooking(req, res)
);
customerRouter.get('/bookings/checkBookingAvailability', (req, res) =>
  customerCarAndBookingController.checkBookingAvailability(req, res)
);
customerRouter.patch(`/bookings/:bookingId/confirm`, (req, res) =>
  customerCarAndBookingController.confirmBooking(req, res)
);
customerRouter.patch(`/bookings/:bookingId/updatePendingBooking`, (req, res) =>
  customerCarAndBookingController.updatePendingBooking(req, res)
);
customerRouter.patch(`/bookings/:bookingId/fail`, (req, res) =>
  customerCarAndBookingController.failedBooking(req, res)
);

customerRouter.get('/getCustomerBookingDetails', authMiddleware, (req, res) =>
  customerDashBoardController.getCustomerBookingDetails(req, res)
);
customerRouter.patch(`/bookings/:bookingId/cancel`, (req, res) =>
  customerDashBoardController.cancelBooking(req, res)
);

customerRouter.post(`/tracking/update`, (req, res) =>
  customerCarAndBookingController.updateCarTracking(req, res)
);

export default customerRouter;
