

import { Request, Response } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { IBookingService } from '../../../services/interfaces/bookings/IBookingServices';
import { StatusCode } from '../../../constants/statusCode';
import { MESSAGES } from '../../../constants/message';
import { bookingMapper } from '../../../mappers/bookingMapper';

export class BookingController {
  constructor(private bookingService: IBookingService) {}

  async getAllBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'admin') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }
      const { bookings, total } = await this.bookingService.listAllBookings(page, limit, search);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOKINGS_FETCHED || 'Bookings fetched successfully',
        data: bookings.map(bookingMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getCarOwnerBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const carOwnerId = req.userId;
      if (!carOwnerId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_OWNER_ID_FOUND,
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
      const { bookings, total } = await this.bookingService.getBookingsForCarOwner(carOwnerId, page, limit);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Car owner bookings fetched successfully',
        data: bookings.map(bookingMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBookingsByCarId(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const ownerId = req.userId;
      const carId = req.params.id;
      if (!ownerId || !carId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const bookings = await this.bookingService.getBookingsByCarId(carId, ownerId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Bookings for car fetched successfully',
        data: bookings.map(bookingMapper.toDTO),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getActiveBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const carId = req.params.id;
      if (!carId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const booking = await this.bookingService.getActiveBookingForCar(carId);
      res.status(StatusCode.OK).json({
        success: true,
        message: booking ? 'Active booking fetched successfully' : 'No active booking found',
        data: booking ? bookingMapper.toDTO(booking) : null,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getCustomerBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const userId = req.userId;
      if (!userId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND,
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
      const bookings = await this.bookingService.getCustomerBookings(userId, page, limit);
      const total = await this.bookingService.getCustomerBookingCount(userId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Customer bookings fetched successfully',
        data: bookings.map(bookingMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createPendingBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role  !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const bookingId = await this.bookingService.createPendingBooking(req.body);
      res.status(StatusCode.CREATED).json({
        success: true,
        message: 'Pending booking created successfully',
        data: { bookingId },
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async confirmBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role  !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { bookingId } = req.params;
      const { paymentIntentId } = req.body;
      if (!bookingId || !paymentIntentId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      await this.bookingService.confirmBooking(bookingId, paymentIntentId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: { bookingId },
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async failedBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role  !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { bookingId } = req.params;
      if (!bookingId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      await this.bookingService.failedBooking(bookingId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Booking marked as failed successfully',
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateCarTracking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role  !== 'customer') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { bookingId, token, lat, lng } = req.body;
      if (!bookingId || !token || lat == null || lng == null) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      await this.bookingService.updateTrackingLocation({ bookingId, token, lat, lng });
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Tracking location updated successfully',
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async cancelBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { bookingId } = req.params;
      if (!bookingId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      await this.bookingService.cancelBooking(bookingId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Booking cancelled successfully',
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
    console.error('Error in BookingController:', error); // Log error for debugging
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}

export default BookingController;