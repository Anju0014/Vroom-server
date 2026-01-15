import IChatRepository from '../../../repositories/interfaces/chat/IChatRepository';
import { IChatService } from '../../interfaces/chat/IChatServices';

import { IChatMessage } from '../../../models/chatMessage/chatMessageModel';

import logger from '../../../utils/logger';
import { Customer } from '../../../models/customer/customerModel';
import { CarOwner } from '../../../models/carowner/carOwnerModel';

class ChatService implements IChatService {
  private _chatRepository: IChatRepository;

  constructor(chatRepository: IChatRepository) {
    this._chatRepository = chatRepository;
  }

  // async addMessage(roomId: string, senderId: string, message: string): Promise<IChatMessage> {
  //   return await this._chatRepository.saveMessage({
  //     roomId,
  //     senderId,
  //     message,
  //     timestamp: new Date(),
  //   });
  // }

  async addMessage(
  senderId: string,
  receiverId: string,
  message: string
): Promise<IChatMessage> {
  // Create roomId for this pair
  const roomId = [senderId, receiverId].sort().join("_");

  // Fetch sender
  const user = (await Customer.findById(senderId)) || (await CarOwner.findById(senderId));
  if (!user) throw new Error("Sender not found");

  // Save message
  return await this._chatRepository.saveMessage(roomId, senderId, receiverId, message);
}

  async fetchMessages(roomId: string): Promise<IChatMessage[]> {
    return await this._chatRepository.getMessagesByRoom(roomId);
  }

  async fetchOwnerChats(ownerId: string): Promise<IChatMessage[]> {
    if (!ownerId) {
      logger.warn('saveMessage: owner not found, ownerId=%s', ownerId);
      throw new Error('Sender not found');
    }
    return await this._chatRepository.getActiveChatsByOwner(ownerId);
  }
  async fetchCustomerChats(customerId: string): Promise<IChatMessage[]> {
    if (!customerId) {
      logger.warn('saveMessage: customer not found, customerId=%s', customerId);
      throw new Error('Sender not found');
    }
    return await this._chatRepository.getActiveChatsByCustomer(customerId);
  }
}
export default ChatService;
