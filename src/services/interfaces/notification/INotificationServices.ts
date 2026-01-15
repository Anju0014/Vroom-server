import { INotification } from '../../../models/notification/notificationModel';
import { CreateNotificationDto, NotificationResponseDto } from '../../../dtos/notification.dto';
export interface INotificationService {
  create(dto: CreateNotificationDto): Promise<NotificationResponseDto>;
  getByUserId(userId: string): Promise<NotificationResponseDto[]>;
  markAsRead(id: string, userId: string): Promise<NotificationResponseDto | null>;
  getUnReadCount(userId: string): Promise<number>;
}
