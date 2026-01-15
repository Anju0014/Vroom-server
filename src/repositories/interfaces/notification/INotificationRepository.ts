import { INotification } from '../../../models/notification/notificationModel';
interface INotificationRepository {
  create(data: Partial<INotification>): Promise<INotification>;
  findByUserId(userId: string, limit: number): Promise<INotification[]>;
  markAsRead(id: string): Promise<INotification | null>;
  getUnReadCount(userId: string): Promise<number>;
}
export default INotificationRepository;
