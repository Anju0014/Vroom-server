import { Response,Request} from 'express';
import {Car, ICar} from '../../../models/car/carModel'
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";
// import {Booking} from '../../../models/booking'


// import { IAdmin } from '../../../models/admin/adminModel';
import ICarController from '../../interfaces/car/ICarController';
import { ICarService} from '../../../services/interfaces/car/ICarServices';
import { Booking } from '../../../models/booking/bookingModel';
// import { ICustomer } from '../../../models/customer/customerModel';
// import { ICarOwner } from '../../../models/carowner/carOwnerModel';


class CarController implements ICarController{
    private _carService: ICarService

    constructor(_carService: ICarService) {
        this._carService = _carService
    }


   async uploadCar(req: CustomRequest, res: Response): Promise<void> {
        try {
          const {carName,brand,year,fuelType,rcBookNo,expectedWage,location,images,videos,} = req.body;
    
          const ownerId = req.userId; 
      
          if (!ownerId) {
            res.status(StatusCode.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.ERROR.UNAUTHORIZED,
            });
            return;
        }

        if (!carName || !brand || !expectedWage || !location || !images || (Array.isArray(images) && images.length === 0)) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: MESSAGES.ERROR.MISSING_FIELDS,
            });
            return;
        }
          console.log("Owner ID:", ownerId);
          console.log("Car details:", req.body);
          const geoLocation: ICar["location"] = {
            address: location.address,
            landmark: location.landmark,
            coordinates: {
              type: "Point",
              coordinates: [location.coordinates.lng, location.coordinates.lat] as [number, number],
            }
          };
          
          const carData: Partial<ICar> = {
            carName,
            brand,
            year,
            fuelType,
            rcBookNo,
            expectedWage,
            location:geoLocation,
            images: Array.isArray(images) ? images : [images], // Ensure images is an array
            videos: videos && Array.isArray(videos) ? videos : [], // Default empty array if not provided
          };
          const newCar = await this._carService.registerNewCar(carData, ownerId);
      
          res.status(StatusCode.CREATED).json({
            success: true,
            message: MESSAGES.SUCCESS.CAR_UPLOADED,
            car: newCar,
        });

          // res.status(201).json({ message: "Car uploaded successfully", car: newCar });
        } catch (error) {
          console.error("Car upload error:", error);
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
      }
      
      async getCarList(req: CustomRequest, res: Response): Promise<void> {
        try {
          const ownerId = req.userId; // Assuming this is set in the middleware
          if (!ownerId) {
            // res.status(400).json({ message: "Owner ID is required" });
            res.status(StatusCode.UNAUTHORIZED).json({
              success: false,
              message: MESSAGES.ERROR.UNAUTHORIZED,
          });
            return;
          }
    
          const cars = await this._carService.getCarsByOwner(ownerId);
    
          console.log("cars list ",cars)

          res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.SUCCESS.CARS_FETCHED,
            cars,
        });
          // res.status(200).json({ message: "Cars fetched successfully", cars });
        } catch (error) {
          console.error("Error fetching cars:", error);
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



    async deleteCar(req: CustomRequest, res: Response): Promise<void> {
        try {
          const carId = req.params.id;
          console.log("deleting one",carId)
      
          const deletedCar = await this._carService.deleteCar(carId);
      
          res.status(200).json({
            success: true,
            message: "Car deleted successfully",
            car: deletedCar,
          });
        } catch (error) {
          console.error("Delete Error:", error);
          this.handleError(res, error, 500);
        }
      }

      // async updateCar(req: CustomRequest, res: Response): Promise<void> {
      //   try {
      //     const carId = req.params.id;
      //     const updatedData = req.body;
      //     console.log("unjfvbyb",updatedData)
      
      //     const updatedCar = await this._carService.updateCar(carId, updatedData);
      
      //     res.status(200).json({
      //       success: true,
      //       message: "Car updated successfully",
      //       car: updatedCar,
      //     });
      //   } catch (error) {
      //     console.error("Update Car Error:", error);
      //     this.handleError(res, error, 500);
      //   }
      // }
      
      async updateCar(req: CustomRequest, res: Response): Promise<void> {
        try {
          const carId = req.params.id;
          const ownerId = req.userId;
          const {
            carName,
            brand,
            year,
            fuelType,
            rcBookNo,
            expectedWage,
            location,
            images,
            videos,
          } = req.body;
      
          if (!ownerId) {
            res.status(StatusCode.UNAUTHORIZED).json({
              success: false,
              message: MESSAGES.ERROR.UNAUTHORIZED,
            });
            return;
          }
      
          if (
            !carName ||
            !brand ||
            !expectedWage ||
            !location ||
            !images ||
            (Array.isArray(images) && images.length === 0)
          ) {
            res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: MESSAGES.ERROR.MISSING_FIELDS,
            });
            return;
          }
      
          const geoLocation: ICar["location"] = {
            address: location.address,
            landmark: location.landmark,
            coordinates: {
              type: "Point",
              coordinates: [location.coordinates.lng, location.coordinates.lat] as [number, number],
            },
          };
      
          const updatedCarData: Partial<ICar> = {
            carName,
            brand,
            year,
            fuelType,
            rcBookNo,
            expectedWage,
            location: geoLocation,
            images: Array.isArray(images) ? images : [images],
            videos: videos && Array.isArray(videos) ? videos : [],
          };
      
          const updatedCar = await this._carService.updateCar(carId, updatedCarData);
      
          res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.SUCCESS.CAR_UPDATED,
            car: updatedCar,
          });
        } catch (error) {
          console.error("Update Car Error:", error);
          this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
      }
      


   async getNearbyCars (req: Request, res: Response): Promise<void>{
  const { lat, lng, maxDistance = "50" } = req.query;
console.log("didi i came")
  console.log(lat,lng,maxDistance)
  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitude and longitude are required' });
    return;
  }

  try {
    const cars = await Car.find({
      verifyStatus: 1,
      isDeleted: false,
      available: true,
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(lng as string),
              parseFloat(lat as string)
            ]
          },
          $maxDistance: parseFloat(maxDistance as string) * 1000 // Convert km to meters
        }
      }
    });
   
    console.log(cars)
    res.json(cars);
  } catch (err) {
    console.error('Nearby cars error:', err);
    res.status(500).json({ error: 'Server error while fetching nearby cars' });
  }
}
async getFeaturedCars (req: Request, res: Response): Promise<void>{

console.log("didi i came")
  
 
  try {
    const cars = await Car.find({
      verifyStatus: 1,
      isDeleted: false,
      available: true,
    });
   
    console.log(cars)
    res.json(cars);
  } catch (err) {
    console.error('Nearby cars error:', err);
    res.status(500).json({ error: 'Server error while fetching nearby cars' });
  }
  
};





async getCarDetail (req:Request, res:Response): Promise<void>  {
console.log("melajd")
  const  {carId}=req.params
  // req.params;

  const car = await Car.findById(carId);
  res.status(201).json(car );
}






async getbookedDatesCars (req: Request, res: Response): Promise<void> {
  const { carId } = req.params;
  console.log("bookto")

  if (!carId) {
    res.status(400).json({ error: 'Missing carId parameter' });
    return;
  }

  try {
    const bookings = await Booking.find(
      { carId, status: 'confirmed' },
      'startDate endDate'
    );

    const bookedRanges = bookings.map(b => ({
      start: b.startDate,
      end: b.endDate
    }));

    res.json({ bookedRanges });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}










  private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
          console.error("Error:", error);
  
          const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
  
          res.status(statusCode).json({
              success: false,
              message: errorMessage,
          });
      }
}

export default CarController