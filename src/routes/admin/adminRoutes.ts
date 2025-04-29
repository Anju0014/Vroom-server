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

adminRouter.get('/cars',(req,res)=>adminOwnerController.getAllCarsforVerify(req,res));

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