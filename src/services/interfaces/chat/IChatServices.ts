import { IChatMessage } from '../../../models/chatMessage/chatMessageModel';
import { OwnerChat } from '../../../types/chatData';

export interface IChatService {
  addMessage(roomId: string, senderId: string, message: string): Promise<IChatMessage>;
  fetchMessages(roomId: string): Promise<IChatMessage[]>;
  fetchOwnerChats(ownerId: string): Promise<IChatMessage[]>;
}
