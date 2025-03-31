import {Router} from "express";
import AdminController from "../../controllers/implementation/admin/adminController";
import AdminRepository from "../../repositories/implementation/admin/adminRepository";
import AdminService from "../../services/implementation/admin/adminServices";

const adminRouter=Router();

const adminRepository= new AdminRepository()
const adminService= new AdminService(adminRepository);
const adminController=new AdminController(adminService);

// adminRouter.post("/signup",(req,res)=>adminController.registerBasicDetailsOwner(req,res))

// adminRouter.post("/verifyotp",(req,res)=>adminController.verifyOtpOwner(req,res))

// adminRouter.post("/resendotp",(req,res)=>adminController.resendOtpOwner(req,res))

// adminRouter.post("/forgotpassword",(req,res)=>adminController.forgotPasswordOwner(req,res))

// adminRouter.post("/resetpassword",(req,res)=>adminController.resetPasswordOwner(req,res))

adminRouter.post("/login",(req,res)=>adminController.loginAdmin(req,res))

adminRouter.post("/logout",(req,res)=>adminController.logoutAdmin(req,res))


adminRouter.get('/customers', (req,res)=>adminController.getAllCustomers(req,res));

adminRouter.get('/owners',(req,res)=>adminController.getAllOwners(req,res));

// Update customer status (-2 to 2)
// adminRouter.patch('/customer/:customerId/status', adminController.updateCustomerStatus);

// Verify customer (document or full)
// adminRouter.patch('/customers/:customerId/verify', adminController.verifyCustomer);

adminRouter.patch('/customers/updatestatus/:userId', (req,res)=>adminController.updateCustomerStatus(req,res));

adminRouter.patch('/owners/updatestatus/:userId', (req,res)=>adminController.updateOwnerStatus(req,res));
// adminRouter.patch('/owners/updatestatus/:userId', (req,res)=>adminController.updateOwnerStatus(req,res));

// adminRouter.patch('/customers/verifycustomer/:customerId',adminController.verifyCustomer)

// adminRouter.patch('/owners/verifydocument/:ownerId', adminController.verifyOwner);

// adminRouter.patch('/owners/verifyowner/:ownerId',adminController.verifyOwner)


export default adminRouter