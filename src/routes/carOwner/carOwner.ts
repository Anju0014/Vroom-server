import {Router} from "express";
import  CarOwnerController from "../../controllers/implementation/carowner/carownerController"
import CarOwnerService from "../../services/implementation/carOwner/carOwnerService"
import CarOwnerRepository from "../../repositories/implementation/carowner/carOwnerRepository";
import authMiddleware from "../../middlewares/authMiddleWare";

const carOwnerRouter=Router();

const carOwnerRepository= new CarOwnerRepository()
const carOwnerService= new CarOwnerService(carOwnerRepository);
const carOwnerController=new CarOwnerController(carOwnerService);

carOwnerRouter.post("/signup",(req,res)=>carOwnerController.registerBasicDetailsOwner(req,res))

carOwnerRouter.post("/verifyotp",(req,res)=>carOwnerController.verifyOtpOwner(req,res))

carOwnerRouter.post("/resendotp",(req,res)=>carOwnerController.resendOtpOwner(req,res))

carOwnerRouter.post("/forgotpassword",(req,res)=>carOwnerController.forgotPasswordOwner(req,res))

carOwnerRouter.post("/resetpassword",(req,res)=>carOwnerController.resetPasswordOwner(req,res))

carOwnerRouter.post("/refreshToken",(req,res)=>carOwnerController.renewRefreshAccessTokenOwner(req,res))

carOwnerRouter.post("/login",(req,res)=>carOwnerController.loginOwner(req,res))

carOwnerRouter.post("/logout",(req,res)=>carOwnerController.logout(req,res))

carOwnerRouter.post("/googleSignIn",(req,res)=>carOwnerController.googleSignIn(req,res))
// carOwnerRouter.post("/googleSignOut",(req,res)=>carOwnerController.googleSignOut(req,res))

carOwnerRouter.get("/getOwnerProfile",authMiddleware,(req,res)=>carOwnerController.getOwnerProfile(req,res))

carOwnerRouter.put("/updateProfile", authMiddleware,(req,res)=>carOwnerController.updateProfileOwner(req,res));

carOwnerRouter.put("/updateProfileIdProof", authMiddleware,(req,res)=>carOwnerController.updateProfileOwnerIdProof(req,res));

carOwnerRouter.post("/carupload", authMiddleware, (req,res)=>carOwnerController.uploadCar(req,res));

carOwnerRouter.get("/getcars", authMiddleware, (req,res)=>carOwnerController.getCarList(req,res));

export default carOwnerRouter