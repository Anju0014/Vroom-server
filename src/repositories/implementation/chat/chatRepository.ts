import ChatMessage,{IChatMessage} from "../../../models/chatMessage/chatMessageModel";

import IChatRepository from "../../interfaces/chat/IChatRepository";
import { BaseRepository } from "../../base/BaseRepository";
import { Booking } from "../../../models/booking/bookingModel";


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
const bookings = await Booking.find({ carOwnerId: ownerId }).select("bookingId");
console.log(bookings)
  const bookingIds = bookings.map(b => b.bookingId);

 const chats = await ChatMessage.find({ roomId: { $in: bookingIds } })
    .sort({ timestamp: 1 });

  console.log("chats",chats)
  return chats;

}
}
export default ChatRepository
