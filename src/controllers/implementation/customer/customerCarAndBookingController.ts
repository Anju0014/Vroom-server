import { Response,Request} from 'express';
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";

import ICustomerCarAndBookingController from '../../interfaces/customer/ICustomerCarAndBookingController';
import { ICustomerCarAndBookingService } from '../../../services/interfaces/customer/ICustomerCarAndBookingServices';
import { generateAndUploadReceipt } from '../../../services/receiptService';
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
        const startDate=req.query.startDate as string;
        const endDate= req.query.endDate as string;

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
          startDate,
          endDate,
        });
        const total = await this._customerCarService.getCarsCount({ search, minPrice, maxPrice,carType,location,startDate,endDate});
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
   
    try {
      const { carId } = req.params;
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

   
    try {
      const { carId } = req.params;
      if (!carId) {
      res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_CAR_ID,
        });
        return
      }
  
      const bookedRanges = await this._customerCarService.getBookedDateRanges(carId);
      console.log("bookedRanges",bookedRanges)
      res.status(StatusCode.OK).json({ success: true, data: bookedRanges });

    } catch (err) {
      this.handleError(res, err);
    }
  }
  // controller
async  checkBookingAvailability (req: Request, res: Response):Promise<void>  {
  console.log("reached availability point")
  try {
    const { carId, startDate, endDate } = req.query; // or req.body

   const bookings = await Booking.find({
  carId,
  $or: [
    // confirmed overlapping
    {
      status: 'confirmed',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    },
    // pending overlapping
    {
      status: 'pending',
      lockedUntil: { $gte: new Date() },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    }
  ]
});

    if (bookings.length > 0) {
      console.log(false)
      res.json({ available: false });
      return
    }
console.log(true)
     res.json({ available: true });
     return
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


  async createPendingBooking(req: Request, res: Response): Promise<void> {
    try {

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
     const booking = await this._customerCarService.confirmBooking(bookingId, paymentIntentId);
    const receiptUrl = await generateAndUploadReceipt(bookingId);
      res.status(StatusCode.OK).json({ success: true, bookingId,receiptUrl });
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




