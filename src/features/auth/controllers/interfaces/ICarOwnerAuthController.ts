import { Request, Response } from 'express';

export interface ICarOwnerAuthController {
  registerBasicDetailsOwner(req: Request, res: Response): Promise<void>;
  verifyOtpOwner(req: Request, res: Response): Promise<void>;
  resendOtpOwner(req: Request, res: Response): Promise<void>;
  loginOwner(req: Request, res: Response): Promise<void>;
  renewRefreshAccessTokenOwner(req: Request, res: Response): Promise<void>;
  completeRegistration(req: Request, res: Response): Promise<void>;
  forgotPasswordOwner(req: Request, res: Response): Promise<void>;
  resetPasswordOwner(req: Request, res: Response): Promise<void>;
  changePasswordOwner(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  googleSignIn(req: Request, res: Response): Promise<void>;
}