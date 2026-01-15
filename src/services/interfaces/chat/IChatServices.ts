import { IChatMessage } from '../../../models/chatMessage/chatMessageModel';
import { OwnerChat } from '../../../types/chatData';

export interface IChatService {
  addMessage(senderId: string,receiverId:string, message: string): Promise<IChatMessage>;
  fetchMessages(roomId: string): Promise<IChatMessage[]>;
  fetchOwnerChats(ownerId: string): Promise<IChatMessage[]>;
  fetchCustomerChats(customerId: string): Promise<IChatMessage[]>;
}
