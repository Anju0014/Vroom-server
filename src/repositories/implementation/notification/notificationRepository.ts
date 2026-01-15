import { Notification, INotification } from '../../../models/notification/notificationModel';
import { BaseRepository } from '../../base/BaseRepository';
import INotificationRepository from '../../interfaces/notification/INotificationRepository';

export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(Notification);
  }
  async create(data: Partial<INotification>): Promise<INotification> {
    return await Notification.create(data);
  }

  async findByUserId(userId: string, limit = 10): Promise<INotification[]> {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  async markAsRead(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async getUnReadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ userId, isRead: false });
  }
}
export default NotificationRepository;
