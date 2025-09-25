import ChatMessage,{IChatMessage} from "../../../models/chatMessage/chatMessageModel";

import IChatRepository from "../../interfaces/chat/IChatRepository";
import { BaseRepository } from "../../base/BaseRepository";


class ChatRepository extends BaseRepository<IChatMessage> implements IChatRepository {
    constructor(){
        super(ChatMessage);
     }
     
 async saveMessage (data: Partial<IChatMessage>):Promise<IChatMessage> {
   return await ChatMessage.create(data);
   
};

async getMessagesByRoom (roomId: string): Promise<IChatMessage[]> {
  return await ChatMessage.find({ roomId })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();
};

  async getActiveChatsByOwner(ownerId: string):Promise<IChatMessage[]> {
  
  return await ChatMessage.aggregate([
    { $match: { senderId: ownerId } },
    { $group: { _id: "$roomId", lastMessage: { $last: "$message" }, timestamp: { $last: "$timestamp" } } },
    { $sort: { timestamp: -1 } }
  ]);
}
}
export default ChatRepository
