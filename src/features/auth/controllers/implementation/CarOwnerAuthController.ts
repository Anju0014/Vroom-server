import { Request, Response } from 'express';
import { CustomRequest } from '../../../../middlewares/authMiddleWare';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { StatusCode } from '../../../../constants/statusCode';
import { MESSAGES } from '../../../../constants/message';
import { getCookieOptions } from '../../../../utils/cookieOptions';
import { ICarOwnerAuthController } from '../interfaces/ICarOwnerAuthController';

class CarOwnerAuthController implements ICarOwnerAuthController {
  constructor(private authService: IAuthService) {}

  async registerBasicDetailsOwner(req: Request, res: Response): Promise<void> {
    try {
      const { carOwner } = await this.authService.registerBasicDetails(req.body, 'carOwner');
      if (!carOwner) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      res.status(StatusCode.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_SENT,
        email: carOwner.email,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async verifyOtpOwner(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const { carOwner } = await this.authService.verifyOtp(email, otp, 'carOwner');
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_VERIFIED,
        carOwner,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resendOtpOwner(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }
      await this.authService.resendOtp(email, 'carOwner');
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.OTP_RESENT });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async loginOwner(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const { ownerAccessToken, refreshToken, carOwner } = await this.authService.loginCarOwner(email, password);
      if (!carOwner) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Car owner not found' });
        return;
      }
      res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('carOwnerAccessToken', ownerAccessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        ownerAccessToken,
        user: {
          id: carOwner._id,
          fullName: carOwner.fullName,
          email: carOwner.email,
          role: carOwner.role,
          profileImage: carOwner.profileImage,
        },
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async renewRefreshAccessTokenOwner(req: Request, res: Response): Promise<void> {
    try {
      const oldRefreshToken = req.cookies.carOwnerRefreshToken;
      if (!oldRefreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const { accessToken, refreshToken } = await this.authService.renewAuthToken(oldRefreshToken, 'carOwner');
      res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('carOwnerAccessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async completeRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const carOwnerId = req.userId;
      if (!carOwnerId) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, message: MESSAGES.ERROR.NO_OWNER_ID_FOUND });
        return;
      }
      const carOwner = await this.authService.completeRegistration(carOwnerId, req.body, 'carOwner');
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.COMPLETED_REGISTRATION_FORM,
        completeOwner: carOwner,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async forgotPasswordOwner(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }
      await this.authService.forgotPassword(email, 'carOwner');
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resetPasswordOwner(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const message = await this.authService.resetPassword(token, newPassword, 'carOwner');
      res.status(StatusCode.OK).json({ success: true, message });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async changePasswordOwner(req: CustomRequest, res: Response): Promise<void> {
    try {
      const carOwnerId = req.userId;
      const { oldPassword, newPassword } = req.body;
      if (!carOwnerId || !oldPassword || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const result = await this.authService.changePassword(carOwnerId, { oldPassword, newPassword }, 'carOwner');
      res.status(StatusCode.OK).json(result);
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.carOwnerRefreshToken;
      if (!refreshToken) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.INVALID_TOKEN });
        return;
      }
      await this.authService.logoutCarOwner(refreshToken);
      res.clearCookie('carOwnerRefreshToken', getCookieOptions(true));
      res.clearCookie('carOwnerAccessToken', getCookieOptions(false));
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
    const { ownerAccessToken, refreshToken, carOwner } = await this.authService.loginOwnerGoogle(fullName, email, profileImage, provider, 'carOwner');
    if (!carOwner) {
      res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Car owner not found or failed to create' });
      return;
    }
    res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
    res.cookie('carOwnerAccessToken', ownerAccessToken, getCookieOptions(false));
    res.status(StatusCode.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
      ownerAccessToken,
      user: {
        id: carOwner._id,
        fullName: carOwner.fullName,
        email: carOwner.email,
        role: carOwner.role,
        profileImage: carOwner.profileImage,
      },
    });
  } catch (error) {
    this.handleError(res, error, StatusCode.BAD_REQUEST);
  }
}

 private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
        console.error("Error:", error);

        const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
        });
    }
}