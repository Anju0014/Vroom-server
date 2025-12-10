import { Response, Request } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { StatusCode } from '../../../constants/statusCode';

import IChatController from '../../interfaces/chat/IChatController';
import { IChatService } from '../../../services/interfaces/chat/IChatServices';
import { MESSAGES } from '../../../constants/message';

class ChatController implements IChatController {
  private _chatService: IChatService;

  constructor(_chatService: IChatService) {
    this._chatService = _chatService;
  }

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      console.log('showw');
      const { roomId } = req.params;
      console.log(',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,', roomId);
      const messages = await this._chatService.fetchMessages(roomId);
      res.status(StatusCode.OK).json(messages);
    } catch (error:any) 
    {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
      // res.status(StatusCode.BAD_REQUEST).json({ message: 'Failed to fetch chat history' });
    }
  }

  async getOwnerChats(req: CustomRequest, res: Response) {
    console.log('eee');
    const ownerId = req.userId;
    if (!ownerId) {
      console.log('missing');
      return;
    }

    try {
      const chats = await this._chatService.fetchOwnerChats(ownerId);
      console.log('ChatService', chats);
      res.status(StatusCode.OK).json(chats);
    } catch(error:any) {
      // res.status(StatusCode.BAD_REQUEST).json({ message: 'Failed to fetch owner chats' });
    this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }
   private handleError(
      res: Response,
      error: unknown,
      statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR
    ): void {
      console.error('Error:', error);
  
      const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
  
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
}
export default ChatController;
