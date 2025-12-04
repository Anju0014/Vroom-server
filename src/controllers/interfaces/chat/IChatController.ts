import { Request, Response } from 'express';

interface IChatController {
  getChatHistory(req: Request, res: Response): Promise<void>;
}
export default IChatController;
