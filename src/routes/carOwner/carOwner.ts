import {Router} from "express";
import  CarOwnerController from "../../controllers/implementation/carowner/carownerController"
import CarOwnerService from "../../services/implementation/carOwner/carOwnerService"
import CarOwnerRepository from "../../repositories/implementation/carowner/carOwnerRepository";

const carOwnerRouter=Router();

const carOwnerRepository= new CarOwnerRepository()
const carOwnerService= new CarOwnerService(carOwnerRepository);
const carOwnerController=new CarOwnerController(carOwnerService);

carOwnerRouter.post("/signup",(req,res)=>carOwnerController.registerBasicDetailsOwner(req,res))

carOwnerRouter.post("/verifyotp",(req,res)=>carOwnerController.verifyOtpOwner(req,res))

carOwnerRouter.post("/resendotp",(req,res)=>carOwnerController.resendOtpOwner(req,res))

carOwnerRouter.post("/forgotpassword",(req,res)=>carOwnerController.forgotPasswordOwner(req,res))

carOwnerRouter.post("/resetpassword",(req,res)=>carOwnerController.resetPasswordOwner(req,res))

carOwnerRouter.post("/login",(req,res)=>carOwnerController.loginOwner(req,res))

carOwnerRouter.post("/logout",(req,res)=>carOwnerController.logout(req,res))




export default carOwnerRouter