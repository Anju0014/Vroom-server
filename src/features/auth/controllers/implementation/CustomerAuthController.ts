import { Request, Response } from 'express';
import { CustomRequest } from '../../../../middlewares/authMiddleWare';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { StatusCode } from '../../../../constants/statusCode';
import { MESSAGES } from '../../../../constants/message';
import { getCookieOptions } from '../../../../utils/cookieOptions';
import { ICustomerAuthController } from '../interfaces/ICustomerAuthController';

class CustomerAuthController implements ICustomerAuthController {
  constructor(private authService: IAuthService) {}

  private handleError(res: Response, error: any, statusCode: number): void {
    res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    });
  }

  async registerBasicDetailsCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customer } = await this.authService.registerBasicDetails(req.body, 'customer');
       if (!customer) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
            return;
        }
      res.status(StatusCode.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_SENT,
        email: customer.email,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async verifyOtpCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const { customer } = await this.authService.verifyOtp(email, otp, 'customer');
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_VERIFIED,
        customer,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resendOtpCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }
      await this.authService.resendOtp(email, 'customer');
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.OTP_RESENT });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async loginCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const { customerAccessToken, refreshToken, customer } = await this.authService.loginCustomer(email, password);
      if (!customer) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Customer not found' });
        return;
      }
      res.cookie('customerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('customerAccessToken', customerAccessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        customerAccessToken,
        user: {
          id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          role: customer.role,
          profileImage: customer.profileImage,
        },
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async renewRefreshAccessTokenCustomer(req: Request, res: Response): Promise<void> {
    try {
      const oldRefreshToken = req.cookies.customerRefreshToken;
      if (!oldRefreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const { accessToken, refreshToken } = await this.authService.renewAuthToken(oldRefreshToken, 'customer');
      res.cookie('customerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('customerAccessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async completeRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, message: MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND });
        return;
      }
      const customer = await this.authService.completeRegistration(customerId, req.body, 'customer');
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.COMPLETED_REGISTRATION_FORM,
        completeCustomer: customer,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async forgotPasswordCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }
      await this.authService.forgotPassword(email, 'customer');
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resetPasswordCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const message = await this.authService.resetPassword(token, newPassword, 'customer');
      res.status(StatusCode.OK).json({ success: true, message });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async changePasswordCustomer(req: CustomRequest, res: Response): Promise<void> {
    try {
      const customerId = req.userId;
      const { oldPassword, newPassword } = req.body;
      if (!customerId || !oldPassword || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const result = await this.authService.changePassword(customerId, { oldPassword, newPassword }, 'customer');
      res.status(StatusCode.OK).json(result);
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.customerRefreshToken;
      if (!refreshToken) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.INVALID_TOKEN });
        return;
      }
      await this.authService.logoutCustomer(refreshToken);
      res.clearCookie('customerRefreshToken', getCookieOptions(true));
      res.clearCookie('customerAccessToken', getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.LOGOUT_SUCCESS });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, profileImage, provider } = req.body;
      if (!fullName || !email || !provider) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const { customerAccessToken, refreshToken, customer } = await this.authService.loginCustomerGoogle(fullName, email, profileImage, provider, 'customer');
      if (!customer) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Customer not found or failed to create' });
        return;
      }
      res.cookie('customerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('customerAccessToken', customerAccessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        customerAccessToken,
        user: {
          id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          role: customer.role,
          profileImage: customer.profileImage,
        },
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }
}

export default CustomerAuthController;