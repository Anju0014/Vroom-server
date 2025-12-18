import ChatMessage, { IChatMessage } from '../../../models/chatMessage/chatMessageModel';

import IChatRepository from '../../interfaces/chat/IChatRepository';
import { BaseRepository } from '../../base/BaseRepository';
import { Booking } from '../../../models/booking/bookingModel';
import { Customer } from '../../../models/customer/customerModel';
import { CarOwner } from '../../../models/carowner/carOwnerModel';
import logger from '../../../utils/logger';

class ChatRepository extends BaseRepository<IChatMessage> implements IChatRepository {
  constructor() {
    super(ChatMessage);
  }

  async saveMessage(data: Partial<IChatMessage>): Promise<IChatMessage> {
   
    let user = await Customer.findById(data.senderId);
    if (!user) {
      user = await CarOwner.findById(data.senderId);
    }

    if (!user) {
      throw new Error('Sender not found');
    }

    const message = await ChatMessage.create({
      ...data,
      senderName: user.fullName,
      senderRole: user.role,
      timestamp: new Date(),
    });

    return message;
  }
  async getMessagesByRoom(roomId: string): Promise<IChatMessage[]> {
    return await ChatMessage.find({ roomId }).sort({ timestamp: 1 }).limit(50).lean();
  }

  async getActiveChatsByOwner(ownerId: string): Promise<IChatMessage[]> {
    const bookings = await Booking.find({ carOwnerId: ownerId }).select('bookingId');
    logger.info("bookings",bookings);
    const bookingIds = bookings.map((b) => b.bookingId);

    const chats = await ChatMessage.find({ roomId: { $in: bookingIds } }).sort({ timestamp: 1 });

    logger.info('chats', chats);
    return chats;
  }
}
export default ChatRepository;
