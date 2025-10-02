
import IChatRepository from "../../../repositories/interfaces/chat/IChatRepository";
import { IChatService } from "../../interfaces/chat/IChatServices";
import { getIO } from "../../../sockets/socket";
import { IChatMessage } from "../../../models/chatMessage/chatMessageModel";
import { OwnerChat } from "../../../types/chatData";
import logger from "../../../utils/logger";


class ChatService implements IChatService {

    private _chatRepository : IChatRepository;

    constructor(chatRepository:IChatRepository){
        this._chatRepository=chatRepository
    }


async  addMessage (roomId: string, senderId: string, message: string):Promise<IChatMessage> {
  return await this._chatRepository.saveMessage({ roomId, senderId, message, timestamp: new Date() });
};

async fetchMessages (roomId: string): Promise<IChatMessage[]> {
  return await this._chatRepository.getMessagesByRoom(roomId);
};

 async fetchOwnerChats (ownerId: string):Promise<IChatMessage[]>{
  if (!ownerId) {
      logger.warn("saveMessage: owner not found, ownerId=%s", ownerId);
      throw new Error("Sender not found");
    }
  return await this._chatRepository.getActiveChatsByOwner(ownerId);
};
}
export default ChatService
