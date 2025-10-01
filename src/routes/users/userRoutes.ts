import { Router } from 'express';
import { UserController } from '../controllers/implementation/users/common/userController';
import { AdminUserController } from '../controllers/implementation/users/admin/adminUserController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const userController = new UserController(/* inject UserService */);
const adminUserController = new AdminUserController(/* inject AdminUserService */);

router.post('/login', userController.login.bind(userController));
router.post('/logout', userController.logout.bind(userController));
router.get('/admin/customers', authMiddleware, adminUserController.getAllCustomers.bind(adminUserController));
router.get('/admin/owners', authMiddleware, adminUserController.getAllCarOwners.bind(adminUserController));
router.get('/admin/owners/verify', authMiddleware, adminUserController.getAllOwnersForVerify.bind(adminUserController));
router.patch('/admin/customers/:userId/block', authMiddleware, adminUserController.updateCustomerBlockStatus.bind(adminUserController));
router.patch('/admin/owners/:userId/block', authMiddleware, adminUserController.updateOwnerBlockStatus.bind(adminUserController));
router.patch('/admin/owners/:userId/verify', authMiddleware, adminUserController.updateOwnerVerifyStatus.bind(adminUserController));

export default router;








import { Router } from 'express';
import { UserController } from '../controllers/implementation/users/common/userController';
import { CarOwnerController } from '../controllers/implementation/users/carowner/carOwnerController';
import { AdminUserController } from '../controllers/implementation/users/admin/adminUserController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const userController = new UserController(/* inject UserService */);
const carOwnerController = new CarOwnerController(/* inject CarOwnerService */);
const adminUserController = new AdminUserController(/* inject AdminUserService */);

router.post('/login', userController.login.bind(userController));
router.post('/logout', userController.logout.bind(userController));
router.post('/carowners/register', carOwnerController.registerBasicDetails.bind(carOwnerController));
router.post('/carowners/verify-otp', carOwnerController.verifyOtp.bind(carOwnerController));
router.post('/carowners/resend-otp', carOwnerController.resendOtp.bind(carOwnerController));
router.post('/carowners/login', carOwnerController.login.bind(carOwnerController));
router.post('/carowners/refresh-token', carOwnerController.renewRefreshAccessToken.bind(carOwnerController));
router.post('/carowners/complete', authMiddleware, carOwnerController.completeRegistration.bind(carOwnerController));
router.post('/carowners/forgot-password', carOwnerController.forgotPassword.bind(carOwnerController));
router.post('/carowners/reset-password', carOwnerController.resetPassword.bind(carOwnerController));
router.post('/carowners/change-password', authMiddleware, carOwnerController.changePassword.bind(carOwnerController));
router.post('/carowners/google-signin', carOwnerController.googleSignIn.bind(carOwnerController));
router.get('/carowners/:id/profile', authMiddleware, carOwnerController.getProfile.bind(carOwnerController));
router.patch('/carowners/:id/profile', authMiddleware, carOwnerController.updateProfile.bind(carOwnerController));
router.get('/carowners/:userId/block-status', authMiddleware, carOwnerController.getBlockStatus.bind(carOwnerController));
router.get('/admin/customers', authMiddleware, adminUserController.getAllCustomers.bind(adminUserController));
router.get('/admin/owners', authMiddleware, adminUserController.getAllCarOwners.bind(adminUserController));
router.get('/admin/owners/verify', authMiddleware, adminUserController.getAllOwnersForVerify.bind(adminUserController));
router.patch('/admin/customers/:userId/block', authMiddleware, adminUserController.updateCustomerBlockStatus.bind(adminUserController));
router.patch('/admin/owners/:userId/block', authMiddleware, adminUserController.updateOwnerBlockStatus.bind(adminUserController));
router.patch('/admin/owners/:userId/verify', authMiddleware, adminUserController.updateOwnerVerifyStatus.bind(adminUserController));

export default router;




