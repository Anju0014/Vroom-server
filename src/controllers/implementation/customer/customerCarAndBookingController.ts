import { Response,Request} from 'express';
import {Car, ICar} from '../../../models/car/carModel'
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";

import ICustomerCarAndBookingController from '../../interfaces/customer/ICustomerCarAndBookingController';
// import ICustomerCarAndBookingRepository from '../../../repositories/interfaces/customer/ICustomerCarAndBookingRepository';
import { ICustomerCarAndBookingService } from '../../../services/interfaces/customer/ICustomerCarAndBookingServices';
import { Booking } from '../../../models/booking/bookingModel';



class CustomerCarAndBookingController implements ICustomerCarAndBookingController{

    private _customerCarService: ICustomerCarAndBookingService

    constructor(_customerCarService: ICustomerCarAndBookingService) {
        this._customerCarService = _customerCarService
    }

async getNearbyCars(req: Request, res: Response): Promise<void> {
    const { lat, lng, maxDistance = "50" } = req.query;
    console.log("nearby cars")
  
    if (!lat || !lng) {
       res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.MISSING_COORDINATES,
      });
      return
    }
  
    try {
      const cars = await this._customerCarService.getNearbyCars(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(maxDistance as string)
      );
      res.status(StatusCode.OK).json({ success: true, data: cars });
    } catch (err) {
      this.handleError(res, err);
    }
  }
  
  async getFeaturedCars(req: Request, res: Response): Promise<void> {
    try {
        console.log("featuredcars")
      const cars = await this._customerCarService.getFeaturedCars();
      res.status(StatusCode.OK).json({ success: true, data: cars });
    } catch (err) {
      this.handleError(res, err);
    }
  }
  
  async getAllCars(req: CustomRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      const search = req.query.search as string;
      const minPrice = parseFloat(req.query.minPrice as string) || 0;
      const maxPrice = parseFloat(req.query.maxPrice as string) || Infinity;
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const carType= req.query.carType as string;
      const location=req.query.location as string;

      console.log("reached at controller", search, minPrice,maxPrice,carType,location)
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }

      const cars = await this._customerCarService.getAllCars(page, limit, {
        search,
        minPrice,
        maxPrice,
        carType,
        location,
        // latitude,
        // longitude,
      });
      const total = await this._customerCarService.getCarsCount({ search, minPrice, maxPrice,carType,location
        // latitude,longitude 
        });
      console.log('Cars:', cars, 'Total:', total);

      res.status(StatusCode.OK).json({ data: cars, total });
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
      });
    }
  }



  async getCarDetail(req: Request, res: Response): Promise<void> {
    const { carId } = req.params;
  console.log("car details")
    try {
      const car = await this._customerCarService.getCarDetail(carId);
      if (!car) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND,
        });
        return
      }
      res.status(StatusCode.OK).json({ success: true, data: car });
    } catch (err) {
      this.handleError(res, err);
    }
  }
  
  async getbookedDatesCars(req: Request, res: Response): Promise<void> {
    const { carId } = req.params;
  
    console.log("hudjij")
    if (!carId) {
     res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.MISSING_CAR_ID,
      });
      return
    }
  
    try {
      const bookedRanges = await this._customerCarService.getBookedDateRanges(carId);
      console.log("bookedRanges",bookedRanges)
      res.status(StatusCode.OK).json({ success: true, data: bookedRanges });
    } catch (err) {
      this.handleError(res, err);
    }
  }



  async createPendingBooking(req: Request, res: Response): Promise<void> {
    try {
        console.log("reached at booking line")
      const bookingId = await this._customerCarService.createPendingBooking(req.body);
      console.log(bookingId)
      res.status(StatusCode.CREATED).json({ success: true, bookingId });
    } catch (err) {
      this.handleError(res, err, StatusCode.BAD_REQUEST);
    }
  }
  
  async confirmBooking(req: Request, res: Response): Promise<void> {
    const { bookingId } = req.params;
    const { paymentIntentId } = req.body;
  
    if (!paymentIntentId) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.MISSING_PAYMENT_INTENT,
      });
      return
    }
  
    try {
      await this._customerCarService.confirmBooking(bookingId, paymentIntentId);
      res.status(StatusCode.OK).json({ success: true, bookingId });
    } catch (err) {
      this.handleError(res, err, StatusCode.BAD_REQUEST);
    }
  }
  
  async failedBooking(req: Request, res: Response): Promise<void> {
    const { bookingId } = req.params;
  
    try {
      await this._customerCarService.failedBooking(bookingId);
      res.status(StatusCode.OK).json({ success: true });
    } catch (err) {
      this.handleError(res, err, StatusCode.BAD_REQUEST);
    }
  }
  
async updateCarTracking(req: Request, res: Response): Promise<void> {
  try {
    console.log("here i am");
    console.log(req.body)
    const { bookingId, token, lat, lng } = req.body;

    await this._customerCarService.updateTrackingLocation({
      bookingId,
      token,
      lat,
      lng,
    });

    res.status(StatusCode.OK).json({ success: true });
  } catch (err: any) {
    this.handleError(res, err, StatusCode.BAD_REQUEST);
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

export default CustomerCarAndBookingController




