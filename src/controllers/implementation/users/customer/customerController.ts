import { Request, Response } from 'express';
import { CustomRequest } from '../../middlewares/authMiddleWare';
import { ICustomerService } from '../../services/interfaces/users/customer/ICustomerService';
import { StatusCode } from '../../constants/statusCode';
import { MESSAGES } from '../../constants/message';
import { getCookieOptions } from '../../utils/cookieOptions';
import { userMapper } from '../../mappers/userMapper';

export class CustomerController {
  constructor(private customerService: ICustomerService) {}

  async registerBasicDetails(req: Request, res: Response): Promise<void> {
    try {
      const { user } = await this.customerService.registerBasicDetails(req.body);
      res.status(StatusCode.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_SENT,
        email: user.email,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const { user } = await this.customerService.otpVerify(email, otp);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_VERIFIED,
        user: userMapper.toDTO(user),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }
      await this.customerService.resendOtp(email);
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.OTP_RESENT });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const { accessToken, refreshToken, user } = await this.customerService.login(email, password);
      res.cookie('customerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('customerAccessToken', accessToken, getCookieOptions(false));
      if (!user) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        accessToken,
        user: userMapper.toDTO(user),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async renewRefreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const oldRefreshToken = req.cookies.customerRefreshToken;
      if (!oldRefreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const { accessToken, refreshToken } = await this.customerService.renewAuthToken(oldRefreshToken);
      res.cookie('customerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('customerAccessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }
      await this.customerService.forgotPassword(email);
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const message = await this.customerService.resetPassword(token, newPassword, 'customer');
      res.status(StatusCode.OK).json({ success: true, message });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async changePassword(req: CustomRequest, res: Response): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const message = await this.customerService.changePassword(customerId, req.body);
      res.status(StatusCode.OK).json({ success: true, message });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.customerRefreshToken;
      if (!refreshToken) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.NO_REFRESH_TOKEN });
        return;
      }
      await this.customerService.logout(refreshToken);
      res.clearCookie('customerRefreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.LOGOUT_SUCCESS });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, profileImage, provider, role } = req.body;
      if (!email || !provider) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const { accessToken, refreshToken, user } = await this.customerService.loginGoogle(fullName, email, profileImage, provider, role);
      res.cookie('customerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('customerAccessToken', accessToken, getCookieOptions(false));
      if (!user) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: MESSAGES.ERROR.USER_NOT_FOUND });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        accessToken,
        user: userMapper.toDTO(user),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async googleSignOut(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.customerRefreshToken;
      if (!refreshToken) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.NO_REFRESH_TOKEN });
        return;
      }
      await this.customerService.logout(refreshToken);
      res.clearCookie('customerRefreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.clearCookie('customerAccessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.LOGOUT_SUCCESS });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const user = await this.customerService.getProfile(customerId);
      if (!user) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: MESSAGES.ERROR.PROFILE_NOT_FOUND });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        user: userMapper.toDTO(user),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, message: MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND });
        return;
      }
      const { phoneNumber, address, profileImage } = req.body;
      if (!phoneNumber && !address) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.NO_UPDATE_DATA });
        return;
      }
      const updatedUser = await this.customerService.updateProfile(customerId, { phoneNumber, address, profileImage });
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PROFILE_UPDATED,
        user: userMapper.toDTO(updatedUser),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfileIdProof(req: CustomRequest, res: Response): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, message: MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND });
        return;
      }
      const { idProof } = req.body;
      if (!idProof) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.NO_UPDATE_DATA });
        return;
      }
      const updatedUser = await this.customerService.updateProfileId(customerId, { idProof });
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.ID_PROOF_UPDATED,
        user: userMapper.toDTO(updatedUser),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const status = await this.customerService.checkBlockStatus(userId);
      res.status(StatusCode.OK).json({ success: true, blockStatus: status });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}

export default CustomerController;