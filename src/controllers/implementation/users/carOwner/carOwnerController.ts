import { Request, Response } from 'express';
import { CustomRequest } from '../../middlewares/authMiddleWare';
import { ICarOwnerService } from '../../services/interfaces/users/carowner/ICarOwnerService';
import { StatusCode } from '../../constants/statusCode';
import { MESSAGES } from '../../constants/message';
import { getCookieOptions } from '../../utils/cookieOptions';
import { userMapper } from '../../mappers/userMapper';

export class CarOwnerController {
  constructor(private carOwnerService: ICarOwnerService) {}

  async registerBasicDetails(req: Request, res: Response): Promise<void> {
    try {
      const { user } = await this.carOwnerService.registerBasicDetails(req.body);
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
      const { user } = await this.carOwnerService.otpVerify(email, otp);
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
      await this.carOwnerService.resendOtp(email);
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
      const { accessToken, refreshToken, user } = await this.carOwnerService.login(email, password);
      res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('carOwnerAccessToken', accessToken, getCookieOptions(false));
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
      const oldRefreshToken = req.cookies.carOwnerRefreshToken;
      if (!oldRefreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const { accessToken, refreshToken } = await this.carOwnerService.renewAuthToken(oldRefreshToken);
      res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('carOwnerAccessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      if (error instanceof Error && (error.message === 'Refresh token expired' || error.message === 'Invalid refresh token')) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: 'Invalid or expired refresh token' });
      } else {
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async completeRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const carOwnerId = req.userId;
      if (!carOwnerId) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, message: MESSAGES.ERROR.NO_OWNER_ID_FOUND });
        return;
      }
      const user = await this.carOwnerService.completeRegister(carOwnerId, req.body);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.COMPLETED_REGISTRATION_FORM,
        user: userMapper.toDTO(user),
      });
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
      await this.carOwnerService.forgotPassword(email);
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
      const message = await this.carOwnerService.resetPassword(token, newPassword, 'carOwner');
      res.status(StatusCode.OK).json({ success: true, message });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async changePassword(req: CustomRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const result = await this.carOwnerService.changePassword(ownerId, req.body);
      if (!result.success) {
        res.status(StatusCode.BAD_REQUEST).json(result);
        return;
      }
      res.status(StatusCode.OK).json(result);
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.carOwnerRefreshToken;
      if (!refreshToken) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.NO_REFRESH_TOKEN });
        return;
      }
      await this.carOwnerService.logout(refreshToken);
      res.clearCookie('carOwnerRefreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
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
      const { accessToken, refreshToken, user } = await this.carOwnerService.loginGoogle(fullName, email, profileImage, provider, role);
      res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('carOwnerAccessToken', accessToken, getCookieOptions(false));
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

  async getProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const ownerProfile = await this.carOwnerService.getProfile(ownerId);
      if (!ownerProfile) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: MESSAGES.ERROR.PROFILE_NOT_FOUND });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        user: userMapper.toDTO(ownerProfile),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const carOwnerId = req.userId;
      if (!carOwnerId) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, message: MESSAGES.ERROR.NO_OWNER_ID_FOUND });
        return;
      }
      const { phoneNumber, address, profileImage } = req.body;
      if (!phoneNumber && !address) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.NO_UPDATE_DATA });
        return;
      }
      const updatedOwner = await this.carOwnerService.updateProfile(carOwnerId, { phoneNumber, address, profileImage });
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PROFILE_UPDATED,
        user: userMapper.toDTO(updatedOwner),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const status = await this.carOwnerService.checkBlockStatus(userId);
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

export default CarOwnerController;