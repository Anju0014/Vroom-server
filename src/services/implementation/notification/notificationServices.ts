import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateNotificationDto,NotificationResponseDto } from "../../../dtos/notification.dto";
import { NotificationMapper } from "../../../mappers/notification.mapper";
import INotificationRepository from "../../../repositories/interfaces/notification/INotificationRepository";
import { INotificationService } from "../../interfaces/notification/INotificationServices";
import { getIO } from "../../../sockets/socket";

class NotificationService implements INotificationService {
  private _notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this._notificationRepository = notificationRepository;
  }

  async create(dto:CreateNotificationDto):Promise<NotificationResponseDto>{
    const validated=plainToInstance(CreateNotificationDto,dto);
    await validateOrReject(validated);

    const notification=await this._notificationRepository.create(validated);
    const responseDto=NotificationMapper.toDto(notification);
    
    const io=getIO()
    io.to(dto.userId).emit('newNotification',responseDto);
    return responseDto;

  }
  async getByUserId(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this._notificationRepository.findByUserId(userId,10);
    return NotificationMapper.toDtoArray(notifications);
  }

  async markAsRead(id: string, userId: string):Promise<NotificationResponseDto | null> {
    const notification = await this._notificationRepository.markAsRead(id);
    if (!notification) return null;
    return NotificationMapper.toDto(notification);
  }

  async getUnReadCount(userId: string): Promise<number> {
    return await this._notificationRepository.getUnReadCount(userId);
  }

}
export default NotificationService