import { Response, Request } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { StatusCode } from '../../../constants/statusCode';

import INotificationController from '../../interfaces/notification/INotificationController';
import { INotificationService } from '../../../services/interfaces/notification/INotificationServices';
import { MESSAGES } from '../../../constants/message';
import logger from '../../../utils/logger';

class NotificationController implements INotificationController {
  private _notificationService: INotificationService;

  constructor(_notificationService: INotificationService) {
    this._notificationService = _notificationService;
  }

  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const notification = await this._notificationService.create(req.body);

      res.status(StatusCode.CREATED).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      logger.error("Create Notification Error:", error);
 this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async getByUser(req: Request, res: Response): Promise<void> {
    try {
        
      const userId = req.query.userId as string;

      if (!userId) {
        logger.warn("No user")
        res.status(StatusCode.BAD_REQUEST).json({ message: "UserId is required" });
        return;
      }

      const notifications = await this._notificationService.getByUserId(userId);

      res.status(StatusCode.OK).json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      logger.error("Get Notifications Error:", error);
       this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

    async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      if (!id || !userId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Notification id and userId are required",
        });
        return;
      }

      const updated = await this._notificationService.markAsRead(id, userId);

      res.status(StatusCode.OK).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      logger.error("Mark As Read Error:", error);
 this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }
   
  
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      const count = await this._notificationService.getUnReadCount(userId);

      res.status(StatusCode.OK).json({
        success: true,
        count,
      });
    } catch (error: any) {
      logger.error("Unread Count Error:", error);

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

export default NotificationController