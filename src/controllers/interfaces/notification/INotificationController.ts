import { Request, Response } from 'express';

interface INotificationController {
  createNotification(req: Request, res: Response): Promise<void>;
  getByUser(req: Request, res: Response): Promise<void>;
  markAsRead(req: Request, res: Response): Promise<void>;
  getUnreadCount(req: Request, res: Response): Promise<void>;
}
export default INotificationController;
