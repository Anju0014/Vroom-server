import { Request, Response } from 'express';

export interface ICustomerAuthController {
  registerBasicDetailsCustomer(req: Request, res: Response): Promise<void>;
  verifyOtpCustomer(req: Request, res: Response): Promise<void>;
  resendOtpCustomer(req: Request, res: Response): Promise<void>;
  loginCustomer(req: Request, res: Response): Promise<void>;
  renewRefreshAccessTokenCustomer(req: Request, res: Response): Promise<void>;
  completeRegistration(req: Request, res: Response): Promise<void>;
  forgotPasswordCustomer(req: Request, res: Response): Promise<void>;
  resetPasswordCustomer(req: Request, res: Response): Promise<void>;
  changePasswordCustomer(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  googleSignIn(req: Request, res: Response): Promise<void>;
}