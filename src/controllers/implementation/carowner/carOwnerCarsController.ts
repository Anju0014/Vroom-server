import { Response,Request} from 'express';
import {Car, ICar} from '../../../models/car/carModel'
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";

import ICarOwnerCarsController from '../../interfaces/carowner/ICarOwnerCarsController';
import { ICarOwnerCarsService} from '../../../services/interfaces/carOwner/ICarOwnerCarsServices';



class CarOwnerCarsController implements ICarOwnerCarsController{

    private _ownerscarService: ICarOwnerCarsService

    constructor(_carService: ICarOwnerCarsService) {
        this._ownerscarService = _carService
    }

   async uploadCar(req: CustomRequest, res: Response): Promise<void> {
        try {
          console.log("DID I REACH HERE")
          console.log(req.body)
          const {carName,brand,year,fuelType,carType,rcBookNo,expectedWage,location,images,videos,rcBookProof, insuranceProof} = req.body;
    
          const ownerId = req.userId; 
          console.log(req.userId)
      
          if (!ownerId) {
            console.log(req.userId)
            console.log("no owner")
            res.status(StatusCode.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.ERROR.UNAUTHORIZED,
            });
            return;
        }

        if (!carName || !brand || !expectedWage || !location ||!insuranceProof || !rcBookProof|| !images || (Array.isArray(images) && images.length === 0)) {

           console.log("error here")
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
            carType,
            rcBookNo,
            expectedWage,
            rcBookProof,
            insuranceProof,
            location:geoLocation,
            images: Array.isArray(images) ? images : [images], 
            videos: videos && Array.isArray(videos) ? videos : [], 
          };
          const newCar = await this._ownerscarService.registerNewCar(carData, ownerId);
      
          res.status(StatusCode.CREATED).json({
            success: true,
            message: MESSAGES.SUCCESS.CAR_UPLOADED,
            car: newCar,
        });


        } catch (error) {
          console.log("Car upload error:", error);
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
      }
      
      async getCarList(req: CustomRequest, res: Response): Promise<void> {
        try {
          const ownerId = req.userId;
          if (!ownerId) {
            res.status(StatusCode.UNAUTHORIZED).json({
              success: false,
              message: MESSAGES.ERROR.UNAUTHORIZED,
          });
            return;
          }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9;
        if (page < 1 || limit < 1 || limit > 100) {
             res.status(StatusCode.BAD_REQUEST).json({
              success: false,
               message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
           });
           return;
         }
          const cars = await this._ownerscarService.getCarsByOwner(ownerId, page, limit);
    const total = await this._ownerscarService.getCarsCount(ownerId);
          console.log("cars list ",cars)

       res.status(StatusCode.OK).json({
         cars,
         total,
       });
        } catch (error) {
          console.error("Error fetching cars:", error);
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



  async getBookingsByCarId(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log("bookings check")
      console.log("id",req.params.id)
      const ownerId = req.userId;
      if (!ownerId) {
        console.log("errornhee")
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const carId = req.params.id;
      const bookings = await this._ownerscarService.getBookingsByCarId(carId, ownerId);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Bookings fetched successfully',
        data: bookings,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }


  async updateCarAvailability(req: CustomRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const carId = req.params.id;
      const { unavailableDates } = req.body;

      if (!Array.isArray(unavailableDates)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'unavailableDates must be an array of strings',
        });
        return;
      }

      const car = await this._ownerscarService.updateCarAvailability(carId, ownerId, unavailableDates);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Availability updated successfully',
        data: car,
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }



    async deleteCar(req: CustomRequest, res: Response): Promise<void> {
        try {
          const carId = req.params.id;
          console.log("deleting one",carId)
      
          const deletedCar = await this._ownerscarService.deleteCar(carId);
      
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
            available,
            carType,
            rcBookProof,
            insuranceProof,
          } = req.body;
      
          if (!ownerId) {
            res.status(StatusCode.UNAUTHORIZED).json({
              success: false,
              message: MESSAGES.ERROR.UNAUTHORIZED,
            });
            return;
          }
      
          if (!carName ||!brand ||!expectedWage ||!location ||!images ||
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
            available,
            rcBookProof,
            insuranceProof,
            carType,
            location: geoLocation,
            images: Array.isArray(images) ? images : [images],
            videos: videos && Array.isArray(videos) ? videos : [],
          };
      
          const updatedCar = await this._ownerscarService.updateCar(carId, updatedCarData);
      
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


      async getActiveBooking(req: Request, res: Response): Promise<void> {
    try {
      const { carId } = req.params;
      console.log("active")
      const booking = await this._ownerscarService.getActiveBookingForCar(carId);
      console.log("booking/ ",booking)
      res.status(StatusCode.OK).json({ success: true, booking });
    } catch (error: any) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
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

export default CarOwnerCarsController

