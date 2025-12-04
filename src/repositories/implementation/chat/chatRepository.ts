import ChatMessage, { IChatMessage } from '../../../models/chatMessage/chatMessageModel';

import IChatRepository from '../../interfaces/chat/IChatRepository';
import { BaseRepository } from '../../base/BaseRepository';
import { Booking } from '../../../models/booking/bookingModel';
import { Customer } from '../../../models/customer/customerModel';
import { CarOwner } from '../../../models/carowner/carOwnerModel';

class ChatRepository extends BaseRepository<IChatMessage> implements IChatRepository {
  constructor() {
    super(ChatMessage);
  }

  //  async saveMessage (data: Partial<IChatMessage>):Promise<IChatMessage> {
  //   const user = await Customer.findById(data.senderId);
  //   const user=await carOwner.findById(data.senderId);
  //    return await ChatMessage.create(...data,senderName:user.name,senderRole:user.role);

  // };

  async saveMessage(data: Partial<IChatMessage>): Promise<IChatMessage> {
    // Try to find the user in Customer first, then CarOwner
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
    console.log(bookings);
    const bookingIds = bookings.map((b) => b.bookingId);

    const chats = await ChatMessage.find({ roomId: { $in: bookingIds } }).sort({ timestamp: 1 });

    console.log('chats', chats);
    return chats;
  }
}
export default ChatRepository;
