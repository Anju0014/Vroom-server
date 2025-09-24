import { Request, Response } from 'express';

export interface IAdminAuthController {
  loginAdmin(req: Request, res: Response): Promise<void>;
  renewRefreshAccessTokenAdmin(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}