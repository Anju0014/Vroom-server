import { Request, Response } from 'express';
import { IUserService } from '../../services/interfaces/users/common/IUserService';
import { StatusCode } from '../..//../../constants/statusCode';
import { MESSAGES } from '../../../../constants/message';
import { getCookieOptions } from '../../../../utils/cookieOptions';
import { userMapper } from '../../mappers/userMapper';

export class UserController {
  constructor(private userService: IUserService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const { accessToken, refreshToken, user } = await this.userService.login(email, password);

      if (!user) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.USER_NOT_FOUND,
        });
        return;
      }

      res.cookie(`${user.role}RefreshToken`, refreshToken, getCookieOptions(true));
      res.cookie(`${user.role}AccessToken`, accessToken, getCookieOptions(false));

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        accessToken,
        user: userMapper.toDTO(user),
      });
    } catch (error) {
      console.error('LoginError:', error);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.adminRefreshToken || req.cookies.customerRefreshToken || req.cookies.carOwnerRefreshToken;
      if (!refreshToken) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_REFRESH_TOKEN,
        });
        return;
      }

      await this.userService.logout(refreshToken);
      res.clearCookie('adminRefreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.clearCookie('customerRefreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.clearCookie('carOwnerRefreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGOUT_SUCCESS,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }
}

export default UserController;