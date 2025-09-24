import { Request, Response } from 'express';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { StatusCode } from '../../../../constants/statusCode';
import { MESSAGES } from '../../../../constants/message';
import { getCookieOptions } from '../../../../utils/cookieOptions';
import { IAdminAuthController } from '../interfaces/IAdminAuthController';

class AdminAuthController implements IAdminAuthController {
  constructor(private authService: IAuthService) {}

  private handleError(res: Response, error: any, statusCode: number): void {
    res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    });
  }

  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
        return;
      }
      const { adminAccessToken, refreshToken, admin } = await this.authService.loginAdmin(email, password);
      if (!admin) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Admin not found' });
        return;
      }
      res.cookie('adminRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('adminAccessToken', adminAccessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        adminAccessToken,
        user: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async renewRefreshAccessTokenAdmin(req: Request, res: Response): Promise<void> {
    try {
      const oldRefreshToken = req.cookies.adminRefreshToken;
      if (!oldRefreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const { accessToken, refreshToken } = await this.authService.renewAuthToken(oldRefreshToken, 'admin');
      res.cookie('adminRefreshToken', refreshToken, getCookieOptions(true));
      res.cookie('adminAccessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.adminRefreshToken;
      if (!refreshToken) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.INVALID_TOKEN });
        return;
      }
      await this.authService.logoutAdmin(refreshToken);
      res.clearCookie('adminRefreshToken', getCookieOptions(true));
      res.clearCookie('adminAccessToken', getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.LOGOUT_SUCCESS });
    } catch (error) {
      this.handleError(res, error, StatusCode.BAD_REQUEST);
    }
  }
}

export default AdminAuthController;