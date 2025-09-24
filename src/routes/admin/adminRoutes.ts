import {Router} from "express";
import AdminController from "../../controllers/implementation/admin/adminController";
import AdminRepository from "../../repositories/implementation/admin/adminRepository";
import AdminService from "../../services/implementation/admin/adminServices";



import AdminOwnerController from "../../controllers/implementation/admin/adminOwnerController";
import AdminOwnerRepository from "../../repositories/implementation/admin/adminOwnerRepository";
import AdminOwnerService from "../../services/implementation/admin/adminOwnerServices";



const adminRouter=Router();

const adminRepository= new AdminRepository()
const adminService= new AdminService(adminRepository);
const adminController=new AdminController(adminService);


const adminOwnerRepository= new AdminOwnerRepository()
const adminOwnerService= new AdminOwnerService(adminOwnerRepository);
const adminOwnerController=new AdminOwnerController(adminOwnerService);



// adminRouter.post("/forgotpassword",(req,res)=>adminController.forgotPasswordOwner(req,res))

// adminRouter.post("/resetpassword",(req,res)=>adminController.resetPasswordOwner(req,res))

adminRouter.post("/login",(req,res)=>adminController.loginAdmin(req,res))

adminRouter.post("/logout",(req,res)=>adminController.logoutAdmin(req,res))


adminRouter.get('/customers', (req,res)=>adminController.getAllCustomers(req,res));

adminRouter.get('/owners',(req,res)=>adminController.getAllOwners(req,res));

adminRouter.get('/pendingcars',(req,res)=>adminOwnerController.getAllCarsforVerify(req,res));

adminRouter.get('/verifiedcars',(req,res)=>adminOwnerController.getAllVerifiedCars(req,res));

adminRouter.get('/bookings',(req,res)=>adminOwnerController.getAllBookings(req,res));

adminRouter.get('/ownerpending',(req,res)=>adminOwnerController.getAllOwnersforVerify(req,res));

adminRouter.patch('/customers/updateblockstatus/:userId', (req,res)=>adminController.updateCustomerBlockStatus(req,res));

adminRouter.patch('/owners/updateblockstatus/:userId', (req,res)=>adminOwnerController.updateOwnerBlockStatus(req,res));


adminRouter.patch('/owners/updateverifystatus/:userId', (req,res)=>adminOwnerController.updateOwnerVerifyStatus(req,res));


adminRouter.patch('/cars/updateverifystatus/:carId', (req,res)=>adminOwnerController.updateCarVerifyStatus(req,res));

export default adminRouter



// Update customer status (-2 to 2)
// adminRouter.patch('/customer/:customerId/status', adminController.updateCustomerStatus);

// Verify customer (document or full)
// adminRouter.patch('/customers/:customerId/verify', adminController.verifyCustomer);
// adminRouter.patch('/owners/updatestatus/:userId', (req,res)=>adminController.updateOwnerStatus(req,res));

// adminRouter.patch('/customers/verifycustomer/:customerId',adminController.verifyCustomer)

// adminRouter.patch('/owners/verifydocument/:ownerId', adminController.verifyOwner);

// adminRouter.patch('/owners/verifyowner/:ownerId',adminController.verifyOwner)






// import { Router } from 'express';
// import { AdminAuthController } from '../../features/auth/controllers/implementation/AdminAuthController';
// import { AdminUserController } from '../../features/user/controllers/implementation/AdminUserController';
// import { AdminCarController } from '../../features/car/controllers/implementation/AdminCarController';
// import { AdminBookingController } from '../../features/booking/controllers/implementation/AdminBookingController';
// import { container } from '../../di/container';
// import { authMiddleware } from '../../middleware/auth'; // Assume middleware for admin auth

// const router = Router();
// const authController = container.get<AdminAuthController>('AdminAuthController');
// const userController = container.get<AdminUserController>('AdminUserController');
// const carController = container.get<AdminCarController>('AdminCarController');
// const bookingController = container.get<AdminBookingController>('AdminBookingController');

// // Apply admin auth middleware to protected routes
// router.use(authMiddleware('admin'));

// // Auth routes
// router.route('/auth/login')
//   .post(authController.loginAdmin.bind(authController));

// router.route('/auth/logout')
//   .post(authController.logoutAdmin.bind(authController));

// // User routes (customers and car owners)
// router.route('/users/customers')
//   .get(userController.getAllCustomers.bind(userController));

// router.route('/users/customers/:customerId/block')
//   .patch(userController.updateCustomerBlockStatus.bind(userController));

// router.route('/users/customers/:customerId/verify')
//   .patch(userController.verifyCustomer.bind(userController));

// router.route('/users/car-owners')
//   .get(userController.getAllCarOwners.bind(userController));

// router.route('/users/car-owners/pending')
//   .get(userController.getAllCarOwnersForVerify.bind(userController));

// router.route('/users/car-owners/:userId/block')
//   .patch(userController.updateOwnerBlockStatus.bind(userController));

// router.route('/users/car-owners/:userId/verify')
//   .patch(userController.updateOwnerVerifyStatus.bind(userController));

// // Car routes
// router.route('/cars/pending')
//   .get(carController.getAllCarsForVerify.bind(carController));

// router.route('/cars/verified')
//   .get(carController.getAllVerifiedCars.bind(carController));

// router.route('/cars/:carId/verify')
//   .patch(carController.updateCarVerifyStatus.bind(carController));

// // Booking routes
// router.route('/bookings')
//   .get(bookingController.getAllBookings.bind(bookingController));

// export default router;