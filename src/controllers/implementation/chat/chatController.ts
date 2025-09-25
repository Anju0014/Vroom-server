import { Response,Request} from 'express';
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";

import IChatController from '../../interfaces/chat/IChatController';
import { IChatService } from '../../../services/interfaces/chat/IChatServices';

class ChatController implements IChatController{

    private _chatService: IChatService

    constructor(_chatService: IChatService) {
        this._chatService = _chatService
    }

async getChatHistory (req: Request, res: Response): Promise<void> {
  try {
    console.log("showw")
    const { roomId } = req.params;
    const messages = await this._chatService.fetchMessages(roomId);
    res.status(StatusCode.OK).json(messages);
  } catch (err) {
    res.status(StatusCode.BAD_REQUEST).json({ message: "Failed to fetch chat history" });
  }
};

async getOwnerChats (req: CustomRequest, res: Response) {
    console.log("eee")
  const ownerId = req.userId; 
  if(!ownerId){
    console.log("missing")
    return 
  }
  try {
    const chats = await this._chatService.fetchOwnerChats(ownerId);
    res.status(200).json(chats);
  } catch {
    res.status(500).json({ message: "Failed to fetch owner chats" });
  }
};

}
export default ChatController