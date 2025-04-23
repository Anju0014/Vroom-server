import {Router} from "express";
import  CustomerController from "../../controllers/implementation/customer/customerController"
import CustomerService from "../../services/implementation/customer/customerService"
import CustomerRepository from "../../repositories/implementation/customer/customerRepository";


import authMiddleware from "../../middlewares/authMiddleWare";



const customerRouter=Router();

const customerRepository= new CustomerRepository()
const customerService= new CustomerService(customerRepository);
const customerController=new CustomerController(customerService);

customerRouter.post("/signup",(req,res)=>customerController.registerBasicDetails(req,res))

customerRouter.post("/verifyotp",(req,res)=>customerController.verifyOtp(req,res))

customerRouter.post("/resendotp",(req,res)=>customerController.resendOtp(req,res))

customerRouter.post("/forgotpassword",(req,res)=>customerController.forgotPassword(req,res))

customerRouter.post("/resetpassword",(req,res)=>customerController.resetPassword(req,res))

customerRouter.post("/login",(req,res)=>customerController.login(req,res))

customerRouter.post("/changepassword",authMiddleware,(req,res)=>customerController.changePassword(req,res))


customerRouter.post('/logout',(req,res)=>customerController.logout(req,res))

customerRouter.post('/googleSignIn',(req,res)=>customerController.googleSignIn(req,res))

customerRouter.post('/googleSignOut',(req,res)=>customerController.googleSignOut(req,res))

customerRouter.get("/getCustomerProfile",authMiddleware,(req,res)=>customerController.getCustomerProfile(req,res))

customerRouter.put("/updateProfile", authMiddleware,(req,res)=>customerController.updateProfileCustomer(req,res));

customerRouter.put("/updateProfileIdProof", authMiddleware,(req,res)=>customerController.updateProfileCustomerIdProof(req,res));




export default customerRouter