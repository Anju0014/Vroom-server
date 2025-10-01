import { Request, Response } from 'express';
import { IBookingService } from '../../services/interfaces/bookings/IBookingService';
import { StatusCode } from '../../constants/statusCode';
import { MESSAGES } from '../../constants/message';
import { bookingMapper } from '../../mappers/bookingMapper';

export class BookingController {
  constructor(private bookingService: IBookingService) {}

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'admin') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { bookings, total } = await this.bookingService.listAllBookings(page, limit, search);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOKINGS_FETCHED || 'Bookings fetched successfully',
        data: bookings.map(bookingMapper.toDTO),
        total,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }
}

export default BookingController;



import { Request, Response } from 'express';
import { CustomRequest } from '../../middlewares/authMiddleWare';
import { IBookingService } from '../../services/interfaces/bookings/IBookingService';
import { StatusCode } from '../../constants/statusCode';
import { MESSAGES } from '../../constants/message';
import { bookingMapper } from '../../mappers/bookingMapper';

export class BookingController {
  constructor(private bookingService: IBookingService) {}

  async getCarOwnerBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const carOwnerId = req.userId;
      if (!carOwnerId) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: MESSAGES.ERROR.NO_OWNER_ID_FOUND });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT });
        return;
      }
      const { bookings, total } = await this.bookingService.getBookingsForCarOwner(carOwnerId, page, limit);
      res.status(StatusCode.OK).json({
        success: true,
        bookings: bookings.map(bookingMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getBookingsByCarId(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const ownerId = req.userId;
      const carId = req.params.id;
      if (!ownerId || !carId) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const bookings = await this.bookingService.getBookingsByCarId(carId, ownerId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Bookings fetched successfully',
        data: bookings.map(bookingMapper.toDTO),
      });
    } replenishError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
  }

  async getActiveBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const carId = req.params.id;
      if (!carId) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const booking = await this.bookingService.getActiveBookingForCar(carId);
      res.status(StatusCode.OK).json({
        success: true,
        booking: booking ? bookingMapper.toDTO(booking) : null,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}

export default BookingController;

import { Request, Response } from 'express';
import { CustomRequest } from '../../middlewares/authMiddleWare';
import { IBookingService } from '../../services/interfaces/bookings/IBookingService';
import { StatusCode } from '../../constants/statusCode';
import { MESSAGES } from '../../constants/message';
import { bookingMapper } from '../../mappers/bookingMapper';

export class BookingController {
  constructor(private bookingService: IBookingService) {}

  async getCustomerBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const userId = req.userId;
      if (!userId) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND });
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
      const bookings = await this.bookingService.getCustomerBookings(userId, page, limit);
      const total = await this.bookingService.getCustomerBookingCount(userId);
      res.status(StatusCode.OK).json({
        success: true,
        bookings: bookings.map(bookingMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async createPendingBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const bookingId = await this.bookingService.createPendingBooking(req.body);
      res.status(StatusCode.CREATED).json({
        success: true,
        bookingId,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async confirmBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_PAYMENT_INTENT,
        });
        return;
      }
      await this.bookingService.confirmBooking(bookingId, paymentIntentId);
      res.status(StatusCode.OK).json({
        success: true,
        bookingId,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async failedBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      await this.bookingService.failedBooking(bookingId);
      res.status(StatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async updateCarTracking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { bookingId, token, lat, lng } = req.body;
      await this.bookingService.updateTrackingLocation({ bookingId, token, lat, lng });
      res.status(StatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async cancelBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (req.user.role !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { bookingId } = req.params;
      await this.bookingService.cancelBooking(bookingId);
      res.status(StatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}

export default BookingController;