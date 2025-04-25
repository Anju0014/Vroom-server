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



// async getNearbyCars (req: Request, res: Response): Promise<void>{
//   const { lat, lng, maxDistance = "50" } = req.query;
// console.log("didi i came")
//   console.log(lat,lng,maxDistance)
//   if (!lat || !lng) {
//     res.status(400).json({ error: 'Latitude and longitude are required' });
//     return;
//   }

//   try {
//     const cars = await Car.find({
//       verifyStatus: 1,
//       isDeleted: false,
//       available: true,
//       'location.coordinates': {
//         $nearSphere: {
//           $geometry: {
//             type: "Point",
//             coordinates: [
//               parseFloat(lng as string),
//               parseFloat(lat as string)
//             ]
//           },
//           $maxDistance: parseFloat(maxDistance as string) * 1000 // Convert km to meters
//         }
//       }
//     });
   
//     console.log(cars)
//     res.json(cars);
//   } catch (err) {
//     console.error('Nearby cars error:', err);
//     res.status(500).json({ error: 'Server error while fetching nearby cars' });
//   }
// }
// async getFeaturedCars (req: Request, res: Response): Promise<void>{

// console.log("didi i came")
  
 
//   try {
//     const cars = await Car.find({
//       verifyStatus: 1,
//       isDeleted: false,
//       available: true,
//     });
   
//     console.log(cars)
//     res.json(cars);
//   } catch (err) {
//     console.error('Nearby cars error:', err);
//     res.status(500).json({ error: 'Server error while fetching nearby cars' });
//   }
  
// };





// async getCarDetail (req:Request, res:Response): Promise<void>  {
// console.log("melajd")
//   const  {carId}=req.params
  

//   const car = await Car.findById(carId);
//   res.status(201).json(car );
// }






// async getbookedDatesCars (req: Request, res: Response): Promise<void> {
//   const { carId } = req.params;
//   console.log("bookto")

//   if (!carId) {
//     res.status(400).json({ error: 'Missing carId parameter' });
//     return;
//   }

//   try {
//     const bookings = await Booking.find(
//       { carId, status: 'confirmed' },
//       'startDate endDate'
//     );

//     const bookedRanges = bookings.map(b => ({
//       start: b.startDate,
//       end: b.endDate
//     }));

//     res.json({ bookedRanges });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// }




async getNearbyCars(req: Request, res: Response): Promise<void> {
    const { lat, lng, maxDistance = "50" } = req.query;
  
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
      const cars = await this._customerCarService.getFeaturedCars();
      res.status(StatusCode.OK).json({ success: true, data: cars });
    } catch (err) {
      this.handleError(res, err);
    }
  }
  
  async getCarDetail(req: Request, res: Response): Promise<void> {
    const { carId } = req.params;
  
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
  
  async cancelBooking(req: Request, res: Response): Promise<void> {
    const { bookingId } = req.params;
  
    try {
      await this._customerCarService.cancelBooking(bookingId);
      res.status(StatusCode.OK).json({ success: true });
    } catch (err) {
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



//  async createPendingBooking (req: Request, res: Response): Promise<void> => {
//   const { carId, userId, carOwnerId, startDate, endDate, totalPrice } = req.body as BookingData;

//   if (!carId || !userId || !carOwnerId || !startDate || !endDate || !totalPrice) {
//     res.status(400).json({ error: 'Missing required fields' });
//     return;
//   }

//   try {
//     // Validate car
//     const car = await Car.findById(carId);
//     if (!car) {
//       res.status(400).json({ error: 'Car not found' });
//       return;
//     }

//     // Add logic to check car availability for the given dates (e.g., no overlapping bookings)
//     const conflictingBooking = await Booking.findOne({
//       carId,
//       status: { $in: ['pending', 'confirmed'] },
//       $or: [
//         { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
//         { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
//       ],
//     });

//     if (conflictingBooking) {
//       res.status(400).json({ error: 'Car is not available for the selected dates' });
//       return;
//     }

//     // Create booking
//     const booking = await Booking.create({
//       carId,
//       userId,
//       carOwnerId,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       totalPrice,
//       status: 'pending',
//     });

//     res.json({ bookingId: booking._id.toString() });
//   } catch (err) {
//     console.error('Error creating booking:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

//  async  confirmBooking(req: Request, res: Response): Promise<void> => {
//   const { bookingId } = req.params;
//   const { paymentIntentId } = req.body;

//   if (!paymentIntentId) {
//     res.status(400).json({ error: 'Missing paymentIntentId' });
//     return;
//   }

//   try {
//     const booking = await Booking.findById(bookingId);
//     if (!booking || booking.status !== 'pending') {
//       res.status(400).json({ error: 'Invalid or non-pending booking' });
//       return;
//     }

//     booking.status = 'confirmed';
//     booking.paymentIntentId = paymentIntentId;
//     await booking.save();

//     res.json({ success: true, bookingId });
//   } catch (err) {
//     console.error('Error confirming booking:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// async cancelBooking (req: Request, res: Response): Promise<void> => {
//   const { bookingId } = req.params;

//   try {
//     const booking = await Booking.findById(bookingId);
//     if (!booking || booking.status !== 'pending') {
//       res.status(400).json({ error: 'Invalid or non-pending booking' });
//       return;
//     }

//     // Option 1: Update status to 'failed'
//     booking.status = 'failed';
//     await booking.save();

//     // Option 2: Delete booking (uncomment if preferred)
//     // await Booking.deleteOne({ _id: bookingId });

//     res.json({ success: true });
//   } catch (err) {
//     console.error('Error cancelling booking:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }




  
}

export default CustomerCarAndBookingController






































//  async getbookedDatesCars (req:Request, res:Response):Promise<void>{
//   const { carId } = req.params;

//   try {
//     const bookings = await Booking.find({
//       carId,
//       status: 'confirmed'
//     }, 'startDate endDate');

//     const bookedRanges = bookings.map(b => ({
//       start: b.startDate,
//       end: b.endDate
//     }));

//     res.json({ bookedRanges });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// }

//  async createBooking (req:Request, res:Response): Promise<void>  {
//   const { carId, userId, startDate, endDate } = req.body;

//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   if (start >= end) {
//      res.status(400).json({ message: 'Invalid date range' });
//      return
//   }

//   const existing = await Booking.findOne({
//     carId,
//     status: 'confirmed',
//     startDate: { $lte: end },
//     endDate: { $gte: start }
//   });

//   if (existing) {
//      res.status(409).json({ message: 'Car already booked in that range' });
//      return
//   }

//   const car = await Car.findById(carId);
//   const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//   const totalPrice = days * car.pricePerDay;

//   const booking = await Booking.create({
//     carId,
//     userId,
//     startDate: start,
//     endDate: end,
//     totalPrice
//   });

//   res.status(201).json({ message: 'Booking confirmed', booking });
// }






