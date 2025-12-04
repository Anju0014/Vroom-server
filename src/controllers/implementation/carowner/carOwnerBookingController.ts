import { Response } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { MESSAGES } from '../../../constants/message';
import { StatusCode } from '../../../constants/statusCode';
import ICarOwnerBookingController from '../../interfaces/carowner/ICarOwnerBookingController';
import { ICarOwnerBookingService } from '../../../services/interfaces/carOwner/ICarOwnerBookingServices';

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
    } catch (error) {
      console.error('Failed to fetch car owner bookings:', error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'Something went wrong' });
    }
  }
}

export default CarOwnerBookingController;
