
import IChatRepository from "../../../repositories/interfaces/chat/IChatRepository";
import { IChatService } from "../../interfaces/chat/IChatServices";
import { getIO } from "../../../sockets/socket";
import { IChatMessage } from "../../../models/chatMessage/chatMessageModel";


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
  return await this._chatRepository.getActiveChatsByOwner(ownerId);
};
}
export default ChatService
