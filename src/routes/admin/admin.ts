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




export default adminRouter