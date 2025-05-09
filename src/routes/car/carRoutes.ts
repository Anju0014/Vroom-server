import {Router} from "express";
import  CarController from "../../controllers/implementation/car/carController"
import CarService from "../../services/implementation/car/carService"
import CarRepository from "../../repositories/implementation/car/carRepository";
import authMiddleware,{verifyRole} from "../../middlewares/authMiddleWare";

const carRouter=Router();

const carRepository= new CarRepository()
const carService= new CarService(carRepository);
const carController=new CarController(carService);


carRouter.post("/carupload", authMiddleware, (req,res)=>carController.uploadCar(req,res));

carRouter.get("/getcars", authMiddleware, (req,res)=>carController.getCarList(req,res));

carRouter.delete("/deletecars/:id", authMiddleware, (req,res)=>carController.deleteCar(req,res));

carRouter.put("/updatecars/:id", authMiddleware, (req,res)=>carController.updateCar(req,res));


carRouter.get('/nearby', (req,res)=>carController.getNearbyCars(req,res));

carRouter.get('/featured',(req,res)=>carController.getFeaturedCars(req,res));


// carRouter.get('/booked-dates/:carId',(req,res)=>carController.getbookedDatesCars(req,res));

// carRouter.post('/bookings', async (req, res) => carController.createBooking(req,res));

carRouter.get('/getCarDetails/:carId', (req,res)=>carController.getCarDetail(req,res));

carRouter.get('/getBookingDetails/:carId',(req,res)=>carController.getbookedDatesCars(req,res));

export default carRouter