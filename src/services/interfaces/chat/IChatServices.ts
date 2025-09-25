import { IChatMessage } from "../../../models/chatMessage/chatMessageModel"

export interface IChatService{

    addMessage (roomId: string, senderId: string, message: string):Promise<IChatMessage> 
    fetchMessages (roomId: string): Promise<IChatMessage[]> 
    fetchOwnerChats (ownerId: string):Promise<IChatMessage[]>
}
