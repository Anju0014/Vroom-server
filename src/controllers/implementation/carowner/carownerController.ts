import { Request, Response } from 'express';
import ICarOwnerController from '../../interfaces/carowner/ICarOwnerContoller';
import { ICarOwnerService } from '../../../services/interfaces/carOwner/ICarOwnerServices';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { MESSAGES } from '../../../constants/message';
import { StatusCode } from '../../../constants/statusCode';
import { getCookieOptions } from '../../../utils/cookieOptions';
import { CarOwnerMapper } from '../../../mappers/carOwner.mapper';

class CarOwnerController implements ICarOwnerController {
  private _carOwnerService: ICarOwnerService;

  constructor(_carOwnerService: ICarOwnerService) {
    this._carOwnerService = _carOwnerService;
  }

  async registerBasicDetailsOwner(req: Request, res: Response): Promise<void> {
    try {
      const { carOwner } = await this._carOwnerService.registerBasicDetails(req.body);

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

      console.log('reached pt3 ');

      const { carOwner } = await this._carOwnerService.otpVerify(email, otp);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_VERIFIED,
        carOwner:CarOwnerMapper.toPublicDTO(carOwner),
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resendOtpOwner(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }

      await this._carOwnerService.resendOtp(email);
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.OTP_RESENT });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async loginOwner(req: Request, res: Response): Promise<void> {
    try {
      console.log('reeached login1');
      const { email, password } = req.body;
      if (!email || !password) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }

      const { ownerAccessToken, refreshToken, carOwner } =
        await this._carOwnerService.loginCarOwner(email, password);

      res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('carOwnerAccessToken', ownerAccessToken, getCookieOptions(false));

      if (!carOwner) {
        res.status(400).json({ error: 'carOwner not found' });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        ownerAccessToken,
        // user: {
        //   id: carOwner._id,
        //   fullName: carOwner.fullName,
        //   email: carOwner.email,
        //   role: carOwner.role,
        //   profileImage: carOwner.profileImage,
        // },
         user: CarOwnerMapper.toPublicDTO(carOwner!)
      });
    } catch (error) {
      console.log(error);
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async renewRefreshAccessTokenOwner(req: Request, res: Response): Promise<void> {
    try {
      console.log('Reached renewRefreshAccessTokenOwner');
      const oldRefreshToken = req.cookies.carOwnerRefreshToken;
      if (!oldRefreshToken) {
        res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }

      const { accessToken, refreshToken } =
        await this._carOwnerService.renewAuthToken(oldRefreshToken);

      res.cookie('carOwnerRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('carOwnerAccessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error renewing token:', error.message);
        if (
          error.message === 'Refresh token expired' ||
          error.message === 'Invalid refresh token'
        ) {
          res
            .status(StatusCode.UNAUTHORIZED)
            .json({ success: false, message: 'Invalid or expired refresh token' });
        } else {
          this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }

  async completeRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const carOwnerId = req.userId;

      if (!carOwnerId) {
        res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: MESSAGES.ERROR.NO_OWNER_ID_FOUND,
        });
        return;
      }

      const completeOwner = await this._carOwnerService.completeRegister(carOwnerId, req.body);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.COMPLETED_REGISTRATION_FORM,
        completeOwner,
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async forgotPasswordOwner(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
        return;
      }
      await this._carOwnerService.forgotPassword(email);
      res
        .status(StatusCode.OK)
        .json({ success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT });
    } catch (error) {
      console.error('Forgot password error:', error);
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async resetPasswordOwner(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      let role = 'carOwner';
      const message = await this._carOwnerService.resetPassword(token, newPassword, role);

      res.status(StatusCode.OK).json({
        success: true,
        message,
      });
    } catch (error) {
      console.error('Reset Password Error:', error);
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async changePasswordOwner(req: CustomRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const result = await this._carOwnerService.changePassword(ownerId, req.body);
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
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_REFRESH_TOKEN,
        });
        return;
      }
      await this._carOwnerService.logoutCarOwner(refreshToken);

      // res.clearCookie("carOwnerRefreshToken", {
      //   ...getCookieOptions(true),
      // });
      res.clearCookie('carOwnerRefreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGOUT_SUCCESS,
      });
    } catch (error) {
      console.error('Logout Error:', error);
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      console.log('reached here at google signin');
      const { fullName, email, profileImage, provider, role } = req.body;

      if (!email || !provider) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const { ownerAccessToken, refreshToken, carOwner } =
        await this._carOwnerService.loginOwnerGoogle(fullName, email, profileImage, provider, role);

      res.cookie('carOwnerRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      if (!carOwner) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.CUSTOMER_NOT_FOUND,
        });
        return;
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        ownerAccessToken,
        user: CarOwnerMapper.toPublicDTO(carOwner)
        // user: {
        //   id: carOwner._id,
        //   fullName: carOwner.fullName,
        //   email: carOwner.email,
        //   role: carOwner.role,
        //   profileImage: carOwner.profileImage,
        // },
      });
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getOwnerProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log('helloooooo');
      const ownerId = req.userId;
      console.log(ownerId);
      if (!ownerId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const ownerProfile = await this._carOwnerService.getOwnerProfile(ownerId);
      if (!ownerProfile) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.PROFILE_NOT_FOUND,
        });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        owner: CarOwnerMapper.toPublicDTO(ownerProfile),
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfileOwner(req: CustomRequest, res: Response): Promise<void> {
    try {
      const carOwnerId = req.userId;
      console.log('reached heriii');
      console.log(carOwnerId);
      if (!carOwnerId) {
        res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: MESSAGES.ERROR.NO_OWNER_ID_FOUND,
        });
        return;
      }
      const { phoneNumber, address, profileImage } = req.body;
      if (!phoneNumber && !address) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_UPDATE_DATA,
        });
        return;
      }
      const updatedOwner = await this._carOwnerService.updateCarOwnerProfile(carOwnerId, {
        phoneNumber,
        address,
        profileImage,
      });

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PROFILE_UPDATED,
        // updatedOwner,
        owner: CarOwnerMapper.toPublicDTO(updatedOwner),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log('block status checking..................');
      const { userId } = req.params;
      const status = await this._carOwnerService.checkBlockStatus(userId);

      res.status(StatusCode.OK).json({ blockStatus: status });
    } catch (error) {
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

export default CarOwnerController;