import { Router } from 'express';
import { UserController } from '../controllers/implementation/users/common/userController';
import { CarOwnerController } from '../controllers/implementation/users/carowner/carOwnerController';
import { CustomerController } from '../controllers/implementation/users/customer/customerController';
import { AdminUserController } from '../controllers/implementation/users/admin/adminUserController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const userController = new UserController(/* inject UserService */);
const carOwnerController = new CarOwnerController(/* inject CarOwnerService */);
const customerController = new CustomerController(/* inject CustomerService */);
const adminUserController = new AdminUserController(/* inject AdminUserService */);

router.post('/login', userController.login.bind(userController));
router.post('/logout', userController.logout.bind(userController));
router.post('/carowners/register', carOwnerController.registerBasicDetails.bind(carOwnerController));
router.post('/carowners/verify-otp', carOwnerController.verifyOtp.bind(carOwnerController));
router.post('/carowners/resend-otp', carOwnerController.resendOtp.bind(carOwnerController));
router.post('/carowners/login', carOwnerController.login.bind(carOwnerController));
router.post('/carowners/refresh-token', carOwnerController.renewRefreshAccessToken.bind(carOwnerController));
router.post('/carowners/complete', authMiddleware, carOwnerController.completeRegistration.bind(carOwnerController));
router.post('/carowners/forgot-password', carOwnerController.forgotPassword.bind(carOwnerController));
router.post('/carowners/reset-password', carOwnerController.resetPassword.bind(carOwnerController));
router.post('/carowners/change-password', authMiddleware, carOwnerController.changePassword.bind(carOwnerController));
router.post('/carowners/google-signin', carOwnerController.googleSignIn.bind(carOwnerController));
router.get('/carowners/:id/profile', authMiddleware, carOwnerController.getProfile.bind(carOwnerController));
router.patch('/carowners/:id/profile', authMiddleware, carOwnerController.updateProfile.bind(carOwnerController));
router.get('/carowners/:userId/block-status', authMiddleware, carOwnerController.getBlockStatus.bind(carOwnerController));
router.post('/customers/register', customerController.registerBasicDetails.bind(customerController));
router.post('/customers/verify-otp', customerController.verifyOtp.bind(customerController));
router.post('/customers/resend-otp', customerController.resendOtp.bind(customerController));
router.post('/customers/login', customerController.login.bind(customerController));
router.post('/customers/refresh-token', customerController.renewRefreshAccessToken.bind(customerController));
router.post('/customers/forgot-password', customerController.forgotPassword.bind(customerController));
router.post('/customers/reset-password', customerController.resetPassword.bind(customerController));
router.post('/customers/change-password', authMiddleware, customerController.changePassword.bind(customerController));
router.post('/customers/google-signin', customerController.googleSignIn.bind(customerController));
router.post('/customers/google-signout', customerController.googleSignOut.bind(customerController));
router.get('/customers/:id/profile', authMiddleware, customerController.getProfile.bind(customerController));
router.patch('/customers/:id/profile', authMiddleware, customerController.updateProfile.bind(customerController));
router.patch('/customers/:id/id-proof', authMiddleware, customerController.updateProfileIdProof.bind(customerController));
router.get('/customers/:userId/block-status', authMiddleware, customerController.getBlockStatus.bind(customerController));
router.get('/admin/customers', authMiddleware, adminUserController.getAllCustomers.bind(adminUserController));
router.get('/admin/owners', authMiddleware, adminUserController.getAllCarOwners.bind(adminUserController));
router.get('/admin/owners/verify', authMiddleware, adminUserController.getAllOwnersForVerify.bind(adminUserController));
router.patch('/admin/customers/:userId/block', authMiddleware, adminUserController.updateCustomerBlockStatus.bind(adminUserController));
router.patch('/admin/owners/:userId/block', authMiddleware, adminUserController.updateOwnerBlockStatus.bind(adminUserController));
router.patch('/admin/owners/:userId/verify', authMiddleware, adminUserController.updateOwnerVerifyStatus.bind(adminUserController));

export default router;