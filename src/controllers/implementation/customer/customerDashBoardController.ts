import { Response, Request } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { MESSAGES } from '../../../constants/message';
import { StatusCode } from '../../../constants/statusCode';

import ICustomerDashBoardController from '../../interfaces/customer/ICustomerDashBoardController';
import { ICustomerDashBoardService } from '../../../services/interfaces/customer/ICustomerDashBoardServices';
import { generateAndUploadReceipt } from '../../../services/receiptService';
import { CustomerBookingMapper } from '../../../mappers/customerBooking.mapper';
import logger from '../../../utils/logger';

class CustomerDashBoardController implements ICustomerDashBoardController {
  private _customerDashService: ICustomerDashBoardService;

  constructor(_customerDashService: ICustomerDashBoardService) {
    this._customerDashService = _customerDashService;
  }

  async getCustomerBookingDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(StatusCode.NOT_FOUND).json({ message: 'User Id not found' });
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
      const bookings = await this._customerDashService.getCustomerBookings(userId, page, limit);
      const total = await this._customerDashService.getCustomerBookingCount(userId);
      const bookingDTOs = CustomerBookingMapper.toDTOList(bookings);
      res.status(200).json({
        success: true,
        data: {
          bookings: bookingDTOs,
          total,
        },
      });
      return;
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    logger.info('**************booking cancel controller*******************************');
    const { bookingId } = req.params;
    try {
      let booking = await this._customerDashService.cancelBooking(bookingId);
      await generateAndUploadReceipt(bookingId);
      logger.info('booking data', booking);
      res.status(StatusCode.OK).json({ success: true });
    } catch (error: any) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  private handleError(
    res: Response,
    error: unknown,
    statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR
  ): void {
    logger.error('Error:', error);

    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}

export default CustomerDashBoardController;
