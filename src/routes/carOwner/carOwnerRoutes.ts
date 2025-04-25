import {Router} from "express";
import  CarOwnerController from "../../controllers/implementation/carOwner/carOwnerController"
import CarOwnerService from "../../services/implementation/carOwner/carOwnerServices"
import CarOwnerRepository from "../../repositories/implementation/carOwner/carOwnerRepository";
import authMiddleware,{verifyRole} from "../../middlewares/authMiddleWare";

import  CarOwnerCarsController from "../../controllers/implementation/carOwner/carOwnerCarsController"
import CarOwnerCarsService from "../../services/implementation/carOwner/carOwnerCarsServices"
import CarOwnerCarsRepository from "../../repositories/implementation/carOwner/carOwnerCarsRepository";



const carOwnerRouter=Router();

const carOwnerRepository= new CarOwnerRepository()
const carOwnerService= new CarOwnerService(carOwnerRepository);
const carOwnerController=new CarOwnerController(carOwnerService);

const carOwnerCarsRepository= new CarOwnerCarsRepository()
const carOwnerCarsService= new CarOwnerCarsService(carOwnerCarsRepository);
const carOwnerCarsController=new CarOwnerCarsController(carOwnerCarsService);


carOwnerRouter.post("/signup",(req,res)=>carOwnerController.registerBasicDetailsOwner(req,res))

carOwnerRouter.post("/verifyotp",(req,res)=>carOwnerController.verifyOtpOwner(req,res))

carOwnerRouter.post("/resendotp",(req,res)=>carOwnerController.resendOtpOwner(req,res))

carOwnerRouter.post("/forgotpassword",(req,res)=>carOwnerController.forgotPasswordOwner(req,res))

carOwnerRouter.post("/resetpassword",(req,res)=>carOwnerController.resetPasswordOwner(req,res))

carOwnerRouter.post("/refreshToken",(req,res)=>carOwnerController.renewRefreshAccessTokenOwner(req,res))

carOwnerRouter.post('/completeregistration',authMiddleware, verifyRole(["carOwner"]),(req,res)=>carOwnerController.completeRegistration(req,res))

carOwnerRouter.post("/login",(req,res)=>carOwnerController.loginOwner(req,res))

carOwnerRouter.post("/changepassword",authMiddleware,(req,res)=>carOwnerController.changePasswordOwner(req,res))

carOwnerRouter.post("/logout",(req,res)=>carOwnerController.logout(req,res))

carOwnerRouter.post("/googleSignIn",(req,res)=>carOwnerController.googleSignIn(req,res))
// carOwnerRouter.post("/googleSignOut",(req,res)=>carOwnerController.googleSignOut(req,res))

carOwnerRouter.get("/getOwnerProfile",authMiddleware,(req,res)=>carOwnerController.getOwnerProfile(req,res))

carOwnerRouter.put("/updateProfile", authMiddleware,(req,res)=>carOwnerController.updateProfileOwner(req,res));

// carOwnerRouter.put("/updateProfileIdProof", authMiddleware,(req,res)=>carOwnerController.updateProfileOwnerIdProof(req,res));

// carOwnerRouter.post("/carupload", authMiddleware, (req,res)=>carOwnerController.uploadCar(req,res));

// carOwnerRouter.get("/getcars", authMiddleware, (req,res)=>carOwnerController.getCarList(req,res));


// router.put('/car-owner/cars/:id', updateCar);
// router.delete('/car-owner/cars/:id', deleteCar);


carOwnerRouter.post("/carupload", authMiddleware, (req,res)=>carOwnerCarsController.uploadCar(req,res));

carOwnerRouter.get("/getcars", authMiddleware, (req,res)=>carOwnerCarsController.getCarList(req,res));

carOwnerRouter.delete("/deletecars/:id", authMiddleware, (req,res)=>carOwnerCarsController.deleteCar(req,res));

carOwnerRouter.put("/updatecars/:id", authMiddleware, (req,res)=>carOwnerCarsController.updateCar(req,res));



export default carOwnerRouter
