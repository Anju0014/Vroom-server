import { IChatMessage } from "../../../models/chatMessage/chatMessageModel"
import { OwnerChat } from "../../../types/chatData"

interface IChatRepository{

    saveMessage (data: Partial<IChatMessage>):Promise<IChatMessage>
    getMessagesByRoom (roomId: string): Promise<IChatMessage[]>
    getActiveChatsByOwner(ownerId: string):Promise<IChatMessage[]>

}
export default IChatRepository