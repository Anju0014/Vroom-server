import { Response, urlencoded } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { MESSAGES } from '../../../constants/message';
import { StatusCode } from '../../../constants/statusCode';
import ICarOwnerBookingController from '../../interfaces/carowner/ICarOwnerBookingController';
import { ICarOwnerBookingService } from '../../../services/interfaces/carOwner/ICarOwnerBookingServices';
import { Booking } from '../../../models/booking/bookingModel';
import { generatePresignedUrl, generateViewPresignedUrl, generateViewRecieptPresignedUrl } from '../../../services/s3Service';


class CarOwnerBookingController implements ICarOwnerBookingController {
  private _ownerBookingService: ICarOwnerBookingService;

  constructor(_ownerBookingService: ICarOwnerBookingService) {
    this._ownerBookingService = _ownerBookingService;
  }

  async getCarOwnerBookings(req: CustomRequest, res: Response) {
    try {
      const carOwnerId = req.userId;
      if (!carOwnerId) {
        res
          .status(StatusCode.NOT_FOUND)
          .json({ success: false, message: MESSAGES.ERROR.NO_OWNER_ID_FOUND });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
      }
      const { bookings, total } = await this._ownerBookingService.getBookingsForCarOwner(
        carOwnerId,
        page,
        limit
      );
      res.status(StatusCode.OK).json({
        success: true,
        bookings,
        total,
      });
    } catch (error:any) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    //   console.error('Failed to fetch car owner bookings:', error);
    //   res
    //     .status(StatusCode.INTERNAL_SERVER_ERROR)
    //     .json({ success: false, message: 'Something went wrong' });
    // }
  }
}

// ownerBooking.controller.ts (or booking.controller.ts)

async getReceiptUrl(req: CustomRequest, res: Response) {
  try {
console.log("reached at")
    const { bookingId } = req.params;
    console.log("bookingId",bookingId)
    const userId = req.userId;
    // const userRole = req.role; // assuming role is added in auth middleware

    if (!bookingId) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_BOOKING_ID,
      });
      return;
    }

    if (!userId) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.UNAUTHORIZED,
      });
      return;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking || !booking.receiptKey) {
      res.status(StatusCode.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.RECEIPT_NOT_FOUND,
      });
      return;
    }

    // ✅ Business authorization
    const isAuthorized =
      booking.userId.toString() === userId ||
      booking.carOwnerId.toString() === userId
      // userRole === 'ADMIN';

    if (!isAuthorized) {
      res.status(StatusCode.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ERROR.FORBIDDEN,
      });
      return;
    }

    
    const url = await generateViewRecieptPresignedUrl(booking.receiptKey);

    console.log(url)
    res.status(StatusCode.OK).json({
      success: true,
      url,
    });
  } catch (error) {
    this.handleError(res, error);
  }
}


    private handleError(
      res: Response,
      error: unknown,
      statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR
    ): void {
      console.error('Error:', error);
  
      const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
  
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
}

export default CarOwnerBookingController;
